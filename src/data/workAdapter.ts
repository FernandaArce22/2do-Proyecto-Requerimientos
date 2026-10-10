// Punto único donde se leen y escriben los servicios y fotos de un trabajador.
import { workers } from "./workers";
import type { Worker } from "./workers";

type AnyObj = Record<string, unknown>;
export type ServiceView = { id: string; title: string; description: string; rate: number; categoryId: string; keywords: string[] };
export type PhotoView = { id: string; url: string; caption: string; categoryId: string };

export const findWorker = (userId: string | undefined): Worker | undefined =>
  workers.find((w) => w.userId === userId);

const str = (v: unknown) => (typeof v === "string" ? v : "");
const raw = (w: Worker, key: "services" | "photos") => (((w as unknown as AnyObj)[key] as AnyObj[] | undefined) ?? []);

// Los datos de ejemplo no tienen id: se usa el título / la descripción como identificador
const svcId = (s: AnyObj) => str(s.id) || str(s.title);
const photoId = (p: AnyObj) => str(p.id) || str(p.caption);

export const servicesOf = (w: Worker): ServiceView[] =>
  raw(w, "services").map((s) => ({
    id: svcId(s),
    title: str(s.title),
    description: str(s.description),
    rate: Number(s.rate ?? 0),
    categoryId: str(s.categoryId),
    keywords: Array.isArray(s.keywords) ? (s.keywords as string[]) : [],
  }));

export const photosOf = (w: Worker): PhotoView[] =>
  raw(w, "photos").map((p) => ({
    id: photoId(p),
    url: str(p.image ?? p.url),
    caption: str(p.caption),
    categoryId: str(p.categoryId),
  }));

export function saveServices(w: Worker, list: ServiceView[]) {
  const prev = raw(w, "services");
  (w as unknown as AnyObj).services = list.map((s) => {
    const old = prev.find((x) => svcId(x) === s.id);
    return { ...old, id: s.id, title: s.title, description: s.description, rate: s.rate, categoryId: s.categoryId, keywords: s.keywords };
  });
}

export function savePhotos(w: Worker, list: PhotoView[]) {
  const prev = raw(w, "photos");
  (w as unknown as AnyObj).photos = list.map((p) => {
    const old = prev.find((x) => photoId(x) === p.id);
    return { ...old, id: p.id, image: p.url, caption: p.caption, categoryId: p.categoryId };
  });
}

// Portada del perfil: id de la foto del portafolio elegida por el trabajador
export const coverIdOf = (w: Worker): string => str((w as unknown as AnyObj).coverId);
export const setCoverId = (w: Worker, id: string) => {
  (w as unknown as AnyObj).coverId = id;
};