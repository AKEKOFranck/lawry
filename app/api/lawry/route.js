import { NextResponse } from "next/server";

/* =====================================================
   ACTIONS AUTORISÉES
===================================================== */

const ACTIONS_PUBLIQUES = [
  "addDemande",
];

const ACTIONS_EQUIPE = [
  "addDossier",
  "addProspect",
];


/* =====================================================
   POST
===================================================== */

export async function POST(request) {
  let body;

  /* -----------------------------------------------------
     1. Lire la requête
  ----------------------------------------------------- */

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Requête invalide.",
      },
      {
        status: 400,
      }
    );
  }

  const {
    action,
    data,
    pin,
  } = body || {};


  /* =====================================================
     2. VÉRIFICATION DU CODE D'ACCÈS
  ===================================================== */

  if (action === "verifyPin") {

    if (
      typeof pin !== "string" ||
      !pin.trim()
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "Code d'accès manquant.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !process.env.LAWRY_PIN ||
      pin !== process.env.LAWRY_PIN
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "Code d'accès incorrect.",
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Accès autorisé.",
    });
  }


  /* =====================================================
     3. VÉRIFIER L'ACTION
  ===================================================== */

  const actionsAutorisees = [
    ...ACTIONS_PUBLIQUES,
    ...ACTIONS_EQUIPE,
  ];

  if (
    !actionsAutorisees.includes(action) ||
    typeof data !== "object" ||
    !data
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "Requête invalide.",
      },
      {
        status: 400,
      }
    );
  }


  /* =====================================================
     4. VÉRIFIER LE CODE POUR LES ACTIONS INTERNES
  ===================================================== */

  if (ACTIONS_EQUIPE.includes(action)) {

    if (
      typeof pin !== "string" ||
      !process.env.LAWRY_PIN ||
      pin !== process.env.LAWRY_PIN
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "Code équipe incorrect.",
        },
        {
          status: 401,
        }
      );
    }
  }


  /* =====================================================
     5. NETTOYER LES DONNÉES
  ===================================================== */

  const propre = {};

  for (const [key, value] of Object.entries(data)) {

    propre[key] =
      typeof value === "string"
        ? value.trim().slice(0, 3000)
        : "";
  }


  /* =====================================================
     6. VÉRIFIER LA CONFIGURATION GOOGLE
  ===================================================== */

  if (!process.env.APPS_SCRIPT_URL) {

    return NextResponse.json(
      {
        ok: false,
        error:
          "APPS_SCRIPT_URL n'est pas configuré.",
      },
      {
        status: 500,
      }
    );
  }


  /* =====================================================
     7. ENVOYER VERS GOOGLE APPS SCRIPT
  ===================================================== */

  // On limite l'attente à 25s max. Google répond en 1-5s en
  // temps normal (vérifié dans Exécutions Apps Script) : si on
  // dépasse largement ça, c'est le réseau local qui traîne, pas
  // Google qui refuse. On distingue donc "timeout" de "refus".

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    25000
  );

  try {

    const response = await fetch(
      process.env.APPS_SCRIPT_URL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "text/plain;charset=utf-8",
        },

        body: JSON.stringify({
          action,
          data: propre,
        }),

        cache: "no-store",
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);


    /* ---------------------------------------------------
       Vérifier la réponse Google
    --------------------------------------------------- */

    if (!response.ok) {

      // On lit le corps pour voir ce que Google renvoie
      // réellement (statut + message), au lieu de masquer
      // l'info derrière un message générique.
      const texte = await response
        .text()
        .catch(() => "");

      console.error(
        "Statut Google:",
        response.status,
        response.statusText
      );
      console.error(
        "Corps réponse Google:",
        texte.slice(0, 500)
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Google Apps Script a refusé la requête.",
          debug: {
            status: response.status,
            body: texte.slice(0, 500),
          },
        },
        {
          status: 502,
        }
      );
    }


    /* ---------------------------------------------------
       Lire la réponse JSON
    --------------------------------------------------- */

    const json =
      await response.json();


    /* ---------------------------------------------------
       Retourner la réponse au site
    --------------------------------------------------- */

    return NextResponse.json(
      json,
      {
        status:
          json.ok
            ? 200
            : 502,
      }
    );

  } catch (error) {

    clearTimeout(timeoutId);

    const estTimeout =
      error.name === "AbortError";

    console.error(
      estTimeout
        ? "Timeout Apps Script (>25s) :"
        : "Erreur Apps Script :",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error: estTimeout
          ? "Le classeur Google met trop de temps à répondre (>25s). Vérifiez votre connexion réseau ou réessayez."
          : "Le classeur Google est injoignable pour le moment.",
      },
      {
        status: 502,
      }
    );
  }
}