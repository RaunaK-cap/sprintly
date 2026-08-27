import "./globals.css";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";

export const metadata: Metadata = {
  title: "Sprintly - Modern Workspace & Kanban Boards",
  description: "Real-time collaborative project management inspired by Trello.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${GeistSans.className} bg-[#090d16] text-gray-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}
