import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Opero",
  description: "Внутрішня операційна система компанії"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uk">
      <body>{children}</body>
    </html>
  );
}

