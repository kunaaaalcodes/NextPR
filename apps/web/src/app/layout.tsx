import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Noto_Serif_SC } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/lib/auth";
import "./globals.css";

const notoSerifSC = Noto_Serif_SC({
  weight: "variable",
  subsets: ["latin"],
  variable: "--font-noto-serif-sc",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NextPR — Find open-source issues that fit your skills",
    template: "%s · NextPR",
  },
  description:
    "Sign in to find open-source issues matched to your skills, review project context, and contribute where you can help.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${notoSerifSC.variable} ${inter.variable}`}>
      <body>
        <AuthProvider>
          <Navbar />
          <main className="main-content">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
