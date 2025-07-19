import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/ui/resizable-navbar";
import { NavbarWithChildren } from "@/components/blocks/navbars/navbar-with-children";
import ClientProvider from "@/components/providers/client-provider";
import AuthProvider from "@/components/providers/auth-provider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased  `}
      >
        <AuthProvider session={session}>
          <ClientProvider />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
