"use client";

import Link from "next/link";

import {
  FiArrowRight,
  FiBriefcase,
  FiCheckCircle,
  FiClipboard,
  FiMessageCircle,
  FiShield,
} from "react-icons/fi";

import styles from "./page.module.css";

const features = [
  {
    icon: FiMessageCircle,
    title: "Demande en ligne",
    text: "Le client décrit simplement son besoin juridique à travers un formulaire.",
  },
  {
    icon: FiClipboard,
    title: "Pilotage des dossiers",
    text: "L'équipe du Cabinet centralise les informations importantes de chaque dossier.",
  },
  {
    icon: FiCheckCircle,
    title: "Suivi structuré",
    text: "Les informations peuvent ensuite être transmises vers le fichier de pilotage.",
  },
];

export default function Home() {
  return (
    <main className={styles.page}>
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

              <p
                className={
                  styles.brandSubtitle
                }
              >
                Espace numérique
              </p>
            </div>
          </Link>

          <div
            className={styles.headerLinks}
          >
            <Link
              href="/prospection"
              className={
                styles.headerLink
              }
            >
              Prospection
              <FiArrowRight size={15} />
            </Link>

            <Link
              href="/pilotage"
              className={
                styles.headerLink
              }
            >
              Espace pilotage
              <FiArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <span className={styles.badge}>
              <FiShield size={14} />
              Cabinet LAWRY
            </span>

            <h1>
              Une gestion juridique
              <span>
                {" "}
                plus simple et structurée.
              </span>
            </h1>

            <p>
              Le Cabinet LAWRY met à votre
              disposition un espace numérique
              permettant de transmettre votre
              demande et de faciliter le suivi
              de votre dossier.
            </p>

            <div
              className={
                styles.heroActions
              }
            >
              <Link
                href="/demande"
                className={
                  styles.primaryButton
                }
              >
                Faire une demande
                <FiArrowRight size={17} />
              </Link>

              <Link
                href="/pilotage"
                className={
                  styles.secondaryButton
                }
              >
                Espace de pilotage
              </Link>
            </div>
          </div>

          <div className={styles.heroCard}>
            <div
              className={
                styles.heroCardTop
              }
            >
              <div
                className={
                  styles.heroIcon
                }
              >
                <FiBriefcase
                  size={22}
                />
              </div>

              <span>LAWRY</span>
            </div>

            <div
              className={
                styles.heroCardContent
              }
            >
              <p
                className={
                  styles.smallLabel
                }
              >
                ESPACE JURIDIQUE
              </p>

              <h2>
                Votre demande,
                <br />
                notre attention.
              </h2>

              <p>
                Un parcours simple pour
                transmettre les informations
                essentielles au Cabinet.
              </p>
            </div>

            <div
              className={
                styles.heroCardBottom
              }
            >
              <div>
                <strong>01</strong>
                <span>Demande</span>
              </div>

              <div>
                <strong>02</strong>
                <span>Analyse</span>
              </div>

              <div>
                <strong>03</strong>
                <span>Suivi</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className={
          styles.processSection
        }
      >
        <div
          className={
            styles.sectionIntro
          }
        >
          <span
            className={
              styles.sectionKicker
            }
          >
            COMMENT ÇA FONCTIONNE ?
          </span>

          <h2>
            Un parcours pensé pour
            <span>
              {" "}
              gagner du temps.
            </span>
          </h2>

          <p>
            Les demandes sont recueillies
            de manière structurée afin de
            faciliter leur traitement et
            leur suivi par l'équipe du
            Cabinet.
          </p>
        </div>

        <div className={styles.features}>
          {features.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className={
                  styles.featureCard
                }
              >
                <div
                  className={
                    styles.featureIcon
                  }
                >
                  <Icon size={19} />
                </div>

                <h3>{item.title}</h3>

                <p>{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section
        className={styles.ctaSection}
      >
        <div className={styles.cta}>
          <div>
            <span>
              BESOIN D'UNE ASSISTANCE
              JURIDIQUE ?
            </span>

            <h2>
              Présentez-nous votre
              demande.
            </h2>

            <p>
              Quelques informations
              suffisent pour nous permettre
              de mieux comprendre votre
              besoin.
            </p>
          </div>

          <Link
            href="/demande"
            className={
              styles.ctaButton
            }
          >
            Commencer ma demande
            <FiArrowRight size={17} />
          </Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <div>
          © {new Date().getFullYear()}{" "}
          Cabinet LAWRY
        </div>

        <div>
          Espace numérique du Cabinet
        </div>
      </footer>
    </main>
  );
}