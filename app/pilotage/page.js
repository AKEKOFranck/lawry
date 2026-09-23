"use client";

import { useMemo, useState } from "react";

import {
  FiArrowLeft,
  FiBriefcase,
  FiCheck,
  FiCheckCircle,
  FiClipboard,
  FiCopy,
  FiMessageCircle,
  FiRefreshCcw,
  FiSend,
} from "react-icons/fi";

import Link from "next/link";

import styles from "./page.module.css";


/* =====================================================
   CONFIGURATION
===================================================== */

const WHATSAPP_NUMBER = "2250777043568";


/* =====================================================
   TYPES DE DOSSIER
===================================================== */

const TYPES_DOSSIER = [
  "Conseil et assistance juridique",
  "Création de société",
  "Rédaction de contrat",
  "Analyse de contrat",
  "Contentieux",
  "Recouvrement",
  "Droit des affaires",
  "Droit du travail",
  "Autre",
];


/* =====================================================
   RESPONSABLES
===================================================== */

const RESPONSABLES = [
  "Noella",
  "Assistante",
  "Cabinet LAWRY",
];


/* =====================================================
   DATE DU JOUR
===================================================== */

function getToday() {
  const d = new Date();

  const mm = String(d.getMonth() + 1).padStart(2, "0");

  const dd = String(d.getDate()).padStart(2, "0");

  return `${d.getFullYear()}-${mm}-${dd}`;
}


/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(value) {

  if (!value) {
    return "—";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("fr-FR").format(date);
}


/* =====================================================
   FORMULAIRE INITIAL
   (aligné sur les colonnes de la feuille "Dossiers & Relances")
===================================================== */

const INITIAL_FORM = {
  client: "",
  nomPrenoms: "",
  type: "",
  responsable: "",
  dateOuverture: getToday(),
  echeance: "",
  regle: "Non",
  derniereRelance: "",
  notes: "",
};


/* =====================================================
   PAGE
===================================================== */

export default function PilotagePage() {

  const [form, setForm] = useState(INITIAL_FORM);

  const [copied, setCopied] = useState("");

  const [error, setError] = useState("");


  /* ===================================================
     MODIFICATION
  =================================================== */

  function updateField(field, value) {

    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (error) {
      setError("");
    }
  }


  /* ===================================================
     VALIDATION
  =================================================== */

  function isValid() {

    return (
      form.client.trim() &&
      form.type &&
      form.responsable &&
      form.dateOuverture &&
      form.echeance
    );
  }


  /* ===================================================
     MESSAGE WHATSAPP
  =================================================== */

  const whatsappMessage = useMemo(() => {

    return [
      "⚖️ CABINET LAWRY — Nouveau dossier",
      "",
      `Client / Entreprise : ${form.client || "—"}`,
      `Nom et prénoms : ${form.nomPrenoms.trim() || "—"}`,
      `Type : ${form.type || "—"}`,
      `Responsable : ${form.responsable || "—"}`,
      `Date d'ouverture : ${formatDate(form.dateOuverture)}`,
      `Échéance / relance prévue : ${formatDate(form.echeance)}`,
      `Réglé : ${form.regle}`,
      `Dernière relance : ${formatDate(form.derniereRelance)}`,
      `Notes : ${form.notes.trim() || "—"}`,
    ].join("\n");

  }, [form]);


  /* ===================================================
     MESSAGE POUR CLAUDE
  =================================================== */

  const claudeMessage = useMemo(() => {

    return [
      "MISE À JOUR DU FICHIER EXCEL — CABINET LAWRY",
      "",
      "Fichier : Cabinet-LAWRY-pilotage.xlsx",
      "Feuille : Dossiers & Relances",
      "",
      "NOUVEAU DOSSIER",
      "",
      `Client / Entreprise (colonne B) : ${form.client || "—"}`,
      `Nom et prénoms (colonne C) : ${form.nomPrenoms.trim() || "—"}`,
      `Type de dossier (colonne D) : ${form.type || "—"}`,
      `Responsable (colonne E) : ${form.responsable || "—"}`,
      `Date d'ouverture (colonne F) : ${formatDate(form.dateOuverture)}`,
      `Échéance / relance prévue (colonne G) : ${formatDate(form.echeance)}`,
      `Réglé (colonne H) : ${form.regle}`,
      `Dernière relance (colonne J) : ${formatDate(form.derniereRelance)}`,
      `Notes (colonne K) : ${form.notes.trim() || "—"}`,
      "",
      "INSTRUCTIONS POUR LA MISE À JOUR",
      "",
      "1. Ajouter ce dossier à la prochaine ligne disponible.",
      "2. Ne pas supprimer les données déjà présentes.",
      "3. Ne pas modifier les formules existantes.",
      "4. Conserver la structure actuelle du fichier.",
      "5. Ne pas remplir manuellement la colonne Statut (colonne I) si elle est calculée par une formule.",
      "6. Vérifier les dates avant d'enregistrer.",
      "7. Enregistrer le fichier après modification.",
    ].join("\n");

  }, [form]);


  /* ===================================================
     ENVOYER WHATSAPP
  =================================================== */

  function sendWhatsApp() {

    if (!isValid()) {

      setError(
        "Veuillez renseigner les champs obligatoires avant l'envoi."
      );

      return;
    }

    setError("");

    const url =
      `https://wa.me/${WHATSAPP_NUMBER}?text=` +
      encodeURIComponent(whatsappMessage);

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  }


  /* ===================================================
     COPIER WHATSAPP
  =================================================== */

  async function copyWhatsApp() {

    if (!isValid()) {

      setError(
        "Veuillez renseigner les champs obligatoires avant de copier."
      );

      return;
    }

    try {

      await navigator.clipboard.writeText(
        whatsappMessage
      );

      setCopied("whatsapp");

      setTimeout(() => {
        setCopied("");
      }, 2000);

    } catch {

      setError(
        "La copie automatique n'est pas disponible sur ce navigateur."
      );

    }
  }


  /* ===================================================
     COPIER POUR CLAUDE
  =================================================== */

  async function copyClaude() {

    if (!isValid()) {

      setError(
        "Veuillez renseigner les champs obligatoires avant de copier."
      );

      return;
    }

    try {

      await navigator.clipboard.writeText(
        claudeMessage
      );

      setCopied("claude");

      setTimeout(() => {
        setCopied("");
      }, 2000);

    } catch {

      setError(
        "La copie automatique n'est pas disponible sur ce navigateur."
      );

    }
  }


  /* ===================================================
     RÉINITIALISER
  =================================================== */

  function resetForm() {

    setForm({
      ...INITIAL_FORM,
      dateOuverture: getToday(),
    });

    setCopied("");

    setError("");
  }


  /* ===================================================
     RENDU
  =================================================== */

  return (
    <main className={styles.page}>

      {/* =================================================
          HEADER
      ================================================= */}

      <header className={styles.header}>

        <div className={styles.headerInner}>

          <Link
            href="/"
            className={styles.brand}
          >

            <div className={styles.logo}>
              ⚖️
            </div>

            <div>
              <p className={styles.brandName}>
                Cabinet LAWRY
              </p>

              <p className={styles.brandSubtitle}>
                Pilotage juridique
              </p>
            </div>

          </Link>


          <Link
            href="/"
            className={styles.backLink}
          >
            <FiArrowLeft size={15} />
            Accueil
          </Link>

        </div>

      </header>


      {/* =================================================
          MAIN
      ================================================= */}

      <section className={styles.main}>

        {/* =================================================
            INTRO
        ================================================= */}

        <div className={styles.hero}>

          <span className={styles.kicker}>
            ESPACE INTERNE
          </span>

          <h1>
            Pilotage des dossiers
          </h1>

          <p>
            Préparez les informations d'un dossier,
            transmettez-les au Cabinet via WhatsApp
            et générez le contenu prêt à être intégré
            dans le fichier Excel.
          </p>

        </div>


        {/* =================================================
            FORMULAIRE
        ================================================= */}

        <section className={styles.card}>

          <div className={styles.cardHeader}>

            <div className={styles.cardIcon}>
              <FiBriefcase size={19} />
            </div>

            <div>
              <h2>
                Nouveau dossier
              </h2>

              <p>
                Renseignez les informations de pilotage.
              </p>
            </div>

          </div>


          <div className={styles.cardBody}>

            <form
              onSubmit={(e) => e.preventDefault()}
              className={styles.form}
            >

              {/* =========================================
                  INFORMATIONS
              ========================================= */}

              <div className={styles.sectionLabel}>
                Informations du dossier
              </div>


              <div className={styles.grid}>

                {/* CLIENT */}

                <div
                  className={`${styles.field} ${styles.full}`}
                >

                  <label htmlFor="client">
                    Client / Entreprise *
                  </label>

                  <input
                    id="client"
                    type="text"
                    placeholder="Nom du client ou de la société"
                    value={form.client}
                    onChange={(e) =>
                      updateField(
                        "client",
                        e.target.value
                      )
                    }
                  />

                </div>


                {/* NOM ET PRENOMS */}

                <div
                  className={`${styles.field} ${styles.full}`}
                >

                  <label htmlFor="nomPrenoms">
                    Nom et prénoms
                  </label>

                  <input
                    id="nomPrenoms"
                    type="text"
                    placeholder="Nom et prénoms du contact / interlocuteur"
                    value={form.nomPrenoms}
                    onChange={(e) =>
                      updateField(
                        "nomPrenoms",
                        e.target.value
                      )
                    }
                  />

                </div>


                {/* TYPE */}

                <div className={styles.field}>

                  <label htmlFor="type">
                    Type de dossier *
                  </label>

                  <select
                    id="type"
                    value={form.type}
                    onChange={(e) =>
                      updateField(
                        "type",
                        e.target.value
                      )
                    }
                  >

                    <option value="">
                      Sélectionner
                    </option>

                    {TYPES_DOSSIER.map((type) => (
                      <option
                        key={type}
                        value={type}
                      >
                        {type}
                      </option>
                    ))}

                  </select>

                </div>


                {/* RESPONSABLE */}

                <div className={styles.field}>

                  <label htmlFor="responsable">
                    Responsable *
                  </label>

                  <select
                    id="responsable"
                    value={form.responsable}
                    onChange={(e) =>
                      updateField(
                        "responsable",
                        e.target.value
                      )
                    }
                  >

                    <option value="">
                      Sélectionner
                    </option>

                    {RESPONSABLES.map((responsable) => (
                      <option
                        key={responsable}
                        value={responsable}
                      >
                        {responsable}
                      </option>
                    ))}

                  </select>

                </div>


                {/* DATE OUVERTURE */}

                <div className={styles.field}>

                  <label htmlFor="dateOuverture">
                    Date d'ouverture *
                  </label>

                  <input
                    id="dateOuverture"
                    type="date"
                    value={form.dateOuverture}
                    onChange={(e) =>
                      updateField(
                        "dateOuverture",
                        e.target.value
                      )
                    }
                  />

                </div>


                {/* ECHEANCE */}

                <div className={styles.field}>

                  <label htmlFor="echeance">
                    Échéance / relance *
                  </label>

                  <input
                    id="echeance"
                    type="date"
                    value={form.echeance}
                    onChange={(e) =>
                      updateField(
                        "echeance",
                        e.target.value
                      )
                    }
                  />

                </div>


                {/* REGLE */}

                <div className={styles.field}>

                  <label>
                    Dossier réglé ?
                  </label>

                  <div className={styles.radioGroup}>

                    <label
                      className={
                        form.regle === "Non"
                          ? styles.radioActive
                          : styles.radio
                      }
                    >

                      <input
                        type="radio"
                        name="regle"
                        value="Non"
                        checked={form.regle === "Non"}
                        onChange={(e) =>
                          updateField(
                            "regle",
                            e.target.value
                          )
                        }
                      />

                      Non

                    </label>


                    <label
                      className={
                        form.regle === "Oui"
                          ? styles.radioActive
                          : styles.radio
                      }
                    >

                      <input
                        type="radio"
                        name="regle"
                        value="Oui"
                        checked={form.regle === "Oui"}
                        onChange={(e) =>
                          updateField(
                            "regle",
                            e.target.value
                          )
                        }
                      />

                      Oui

                    </label>

                  </div>

                </div>


                {/* DERNIERE RELANCE */}

                <div className={styles.field}>

                  <label htmlFor="derniereRelance">
                    Dernière relance
                  </label>

                  <input
                    id="derniereRelance"
                    type="date"
                    value={form.derniereRelance}
                    onChange={(e) =>
                      updateField(
                        "derniereRelance",
                        e.target.value
                      )
                    }
                  />

                </div>


                {/* NOTES */}

                <div
                  className={`${styles.field} ${styles.full}`}
                >

                  <label htmlFor="notes">
                    Notes
                  </label>

                  <textarea
                    id="notes"
                    placeholder="Précisions, observations, prochaine action..."
                    value={form.notes}
                    onChange={(e) =>
                      updateField(
                        "notes",
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>


              {/* =========================================
                  ERREUR
              ========================================= */}

              {error && (
                <div className={styles.error}>
                  {error}
                </div>
              )}


              {/* =========================================
                  ACTIONS
              ========================================= */}

              <div className={styles.actions}>

                <button
                  type="button"
                  className={`${styles.button} ${styles.primary}`}
                  onClick={sendWhatsApp}
                >

                  <FiSend size={16} />

                  Envoyer sur WhatsApp

                </button>


                <button
                  type="button"
                  className={`${styles.button} ${styles.secondary}`}
                  onClick={copyWhatsApp}
                >

                  {copied === "whatsapp" ? (
                    <FiCheck size={16} />
                  ) : (
                    <FiMessageCircle size={16} />
                  )}

                  {copied === "whatsapp"
                    ? "Message copié"
                    : "Copier WhatsApp"}

                </button>

              </div>


              {/* =========================================
                  CLAUDE
              ========================================= */}

              <div className={styles.claudeBox}>

                <div className={styles.claudeHeader}>

                  <div>

                    <span className={styles.claudeBadge}>
                      02
                    </span>

                    <div>

                      <h3>
                        Préparer la mise à jour Excel
                      </h3>

                      <p>
                        Génère un message structuré à
                        copier dans Claude.
                      </p>

                    </div>

                  </div>

                  <FiClipboard size={19} />

                </div>


                <div className={styles.claudeContent}>

                  <p>
                    Le message contiendra les informations
                    du dossier ainsi que les instructions
                    nécessaires pour mettre à jour
                    <strong> Cabinet-LAWRY-pilotage.xlsx</strong>.
                  </p>


                  <button
                    type="button"
                    className={styles.claudeButton}
                    onClick={copyClaude}
                  >

                    {copied === "claude" ? (
                      <FiCheck size={17} />
                    ) : (
                      <FiCopy size={17} />
                    )}

                    {copied === "claude"
                      ? "Instructions copiées"
                      : "Copier pour Claude"}

                  </button>

                </div>

              </div>


              {/* =========================================
                  RESET
              ========================================= */}

              <button
                type="button"
                className={styles.resetButton}
                onClick={resetForm}
              >

                <FiRefreshCcw size={15} />

                Réinitialiser le formulaire

              </button>

            </form>

          </div>

        </section>


        {/* =================================================
            WORKFLOW
        ================================================= */}

        <section className={styles.workflow}>

          <div className={styles.workflowTitle}>
            <FiCheckCircle size={17} />

            <span>
              Processus de traitement
            </span>
          </div>

          <div className={styles.workflowSteps}>

            <div>
              <strong>01</strong>
              <span>Recevoir la demande</span>
            </div>

            <div>
              <strong>02</strong>
              <span>Préparer le dossier</span>
            </div>

            <div>
              <strong>03</strong>
              <span>Copier pour Claude</span>
            </div>

            <div>
              <strong>04</strong>
              <span>Mettre à jour Excel</span>
            </div>

          </div>

        </section>


        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className={styles.footer}>
          Cabinet LAWRY · Espace interne de pilotage
        </footer>

      </section>

    </main>
  );
}