import Top from "../Top";
import Inbox from "./Inbox";

export const dynamic = "force-dynamic";

export default function InboxPage({ searchParams }) {
  return (
    <>
      <Top current="inbox" />
      <main className="wrap">
        <div className="bo-head" style={{ paddingBottom: 12 }}>
          <div>
            <h1>Inbox</h1>
            <p>Conversa con los leads desde aquí. Al escribir, tomas el control y Aria deja de contestar en esa conversación hasta que se lo devuelvas.</p>
          </div>
        </div>
        <Inbox initialId={searchParams?.c || ""} />
      </main>
    </>
  );
}
