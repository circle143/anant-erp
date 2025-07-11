import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/main.scss";
import Authentication from "@/components/Authentication/Authentication";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Providers from "./providers";
import { Toaster } from "react-hot-toast";
import { CAlert } from "@coreui/react";

import "bootstrap/dist/css/bootstrap.min.css";
import "boxicons/css/boxicons.min.css";

import RedirectByRole from "@/components/RedirectByRole/RedirectByRole";
const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Horizon Anant",
    description: "Horizon Anant",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable}`}>
                <SpeedInsights />
                <Providers>
                    <Authentication>
                        <RedirectByRole>
                            {children}
                            <Toaster />
                        </RedirectByRole>
                    </Authentication>
                </Providers>
            </body>
        </html>
    );
}
