"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Mientras el resultado se está generando, refresca la página cada 5 s y muestra el tiempo transcurrido.
export default function LiveRefresh({ active, startedAt }) {
  const router = useRouter();
  const [now, setNow] = useState(null);
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const tick = setInterval(() => setNow(Date.now()), 1000);
    const refresh = setInterval(() => router.refresh(), 5000);
    return () => { clearInterval(tick); clearInterval(refresh); };
  }, [active, router]);
  if (!active || !now) return null;
  const s = Math.max(0, Math.floor((now - startedAt) / 1000));
  return <span className="mr-elapsed">{Math.floor(s / 60)}:{String(s % 60).padStart(2, "0")}</span>;
}
