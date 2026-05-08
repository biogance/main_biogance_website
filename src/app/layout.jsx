import "./globals.css";
import { ReduxProvider } from "../redux/provider";
import I18nProvider from "../Components/I18nProvider";
import { RouteTopLoader } from "../Components/Pages/TopLoader";
import { Suspense } from "react";

export const metadata = {
  title: "Biogance - Biogance",
  description: "Pioneers in Natural Pet Care",
  icons: {
    icon: [
      { url: "/FF.svg", type: "image/svg+xml" },
    ],
  },

  robots: {
    index: false,
    follow: false,
  },
  
  openGraph: {
    title: "Biogance - Biogance",
    description: "Pioneers in Natural Pet Care",
    images: [
      {
        url: "/og-image.jpg", 
        width: 1200,
        height: 630,
        alt: "Biogance - Pioneers in Natural Pet Care",
      },
    ],
  },
 
  twitter: {
    card: "summary_large_image",
    title: "Biogance - Biogance",
    description: "Pioneers in Natural Pet Care",
    images: ["/fav.svg"], 
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/FF.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Inter', sans-serif" }} suppressHydrationWarning>
        <ReduxProvider>
          <I18nProvider>
            <Suspense fallback={null}><RouteTopLoader /></Suspense>
            {children}
          </I18nProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}