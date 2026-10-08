import { useId, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Banknote,
  CalendarDays,
  CreditCard,
  Info,
  Loader2,
  MapPin,
  Paperclip,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserX,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AIAssistant from "../components/AIAssistant";
import Avatar from "../components/Avatar";
import Button from "../components/Button";
import Field from "../components/Field";
import FileDrop from "../components/FileDrop";
import MapPicker from "../components/MapPicker";
import Stepper from "../components/Stepper";
import { categories } from "../data/mockData";
import { SLOTS, formatDate, roundAdvance, todayISO } from "../data/requests";
import type { Attachment, LatLng, ServiceRequest } from "../data/requests";
import { colones, workers } from "../data/workers";
import { useAppStore } from "../store/useAppStore";
import { useRequestsStore } from "../store/useRequestsStore";

type Method = "sinpe" | "tarjeta";
const STEPS = ["Problema", "Cuándo y dónde", "Pago"];

function Row({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="mt-0.5 shrink-0 text-forest-700">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wide text-forest-900/50">{label}</p>
        <div className="text-sm text-forest-900">{children}</div>
      </div>
    </div>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <p className="mb-1.5 text-sm font-semibold text-forest-900">{children}</p>;
}

function ErrorText({ children }: { children: ReactNode }) {
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-terracotta-600">
      <AlertCircle size={13} /> {children}
    </p>
  );
}

function TextArea({
  label,
  value,
  onChange,
  error,
  placeholder,
  rows = 4,
  max,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  rows?: number;
  max?: number;
}) {
  const id = useId();
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-semibold text-forest-900">
          {label}
        </label>
        {max && (
          <span className="text-xs text-forest-900/50">
            {value.length}/{max}
          </span>
        )}
      </div>
      <textarea
        id={id}
        value={value}
        rows={rows}
        maxLength={max}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={!!error}
        className={`w-full resize-none rounded-xl border-2 bg-white px-4 py-3 text-forest-950 outline-none transition-all duration-200 placeholder:text-forest-900/35 ${
          error
            ? "border-terracotta-500 shadow-md shadow-terracotta-500/10"
            : "border-forest-900/15 hover:border-forest-900/40 focus:border-forest-700 focus:shadow-md focus:shadow-forest-700/15"
        }`}
      />
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}

export default function RequestService() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useAppStore((s) => s.currentUser);
  const showToast = useAppStore((s) => s.showToast);
  const settings = useRequestsStore((s) => s.settings);
  const addRequest = useRequestsStore((s) => s.addRequest);

  const worker = workers.find((w) => w.id === id);

  const [step, setStep] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const [serviceIdx, setServiceIdx] = useState(0);
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<Attachment[]>([]);
  const [aiOpen, setAiOpen] = useState(false);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [location, setLocation] = useState<LatLng | null>(null);
  const [directions, setDirections] = useState("");
  const [method, setMethod] = useState<Method>("sinpe");
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [payTried, setPayTried] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [created, setCreated] = useState<ServiceRequest | null>(null);

  const errors = {
    description: description.trim().length < 15 ? "Cuéntanos un poco más (mínimo 15 caracteres)." : "",
    date: !date ? "Elige una fecha." : date < todayISO() ? "La fecha no puede ser pasada." : "",
    slot: slot ? "" : "Elige un horario.",
    location: location ? "" : "Marca en el mapa dónde necesitas el servicio.",
  };
  const err = (k: keyof typeof errors) => (showErrors ? errors[k] : "");

  const stepHasErrors = (s: number) =>
    s === 0 ? !!errors.description : s === 1 ? !!(errors.date || errors.slot || errors.location) : false;

  const next = () => {
    if (stepHasErrors(step)) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    setStep(step + 1);
  };

  const back = () => {
    setShowErrors(false);
    setStep(step - 1);
  };

  if (!worker || !worker.verified || !worker.active || !worker.published) {
    return (
      <main className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-24 text-center">
        <UserX size={44} className="text-terracotta-500" />
        <h1 className="font-display text-2xl uppercase text-forest-900">Trabajador no disponible</h1>
        <p className="text-sm text-forest-900/60">Este trabajador no está disponible. Te sugerimos buscar a otro.</p>
        <Button onClick={() => navigate("/buscar")}>Ver trabajadores</Button>
      </main>
    );
  }

  const service = worker.services[serviceIdx];
  const advance = roundAdvance(service.rate, settings.advancePercent);
  const category = categories.find((c) => c.id === service.categoryId);

  const cardDigits = card.replace(/\D/g, "");
  const needsCard = method === "tarjeta" && advance > 0;
  const cardErrors = {
    number: needsCard && cardDigits.length !== 16 ? "Escribe los 16 dígitos de la tarjeta." : "",
    expiry: needsCard && !/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry) ? "Usa el formato MM/AA." : "",
  };

  const acceptAI = (r: { description: string; categoryId: string | null }) => {
    setDescription(r.description);
    if (r.categoryId) {
      const i = worker.services.findIndex((s) => s.categoryId === r.categoryId);
      if (i >= 0) setServiceIdx(i);
      else showToast("info", "La categoría sugerida no coincide con los servicios de este trabajador.");
    }
    setAiOpen(false);
    showToast("success", "Descripción cargada. Puedes editarla.");
  };

  const pay = () => {
    setPayTried(true);
    setPayError("");
    if (!accepted || cardErrors.number || cardErrors.expiry || !location) return;

    setPaying(true);
    window.setTimeout(() => {
      // Excepción C: el trabajador pasó a inactivo mientras se llenaba el formulario
      if (!worker.active) {
        setPaying(false);
        setPayError("Este trabajador pasó a estar inactivo. No se realizó ningún cobro; te sugerimos elegir a otro.");
        return;
      }
      // Excepción A: pago rechazado (tarjeta de prueba terminada en 0000)
      if (needsCard && cardDigits.endsWith("0000")) {
        setPaying(false);
        setPayError("El pago fue rechazado. No se registró la solicitud. Intenta con otra tarjeta o usa SINPE Móvil.");
        return;
      }
      const request = addRequest({
        clientId: currentUser?.id ?? "",
        workerId: worker.id,
        serviceTitle: service.title,
        categoryId: service.categoryId,
        description: description.trim(),
        date,
        slot,
        location,
        directions: directions.trim(),
        attachments: files,
        rate: service.rate,
        advance,
        paymentMethod: advance === 0 ? "sin_anticipo" : method,
        receipt: advance === 0 ? "—" : `CMP-${Math.floor(100000 + Math.random() * 900000)}`,
      });
      setCreated(request);
      setPaying(false);
    }, 1500);
  };

  // Confirmación (CU-07, paso 7)
  if (created) {
    return (
      <main className="mx-auto max-w-lg px-4 py-12 text-center">
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 14 }}
          className="relative mx-auto grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-forest-700 to-forest-900 text-white shadow-2xl shadow-forest-900/30"
        >
          <motion.span
            aria-hidden
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-forest-700"
          />
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" className="relative">
            <motion.path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            />
          </svg>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 font-display text-3xl uppercase text-forest-900"
        >
          ¡Solicitud enviada!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-1 text-forest-900/70"
        >
          {worker.name} recibió tu solicitud y te responderá pronto.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-6 divide-y divide-forest-900/10 rounded-2xl bg-white p-5 text-left shadow-md shadow-black/10"
        >
          <Row icon={<Info size={18} />} label="Solicitud">
            <span className="font-bold">{created.code}</span> ·{" "}
            <span className="rounded-full bg-gold-400/30 px-2 py-0.5 text-xs font-bold">Pendiente</span>
          </Row>
          <Row icon={<CalendarDays size={18} />} label="Fecha">
            {formatDate(created.date)} · {created.slot}
          </Row>
          <Row icon={<Banknote size={18} />} label="Comprobante de anticipo">
            {created.advance > 0 ? (
              <>
                {colones(created.advance)} · <span className="font-semibold">{created.receipt}</span>
              </>
            ) : (
              "Sin anticipo"
            )}
          </Row>
        </motion.div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={() => navigate("/solicitudes")}>Ver mis solicitudes</Button>
          <Button variant="forest" onClick={() => navigate("/")}>
            Volver al inicio
          </Button>
        </div>
      </main>
    );
  }

  const paymentOptions: { id: Method; label: string; hint: string; icon: ReactNode }[] = [
    { id: "sinpe", label: "SINPE Móvil", hint: "Pago inmediato", icon: <Smartphone size={20} /> },
    { id: "tarjeta", label: "Tarjeta", hint: "Crédito o débito", icon: <CreditCard size={20} /> },
  ];

  return (
    <>
      <section className="rounded-b-[2rem] bg-forest-900 pb-6 text-white">
        <div className="mx-auto max-w-3xl px-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-1" />
            Cancelar solicitud
          </button>
          <div className="mt-3 flex items-center gap-3">
            <Avatar name={worker.name} />
            <div>
              <p className="text-xs text-white/70">Solicitar servicio a</p>
              <h1 className="flex items-center gap-1.5 font-display text-2xl uppercase tracking-wide">
                {worker.name}
                <ShieldCheck size={20} className="text-gold-400" aria-label="Verificado" />
              </h1>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-3xl space-y-6 px-4 pb-36 pt-6">
        <div className="rounded-2xl bg-white p-4 shadow-md shadow-black/10">
          <Stepper steps={STEPS} current={step} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
            className="space-y-6 rounded-2xl bg-white p-5 shadow-md shadow-black/10"
          >
            {/* PASO 1: problema */}
            {step === 0 && (
              <>
                <div>
                  <Label>¿Qué servicio necesitas?</Label>
                  <div className="space-y-2">
                    {worker.services.map((s, i) => {
                      const c = categories.find((x) => x.id === s.categoryId);
                      const Icon = c?.icon;
                      const on = serviceIdx === i;
                      return (
                        <button
                          key={s.title}
                          type="button"
                          aria-pressed={on}
                          onClick={() => setServiceIdx(i)}
                          className={`group flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition-all duration-200 ${
                            on
                              ? "border-terracotta-500 bg-terracotta-500/5 shadow-md"
                              : "border-forest-900/10 bg-white hover:-translate-y-0.5 hover:border-forest-900/40"
                          }`}
                        >
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-forest-900 text-white transition-transform duration-300 group-hover:rotate-12">
                            {Icon && <Icon size={18} />}
                          </span>
                          <span className="flex-1">
                            <span className="block font-bold text-forest-900">{s.title}</span>
                            <span className="block text-xs text-forest-900/60">{s.description}</span>
                          </span>
                          <span className="rounded-md bg-terracotta-500 px-2.5 py-1 text-xs font-bold text-white">
                            {colones(s.rate)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <TextArea
                    label="Describe el problema"
                    value={description}
                    onChange={setDescription}
                    error={err("description")}
                    placeholder="Ej.: Hay una fuga debajo del lavatorio de la cocina y el piso se está mojando…"
                    max={500}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setAiOpen(true)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="group mt-2 inline-flex items-center gap-2 rounded-full bg-gold-400/25 px-4 py-2 text-sm font-bold text-forest-900 transition-colors hover:bg-gold-400"
                  >
                    <Sparkles size={16} className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-125" />
                    Ayuda para describir el problema
                  </motion.button>
                </div>

                <div>
                  <Label>Fotos o video (opcional, pero ayuda mucho)</Label>
                  <FileDrop files={files} onChange={setFiles} />
                </div>
              </>
            )}

            {/* PASO 2: cuándo y dónde */}
            {step === 1 && (
              <>
                <div>
                  <label htmlFor="fecha" className="mb-1.5 block text-sm font-semibold text-forest-900">
                    ¿Qué día lo necesitas?
                  </label>
                  <input
                    id="fecha"
                    type="date"
                    min={todayISO()}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    aria-invalid={!!err("date")}
                    className={`w-full rounded-xl border-2 bg-white px-4 py-3 text-forest-950 outline-none transition-all duration-200 ${
                      err("date")
                        ? "border-terracotta-500"
                        : "border-forest-900/15 hover:border-forest-900/40 focus:border-forest-700 focus:shadow-md focus:shadow-forest-700/15"
                    }`}
                  />
                  {err("date") && <ErrorText>{err("date")}</ErrorText>}
                </div>

                <div>
                  <Label>¿A qué hora?</Label>
                  <div className="flex flex-wrap gap-2">
                    {SLOTS.map((s) => (
                      <motion.button
                        key={s}
                        type="button"
                        aria-pressed={slot === s}
                        onClick={() => setSlot(s)}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.94 }}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                          slot === s
                            ? "bg-forest-900 text-white shadow-lg shadow-forest-900/25"
                            : "bg-forest-900/5 text-forest-900 hover:bg-forest-900/15"
                        }`}
                      >
                        {s}
                      </motion.button>
                    ))}
                  </div>
                  {err("slot") && <ErrorText>{err("slot")}</ErrorText>}
                </div>

                <div>
                  <Label>¿Dónde necesitas el servicio?</Label>
                  <MapPicker value={location} onChange={setLocation} />
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-forest-900/60">
                    <MapPin size={13} />
                    {location
                      ? `Punto marcado (${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}). Puedes arrastrar el pin para ajustarlo.`
                      : "Toca el mapa o usa tu ubicación actual."}
                  </p>
                  {err("location") && <ErrorText>{err("location")}</ErrorText>}
                </div>

                <TextArea
                  label="Señas adicionales (opcional)"
                  value={directions}
                  onChange={setDirections}
                  rows={2}
                  max={200}
                  placeholder="Ej.: Casa verde con portón negro, 200 m al norte de la escuela."
                />
              </>
            )}

            {/* PASO 3: resumen y anticipo */}
            {step === 2 && (
              <>
                <div className="divide-y divide-forest-900/10">
                  <Row icon={category ? <category.icon size={18} /> : <Info size={18} />} label="Servicio">
                    <span className="font-bold">{service.title}</span> · {worker.name}
                  </Row>
                  <Row icon={<CalendarDays size={18} />} label="Fecha y hora">
                    {formatDate(date)} · {slot}
                  </Row>
                  <Row icon={<MapPin size={18} />} label="Ubicación">
                    {location && `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`}
                    {directions && <span className="block text-forest-900/70">{directions}</span>}
                  </Row>
                  <Row icon={<Paperclip size={18} />} label="Descripción y adjuntos">
                    <span className="whitespace-pre-line">{description}</span>
                    <span className="mt-1 block text-xs text-forest-900/60">
                      {files.length === 0 ? "Sin fotos ni video" : `${files.length} archivo(s) adjunto(s)`}
                    </span>
                  </Row>
                </div>

                <div className="rounded-xl bg-forest-900 p-4 text-white">
                  <div className="flex items-center justify-between text-sm text-white/80">
                    <span>Tarifa de referencia</span>
                    <span>{colones(service.rate)}</span>
                  </div>
                  <div className="mt-2 flex items-end justify-between">
                    <span className="font-semibold">Anticipo ({settings.advancePercent} %)</span>
                    <motion.span
                      key={advance}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="font-display text-3xl text-gold-400"
                    >
                      {advance > 0 ? colones(advance) : "Sin anticipo"}
                    </motion.span>
                  </div>
                  <p className="mt-2 text-xs text-white/60">El resto se acuerda y paga al finalizar el servicio.</p>
                </div>

                {advance > 0 && (
                  <div>
                    <Label>Método de pago (simulado)</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {paymentOptions.map((o) => (
                        <motion.button
                          key={o.id}
                          type="button"
                          aria-pressed={method === o.id}
                          onClick={() => setMethod(o.id)}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all duration-200 ${
                            method === o.id
                              ? "border-terracotta-500 bg-terracotta-500/5 shadow-md"
                              : "border-forest-900/10 hover:border-forest-900/40"
                          }`}
                        >
                          <span className="text-forest-700">{o.icon}</span>
                          <span>
                            <span className="block text-sm font-bold text-forest-900">{o.label}</span>
                            <span className="block text-xs text-forest-900/60">{o.hint}</span>
                          </span>
                        </motion.button>
                      ))}
                    </div>

                    {method === "tarjeta" ? (
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <Field
                          label="Número de tarjeta"
                          icon={CreditCard}
                          value={card}
                          onChange={(v) =>
                            setCard(
                              v
                                .replace(/\D/g, "")
                                .slice(0, 16)
                                .replace(/(.{4})/g, "$1 ")
                                .trim(),
                            )
                          }
                          placeholder="4242 4242 4242 4242"
                          autoComplete="cc-number"
                          error={payTried ? cardErrors.number : ""}
                        />
                        <Field
                          label="Vencimiento"
                          icon={CalendarDays}
                          value={expiry}
                          onChange={(v) => {
                            const d = v.replace(/\D/g, "").slice(0, 4);
                            setExpiry(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
                          }}
                          placeholder="MM/AA"
                          autoComplete="cc-exp"
                          error={payTried ? cardErrors.expiry : ""}
                        />
                        <p className="text-xs text-forest-900/50 sm:col-span-2">
                          Demo: usa 4242 4242 4242 4242. Una tarjeta que termine en 0000 simula un rechazo.
                        </p>
                      </div>
                    ) : (
                      <p className="mt-3 rounded-xl bg-cream-50 p-3 text-sm text-forest-900/70">
                        Se enviará una solicitud de pago SINPE Móvil a tu teléfono {currentUser?.phone}. (Simulado)
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-start gap-3 rounded-xl bg-gold-400/15 p-4">
                  <Info size={20} className="mt-0.5 shrink-0 text-gold-500" />
                  <div className="text-sm text-forest-900/80">
                    <p className="font-bold text-forest-900">Política de cancelación</p>
                    <p>
                      Si el trabajador rechaza o no responde, se te devuelve el anticipo completo. Si cancelas una
                      solicitud ya aceptada, se retiene una tarifa del {settings.cancelFeePercent} % del anticipo.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="flex cursor-pointer items-start gap-3 text-sm text-forest-900/80">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={accepted}
                      onChange={(e) => setAccepted(e.target.checked)}
                    />
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 border-forest-900/30 transition-colors peer-checked:border-forest-700 peer-checked:bg-forest-700 peer-focus-visible:ring-2 peer-focus-visible:ring-gold-400">
                      {accepted && (
                        <motion.svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="text-white"
                        >
                          <motion.path
                            d="M5 13l4 4L19 7"
                            stroke="currentColor"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.25 }}
                          />
                        </motion.svg>
                      )}
                    </span>
                    <span>He leído y acepto la política de cancelación.</span>
                  </label>
                  {payTried && !accepted && <ErrorText>Debes aceptar la política para continuar.</ErrorText>}
                </div>

                <AnimatePresence>
                  {payError && (
                    <motion.div
                      role="alert"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-start gap-2 rounded-xl bg-terracotta-500/10 p-3 text-sm font-medium text-terracotta-600">
                        <AlertCircle size={18} className="mt-0.5 shrink-0" /> {payError}
                      </div>
                      {!worker.active && (
                        <Link to="/buscar" className="mt-2 inline-block text-sm font-semibold text-forest-700 underline">
                          Ver otros trabajadores
                        </Link>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Barra fija de acciones */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-forest-900/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <button
            type="button"
            onClick={step === 0 ? () => navigate(-1) : back}
            disabled={paying}
            className="group inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-forest-900 transition-colors hover:bg-forest-900/5 disabled:opacity-50"
          >
            <ArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-1" />
            {step === 0 ? "Cancelar" : "Atrás"}
          </button>

          {step < 2 ? (
            <Button onClick={next}>
              Continuar
              <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
            </Button>
          ) : (
            <Button onClick={pay} disabled={paying}>
              {paying && <Loader2 size={16} className="animate-spin" />}
              {paying ? "Procesando…" : advance > 0 ? `Pagar anticipo ${colones(advance)}` : "Confirmar solicitud"}
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {aiOpen && (
          <AIAssistant hasAttachments={files.length > 0} onAccept={acceptAI} onClose={() => setAiOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}