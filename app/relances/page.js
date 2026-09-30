"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  FiArrowLeft,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiLock,
  FiMail,
  FiMessageCircle,
  FiRefreshCcw,
  FiShield,
} from "react-icons/fi";

import styles from "./page.module.css";

/* PAGE */

export default function RelancesPage() {
  const [accessGranted, setAccessGranted] = useState(false);
  const [pin, setPin] = useState("");
  const [accessError, setAccessError] = useState("");
  const [accessLoading, setAccessLoading] = useState(false);

  const [relances, setRelances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [enCours, setEnCours] = useState(""); // action en cours de traitement
  const [emailsEnvoyes, setEmailsEnvoyes] = useState([]); // lignes dont l'e-mail est parti

  useEffect(() => {
    try {
      const savedPin = localStorage.getItem("lawry_pin");
      if (savedPin) {
        setPin(savedPin);
      }
    } catch {}
  }, []);

  /* ===================================================
     ACCÈS
  =================================================== */

  async function verifyAccess(event) {
    event.preventDefault();

    if (!pin.trim()) {
      setAccessError("Veuillez entrer le code d'accès.");
      return;
    }

    setAccessLoading(true);
    setAccessError("");

    try {
      const response = await fetch("/api/lawry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verifyPin", pin }),
      });

      const json = await response.json();
      if (!json.ok) throw new Error(json.error || "Code d'accès incorrect.");

      try {
        localStorage.setItem("lawry_pin", pin);
      } catch {}

      setAccessGranted(true);
    } catch (err) {
      setAccessError(err.message || "Code d'accès incorrect.");
    } finally {
      setAccessLoading(false);
    }
  }

  /* ===================================================
     CHARGEMENT DES RELANCES
  =================================================== */

  useEffect(() => {
    if (accessGranted) chargerRelances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessGranted]);

  async function chargerRelances() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/lawry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "getRelances", data: {}, pin }),
      });

      const json = await response.json();
      if (!json.ok) throw new Error(json.error || "Impossible de charger les relances.");

      setRelances(json.data.relances || []);
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  /* ===================================================
     ACTIONS SUR UNE RELANCE
  =================================================== */

  // WhatsApp : ouvre le lien préparé par le script (message LAWRY déjà rédigé)
  function ouvrirWhatsApp(prospect) {
    if (!prospect.lienWhatsApp) return;
    window.open(prospect.lienWhatsApp, "_blank", "noopener,noreferrer");
  }

  // E-mail : envoi direct via Gmail (message LAWRY défini dans le script)
  async function envoyerEmail(prospect) {
    if (!prospect.email) return;

    setEnCours("mail-" + prospect.ligne);
    setError("");

    try {
      const response = await fetch("/api/lawry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "envoyerEmailRelance",
          data: { ligne: prospect.ligne },
          pin,
        }),
      });

      const json = await response.json();
      if (!json.ok) throw new Error(json.error || "Échec de l'envoi de l'e-mail.");

      setEmailsEnvoyes((current) => [...current, prospect.ligne]);
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setEnCours("");
    }
  }

  async function marquerCommeRelance(prospect) {
    setEnCours(prospect.ligne);
    setError("");

    try {
      const response = await fetch("/api/lawry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "marquerRelance",
          data: { ligne: prospect.ligne },
          pin,
        }),
      });

      const json = await response.json();
      if (!json.ok) throw new Error(json.error || "Échec de l'enregistrement.");

      // On retire le prospect de la liste : sa prochaine relance
      // n'est plus due aujourd'hui.
      setRelances((current) => current.filter((r) => r.ligne !== prospect.ligne));
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setEnCours("");
    }
  }

  /* ===================================================
     ÉCRAN D'ACCÈS
  =================================================== */

  if (!accessGranted) {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <Link href="/" className={styles.brand}>
              <span className={styles.logo}>⚖️</span>
              <span>
                <strong>Cabinet LAWRY</strong>
                <small>Espace équipe</small>
              </span>
            </Link>
            <Link href="/" className={styles.back}>
              <FiArrowLeft size={14} />
              Accueil
            </Link>
          </div>
        </header>

        <section className={`${styles.main} ${styles.accessMain}`}>
          <section className={styles.accessCard}>
            <div className={styles.accessIcon}>
              <FiLock size={25} />
            </div>

            <span className={styles.kicker}>ESPACE ÉQUIPE</span>
            <h1>Accès équipe</h1>
            <p>Entrez le code d'accès de l'équipe pour voir les relances.</p>

            <form onSubmit={verifyAccess} className={styles.accessForm}>
              <label htmlFor="accessPin">Code d'accès</label>
              <input
                id="accessPin"
                type="password"
                inputMode="numeric"
                autoComplete="off"
                placeholder="Entrez le code"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />

              {accessError && <div className={styles.error}>{accessError}</div>}

              <button type="submit" className={styles.primary} disabled={accessLoading}>
                <FiShield size={16} />
                {accessLoading ? "Vérification…" : "Voir les relances"}
              </button>
            </form>
          </section>
        </section>
      </main>
    );
  }

  /* ===================================================
     PAGE RELANCES
  =================================================== */

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brand}>
            <span className={styles.logo}>⚖️</span>
            <span>
              <strong>Cabinet LAWRY</strong>
              <small>Relances du jour</small>
            </span>
          </Link>

          <nav className={styles.nav}>
            <Link href="/prospection">Prospection</Link>
            <Link href="/" className={styles.back}>
              <FiArrowLeft size={14} />
              Accueil
            </Link>
          </nav>
        </div>
      </header>

      <section className={styles.main}>
        <div className={styles.hero}>
          <span className={styles.kicker}>ESPACE ÉQUIPE</span>
          <h1>Relances à faire</h1>
          <p>
            Prospects dont la prochaine relance est due aujourd'hui ou en
            retard. Cliquez sur WhatsApp pour ouvrir le message prêt à envoyer,
            ou sur « Envoyer l'e-mail » pour l'envoyer directement, puis sur
            « Marquer comme relancé » pour programmer la relance suivante.
          </p>

          <button
            type="button"
            className={styles.refreshButton}
            onClick={chargerRelances}
            disabled={loading}
          >
            <FiRefreshCcw size={14} />
            {loading ? "Actualisation…" : "Actualiser"}
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {loading && relances.length === 0 && (
          <div className={styles.empty}>Chargement des relances…</div>
        )}

        {!loading && relances.length === 0 && !error && (
          <div className={styles.empty}>
            <FiCheckCircle size={22} />
            <p>Aucune relance à faire aujourd'hui. Tout est à jour.</p>
          </div>
        )}

        <div className={styles.list}>
          {relances.map((prospect) => (
            <div key={prospect.ligne} className={styles.cardItem}>
              <div className={styles.cardItemTop}>
                <div>
                  <h3>{prospect.nom}</h3>
                  {prospect.entreprise && (
                    <p className={styles.entreprise}>{prospect.entreprise}</p>
                  )}
                </div>

                {prospect.enRetard ? (
                  <span className={styles.badgeRetard}>
                    <FiClock size={12} />
                    En retard
                  </span>
                ) : (
                  <span className={styles.badgeToday}>Aujourd'hui</span>
                )}
              </div>

              <div className={styles.cardItemInfo}>
                <span>{prospect.service || "Service non précisé"}</span>
                {prospect.contact && <span>Tél. {prospect.contact}</span>}
                {prospect.email && <span>{prospect.email}</span>}
                <span>Relances précédentes : {prospect.nbRelances}</span>
                {prospect.collaborateur && (
                  <span>Suivi par {prospect.collaborateur}</span>
                )}
              </div>

              <div className={styles.cardItemActions}>
                <button
                  type="button"
                  className={styles.whatsappButton}
                  onClick={() => ouvrirWhatsApp(prospect)}
                  disabled={!prospect.lienWhatsApp}
                >
                  <FiMessageCircle size={15} />
                  WhatsApp
                </button>

                <button
                  type="button"
                  className={styles.emailButton}
                  onClick={() => envoyerEmail(prospect)}
                  disabled={
                    !prospect.email ||
                    enCours === "mail-" + prospect.ligne ||
                    emailsEnvoyes.includes(prospect.ligne)
                  }
                >
                  <FiMail size={15} />
                  {emailsEnvoyes.includes(prospect.ligne)
                    ? "E-mail envoyé ✓"
                    : enCours === "mail-" + prospect.ligne
                    ? "Envoi…"
                    : "Envoyer l'e-mail"}
                </button>

                <button
                  type="button"
                  className={styles.doneButton}
                  onClick={() => marquerCommeRelance(prospect)}
                  disabled={enCours === prospect.ligne}
                >
                  <FiCheck size={15} />
                  {enCours === prospect.ligne ? "Enregistrement…" : "Marquer comme relancé"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <footer className={styles.footer}>
          Cabinet LAWRY · Espace interne de relance
        </footer>
      </section>
    </main>
  );
}