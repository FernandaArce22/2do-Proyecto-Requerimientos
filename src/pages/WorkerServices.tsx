import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Image as ImageIcon, ImagePlus, Pencil, Plus, Trash2 } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { refreshVisible } from "../data/workers";
import { categories } from "../data/mockData";
import { coverIdOf, findWorker, photosOf, savePhotos, saveServices, servicesOf, setCoverId } from "../data/workAdapter";
import type { PhotoView, ServiceView } from "../data/workAdapter";
import TextField from "../components/TextField";
import SelectField from "../components/SelectField";
import TextAreaField from "../components/TextAreaField";
import { Banner, Btn, Card, Dialog, PageTitle } from "../components/Ui";

type Cat = { id: string; name: string };
const catList = (categories as unknown as Record<string, string>[]).map((c) => ({
  id: c.id,
  name: c.name ?? c.label ?? c.id,
})) as Cat[];

const colones = (n: number) => `₡${n.toLocaleString("es-CR")}`;

export default function WorkerServices() {
  const user = useAppStore((s) => s.currentUser);
  const worker = findWorker(user?.id);
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const [msg, setMsg] = useState<{ text: string; tone: "ok" | "warn" | "info" } | null>(null);

  // Servicio (crear / editar)
  const [svcOpen, setSvcOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [rate, setRate] = useState("");
  const [kw, setKw] = useState("");
  const [svcCat, setSvcCat] = useState("");
  const [svcErr, setSvcErr] = useState<Record<string, string>>({});

  // Foto
  const fileRef = useRef<HTMLInputElement>(null);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [pUrl, setPUrl] = useState("");
  const [pCaption, setPCaption] = useState("");
  const [pCat, setPCat] = useState("");
  const [photoErr, setPhotoErr] = useState<Record<string, string>>({});

  if (!worker) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <PageTitle title="Mis servicios" />
        <Banner tone="info">Aún no tienes perfil de trabajador. Postúlate desde “Quiero ofrecer servicios”.</Banner>
      </main>
    );
  }

  const services = servicesOf(worker);
  const photos = photosOf(worker);

  const openSvc = (s?: ServiceView) => {
    setEditId(s?.id ?? null);
    setTitle(s?.title ?? "");
    setDesc(s?.description ?? "");
    setRate(s ? String(s.rate) : "");
    setKw(s ? s.keywords.join(", ") : "");
    setSvcCat(s?.categoryId || catList[0]?.id || "");
    setSvcErr({});
    setSvcOpen(true);
  };

  const saveSvc = () => {
    const e: Record<string, string> = {};
    const digits = rate.replace(/[^\d]/g, ""); // acepta "10 000", "10.000" o "₡10,000"
    const r = digits === "" ? NaN : Number(digits);
    if (title.trim().length < 3) e.title = "El título necesita al menos 3 caracteres.";
    if (desc.trim().length < 10) e.desc = "Describe el servicio con al menos 10 caracteres.";
    if (!Number.isInteger(r) || r < 1000 || r > 1_000_000) e.rate = "Indica una tarifa entre ₡1.000 y ₡1.000.000.";
    if (!svcCat) e.cat = "Elige una categoría.";
    setSvcErr(e);
    if (Object.keys(e).length) return;

    const item: ServiceView = {
      id: editId ?? `s${Date.now()}`,
      title: title.trim(),
      description: desc.trim(),
      rate: r,
      categoryId: svcCat,
      keywords: kw.split(",").map((k) => k.trim()).filter(Boolean),
    };
    saveServices(worker, editId ? services.map((s) => (s.id === editId ? item : s)) : [...services, item]);
    refreshVisible();
    setSvcOpen(false);
    setMsg({ text: editId ? "Servicio actualizado." : "Servicio agregado.", tone: "ok" });
    refresh();
  };

  const removeSvc = (id: string) => {
    const left = services.filter((s) => s.id !== id);
    saveServices(worker, left);
    if (left.length === 0 && worker.published) {
      worker.published = false;
      setMsg({ text: "Quitaste tu último servicio: tu perfil volvió a borrador.", tone: "info" });
    }
    refreshVisible();
    refresh();
  };

  const pickPhoto = (list: FileList | null) => {
    const f = list?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return setPhotoErr({ file: "Solo se permiten imágenes (JPG o PNG)." });
    if (f.size > 5 * 1024 * 1024) return setPhotoErr({ file: "La imagen pesa más de 5 MB." });
    if (pUrl) URL.revokeObjectURL(pUrl);
    setPUrl(URL.createObjectURL(f));
    setPhotoErr({});
    if (fileRef.current) fileRef.current.value = "";
  };

  const openPhoto = () => {
    if (photos.length >= 12) return setMsg({ text: "Llegaste al máximo de 12 fotos.", tone: "warn" });
    setPUrl("");
    setPCaption("");
    setPCat(catList[0]?.id ?? "");
    setPhotoErr({});
    setPhotoOpen(true);
  };

  const savePhoto = () => {
    const e: Record<string, string> = {};
    if (!pUrl) e.file = "Elige una foto.";
    if (pCaption.trim().length < 3) e.caption = "Agrega una descripción de al menos 3 caracteres.";
    setPhotoErr(e);
    if (Object.keys(e).length) return;
    const p: PhotoView = { id: `p${Date.now()}`, url: pUrl, caption: pCaption.trim(), categoryId: pCat };
    savePhotos(worker, [...photos, p]);
    setPhotoOpen(false);
    setMsg({ text: "Foto agregada a tu portafolio.", tone: "ok" });
    refresh();
  };

  const removePhoto = (id: string) => {
    savePhotos(worker, photos.filter((p) => p.id !== id));
    refresh();
  };

  const togglePublish = () => {
    if (!worker.active) return setMsg({ text: "Tu cuenta está inactiva: solicita la reactivación para publicar.", tone: "warn" });
    if (!worker.published && services.length === 0) return setMsg({ text: "Agrega al menos un servicio para publicar tu perfil.", tone: "warn" });
    worker.published = !worker.published;
    refreshVisible();
    setMsg({
      text: worker.published ? "¡Perfil publicado! Ya apareces en las búsquedas." : "Perfil en borrador: los clientes ya no te ven.",
      tone: worker.published ? "ok" : "info",
    });
    refresh();
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <PageTitle title="Mis servicios" sub="Lo que publiques aquí es lo que verán los clientes en tu perfil." />

      <div className="space-y-4">
        {!worker.active && (
          <Banner tone="warn">Tu cuenta está inactiva por falta de actividad. No apareces en búsquedas hasta que se reactive.</Banner>
        )}
        {msg && <Banner tone={msg.tone}>{msg.text}</Banner>}

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-bold text-forest-950">Estado del perfil</p>
              <p className="text-sm text-forest-900/70">{worker.published ? "Publicado: los clientes te encuentran." : "Borrador: nadie te ve todavía."}</p>
            </div>
            <Btn variant={worker.published ? "ghost" : "gold"} onClick={togglePublish}>
              {worker.published ? <EyeOff size={16} /> : <Eye size={16} />}
              {worker.published ? "Pasar a borrador" : "Publicar perfil"}
            </Btn>
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl uppercase text-forest-950">Servicios ({services.length})</h2>
            <Btn onClick={() => openSvc()}>
              <Plus size={16} /> Agregar
            </Btn>
          </div>
          {services.length === 0 ? (
            <p className="text-sm text-forest-900/70">Todavía no tienes servicios. Agrega el primero para poder publicar.</p>
          ) : (
            <ul className="space-y-3">
              {services.map((s) => (
                <motion.li key={s.id} layout className="flex items-start gap-3 rounded-2xl bg-cream-50 p-4 transition-colors hover:bg-cream-100">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-forest-950">{s.title}</p>
                    <p className="text-sm text-forest-900/70">{s.description}</p>
                    <p className="mt-1 text-sm font-bold text-terracotta-600">Desde {colones(s.rate)}</p>
                  </div>
                  <button type="button" aria-label="Editar" onClick={() => openSvc(s)} className="rounded-full p-2 transition-colors hover:bg-forest-900/10">
                    <Pencil size={16} />
                  </button>
                  <button type="button" aria-label="Eliminar" onClick={() => removeSvc(s.id)} className="rounded-full p-2 text-terracotta-600 transition-colors hover:bg-terracotta-500 hover:text-white">
                    <Trash2 size={16} />
                  </button>
                </motion.li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl uppercase text-forest-950">Portafolio ({photos.length}/12)</h2>
            <Btn variant="ghost" onClick={openPhoto}>
              <ImagePlus size={16} /> Subir foto
            </Btn>
          </div>
          {photos.length === 0 ? (
            <p className="text-sm text-forest-900/70">Las fotos de trabajos anteriores generan más confianza.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos.map((p) => (
                <motion.figure key={p.id} layout whileHover={{ y: -4 }} className="group relative overflow-hidden rounded-2xl bg-cream-50">
                  {p.url && <img src={p.url} alt={p.caption} className="h-32 w-full object-cover transition-transform duration-300 group-hover:scale-110" />}
                  <figcaption className="p-2 text-xs font-medium text-forest-900">{p.caption}</figcaption>
                  <button
                    type="button"
                    onClick={() => {
                      const isCover = coverIdOf(worker) === p.id;
                      setCoverId(worker, isCover ? "" : p.id);
                      setMsg({ text: isCover ? "Se quitó la portada." : "Esta foto es ahora la portada de tu perfil.", tone: "ok" });
                      refresh();
                    }}
                    className={`absolute bottom-9 left-2 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold shadow transition-all hover:scale-105 ${
                      coverIdOf(worker) === p.id ? "bg-gold-400 text-forest-950" : "bg-white/90 text-forest-900 opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    <ImageIcon size={12} /> {coverIdOf(worker) === p.id ? "Portada" : "Usar de portada"}
                  </button>
                  <button
                    type="button"
                    aria-label="Quitar foto"
                    onClick={() => removePhoto(p.id)}
                    className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/90 opacity-0 transition-all hover:bg-terracotta-500 hover:text-white group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.figure>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Dialog
        open={svcOpen}
        title={editId ? "Editar servicio" : "Nuevo servicio"}
        onClose={() => setSvcOpen(false)}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setSvcOpen(false)}>
              Cancelar
            </Btn>
            <Btn onClick={saveSvc}>Guardar</Btn>
          </>
        }
      >
        <div className="space-y-4">
          <TextField label="Título" value={title} onChange={setTitle} error={svcErr.title} />
          <SelectField label="Categoría" value={svcCat} onChange={setSvcCat} error={svcErr.cat}>
            {catList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </SelectField>
          <TextAreaField label="Descripción" value={desc} onChange={setDesc} error={svcErr.desc} rows={3} max={300} />
          <TextField inputMode="numeric" label="Tarifa desde (₡)" value={rate} onChange={setRate} error={svcErr.rate} />
          <TextField label="Palabras clave (opcional, separadas por coma)" value={kw} onChange={setKw} />
        </div>
      </Dialog>

      <Dialog
        open={photoOpen}
        title="Subir foto"
        onClose={() => setPhotoOpen(false)}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setPhotoOpen(false)}>
              Cancelar
            </Btn>
            <Btn onClick={savePhoto}>Agregar</Btn>
          </>
        }
      >
        <div className="space-y-4">
          <input ref={fileRef} type="file" accept="image/*" className="sr-only" aria-label="Elegir foto" onChange={(e) => pickPhoto(e.target.files)} />
          {pUrl ? (
            <img src={pUrl} alt="Vista previa" className="max-h-52 w-full rounded-xl object-cover" />
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center gap-1 rounded-xl border-2 border-dashed border-forest-900/25 bg-cream-50 px-4 py-8 text-sm font-semibold text-forest-900 transition-colors hover:border-terracotta-500 hover:bg-terracotta-500/5"
            >
              <ImagePlus size={26} /> Toca para elegir una foto
            </button>
          )}
          {photoErr.file && <p className="text-xs font-medium text-terracotta-600">{photoErr.file}</p>}
          <TextField label="Descripción de la foto" value={pCaption} onChange={setPCaption} error={photoErr.caption} />
          <SelectField label="Categoría" value={pCat} onChange={setPCat}>
            {catList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </SelectField>
        </div>
      </Dialog>
    </main>
  );
}