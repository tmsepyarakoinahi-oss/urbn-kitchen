import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Urban Kitchen — Manufacturing & Solutions | Premium Commercial Kitchen Equipment",
  description: "India's leading manufacturer of commercial kitchen equipment. Premium industrial burners, ranges, refrigeration, and complete kitchen solutions for hotels, restaurants, and catering businesses.",
  keywords: ["commercial kitchen", "industrial equipment", "kitchen solutions", "hotel kitchen", "restaurant equipment", "Urban Kitchen"],
  authors: [{ name: "Urban Kitchen" }],
  icons: {
    icon: "/logo.jpg",
  },
  openGraph: {
    title: "Urban Kitchen — Manufacturing & Solutions",
    description: "Premium commercial kitchen equipment manufacturer",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${poppins.variable} antialiased bg-[#0b0b0b] text-white font-sans`}
        suppressHydrationWarning
      >
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
