import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SINAG — AI-Powered Graduate Advising | UPLB SESAM",
  description: "SINAG is an AI-powered, natural language-driven consultation platform for graduate thesis and dissertation advising within SESAM, UPLB. Join our MS and PhD programs in Environmental Science.",
  keywords: ["UPLB", "SESAM", "Environmental Science", "Graduate School", "Thesis Advising", "AI", "Philippines"],
  openGraph: {
    title: "SINAG — AI-Powered Graduate Advising",
    description: "Your AI-powered companion for graduate advising at UPLB SESAM",
    type: "website",
  },
};

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
