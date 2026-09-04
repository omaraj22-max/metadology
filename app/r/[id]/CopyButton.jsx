"use client";
import { useState } from "react";

export default function CopyButton({ text, label = "Copiar" }) {
  const [ok, setOk] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setOk(true);
      setTimeout(() => setOk(false), 1600);
    } catch {}
  }
  return (
    <button type="button" className="mr-copybtn" onClick={copy}>{ok ? "Copiado ✓" : label}</button>
  );
}
