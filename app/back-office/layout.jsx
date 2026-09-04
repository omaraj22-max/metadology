import "./bo.css";

export const metadata = { title: "Back office · Metadology WhatsApp", robots: { index: false, follow: false } };

export default function BackOfficeLayout({ children }) {
  return <div className="bo">{children}</div>;
}
