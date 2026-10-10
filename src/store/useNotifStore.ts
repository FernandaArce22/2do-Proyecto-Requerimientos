import { create } from "zustand";
import { useAppStore } from "./useAppStore";

export type Notif = {
  id: string;
  userId: string;
  title: string;
  text: string;
  at: number;
  read: boolean;
  to?: string; // pantalla a la que lleva al tocarla
};

type State = {
  items: Notif[];
  push: (userId: string, title: string, text: string, to?: string) => void;
  markRead: (id: string) => void;
  markAll: (userId: string) => void;
};

let counter = 0;
const ago = (min: number) => Date.now() - min * 60_000;

// Notificaciones de ejemplo para las cuentas de demostración
const seed: Notif[] = [
  { id: "n-s1", userId: "u1", title: "¡Bienvenida a la plataforma!", text: "Busca un trabajador verificado y envía tu primera solicitud.", at: ago(120), read: false, to: "/buscar" },
  { id: "n-s2", userId: "u2", title: "Tu perfil está activo", text: "Revisa tus solicitudes recibidas para no perder clientes.", at: ago(90), read: false, to: "/trabajador/solicitudes" },
  { id: "n-s3", userId: "u5", title: "Postulación nueva", text: "Pedro Vargas envió su postulación para ser trabajador.", at: ago(60), read: false, to: "/admin/postulaciones" },
];

export const useNotifStore = create<State>((set) => ({
  items: seed,
  push: (userId, title, text, to) =>
    set((s) => ({
      items: [{ id: `n${Date.now()}-${++counter}`, userId, title, text, at: Date.now(), read: false, to }, ...s.items],
    })),
  markRead: (id) => set((s) => ({ items: s.items.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
  markAll: (userId) => set((s) => ({ items: s.items.map((n) => (n.userId === userId ? { ...n, read: true } : n)) })),
}));

export const notifyUser = (userId: string | undefined, title: string, text: string, to?: string) => {
  if (userId) useNotifStore.getState().push(userId, title, text, to);
};

export const notifyAdmins = (title: string, text: string, to?: string) => {
  useAppStore
    .getState()
    .users.filter((u) => u.roles.includes("administrador"))
    .forEach((u) => useNotifStore.getState().push(u.id, title, text, to));
};