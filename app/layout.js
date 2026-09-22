import "./globals.css";

export const metadata = {
  title: "Cabinet LAWRY — Pilotage",
  description: "Gestion et pilotage des dossiers du Cabinet LAWRY",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}