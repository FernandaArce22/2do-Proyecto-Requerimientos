import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDateTime, statusInfo } from "../data/requests";
import type { ServiceRequest } from "../data/requests";
import { colones, workers } from "../data/workers";
import { Banner, Btn, Card, PageTitle } from "../components/Ui";
import { useAppStore } from "../store/useAppStore";
import { useRequestsStore } from "../store/useRequestsStore";

function DisputeCard({ r, onResolved }: { r: ServiceRequest; onResolved: (m: string) => void }) {
  const users = useAppStore((s) => s.users);
  const resolve = useRequestsStore((s) => s.resolveDispute);
  const [note, setNote] = useState("");
  const client = users.find((u) => u.id === r.clientId)?.name ?? "Cliente";
  const worker = workers.find((w) => w.id === r.workerId)?.name ?? "Trabajador";
  const ready = note.trim().length >= 10;
  const nameOf = (id: string) => users.find((u) => u.id === id)?.name ?? "Usuario";

  const decide = (favor: "cliente" | "trabajador") => {
    resolve(r.id, favor, note);
    onResolved(`${r.code} resuelta a favor ${favor === "cliente" ? "del cliente" : "del trabajador"}. Se notificó a ambas partes.`);
  };

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-display text-lg uppercase text-forest-950">
            {r.code} · {r.serviceTitle}
          </p>
          <p className="text-sm text-forest-900/70">
            Cliente: <strong>{client}</strong> · Trabajador:{" "}
            <Link to={`/trabajadores/${r.workerId}`} className="font-semibold underline-offset-4 hover:underline">
              {worker}
            </Link>{" "}
            · Anticipo {colones(r.advance)}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusInfo[r.status].cls}`}>{statusInfo[r.status].label}</span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-cream-50 p-3 text-sm">
          <p className="text-xs font-bold uppercase text-forest-900/60">Versión del cliente</p>
          <p className="mt-1">{r.reason}</p>
        </div>
        <div className="rounded-2xl bg-cream-50 p-3 text-sm">
          <p className="text-xs font-bold uppercase text-forest-900/60">Versión del trabajador</p>
          <p className="mt-1">{r.workerReply ?? "Aún no ha respondido."}</p>
        </div>
      </div>

      {r.messages.length > 0 && (
        <div className="mt-3 rounded-2xl bg-forest-900/5 p-3 text-sm">
          <p className="text-xs font-bold uppercase text-forest-900/60">Conversación</p>
          <ul className="mt-1 space-y-1">
            {r.messages.map((m) => (
              <li key={m.id}>
                <strong>{nameOf(m.from)}:</strong> {m.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      <details className="mt-3 text-sm">
        <summary className="cursor-pointer font-bold text-forest-900/70">Historial de la solicitud</summary>
        <ul className="mt-2 space-y-1 text-forest-900/80">
          {r.events.map((e, i) => (
            <li key={i}>
              {e.label} <span className="text-xs text-forest-900/50">· {formatDateTime(e.at)}</span>
            </li>
          ))}
        </ul>
      </details>

      <div className="mt-4">
        <label htmlFor={`note-${r.id}`} className="mb-1 block text-sm font-semibold text-forest-900">
          Motivo de tu resolución (se envía a ambas partes)
        </label>
        <textarea
          id={`note-${r.id}`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          maxLength={500}
          className="w-full rounded-xl border-2 border-forest-900/15 bg-white p-3 text-sm outline-none focus:border-terracotta-500"
          placeholder="Explica por qué resuelves así (mínimo 10 caracteres)."
        />
        <div className="mt-3 flex flex-wrap gap-3">
          <Btn onClick={() => decide("cliente")} disabled={!ready}>
            Resolver a favor del cliente (devolver anticipo)
          </Btn>
          <Btn variant="ghost" onClick={() => decide("trabajador")} disabled={!ready}>
            Resolver a favor del trabajador
          </Btn>
        </div>
      </div>
    </Card>
  );
}

export default function AdminDisputes() {
  const requests = useRequestsStore((s) => s.requests);
  const [msg, setMsg] = useState("");
  const open = requests.filter((r) => r.status === "en_disputa");
  const closed = requests.filter((r) => r.resolution);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <PageTitle title="Disputas" sub="Revisa las dos versiones y resuelve cada caso." />
      <div className="space-y-4">
        {msg && <Banner>{msg}</Banner>}
        {open.length === 0 ? (
          <Banner tone="info">No hay disputas abiertas.</Banner>
        ) : (
          open.map((r) => <DisputeCard key={r.id} r={r} onResolved={setMsg} />)
        )}

        {closed.length > 0 && (
          <>
            <h2 className="pt-4 font-display text-xl uppercase text-forest-950">Resueltas</h2>
            {closed.map((r) => (
              <Card key={r.id}>
                <p className="font-bold text-forest-950">
                  {r.code} · {r.serviceTitle}
                </p>
                <p className="text-sm text-forest-900/70">
                  A favor {r.resolution?.favor === "cliente" ? "del cliente" : "del trabajador"}: {r.resolution?.note}
                </p>
              </Card>
            ))}
          </>
        )}
      </div>
    </main>
  );
}
