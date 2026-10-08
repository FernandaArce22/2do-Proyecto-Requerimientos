import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CalendarCheck, ChevronLeft, ChevronRight, Clock, MapPin, ShieldCheck, UserX, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Avatar from "../components/Avatar";
import Button from "../components/Button";
import Stars from "../components/Stars";
import { categories } from "../data/mockData";
import { colones, fromRate, lastJobText, workers } from "../data/workers";
import type { Photo } from "../data/workers";
import { useAppStore } from "../store/useAppStore";

// Foto del trabajo; si no carga (CU-06, excepción B) se muestra una ilustración
function PhotoTile({ photo, big = false }: { photo: Photo; big?: boolean }) {
  const [failed, setFailed] = useState(false);
  const cat = categories.find((c) => c.id === photo.categoryId);
  const Icon = cat?.icon;

  if (!failed) {
    return (
      <img
        src={photo.image}
        alt={photo.caption}
        onError={() => setFailed(true)}
        className="h-full w-full object-cover"
      />
    );
  }
  return (
    <div className={`grid h-full w-full place-items-center bg-gradient-to-br ${cat?.gradient ?? "from-gray-200 to-gray-300"}`}>
      {Icon && <Icon size={big ? 96 : 40} strokeWidth={1.4} className="text-forest-900/60" />}
    </div>
  );
}

function Section({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl bg-white p-5 shadow-md shadow-black/10"
    >
      <h2 className="mb-3 font-display text-xl uppercase tracking-wide text-forest-900">{title}</h2>
      {children}
    </motion.section>
  );
}

export default function WorkerProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useAppStore((s) => s.currentUser);
  const activeRole = useAppStore((s) => s.activeRole);
  const showToast = useAppStore((s) => s.showToast);

  const worker = workers.find((w) => w.id === id);
  const available = !!worker && worker.verified && worker.active && worker.published;

  const [open, setOpen] = useState<number | null>(null);
  const total = worker?.photos.length ?? 0;

  // Teclado en la galería: Escape y flechas
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((o) => (o === null ? o : (o + 1) % total));
      if (e.key === "ArrowLeft") setOpen((o) => (o === null ? o : (o - 1 + total) % total));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, total]);

  if (!worker || !available) {
    return (
      <main className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-24 text-center">
        <UserX size={44} className="text-terracotta-500" />
        <h1 className="font-display text-2xl uppercase text-forest-900">Trabajador no disponible</h1>
        <p className="text-sm text-forest-900/60">
          Este perfil no existe o su cuenta está inactiva. Te sugerimos buscar a otros trabajadores.
        </p>
        <Button onClick={() => navigate("/buscar")}>Ver trabajadores</Button>
      </main>
    );
  }

  const handleRequest = () => {
    if (!currentUser) {
      showToast("info", "Inicia sesión para solicitar un servicio.");
      navigate("/acceso");
      return;
    }
    if (activeRole !== "cliente") {
      showToast("error", "Cambia a modo cliente para solicitar servicios.");
      return;
    }
    if (worker.userId === currentUser.id) {
      showToast("error", "No puedes contratarte a ti mismo.");
      return;
    }
    showToast("info", "Aquí continúa el Incremento 3: formulario de solicitud (CU-07).");
  };

  const stats = [
    { icon: ShieldCheck, label: "Calificación", value: `${worker.rating}` },
    { icon: CalendarCheck, label: "Trabajos", value: `${worker.jobsDone}` },
    { icon: Clock, label: "Último trabajo", value: lastJobText(worker.lastJobDaysAgo) },
  ];

  return (
    <>
      <section className="rounded-b-[2rem] bg-forest-900 pb-8 text-white">
        <div className="mx-auto max-w-5xl px-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-1" />
            Volver
          </button>

          <div className="mt-4 flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
              <Avatar name={worker.name} size="lg" />
            </motion.div>
            <div className="flex-1 space-y-1.5">
              <h1 className="font-display text-3xl uppercase tracking-wide">{worker.name}</h1>
              <p className="flex items-center justify-center gap-1 text-sm text-white/80 sm:justify-start">
                <MapPin size={15} /> {worker.zone} · Miembro desde {worker.memberSince}
              </p>
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <Stars rating={worker.rating} size={17} />
                <span className="text-sm font-semibold">
                  {worker.rating} ({worker.reviewCount} reseñas)
                </span>
              </div>
            </div>

            {/* Insignia de verificación individual */}
            <motion.div
              animate={{ y: [0, -6, 0], rotate: [0, 3, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center gap-1"
            >
              <span className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-gold-400 to-gold-500 text-forest-900 shadow-2xl shadow-black/30">
                <ShieldCheck size={42} strokeWidth={1.8} />
              </span>
              <span className="text-xs font-bold uppercase tracking-wide text-gold-400">Verificado</span>
            </motion.div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {stats.map(({ icon: Icon, label, value }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                whileHover={{ y: -3 }}
                className="rounded-2xl bg-white/10 p-3 text-center backdrop-blur transition-colors hover:bg-white/20"
              >
                <Icon size={18} className="mx-auto mb-1 text-gold-400" />
                <p className="font-display text-xl">{value}</p>
                <p className="text-xs text-white/70">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-5xl space-y-5 px-4 pb-32 pt-6">
        <Section title="Sobre mí" delay={0.1}>
          <p className="text-forest-900/80">{worker.bio}</p>
        </Section>

        <Section title="Servicios" delay={0.15}>
          <ul className="divide-y divide-forest-900/10">
            {worker.services.map((s) => {
              const c = categories.find((x) => x.id === s.categoryId);
              const Icon = c?.icon;
              return (
                <li key={s.title} className="group flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-forest-900 text-white transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
                    {Icon && <Icon size={18} />}
                  </span>
                  <div className="flex-1">
                    <p className="font-bold text-forest-900">{s.title}</p>
                    <p className="text-sm text-forest-900/60">{s.description}</p>
                  </div>
                  <span className="shrink-0 rounded-md bg-terracotta-500 px-2.5 py-1 text-xs font-bold text-white">
                    {colones(s.rate)}
                  </span>
                </li>
              );
            })}
          </ul>
        </Section>

        <Section title="Trabajos realizados" delay={0.2}>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {worker.photos.map((p, i) => (
              <motion.button
                key={p.caption}
                type="button"
                onClick={() => setOpen(i)}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.97 }}
                aria-label={`Ampliar foto: ${p.caption}`}
                className="group relative aspect-square overflow-hidden rounded-xl border-2 border-transparent shadow-md shadow-black/10 transition-[border-color,box-shadow] duration-300 hover:border-terracotta-500 hover:shadow-xl"
              >
                <div className="h-full w-full transition-transform duration-500 group-hover:scale-110">
                  <PhotoTile photo={p} />
                </div>
                <span className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-forest-950/90 to-transparent p-2 text-left text-xs font-semibold text-white transition-transform duration-300 group-hover:translate-y-0">
                  {p.caption}
                </span>
              </motion.button>
            ))}
          </div>
        </Section>

        <Section title="Calificaciones" delay={0.25}>
          <div className="space-y-4">
            {worker.reviews.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="rounded-xl bg-cream-50 p-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-forest-900">{r.author}</p>
                  <span className="text-xs text-forest-900/50">hace {r.daysAgo} días</span>
                </div>
                <Stars rating={r.rating} size={14} className="my-1" />
                <p className="text-sm text-forest-900/80">{r.comment}</p>
              </motion.div>
            ))}
          </div>
        </Section>
      </main>

      {/* Barra fija con la acción principal */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-forest-900/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <div>
            <p className="text-xs text-forest-900/60">Tarifa desde</p>
            <p className="font-display text-2xl text-forest-900">{colones(fromRate(worker, "todos"))}</p>
          </div>
          <Button onClick={handleRequest} className="px-6 py-3 text-base">
            Solicitar servicio
          </Button>
        </div>
      </div>

      {/* Galería ampliada */}
      <AnimatePresence>
        {open !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Galería de trabajos"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4"
          >
            <button
              type="button"
              aria-label="Cerrar"
              onClick={() => setOpen(null)}
              className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-terracotta-500"
            >
              <X size={20} />
            </button>
            <button
              type="button"
              aria-label="Foto anterior"
              onClick={(e) => {
                e.stopPropagation();
                setOpen((open - 1 + total) % total);
              }}
              className="absolute left-3 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              aria-label="Foto siguiente"
              onClick={(e) => {
                e.stopPropagation();
                setOpen((open + 1) % total);
              }}
              className="absolute right-3 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
            >
              <ChevronRight size={22} />
            </button>

            <motion.div
              key={open}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <div className="aspect-[4/3]">
                <PhotoTile photo={worker.photos[open]} big />
              </div>
              <p className="px-4 py-3 text-sm font-semibold text-forest-900">
                {worker.photos[open].caption}{" "}
                <span className="font-normal text-forest-900/50">
                  · {open + 1} de {total}
                </span>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}