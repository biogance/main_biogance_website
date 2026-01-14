import { Inter } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "../redux/provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Biogance - Biogance",
  description: "Pioneers in Natural Pet Care",
  icons: {
    icon: "/FF.svg",
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
      <body className={inter.className} suppressHydrationWarning>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}