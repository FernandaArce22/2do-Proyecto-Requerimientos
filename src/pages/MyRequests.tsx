import { motion } from "framer-motion";
import { Banknote, CalendarDays, ClipboardList, Paperclip } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Avatar from "../components/Avatar";
import Button from "../components/Button";
import { formatDate, statusInfo } from "../data/requests";
import { colones, workers } from "../data/workers";
import { useAppStore } from "../store/useAppStore";
import { useRequestsStore } from "../store/useRequestsStore";

export default function MyRequests() {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.currentUser);
  const requests = useRequestsStore((s) => s.requests);
  const mine = requests.filter((r) => r.clientId === user?.id);

  return (
    <>
      <section className="rounded-b-[2rem] bg-forest-900 pb-6 text-white">
        <div className="mx-auto max-w-3xl px-4 pt-4">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl uppercase tracking-wide"
          >
            Mis solicitudes
          </motion.h1>
          <p className="text-white/70">Consulta el estado de los servicios que has pedido.</p>
        </div>
      </section>

      <main className="mx-auto max-w-3xl space-y-4 px-4 pb-16 pt-6">
        {mine.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3 rounded-2xl bg-white px-6 py-14 text-center shadow-md shadow-black/5"
          >
            <ClipboardList size={40} className="text-terracotta-500" />
            <p className="font-semibold text-forest-900">Aún no tienes solicitudes</p>
            <p className="text-sm text-forest-900/60">Cuando pidas un servicio, aparecerá aquí con su estado.</p>
            <Button onClick={() => navigate("/buscar")}>Buscar trabajadores</Button>
          </motion.div>
        ) : (
          mine.map((r, i) => {
            const worker = workers.find((w) => w.id === r.workerId);
            const st = statusInfo[r.status];
            return (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4 }}
                className="rounded-2xl border-2 border-transparent bg-white p-4 shadow-md shadow-black/10 transition-[border-color,box-shadow] duration-300 hover:border-terracotta-500 hover:shadow-xl"
              >
                <div className="flex items-start gap-3">
                  {worker && <Avatar name={worker.name} />}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="font-display text-lg uppercase tracking-wide text-forest-900">{r.serviceTitle}</h2>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${st.cls}`}>{st.label}</span>
                    </div>
                    {worker && (
                      <Link
                        to={`/trabajadores/${worker.id}`}
                        className="text-sm font-semibold text-forest-700 underline-offset-4 hover:text-terracotta-500 hover:underline"
                      >
                        {worker.name}
                      </Link>
                    )}
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-forest-900/60">
                      <span className="flex items-center gap-1">
                        <CalendarDays size={13} /> {formatDate(r.date)} · {r.slot}
                      </span>
                      <span className="flex items-center gap-1">
                        <Banknote size={13} /> {r.advance > 0 ? `Anticipo ${colones(r.advance)}` : "Sin anticipo"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Paperclip size={13} /> {r.attachments.length} adjunto(s)
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-forest-900/80">{r.description}</p>
                    <p className="mt-2 text-xs font-semibold text-forest-900/50">
                      {r.code} · Comprobante {r.receipt}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </main>
    </>
  );
}