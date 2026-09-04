import Top from "../Top";
import SettingsForm from "./SettingsForm";
import { describeSettings } from "@/lib/settings";
import { hasRedis } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const groups = await describeSettings();
  return (
    <>
      <Top current="settings" />
      <main className="wrap">
        <div className="bo-head">
          <div>
            <h1>Configuración</h1>
            <p>Se guarda en {hasRedis() ? "Redis" : "el archivo local (dev)"} y aplica al instante (sin redeploy). Si un campo está vacío se usa la variable de entorno de Vercel con el mismo nombre.</p>
          </div>
        </div>
        <SettingsForm initialGroups={groups} />
      </main>
    </>
  );
}
