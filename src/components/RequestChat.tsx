import { useEffect, useRef, useState } from "react";
import { ChevronDown, Send } from "lucide-react";
import { formatDateTime } from "../data/requests";
import type { RequestStatus, ServiceRequest } from "../data/requests";
import { useAppStore } from "../store/useAppStore";
import { useRequestsStore } from "../store/useRequestsStore";

// Mensajería dentro de la solicitud (HU-17): solo mientras la solicitud sigue abierta
const OPEN: RequestStatus[] = ["pendiente", "aceptada", "pendiente_confirmacion", "en_disputa"];

export default function RequestChat({ r }: { r: ServiceRequest }) {
  const user = useAppStore((s) => s.currentUser);
  const send = useRequestsStore((s) => s.sendMessage);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const canWrite = OPEN.includes(r.status);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ block: "nearest" });
  }, [open, r.messages.length]);

  if (!user) return null;
  const submit = () => {
    if (!text.trim()) return;
    send(r.id, user.id, text);
    setText("");
  };

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-forest-900/60 transition-colors hover:text-terracotta-500"
      >
        Mensajes{r.messages.length > 0 ? ` (${r.messages.length})` : ""}
        <ChevronDown size={14} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-2 rounded-xl bg-forest-900/5 p-3">
          <div className="flex max-h-60 flex-col gap-2 overflow-y-auto" aria-live="polite">
            {r.messages.length === 0 && (
              <p className="text-sm text-forest-900/60">Aún no hay mensajes. Escribe para coordinar los detalles del servicio.</p>
            )}
            {r.messages.map((m) => {
              const mine = m.from === user.id;
              return (
                <div key={m.id} className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${mine ? "self-end bg-forest-900 text-white" : "self-start bg-white text-forest-900"}`}>
                  <p className="whitespace-pre-wrap break-words">{m.text}</p>
                  <p className={`mt-1 text-[10px] ${mine ? "text-white/60" : "text-forest-900/50"}`}>{formatDateTime(m.at)}</p>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>
          {canWrite ? (
            <form
              className="mt-3 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={500}
                placeholder="Escribe un mensaje…"
                aria-label="Mensaje"
                className="min-w-0 flex-1 rounded-full border border-forest-900/15 bg-white px-4 py-2 text-sm outline-none focus:border-terracotta-500"
              />
              <button
                type="submit"
                disabled={!text.trim()}
                aria-label="Enviar mensaje"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-terracotta-500 text-white transition-opacity disabled:opacity-40"
              >
                <Send size={16} />
              </button>
            </form>
          ) : (
            <p className="mt-3 text-xs font-semibold text-forest-900/50">La solicitud está cerrada: la conversación quedó solo de lectura.</p>
          )}
        </div>
      )}
    </div>
  );
}
