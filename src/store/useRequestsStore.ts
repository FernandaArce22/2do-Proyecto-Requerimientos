import { create } from "zustand";
import { addDaysISO, roundAdvance, todayISO } from "../data/requests";
import type { Attachment, Rating, ServiceRequest } from "../data/requests";
import { workers } from "../data/workers";

type NewRequest = Omit<ServiceRequest, "id" | "code" | "createdAt" | "status" | "events" | "resultPhotos">;
type CancelBy = "cliente" | "trabajador";

type State = {
  requests: ServiceRequest[];
  // Parámetros del negocio (el administrador los configurará en CU-14)
  settings: { advancePercent: number; cancelFeePercent: number };
  addRequest: (data: NewRequest) => ServiceRequest;
  accept: (id: string) => void;
  reject: (id: string, reason: string) => void;
  expire: (id: string) => void;
  cancel: (id: string, by: CancelBy, reason: string) => { refund: number; fee: number } | null;
  finish: (id: string, photos: Attachment[]) => void;
  confirm: (id: string, auto?: boolean) => void;
  report: (id: string, reason: string) => void;
  rate: (id: string, rating: Rating, author: string) => void;
};

const ago = (hours: number) => Date.now() - hours * 3_600_000;

// Solicitudes de ejemplo para Luis Mora (w1), para probar el lado del trabajador
const seed: ServiceRequest[] = [
  {
    id: "seed1",
    code: "SOL-097",
    clientId: "u1",
    workerId: "w1",
    serviceTitle: "Reparación de fugas",
    categoryId: "plomeria",
    description: "Hay una fuga debajo del lavatorio de la cocina y el piso se está mojando.\nUrgencia: lo antes posible.",
    date: addDaysISO(2),
    slot: "10:00 a. m.",
    location: { lat: 10.3262, lng: -84.4301 },
    directions: "Casa verde con portón negro, 200 m al norte de la escuela.",
    attachments: [],
    rate: 15000,
    advance: roundAdvance(15000, 20),
    paymentMethod: "sinpe",
    receipt: "CMP-482913",
    status: "pendiente",
    createdAt: ago(3),
    events: [{ label: "Solicitud enviada · anticipo pagado", at: ago(3) }],
    resultPhotos: [],
  },
  {
    id: "seed2",
    code: "SOL-098",
    clientId: "u4",
    workerId: "w1",
    serviceTitle: "Instalación de sanitarios",
    categoryId: "plomeria",
    description: "Necesito cambiar el inodoro del baño principal por uno nuevo que ya compré.",
    date: todayISO(),
    slot: "3:00 p. m.",
    location: { lat: 10.3198, lng: -84.4255 },
    directions: "Condominio Las Palmas, casa 12.",
    attachments: [],
    rate: 25000,
    advance: roundAdvance(25000, 20),
    paymentMethod: "tarjeta",
    receipt: "CMP-715204",
    status: "pendiente",
    createdAt: ago(1),
    events: [{ label: "Solicitud enviada · anticipo pagado", at: ago(1) }],
    resultPhotos: [],
  },
  {
    id: "seed3",
    code: "SOL-096",
    clientId: "u1",
    workerId: "w1",
    serviceTitle: "Reparación de fugas",
    categoryId: "plomeria",
    description: "La llave del patio gotea todo el día.",
    date: todayISO(),
    slot: "3:00 p. m.",
    location: { lat: 10.3244, lng: -84.4289 },
    directions: "Frente al parque, portón blanco.",
    attachments: [],
    rate: 15000,
    advance: roundAdvance(15000, 20),
    paymentMethod: "sinpe",
    receipt: "CMP-330871",
    status: "aceptada",
    createdAt: ago(30),
    events: [
      { label: "Solicitud enviada · anticipo pagado", at: ago(30) },
      { label: "Solicitud aceptada por el trabajador", at: ago(20) },
    ],
    resultPhotos: [],
  },
];

let counter = 100;

export const useRequestsStore = create<State>((set, get) => {
  const find = (id: string) => get().requests.find((r) => r.id === id);

  // Aplica cambios a una solicitud y registra el evento en su historial
  const change = (id: string, changes: Partial<ServiceRequest>, label: string) =>
    set((s) => ({
      requests: s.requests.map((r) =>
        r.id === id ? { ...r, ...changes, events: [...r.events, { label, at: Date.now() }] } : r,
      ),
    }));

  return {
    requests: seed,
    settings: { advancePercent: 20, cancelFeePercent: 50 },

    addRequest: (data) => {
      counter += 1;
      const request: ServiceRequest = {
        ...data,
        id: `r${Date.now()}`,
        code: `SOL-${counter}`,
        status: "pendiente",
        createdAt: Date.now(),
        events: [{ label: "Solicitud enviada · anticipo pagado", at: Date.now() }],
        resultPhotos: [],
      };
      set((s) => ({ requests: [request, ...s.requests] }));
      return request;
    },

    accept: (id) => change(id, { status: "aceptada" }, "Solicitud aceptada por el trabajador"),

    reject: (id, reason) => {
      const r = find(id);
      if (!r) return;
      change(id, { status: "rechazada", reason, refund: r.advance }, "Solicitud rechazada · anticipo devuelto");
    },

    expire: (id) => {
      const r = find(id);
      if (!r || r.status !== "pendiente") return;
      change(id, { status: "vencida", refund: r.advance }, "El trabajador no respondió a tiempo · anticipo devuelto");
    },

    cancel: (id, by, reason) => {
      const r = find(id);
      if (!r || (r.status !== "pendiente" && r.status !== "aceptada")) return null;
      // Tarifa solo si el cliente cancela una solicitud ya aceptada
      const fee =
        by === "cliente" && r.status === "aceptada"
          ? Math.min(r.advance, roundAdvance(r.advance, get().settings.cancelFeePercent))
          : 0;
      const refund = r.advance - fee;
      change(
        id,
        { status: "cancelada", cancelledBy: by, reason, refund, fee },
        by === "cliente" ? "Cancelada por el cliente" : "Cancelada por el trabajador · anticipo devuelto completo",
      );
      return { refund, fee };
    },

    finish: (id, photos) =>
      change(id, { status: "pendiente_confirmacion", resultPhotos: photos }, "Trabajo marcado como finalizado"),

    confirm: (id, auto = false) => {
      const r = find(id);
      if (!r) return;
      // Objetos en memoria: el trabajo suma al historial del trabajador
      const w = workers.find((x) => x.id === r.workerId);
      if (w) {
        w.jobsDone += 1;
        w.lastJobDaysAgo = 0;
      }
      change(
        id,
        { status: "finalizada", autoClosed: auto },
        auto ? "Cierre automático por falta de respuesta del cliente" : "Servicio confirmado por el cliente",
      );
    },

    report: (id, reason) => change(id, { status: "en_disputa", reason }, "El cliente reportó un problema · en revisión"),

    rate: (id, rating, author) => {
      const r = find(id);
      if (!r || r.rating) return;
      // Recalcula el promedio del trabajador y agrega la reseña a su perfil
      const w = workers.find((x) => x.id === r.workerId);
      if (w) {
        w.rating = Math.round(((w.rating * w.reviewCount + rating.stars) / (w.reviewCount + 1)) * 10) / 10;
        w.reviewCount += 1;
        w.reviews.unshift({
          author,
          rating: rating.stars,
          comment: rating.comment || "Sin comentario escrito.",
          daysAgo: 0,
        });
      }
      change(id, { rating }, `Calificación: ${rating.stars} de 5`);
    },
  };
});