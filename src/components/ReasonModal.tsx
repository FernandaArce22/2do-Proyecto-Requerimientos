import { useId, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import Button from "./Button";
import Modal from "./Modal";

type Props = {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel: string;
  suggestions?: string[];
  onConfirm: (reason: string) => void;
  onClose: () => void;
};

export default function ReasonModal({
  open,
  title,
  description,
  confirmLabel,
  suggestions = [],
  onConfirm,
  onClose,
}: Props) {
  const id = useId();
  const [reason, setReason] = useState("");
  const [tried, setTried] = useState(false);
  const error = tried && reason.trim().length < 5 ? "Escribe un motivo (mínimo 5 caracteres)." : "";

  const reset = () => {
    setReason("");
    setTried(false);
  };
  const close = () => {
    reset();
    onClose();
  };
  const submit = () => {
    if (reason.trim().length < 5) {
      setTried(true);
      return;
    }
    const value = reason.trim();
    reset();
    onConfirm(value);
  };

  return (
    <Modal open={open} title={title} onClose={close}>
      <div className="space-y-4">
        {description && <div className="text-sm text-forest-900/80">{description}</div>}

        {suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <motion.button
                key={s}
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setReason(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  reason === s ? "bg-forest-900 text-white" : "bg-forest-900/5 text-forest-900 hover:bg-forest-900/15"
                }`}
              >
                {s}
              </motion.button>
            ))}
          </div>
        )}

        <div>
          <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-forest-900">
            Motivo
          </label>
          <textarea
            id={id}
            rows={3}
            maxLength={200}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            aria-invalid={!!error}
            placeholder="Cuéntanos brevemente el motivo…"
            className={`w-full resize-none rounded-xl border-2 bg-white px-4 py-3 text-forest-950 outline-none transition-all duration-200 placeholder:text-forest-900/35 ${
              error
                ? "border-terracotta-500"
                : "border-forest-900/15 hover:border-forest-900/40 focus:border-forest-700 focus:shadow-md focus:shadow-forest-700/15"
            }`}
          />
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-1.5 flex items-center gap-1 text-xs font-medium text-terracotta-600"
              >
                <AlertCircle size={13} /> {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={close}
            className="rounded-xl px-4 py-2.5 text-sm font-bold text-forest-900 transition-colors hover:bg-forest-900/5"
          >
            Volver
          </button>
          <Button onClick={submit}>{confirmLabel}</Button>
        </div>
      </div>
    </Modal>
  );
}