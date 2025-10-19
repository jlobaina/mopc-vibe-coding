import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { TutorialProvider } from "@/components/tutorial/tutorial-provider";
import { SkipLink } from "@/components/ui/skip-link";
import { PerformanceMonitor } from "@/components/performance/performance-monitor";
import { TutorialOverlay } from "@/components/tutorial/tutorial-overlay";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: "Plataforma de Expropiación - MOPC",
  description: "Plataforma digital para la gestión de casos de expropiación en la República Dominicana",
  keywords: ["expropiación", "gobierno", "casos", "MOPC", "República Dominicana"],
  authors: [{ name: "MOPC Development Team" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1e40af",
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          defaultTheme="system"
          storageKey="mopc-ui-theme"
        >
          <TutorialProvider>
            <AuthProvider>
              <PerformanceMonitor />
              <SkipLink className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50" />

              <div className="min-h-screen flex flex-col bg-background text-foreground">
                <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
                  {children}
                </main>
              </div>

              <TutorialOverlay />
            </AuthProvider>
          </TutorialProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}