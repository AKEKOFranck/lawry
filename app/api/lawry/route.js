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
  "getRelances",      // NOUVEAU — lire les relances du jour
  "marquerRelance",   // NOUVEAU — marquer une relance comme faite
];


/* =====================================================
   POST
===================================================== */

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Requête invalide." },
      { status: 400 }
    );
  }

  const { action, data, pin } = body || {};


  /* =====================================================
     2. VÉRIFICATION DU CODE D'ACCÈS
  ===================================================== */

  if (action === "verifyPin") {
    if (typeof pin !== "string" || !pin.trim()) {
      return NextResponse.json(
        { ok: false, error: "Code d'accès manquant." },
        { status: 400 }
      );
    }

    if (!process.env.LAWRY_PIN || pin !== process.env.LAWRY_PIN) {
      return NextResponse.json(
        { ok: false, error: "Code d'accès incorrect." },
        { status: 401 }
      );
    }

    return NextResponse.json({ ok: true, message: "Accès autorisé." });
  }


  /* =====================================================
     3. VÉRIFIER L'ACTION
  ===================================================== */

  const actionsAutorisees = [...ACTIONS_PUBLIQUES, ...ACTIONS_EQUIPE];

  if (
    !actionsAutorisees.includes(action) ||
    typeof data !== "object" ||
    !data
  ) {
    return NextResponse.json(
      { ok: false, error: "Requête invalide." },
      { status: 400 }
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
        { ok: false, error: "Code équipe incorrect." },
        { status: 401 }
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
        : value; // on garde les nombres (ex. "ligne") tels quels
  }


  /* =====================================================
     6. VÉRIFIER LA CONFIGURATION GOOGLE
  ===================================================== */

  if (!process.env.APPS_SCRIPT_URL) {
    return NextResponse.json(
      { ok: false, error: "APPS_SCRIPT_URL n'est pas configuré." },
      { status: 500 }
    );
  }


  /* =====================================================
     7. ENVOYER VERS GOOGLE APPS SCRIPT
  ===================================================== */

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch(process.env.APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action, data: propre }),
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const texte = await response.text().catch(() => "");
      console.error("Statut Google:", response.status, response.statusText);
      console.error("Corps réponse Google:", texte.slice(0, 500));

      return NextResponse.json(
        {
          ok: false,
          error: "Google Apps Script a refusé la requête.",
          debug: { status: response.status, body: texte.slice(0, 500) },
        },
        { status: 502 }
      );
    }

    const json = await response.json();

    return NextResponse.json(json, { status: json.ok ? 200 : 502 });
  } catch (error) {
    clearTimeout(timeoutId);

    const estTimeout = error.name === "AbortError";

    console.error(
      estTimeout ? "Timeout Apps Script (>25s) :" : "Erreur Apps Script :",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error: estTimeout
          ? "Le classeur Google met trop de temps à répondre (>25s). Vérifiez votre connexion réseau ou réessayez."
          : "Le classeur Google est injoignable pour le moment.",
      },
      { status: 502 }
    );
  }
}