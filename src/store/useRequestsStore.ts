import { create } from "zustand";
import { addDaysISO, roundAdvance, todayISO } from "../data/requests";
import type { Attachment, Rating, ServiceRequest } from "../data/requests";
import { workers } from "../data/workers";
import { useAppStore } from "./useAppStore";
import { notifyUser } from "./useNotifStore";

type NewRequest = Omit<ServiceRequest, "id" | "code" | "createdAt" | "status" | "events" | "resultPhotos" | "messages">;
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
  sendMessage: (id: string, from: string, text: string) => void;
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
    messages: [],
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
    messages: [],
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
    messages: [],
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

  // Avisos (HU-33): cada cambio de estado notifica a la otra parte
  const clientName = (r: ServiceRequest) => useAppStore.getState().users.find((u) => u.id === r.clientId)?.name ?? "Un cliente";
  const workerUser = (r: ServiceRequest) => workers.find((w) => w.id === r.workerId);
  const toClient = (r: ServiceRequest, title: string, text: string) =>
    notifyUser(r.clientId, title, `${r.code} · ${r.serviceTitle}. ${text}`, "/solicitudes");
  const toWorker = (r: ServiceRequest, title: string, text: string) =>
    notifyUser(workerUser(r)?.userId, title, `${r.code} · ${r.serviceTitle}. ${text}`, "/trabajador/solicitudes");

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
        messages: [],
      };
      set((s) => ({ requests: [request, ...s.requests] }));
      toWorker(request, "Nueva solicitud recibida", `${clientName(request)} te pidió un servicio. Respóndele a tiempo.`);
      return request;
    },

    accept: (id) => {
      const r = find(id);
      change(id, { status: "aceptada" }, "Solicitud aceptada por el trabajador");
      if (r) toClient(r, "Tu solicitud fue aceptada", "El trabajador confirmó la fecha acordada.");
    },

    reject: (id, reason) => {
      const r = find(id);
      if (!r) return;
      change(id, { status: "rechazada", reason, refund: r.advance }, "Solicitud rechazada · anticipo devuelto");
      toClient(r, "Tu solicitud fue rechazada", "Tu anticipo se devolvió completo. Puedes buscar a otro trabajador.");
    },

    expire: (id) => {
      const r = find(id);
      if (!r || r.status !== "pendiente") return;
      change(id, { status: "vencida", refund: r.advance }, "El trabajador no respondió a tiempo · anticipo devuelto");
      toClient(r, "Tu solicitud venció", "El trabajador no respondió a tiempo y tu anticipo se devolvió.");
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
      const text = by === "cliente" ? `${clientName(r)} canceló la solicitud.` : "El trabajador canceló la solicitud y tu anticipo se devolvió completo.";
      if (by === "cliente") toWorker(r, "Solicitud cancelada", text);
      else toClient(r, "Solicitud cancelada", text);
      return { refund, fee };
    },

    finish: (id, photos) => {
      const r = find(id);
      change(id, { status: "pendiente_confirmacion", resultPhotos: photos }, "Trabajo marcado como finalizado");
      if (r) toClient(r, "Confirma el trabajo realizado", "El trabajador marcó el servicio como finalizado. Revísalo y confírmalo.");
    },

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
      toWorker(r, "Servicio finalizado", auto ? "Se cerró automáticamente por falta de respuesta del cliente." : "El cliente confirmó el trabajo.");
    },

    report: (id, reason) => {
      const r = find(id);
      change(id, { status: "en_disputa", reason }, "El cliente reportó un problema · en revisión");
      if (r) toWorker(r, "El cliente reportó un problema", "La solicitud quedó en revisión.");
    },

    sendMessage: (id, from, text) => {
      const r = find(id);
      const body = text.trim();
      if (!r || !body) return;
      set((s) => ({
        requests: s.requests.map((x) =>
          x.id === id ? { ...x, messages: [...x.messages, { id: `m${Date.now()}`, from, text: body, at: Date.now() }] } : x,
        ),
      }));
      // Avisa a la otra parte del chat
      const sender = useAppStore.getState().users.find((u) => u.id === from)?.name ?? "Alguien";
      if (from === r.clientId) toWorker(r, "Mensaje nuevo", `${sender}: ${body.slice(0, 60)}`);
      else toClient(r, "Mensaje nuevo", `${sender}: ${body.slice(0, 60)}`);
    },

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
      toWorker(r, "Recibiste una calificación", `${author} te calificó con ${rating.stars} de 5.`);
    },
  };
});