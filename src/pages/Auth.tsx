import { useState } from "react";
import type { FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowLeft, Check, Loader2, Lock, Mail, Phone, ShieldCheck, Sprout, User as UserIcon } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import Button from "../components/Button";
import Field from "../components/Field";
import { DEMO_PASSWORD, seedUsers } from "../data/users";
import type { User } from "../data/users";
import { homeFor } from "../routes";
import { useAppStore } from "../store/useAppStore";
import { APP_NAME } from "../config";

type Mode = "login" | "register";
type FieldName = "name" | "email" | "phone" | "password" | "terms";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const demoLabel = (u: User) =>
  u.roles.includes("administrador")
    ? "Administrador"
    : u.workerStatus === "verificado"
      ? u.accountActive
        ? "Trabajador"
        : "Trabajador inactivo"
      : u.workerStatus === "en_revision"
        ? "Postulante"
        : "Cliente";

function Strength({ password }: { password: string }) {
  const score = [
    password.length >= 6,
    password.length >= 10,
    /\d/.test(password),
    /[A-Z]|[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
  const labels = ["Muy débil", "Débil", "Aceptable", "Buena", "Fuerte"];
  const colors = ["bg-forest-900/10", "bg-terracotta-500", "bg-gold-500", "bg-forest-700", "bg-forest-800"];

  return (
    <div className="-mt-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-forest-900/10">
            <motion.div
              initial={false}
              animate={{ width: i < score ? "100%" : "0%" }}
              className={`h-full ${colors[score]}`}
            />
          </div>
        ))}
      </div>
      <p className="mt-1 text-xs text-forest-900/60">
        {password ? `Seguridad: ${labels[score]}` : "Usa al menos 6 caracteres"}
      </p>
    </div>
  );
}

export default function Auth() {
  const login = useAppStore((s) => s.login);
  const register = useAppStore((s) => s.register);
  const showToast = useAppStore((s) => s.showToast);
  const currentUser = useAppStore((s) => s.currentUser);
  const activeRole = useAppStore((s) => s.activeRole);

  const [mode, setMode] = useState<Mode>("login");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", terms: false });
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  // Precondición de CU-01: no tener sesión activa
  if (currentUser) return <Navigate to={homeFor(activeRole)} replace />;

  const errors: Record<FieldName, string> = {
    name: form.name.trim().length < 3 ? "Escribe tu nombre completo." : "",
    email: emailRe.test(form.email.trim()) ? "" : "Escribe un correo válido.",
    phone: /^\d{8}$/.test(form.phone.replace(/[\s-]/g, "")) ? "" : "El teléfono debe tener 8 dígitos.",
    password:
      mode === "login"
        ? form.password
          ? ""
          : "Escribe tu contraseña."
        : form.password.length >= 6
          ? ""
          : "Mínimo 6 caracteres.",
    terms: form.terms ? "" : "Debes aceptar los términos para continuar.",
  };

  const fieldsOf: FieldName[] =
    mode === "login" ? ["email", "password"] : ["name", "email", "phone", "password", "terms"];

  const err = (n: FieldName) => (touched[n] ? errors[n] : "");
  const touch = (n: FieldName) => setTouched((t) => ({ ...t, [n]: true }));
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const changeMode = (m: Mode) => {
    setMode(m);
    setTouched({});
    setFormError("");
  };

  const fillDemo = (u: User) => {
    set({ email: u.email, password: u.password });
    setTouched({});
    setFormError("");
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setFormError("");
    setTouched(Object.fromEntries(fieldsOf.map((n) => [n, true])));
    if (fieldsOf.some((n) => errors[n])) return;

    setLoading(true);
    setTimeout(() => {
      const res =
        mode === "login"
          ? login(form.email, form.password)
          : register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      setLoading(false);
      if (!res.ok) {
        setFormError(res.error);
        return;
      }
      const first = useAppStore.getState().currentUser?.name.split(" ")[0];
      showToast("success", mode === "login" ? `¡Hola de nuevo, ${first}!` : `¡Cuenta creada! Bienvenido, ${first}.`);
    }, 600);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panel visual (solo en pantallas grandes) */}
      <div className="relative hidden overflow-hidden bg-forest-900 lg:block">
        <motion.div
          aria-hidden
          initial={{ scale: 1.03 }}
          animate={{ scale: 1.12 }}
          transition={{ duration: 30, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/img/hero.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950/95 via-forest-900/50 to-forest-900/40" />
        <div className="relative flex h-full flex-col justify-between p-10 text-white">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-forest-900">
              <Sprout size={22} />
            </span>
            <span className="font-display text-lg uppercase tracking-wide">{APP_NAME}</span>
          </div>
          <div className="space-y-5">
            <h2 className="font-display text-4xl uppercase leading-tight">Tu hogar, en manos de confianza</h2>
            {["Trabajadores verificados uno a uno", "Anticipo protegido", "Seguimiento del trabajo paso a paso"].map(
              (t, i) => (
                <motion.p
                  key={t}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.12 }}
                  className="flex items-center gap-2.5 text-white/90"
                >
                  <ShieldCheck size={18} className="text-gold-400" /> {t}
                </motion.p>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="group mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-forest-900/70 transition-colors hover:text-terracotta-500"
          >
            <ArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-1" />
            Volver al inicio
          </Link>

          <h1 className="font-display text-3xl uppercase text-forest-900">
            {mode === "login" ? "Bienvenido de nuevo" : "Crea tu cuenta"}
          </h1>
          <p className="mb-6 mt-1 text-sm text-forest-900/60">
            {mode === "login"
              ? "Ingresa para contratar o gestionar tus servicios."
              : "Con una sola cuenta puedes contratar y, si te verifican, ofrecer servicios."}
          </p>

          {/* Pestañas */}
          <div className="mb-6 grid grid-cols-2 rounded-xl bg-forest-900/5 p-1">
            {(["login", "register"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => changeMode(m)}
                className="relative rounded-lg py-2 text-sm font-bold"
              >
                {mode === m && (
                  <motion.span
                    layoutId="auth-tab"
                    className="absolute inset-0 rounded-lg bg-white shadow"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span
                  className={`relative transition-colors ${
                    mode === m ? "text-forest-900" : "text-forest-900/50 hover:text-forest-900"
                  }`}
                >
                  {m === "login" ? "Ingresar" : "Crear cuenta"}
                </span>
              </button>
            ))}
          </div>

          <motion.form
            key={mode}
            onSubmit={submit}
            noValidate
            initial={{ opacity: 0, x: mode === "login" ? -16 : 16 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <AnimatePresence>
              {formError && (
                <motion.div
                  role="alert"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-start gap-2 rounded-xl bg-terracotta-500/10 p-3 text-sm font-medium text-terracotta-600">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" /> {formError}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {mode === "register" && (
              <Field
                label="Nombre completo"
                icon={UserIcon}
                value={form.name}
                onChange={(v) => set({ name: v })}
                onBlur={() => touch("name")}
                error={err("name")}
                placeholder="María Gómez"
                autoComplete="name"
              />
            )}
            <Field
              label="Correo electrónico"
              icon={Mail}
              type="email"
              value={form.email}
              onChange={(v) => set({ email: v })}
              onBlur={() => touch("email")}
              error={err("email")}
              placeholder="correo@ejemplo.com"
              autoComplete="email"
            />
            {mode === "register" && (
              <Field
                label="Teléfono"
                icon={Phone}
                type="tel"
                value={form.phone}
                onChange={(v) => set({ phone: v })}
                onBlur={() => touch("phone")}
                error={err("phone")}
                placeholder="8888 8888"
                autoComplete="tel"
              />
            )}
            <Field
              label="Contraseña"
              icon={Lock}
              type="password"
              value={form.password}
              onChange={(v) => set({ password: v })}
              onBlur={() => touch("password")}
              error={err("password")}
              placeholder="••••••"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
            {mode === "register" && <Strength password={form.password} />}

            {mode === "register" && (
              <div>
                <label className="flex cursor-pointer items-start gap-3 text-sm text-forest-900/80">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={form.terms}
                    onChange={(e) => {
                      set({ terms: e.target.checked });
                      touch("terms");
                    }}
                  />
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 border-forest-900/30 transition-colors peer-checked:border-forest-700 peer-checked:bg-forest-700 peer-focus-visible:ring-2 peer-focus-visible:ring-gold-400">
                    {form.terms && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      >
                        <Check size={14} className="text-white" />
                      </motion.span>
                    )}
                  </span>
                  <span>Acepto los términos de uso y la política de privacidad.</span>
                </label>
                {err("terms") && <p className="mt-1.5 text-xs font-medium text-terracotta-600">{err("terms")}</p>}
              </div>
            )}

            {mode === "login" && (
              <button
                type="button"
                onClick={() => showToast("info", "Te enviamos un enlace para restablecer tu contraseña (simulado).")}
                className="text-sm font-semibold text-forest-700 underline-offset-4 transition-colors hover:text-terracotta-500 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}

            <Button type="submit" disabled={loading} className="w-full justify-center py-3">
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading
                ? mode === "login"
                  ? "Ingresando…"
                  : "Creando cuenta…"
                : mode === "login"
                  ? "Ingresar"
                  : "Crear cuenta"}
            </Button>
          </motion.form>

          {/* Cuentas de demostración */}
          {mode === "login" && (
            <div className="mt-8 rounded-2xl border border-dashed border-forest-900/20 p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-forest-900/60">
                Cuentas de demostración · contraseña {DEMO_PASSWORD}
              </p>
              <div className="flex flex-wrap gap-2">
                {seedUsers.map((u) => (
                  <motion.button
                    key={u.id}
                    type="button"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fillDemo(u)}
                    className="rounded-full bg-forest-900/5 px-3 py-1.5 text-xs font-semibold text-forest-900 transition-colors hover:bg-forest-900 hover:text-white"
                  >
                    {u.name.split(" ")[0]} · {demoLabel(u)}
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}