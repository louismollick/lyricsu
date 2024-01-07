export const runtime = "edge";

import "~/styles/globals.css";

import { Inter } from "next/font/google";
import { headers } from "next/headers";

import { TRPCReactProvider } from "~/trpc/react";
import ClientProviders from "../components/clientProviders";
import { cn } from "~/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Create T3 App",
  description: "Generated by create-t3-app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          "dark relative flex h-screen flex-col bg-background font-sans antialiased",
          inter.variable,
        )}
      >
        <TRPCReactProvider headers={headers()}>
          <ClientProviders>{children}</ClientProviders>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
