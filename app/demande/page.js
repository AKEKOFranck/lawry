"use client";

import { useState } from "react";
import {
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiMail,
  FiMessageCircle,
  FiPhone,
  FiUser,
} from "react-icons/fi";

import styles from "./page.module.css";

/* CONFIGURATION */

const WHATSAPP_NUMBER = "2250777043568";

const TYPES_DEMANDE = [
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

const INITIAL_FORM = {
  nom: "",
  telephone: "",
  email: "",
  type: "",
  urgence: "Normale",
  description: "",
  disponibilite: "",
  informations: "",
};

/* PAGE */

export default function DemandePage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState("");

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    if (error) setError("");
  }

  function isValid() {
    return (
      form.nom.trim() &&
      form.telephone.trim() &&
      form.type &&
      form.description.trim()
    );
  }

  function createWhatsAppMessage() {
    return [
      "⚖️ CABINET LAWRY — Nouvelle demande client",
      "",
      `Client : ${form.nom || "—"}`,
      `Téléphone : ${form.telephone || "—"}`,
      `Email : ${form.email || "—"}`,
      "",
      `Type de demande : ${form.type || "—"}`,
      `Urgence : ${form.urgence || "—"}`,
      "",
      "Description de la demande :",
      form.description.trim() || "—",
      "",
      `Disponibilité : ${form.disponibilite.trim() || "—"}`,
      "",
      "Informations complémentaires :",
      form.informations.trim() || "—",
      "",
      "📌 Demande reçue via le formulaire en ligne LAWRY.",
    ].join("\n");
  }

  /* ENVOI : enregistrement dans Excel + ouverture de WhatsApp */

  function handleSubmit(event) {
    event.preventDefault();

    if (!isValid()) {
      setError(
        "Veuillez renseigner votre nom, votre téléphone, le type de demande et sa description."
      );
      return;
    }

    setError("");

    // 1) Enregistrement dans le classeur (feuille « Demandes »).
    //    Pas de "await" : on ne retarde pas l'ouverture de WhatsApp,
    //    et une éventuelle panne du classeur ne bloque pas le client.
    fetch("/api/lawry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "addDemande", data: form }),
      keepalive: true,
    }).catch(() => {});

    // 2) WhatsApp
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      createWhatsAppMessage()
    )}`;

    window.open(url, "_blank", "noopener,noreferrer");
  }

  function resetForm() {
    setForm(INITIAL_FORM);
    setError("");
  }

  return (
    <main className={styles.page}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>⚖️</div>
          <div>
            <p className={styles.brand}>Cabinet LAWRY</p>
            <p className={styles.subtitle}>Demande juridique</p>
          </div>
        </div>
      </header>

      <section className={styles.main}>
        {/* INTRODUCTION */}
        <div className={styles.intro}>
          <span className={styles.badge}>
            <FiMessageCircle size={14} />
            Demande en ligne
          </span>

          <h1>
            Comment pouvons-nous
            <span> vous accompagner ?</span>
          </h1>

          <p>
            Quelques informations nous permettront de mieux
            comprendre votre besoin et de préparer votre prise
            en charge par le Cabinet LAWRY.
          </p>
        </div>

        {/* FORMULAIRE */}
        <section className={styles.card}>
          <div className={styles.cardTop}>
            <div>
              <h2>Votre demande</h2>
              <p>Les informations marquées d'un astérisque sont obligatoires.</p>
            </div>

            <div className={styles.cardIcon}>
              <FiMessageCircle size={20} />
            </div>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            {/* 01 — COORDONNÉES */}
            <div className={styles.sectionTitle}>
              <span>01</span>
              Vos coordonnées
            </div>

            <div className={styles.grid}>
              <div className={styles.field}>
                <label>
                  <FiUser size={14} />
                  Nom / Prénom ou société *
                </label>
                <input
                  type="text"
                  placeholder="Ex. Jean Kouassi"
                  value={form.nom}
                  onChange={(e) => updateField("nom", e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label>
                  <FiPhone size={14} />
                  Téléphone *
                </label>
                <input
                  type="tel"
                  placeholder="Ex. 0700000000"
                  value={form.telephone}
                  onChange={(e) => updateField("telephone", e.target.value)}
                />
              </div>

              <div className={`${styles.field} ${styles.full}`}>
                <label>
                  <FiMail size={14} />
                  Adresse e-mail
                </label>
                <input
                  type="email"
                  placeholder="Ex. jean@email.com"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </div>
            </div>

            {/* 02 — BESOIN */}
            <div className={styles.sectionTitle}>
              <span>02</span>
              Votre besoin
            </div>

            <div className={styles.grid}>
              <div className={`${styles.field} ${styles.full}`}>
                <label>Type de demande *</label>
                <select
                  value={form.type}
                  onChange={(e) => updateField("type", e.target.value)}
                >
                  <option value="">Sélectionner votre demande</option>
                  {TYPES_DEMANDE.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className={`${styles.field} ${styles.full}`}>
                <label>Décrivez votre demande *</label>
                <textarea
                  placeholder="Expliquez-nous brièvement votre situation ou votre besoin juridique..."
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                />
              </div>
            </div>

            {/* 03 — URGENCE */}
            <div className={styles.sectionTitle}>
              <span>03</span>
              Disponibilité et urgence
            </div>

            <div className={styles.grid}>
              <div className={styles.field}>
                <label>
                  <FiClock size={14} />
                  Niveau d'urgence
                </label>
                <select
                  value={form.urgence}
                  onChange={(e) => updateField("urgence", e.target.value)}
                >
                  <option value="Normale">Normale</option>
                  <option value="Importante">Importante</option>
                  <option value="Urgente">Urgente</option>
                </select>
              </div>

              <div className={styles.field}>
                <label>Vos disponibilités</label>
                <input
                  type="text"
                  placeholder="Ex. Lundi après-midi"
                  value={form.disponibilite}
                  onChange={(e) => updateField("disponibilite", e.target.value)}
                />
              </div>

              <div className={`${styles.field} ${styles.full}`}>
                <label>Informations complémentaires</label>
                <textarea
                  className={styles.smallTextarea}
                  placeholder="Toute autre information utile..."
                  value={form.informations}
                  onChange={(e) => updateField("informations", e.target.value)}
                />
              </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.actions}>
              <button type="submit" className={styles.primaryButton}>
                <FiMessageCircle size={17} />
                Envoyer ma demande
                <FiArrowRight size={17} />
              </button>

              <button
                type="button"
                className={styles.resetButton}
                onClick={resetForm}
              >
                Réinitialiser
              </button>
            </div>

            <div className={styles.notice}>
              <FiCheckCircle size={16} />
              <p>
                Après validation, WhatsApp s'ouvrira avec
                votre demande déjà préparée. Il vous suffira
                de l'envoyer au Cabinet LAWRY.
              </p>
            </div>
          </form>
        </section>

        <footer className={styles.footer}>
          Cabinet LAWRY · Demande juridique en ligne
        </footer>
      </section>
    </main>
  );
}