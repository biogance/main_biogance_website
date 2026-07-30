import "./globals.css";
import { ReduxProvider } from "../redux/provider";
import I18nProvider from "../Components/I18nProvider";
import { RouteTopLoader, PullToRefresh } from "../Components/Pages/TopLoader";
import { Suspense } from "react";
import { Toaster } from 'react-hot-toast';
import PageLoader from "../Components/PageLoader";


export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#ffffff" },
  ],
  colorScheme: "light",
};

export const metadata = {
  title: "Biogance - Biogance",
  description: "Pioneers in Natural Pet Care",
  icons: {
    icon: [
      { url: "/logoblack.svg", type: "image/svg+xml", media: "(prefers-color-scheme: light)" },
      { url: "/FF.svg", type: "image/svg+xml", media: "(prefers-color-scheme: dark)" },
    ],
  },

  robots: {
    index: false,
    follow: false,
  },
  
  openGraph: {
    title: "Biogance - Biogance",
    description: "Pioneers in Natural Pet Care",
    // No explicit images here — Next.js auto-picks up src/app/opengraph-image.jsx
    // for every route that doesn't set its own (like /advices/[slug] does).
  },

  twitter: {
    card: "summary_large_image",
    title: "Biogance - Biogance",
    description: "Pioneers in Natural Pet Care",
    // Falls back to the resolved openGraph image (see above) when unset.
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: dark)" />
        <meta name="color-scheme" content="light" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="icon" type="image/svg+xml" href="/logoblack.svg" media="(prefers-color-scheme: light)" />
        <link rel="icon" type="image/svg+xml" href="/FF.svg" media="(prefers-color-scheme: dark)" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Inter', sans-serif" }} suppressHydrationWarning>
        <ReduxProvider>
          <I18nProvider>
            <PageLoader />
            <PullToRefresh />
            <Suspense fallback={null}><RouteTopLoader /></Suspense>
            <Toaster position="top-right" toastOptions={{ duration: 4000, style: { zIndex: 999999 } }} containerStyle={{ zIndex: 999999 }} />
            {children}
          </I18nProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}