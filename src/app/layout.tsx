import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientProvider from "@/components/providers/client-provider";
import AuthProvider from "@/components/providers/auth-provider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Toaster } from "sonner";
import AccessibilityStyles from "@/components/accessibility/accessibility-styles";
import AccessibilityButton from "@/components/accessibility/accessibility-button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Disability Job Platform",
  description: "Inclusive job platform for people with disabilities",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  console.log("Session in RootLayout:", session);
  return (
    <html lang="en" className="accessibility-text">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased accessibility-text`}
      >
        <AccessibilityStyles />
        <AuthProvider session={session}>
          <ClientProvider />
          <div id="main-content" className="overflow-hidden">
            {children}
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
