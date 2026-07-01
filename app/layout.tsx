// app/layout.tsx
import type { Metadata } from "next";
import "@/styles/globals.css";
import { AuthProvider }      from "@/context/AuthContext";
import { ConditionalLayout } from "@/components/shared/ConditionalLayout";
import { ToastProvider }     from "@/components/shared/Toast";

export const metadata: Metadata = {
  title:       { default: "Mona's Closet", template: "%s | Mona's Closet" },
  description: "Trendy women's fashion delivered across Sri Lanka. Shop dresses, tops, accessories and more.",
  keywords:    ["women's fashion", "Sri Lanka", "online clothing", "Colombo", "MOD"],
  openGraph: {
    type:        "website",
    siteName:    "Mona's Closet",
    locale:      "en_LK",
  },
  metadataBase: new URL("https://monascloset.lk"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <AuthProvider>
          <ToastProvider>
            {/* Skip to content for accessibility */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-999 focus:bg-brand-mauve focus:text-white focus:px-4 focus:py-2 focus:rounded-card focus:text-sm focus:font-medium"
            >
              Skip to content
            </a>

            <ConditionalLayout>{children}</ConditionalLayout>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
