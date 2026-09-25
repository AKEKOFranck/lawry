"use client";

import { useState } from "react";
import Link from "next/link";

import {
  FiArrowLeft,
  FiCheckCircle,
  FiLock,
  FiSend,
  FiShield,
} from "react-icons/fi";

import styles from "./page.module.css";

/*
=====================================================
CONFIGURATION
=====================================================
*/

const SERVICES = [
  "Conseil et assistance juridique",
  "Création de société",
  "Rédaction de contrat",
  "Analyse de contrat",
  "Contentieux",
  "Recouvrement",
  "Droit des affaires",
  "Droit du travail",
  "Autre",
  "A voir",
];

const CANAUX = [
  "Prospection directe",
  "Prescripteurs",
  "Contenu / réseau",
];

const COLLABORATEURS = [
  "Mariame",
  "Assistante",
  "Boss",
];

const INITIAL_FORM = {
  nom: "",
  entreprise: "",
  contact: "",
  email: "",
  service: "",
  canal: "Prospection directe",
  collaborateur: "",
  observation: "",
};

function formatIso(iso) {
  return iso
    ? iso.split("-").reverse().join("/")
    : "—";
}

/*
=====================================================
PAGE
=====================================================
*/

export default function ProspectionPage() {
  const [accessGranted, setAccessGranted] =
    useState(false);

  const [pin, setPin] = useState("");

  const [accessError, setAccessError] =
    useState("");

  const [accessLoading, setAccessLoading] =
    useState(false);

  const [form, setForm] =
    useState(INITIAL_FORM);

  const [state, setState] = useState({
    status: "idle",
    message: "",
    result: null,
  });

  /*
  ===================================================
  VÉRIFICATION DU CODE
  ===================================================
  */

  async function verifyAccess(event) {
    event.preventDefault();

    if (!pin.trim()) {
      setAccessError(
        "Veuillez entrer le code d'accès."
      );
      return;
    }

    setAccessLoading(true);
    setAccessError("");

    try {
      const response = await fetch(
        "/api/lawry",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            action: "verifyPin",
            pin,
          }),
        }
      );

      const json =
        await response.json();

      if (!json.ok) {
        throw new Error(
          json.error ||
            "Code d'accès incorrect."
        );
      }

      setAccessGranted(true);
    } catch (error) {
      setAccessError(
        error.message ||
          "Code d'accès incorrect."
      );
    } finally {
      setAccessLoading(false);
    }
  }

  /*
  ===================================================
  FORMULAIRE
  ===================================================
  */

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (state.status === "error") {
      setState({
        status: "idle",
        message: "",
        result: null,
      });
    }
  }

  const isValid =
    form.nom.trim() &&
    form.contact.trim() &&
    form.collaborateur;

  /*
  ===================================================
  ENREGISTREMENT
  ===================================================
  */

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isValid) {
      setState({
        status: "error",
        message:
          "Renseignez le nom, le contact et le collaborateur.",
        result: null,
      });

      return;
    }

    setState({
      status: "loading",
      message: "",
      result: null,
    });

    try {
      const response = await fetch(
        "/api/lawry",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            action: "addProspect",
            data: form,
            pin,
          }),
        }
      );

      const json =
        await response.json();

      if (!json.ok) {
        throw new Error(
          json.error ||
            "Échec de l'enregistrement."
        );
      }

      setState({
        status: "success",
        message: "",
        result: json.data,
      });
    } catch (error) {
      setState({
        status: "error",
        message:
          error.message ||
          "Une erreur est survenue.",
        result: null,
      });
    }
  }

  function newSheet() {
    setForm({
      ...INITIAL_FORM,
      collaborateur:
        form.collaborateur,
    });

    setState({
      status: "idle",
      message: "",
      result: null,
    });
  }

  /*
  ===================================================
  ÉCRAN D'ACCÈS
  ===================================================
  */

  if (!accessGranted) {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <Link
              href="/"
              className={styles.brand}
            >
              <span
                className={styles.logo}
              >
                ⚖️
              </span>

              <span>
                <strong>
                  Cabinet LAWRY
                </strong>

                <small>
                  Espace équipe
                </small>
              </span>
            </Link>

            <Link
              href="/"
              className={styles.back}
            >
              <FiArrowLeft size={14} />
              Accueil
            </Link>
          </div>
        </header>

        <section
          className={`${styles.main} ${styles.accessMain}`}
        >
          <section
            className={
              styles.accessCard
            }
          >
            <div
              className={
                styles.accessIcon
              }
            >
              <FiLock size={25} />
            </div>

            <span
              className={styles.kicker}
            >
              ESPACE ÉQUIPE
            </span>

            <h1>Accès équipe</h1>

            <p>
              Entrez le code d'accès de
              l'équipe pour accéder à la
              prospection.
            </p>

            <form
              onSubmit={verifyAccess}
              className={
                styles.accessForm
              }
            >
              <label htmlFor="accessPin">
                Code d'accès
              </label>

              <input
                id="accessPin"
                type="password"
                inputMode="numeric"
                autoComplete="off"
                placeholder="Entrez le code"
                value={pin}
                onChange={(event) =>
                  setPin(
                    event.target.value
                  )
                }
              />

              {accessError && (
                <div
                  className={
                    styles.error
                  }
                >
                  {accessError}
                </div>
              )}

              <button
                type="submit"
                className={
                  styles.primary
                }
                disabled={accessLoading}
              >
                <FiShield size={16} />

                {accessLoading
                  ? "Vérification…"
                  : "Accéder à la prospection"}
              </button>
            </form>

            <div
              className={
                styles.accessNotice
              }
            >
              <FiCheckCircle
                size={15}
              />
              Accès réservé à l'équipe
              du Cabinet LAWRY.
            </div>
          </section>
        </section>
      </main>
    );
  }

  /*
  ===================================================
  PAGE PROSPECTION
  ===================================================
  */

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link
            href="/"
            className={styles.brand}
          >
            <span
              className={styles.logo}
            >
              ⚖️
            </span>

            <span>
              <strong>
                Cabinet LAWRY
              </strong>

              <small>
                Prospection commerciale
              </small>
            </span>
          </Link>

          <nav className={styles.nav}>
            <Link href="/relances">
              Relances
            </Link>

            <Link
              href="/"
              className={styles.back}
            >
              <FiArrowLeft size={14} />
              Accueil
            </Link>
          </nav>
        </div>
      </header>

      <section className={styles.main}>
        <div className={styles.hero}>
          <span className={styles.kicker}>
            ESPACE ÉQUIPE
          </span>

          <h1>
            Fiche de prospection
          </h1>

          <p>
            Remplissez la fiche après
            chaque prise de contact.
          </p>
        </div>

        {state.status === "success" ? (
          <section className={styles.card}>
            <div
              className={
                styles.success
              }
            >
              <FiCheckCircle
                size={38}
              />

              <h2>
                Fiche enregistrée
              </h2>

              <p>
                Prospect{" "}
                <strong>
                  {state.result?.id ||
                    "enregistré"}
                </strong>{" "}
                ajouté au Journal.
                <br />

                {state.result
                  ?.prochaine && (
                  <>
                    Première relance
                    prévue le{" "}
                    <strong>
                      {formatIso(
                        state.result
                          .prochaine
                      )}
                    </strong>
                    .
                  </>
                )}
              </p>

              <div
                className={
                  styles.actions
                }
              >
                <button
                  type="button"
                  className={
                    styles.primary
                  }
                  onClick={newSheet}
                >
                  Nouvelle fiche
                </button>

                <Link
                  href="/relances"
                  className={
                    styles.secondary
                  }
                >
                  Voir les relances
                </Link>
              </div>
            </div>
          </section>
        ) : (
          <section className={styles.card}>
            <form
              className={styles.form}
              onSubmit={handleSubmit}
              noValidate
            >
              <div
                className={
                  styles.sectionLabel
                }
              >
                Le prospect
              </div>

              <div className={styles.grid}>
                <div
                  className={styles.field}
                >
                  <label htmlFor="nom">
                    Noms et prénoms *
                  </label>

                  <input
                    id="nom"
                    type="text"
                    placeholder="Ex. KADIO Yoan"
                    value={form.nom}
                    onChange={(e) =>
                      updateField(
                        "nom",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div
                  className={styles.field}
                >
                  <label htmlFor="entreprise">
                    Entreprise
                  </label>

                  <input
                    id="entreprise"
                    type="text"
                    placeholder="Ex. Groupe MERMISA"
                    value={
                      form.entreprise
                    }
                    onChange={(e) =>
                      updateField(
                        "entreprise",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div
                  className={styles.field}
                >
                  <label htmlFor="contact">
                    Contact *
                  </label>

                  <input
                    id="contact"
                    type="tel"
                    placeholder="Ex. 0748904218"
                    value={
                      form.contact
                    }
                    onChange={(e) =>
                      updateField(
                        "contact",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div
                  className={styles.field}
                >
                  <label htmlFor="email">
                    E-mail
                  </label>

                  <input
                    id="email"
                    type="email"
                    placeholder="Facultatif"
                    value={form.email}
                    onChange={(e) =>
                      updateField(
                        "email",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div
                className={
                  styles.sectionLabel
                }
              >
                La prise de contact
              </div>

              <div className={styles.grid}>
                <div
                  className={styles.field}
                >
                  <label htmlFor="service">
                    Service
                  </label>

                  <select
                    id="service"
                    value={
                      form.service
                    }
                    onChange={(e) =>
                      updateField(
                        "service",
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      À préciser
                    </option>

                    {SERVICES.map(
                      (service) => (
                        <option
                          key={service}
                          value={service}
                        >
                          {service}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div
                  className={styles.field}
                >
                  <label htmlFor="canal">
                    Canal
                  </label>

                  <select
                    id="canal"
                    value={form.canal}
                    onChange={(e) =>
                      updateField(
                        "canal",
                        e.target.value
                      )
                    }
                  >
                    {CANAUX.map(
                      (canal) => (
                        <option
                          key={canal}
                          value={canal}
                        >
                          {canal}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div
                  className={styles.field}
                >
                  <label htmlFor="collaborateur">
                    Collaborateur *
                  </label>

                  <select
                    id="collaborateur"
                    value={
                      form.collaborateur
                    }
                    onChange={(e) =>
                      updateField(
                        "collaborateur",
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Sélectionner
                    </option>

                    {COLLABORATEURS.map(
                      (collaborateur) => (
                        <option
                          key={
                            collaborateur
                          }
                          value={
                            collaborateur
                          }
                        >
                          {collaborateur}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div
                  className={`${styles.field} ${styles.full}`}
                >
                  <label htmlFor="observation">
                    Observation
                  </label>

                  <textarea
                    id="observation"
                    placeholder="Ex. Intéressé par une formation..."
                    value={
                      form.observation
                    }
                    onChange={(e) =>
                      updateField(
                        "observation",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              {state.status ===
                "error" && (
                <div
                  className={
                    styles.error
                  }
                >
                  {state.message}
                </div>
              )}

              <div
                className={
                  styles.actions
                }
              >
                <button
                  type="submit"
                  className={
                    styles.primary
                  }
                  disabled={
                    state.status ===
                    "loading"
                  }
                >
                  <FiSend size={16} />

                  {state.status ===
                  "loading"
                    ? "Envoi en cours…"
                    : "Enregistrer la fiche"}
                </button>
              </div>
            </form>
          </section>
        )}

        <footer className={styles.footer}>
          Cabinet LAWRY · Espace interne
          de prospection
        </footer>
      </section>
    </main>
  );
}