import { useRef, useState } from "react";
import type { DragEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Film, ImagePlus, X } from "lucide-react";
import type { Attachment } from "../data/requests";

const MAX_FILES = 4;
const MAX_IMAGE = 5 * 1024 * 1024;
const MAX_VIDEO = 25 * 1024 * 1024;

type Props = { files: Attachment[]; onChange: (files: Attachment[]) => void; title?: string };

export default function FileDrop({ files, onChange, title = "Agrega fotos o video del problema" }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const add = (list: FileList | null) => {
    if (!list) return;
    const next = [...files];
    const errs: string[] = [];

    Array.from(list).forEach((f) => {
      const isImage = f.type.startsWith("image/");
      const isVideo = f.type.startsWith("video/");
      if (!isImage && !isVideo) errs.push(`"${f.name}": formato no permitido (solo fotos y videos).`);
      else if (isImage && f.size > MAX_IMAGE) errs.push(`"${f.name}": la foto pesa más de 5 MB.`);
      else if (isVideo && f.size > MAX_VIDEO) errs.push(`"${f.name}": el video pesa más de 25 MB.`);
      else if (next.length >= MAX_FILES) errs.push(`Máximo ${MAX_FILES} archivos por solicitud.`);
      else
        next.push({
          id: `${Date.now()}-${Math.random()}`,
          name: f.name,
          kind: isImage ? "imagen" : "video",
          url: URL.createObjectURL(f),
          size: f.size,
        });
    });

    setErrors([...new Set(errs)]);
    onChange(next);
    if (input.current) input.current.value = "";
  };

  const remove = (id: string) => {
    const file = files.find((f) => f.id === id);
    if (file) URL.revokeObjectURL(file.url);
    onChange(files.filter((f) => f.id !== id));
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDrag(false);
    add(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      <input
        ref={input}
        type="file"
        multiple
        accept="image/*,video/*"
        className="sr-only"
        onChange={(e) => add(e.target.files)}
        aria-label="Adjuntar fotos o videos"
      />

      <motion.button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={`group flex w-full flex-col items-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors duration-200 ${
          drag
            ? "border-terracotta-500 bg-terracotta-500/10"
            : "border-forest-900/25 bg-cream-50 hover:border-terracotta-500 hover:bg-terracotta-500/5"
        }`}
      >
        <ImagePlus
          size={30}
          className="text-forest-700 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110 group-hover:text-terracotta-500"
        />
        <span className="text-sm font-semibold text-forest-900">{title}</span>
        <span className="text-xs text-forest-900/60">
          Arrastra aquí o toca para elegir · hasta {MAX_FILES} archivos · fotos 5 MB · videos 25 MB
        </span>
      </motion.button>

      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-1 rounded-xl bg-terracotta-500/10 p-3 text-xs font-medium text-terracotta-600">
              {errors.map((e) => (
                <p key={e} className="flex items-start gap-1.5">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" /> {e}
                </p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {files.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <AnimatePresence>
            {files.map((f) => (
              <motion.li
                key={f.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="group relative aspect-square overflow-hidden rounded-xl bg-forest-900/10 shadow-md shadow-black/10"
              >
                {f.kind === "imagen" ? (
                  <img src={f.url} alt={f.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <>
                    <video src={f.url} muted className="h-full w-full object-cover" />
                    <span className="absolute left-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white">
                      <Film size={13} />
                    </span>
                  </>
                )}
                <motion.button
                  type="button"
                  aria-label={`Quitar ${f.name}`}
                  onClick={() => remove(f.id)}
                  whileHover={{ scale: 1.15, rotate: 90 }}
                  whileTap={{ scale: 0.85 }}
                  className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-forest-900 shadow transition-colors hover:bg-terracotta-500 hover:text-white"
                >
                  <X size={15} />
                </motion.button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}