import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, FileText, ImagePlus, X } from "lucide-react";
import type { Doc } from "../data/work";

const MAX = 5 * 1024 * 1024;
const MIN = 10 * 1024; // por debajo de esto se considera ilegible (simulado)

export const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

// Vista de un documento ya cargado
export function DocPreview({ doc }: { doc: Doc }) {
  if (!doc.url) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-cream-50 p-3 text-sm">
        <FileText size={22} className="shrink-0 text-forest-700" />
        <div className="min-w-0">
          <p className="truncate font-semibold text-forest-900">{doc.name}</p>
          <p className="text-xs text-forest-900/60">Documento de ejemplo (demo) · {formatSize(doc.size)}</p>
        </div>
      </div>
    );
  }
  if (doc.isPdf) {
    return (
      <a
        href={doc.url}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-3 rounded-xl bg-cream-50 p-3 text-sm transition-colors hover:bg-forest-900/10"
      >
        <FileText size={22} className="shrink-0 text-terracotta-500" />
        <div className="min-w-0">
          <p className="truncate font-semibold text-forest-900">{doc.name}</p>
          <p className="text-xs text-forest-900/60">Abrir PDF · {formatSize(doc.size)}</p>
        </div>
      </a>
    );
  }
  return <img src={doc.url} alt={doc.name} className="max-h-52 w-full rounded-xl object-cover" />;
}

type Props = {
  label: string;
  hint: string;
  value: Doc | null;
  onChange: (doc: Doc | null) => void;
  error?: string;
};

export default function DocUpload({ label, hint, value, onChange, error }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState("");

  const pick = (list: FileList | null) => {
    const f = list?.[0];
    if (!f) return;
    const isPdf = f.type === "application/pdf";
    const isImage = f.type.startsWith("image/");

    // CU-03, excepción A: documento ilegible o con formato inválido
    if (!isPdf && !isImage) {
      setFileError(`"${f.name}": formato no permitido. Sube una foto (JPG, PNG) o un PDF.`);
    } else if (f.size > MAX) {
      setFileError(`"${f.name}": pesa más de 5 MB.`);
    } else if (f.size < MIN) {
      setFileError(`"${f.name}": el archivo parece ilegible (muy pequeño). Sube una imagen más clara.`);
    } else {
      if (value?.url) URL.revokeObjectURL(value.url);
      setFileError("");
      onChange({ name: f.name, url: URL.createObjectURL(f), size: f.size, isPdf });
    }
    if (input.current) input.current.value = "";
  };

  const remove = () => {
    if (value?.url) URL.revokeObjectURL(value.url);
    onChange(null);
  };

  const shown = fileError || error;

  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold text-forest-900">{label}</p>
      <input
        ref={input}
        type="file"
        accept="image/*,application/pdf"
        className="sr-only"
        onChange={(e) => pick(e.target.files)}
        aria-label={label}
      />

      {value ? (
        <div className="relative space-y-2 rounded-xl border-2 border-forest-700/30 p-3">
          <DocPreview doc={value} />
          <motion.button
            type="button"
            aria-label={`Quitar ${value.name}`}
            onClick={remove}
            whileHover={{ scale: 1.15, rotate: 90 }}
            whileTap={{ scale: 0.85 }}
            className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-forest-900 shadow transition-colors hover:bg-terracotta-500 hover:text-white"
          >
            <X size={15} />
          </motion.button>
        </div>
      ) : (
        <motion.button
          type="button"
          onClick={() => input.current?.click()}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className={`group flex w-full flex-col items-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors duration-200 ${
            shown
              ? "border-terracotta-500 bg-terracotta-500/5"
              : "border-forest-900/25 bg-cream-50 hover:border-terracotta-500 hover:bg-terracotta-500/5"
          }`}
        >
          <ImagePlus
            size={28}
            className="text-forest-700 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110 group-hover:text-terracotta-500"
          />
          <span className="text-sm font-semibold text-forest-900">Toca para subir</span>
          <span className="text-xs text-forest-900/60">{hint}</span>
        </motion.button>
      )}

      <AnimatePresence>
        {shown && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1.5 flex items-start gap-1 overflow-hidden text-xs font-medium text-terracotta-600"
          >
            <AlertCircle size={13} className="mt-0.5 shrink-0" /> {shown}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
