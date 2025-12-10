import { Inter } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "../redux/provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Biogance - Biogance",
  description: "Pioneers in Natural Pet Care",
  // Add these lines for the favicon
  icons: {
    icon: "/FF.svg",        // ← your SVG favicon
    // optional: you can also add apple touch icon, etc.
    // apple: "/logo.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}