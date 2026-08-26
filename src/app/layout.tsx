import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Conectados | CRM & Operations",
  description: "Centro de operaciones interno de Conectados.",
  robots: { index: false, follow: false },
};

// Es un CRM privado autenticado: ninguna página se beneficia de generación
// estática, y NextAuth necesita request headers (no disponibles en build)
// para resolver su base URL cuando NEXTAUTH_URL no está seteada.
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
