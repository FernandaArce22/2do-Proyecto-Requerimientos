import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  icon: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  type?: "text" | "email" | "tel" | "password";
  placeholder?: string;
  autoComplete?: string;
  error?: string;
};

export default function Field({
  label,
  icon: Icon,
  value,
  onChange,
  onBlur,
  type = "text",
  placeholder,
  autoComplete,
  error,
}: Props) {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-forest-900">
        {label}
      </label>

      {/* Se sacude cuando aparece un error */}
      <motion.div
        animate={{ x: error ? [0, -6, 6, -4, 4, 0] : 0 }}
        transition={{ duration: 0.35 }}
        className="group relative"
      >
        <Icon
          size={18}
          className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
            error ? "text-terracotta-500" : "text-forest-900/40 group-focus-within:text-forest-700"
          }`}
        />
        <input
          id={id}
          type={isPassword && show ? "text" : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          className={`w-full rounded-xl border-2 bg-white py-3 pl-11 text-forest-950 outline-none transition-all duration-200 placeholder:text-forest-900/35 ${
            isPassword ? "pr-11" : "pr-4"
          } ${
            error
              ? "border-terracotta-500 shadow-md shadow-terracotta-500/10"
              : "border-forest-900/15 hover:border-forest-900/40 focus:border-forest-700 focus:shadow-md focus:shadow-forest-700/15"
          }`}
        />
        {isPassword && (
          <motion.button
            type="button"
            aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
            onClick={() => setShow((s) => !s)}
            whileTap={{ scale: 0.85 }}
            className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-forest-900/50 transition-colors hover:bg-forest-900/10 hover:text-forest-900"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </motion.button>
        )}
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1.5 flex items-center gap-1 text-xs font-medium text-terracotta-600"
          >
            <AlertCircle size={13} /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}