import { create } from "zustand";
import { seedUsers } from "../data/users";
import type { Role, User } from "../data/users";

// Parámetros de seguridad (CU-01, excepción B)
export const MAX_LOGIN_ATTEMPTS = 3;
const LOCK_MS = 30_000;

type Toast = { id: number; type: "success" | "error" | "info"; message: string };
type Result = { ok: true } | { ok: false; error: string };
type RegisterData = { name: string; email: string; phone: string; password: string };

type State = {
  // Búsqueda (Inicio)
  query: string;
  category: string;
  setQuery: (q: string) => void;
  setCategory: (c: string) => void;

  // Notificaciones
  notifications: number;
  addNotification: () => void;
  clearNotifications: () => void;

  // Sesión y roles (CU-01, CU-02)
  users: User[];
  currentUser: User | null;
  activeRole: Role | null;
  failedAttempts: number;
  lockedUntil: number | null;
  login: (email: string, password: string) => Result;
  register: (data: RegisterData) => Result;
  logout: () => void;
  switchRole: (role: Role) => Result;

  // Avisos (toasts)
  toasts: Toast[];
  showToast: (type: Toast["type"], message: string) => void;
  dismissToast: (id: number) => void;
};

let toastId = 0;

export const useAppStore = create<State>((set, get) => ({
  query: "",
  category: "todos",
  setQuery: (query) => set({ query }),
  setCategory: (category) => set({ category }),

  notifications: 2,
  addNotification: () => set((s) => ({ notifications: s.notifications + 1 })),
  clearNotifications: () => set({ notifications: 0 }),

  users: seedUsers,
  currentUser: null,
  activeRole: null,
  failedAttempts: 0,
  lockedUntil: null,

  login: (email, password) => {
    const { lockedUntil, failedAttempts, users } = get();

    if (lockedUntil && Date.now() < lockedUntil) {
      const secs = Math.ceil((lockedUntil - Date.now()) / 1000);
      return { ok: false, error: `Demasiados intentos. Intenta de nuevo en ${secs} s.` };
    }

    const user = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
    );

    if (!user) {
      const attempts = failedAttempts + 1;
      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        set({ failedAttempts: 0, lockedUntil: Date.now() + LOCK_MS });
        return { ok: false, error: "Demasiados intentos fallidos. Acceso bloqueado por 30 segundos." };
      }
      set({ failedAttempts: attempts });
      return { ok: false, error: "Correo o contraseña incorrectos." }; // mensaje genérico
    }

    // Por defecto entra como cliente (el administrador entra a su panel)
    const role: Role = user.roles.includes("administrador") ? "administrador" : "cliente";
    set({ currentUser: user, activeRole: role, failedAttempts: 0, lockedUntil: null });
    return { ok: true };
  },

  register: ({ name, email, phone, password }) => {
    const exists = get().users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (exists) {
      return { ok: false, error: "Ese correo ya está registrado. Prueba iniciando sesión." };
    }
    const user: User = {
      id: `u${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
      roles: ["cliente"],
      workerStatus: "ninguno",
      accountActive: true,
    };
    set((s) => ({ users: [...s.users, user], currentUser: user, activeRole: "cliente" }));
    return { ok: true };
  },

  logout: () => set({ currentUser: null, activeRole: null }),

  switchRole: (role) => {
    const user = get().currentUser;
    if (!user) return { ok: false, error: "Inicia sesión primero." };

    if (role === "trabajador" && user.workerStatus !== "verificado") {
      return {
        ok: false,
        error:
          user.workerStatus === "en_revision"
            ? "Tu postulación sigue en revisión. Te avisaremos cuando sea resuelta."
            : "Aún no eres trabajador verificado. Postúlate para ofrecer servicios.",
      };
    }
    if (!user.roles.includes(role)) return { ok: false, error: "No tienes acceso a ese rol." };

    set({ activeRole: role });
    return { ok: true };
  },

  toasts: [],
  showToast: (type, message) => {
    const id = ++toastId;
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));
    setTimeout(() => get().dismissToast(id), 3500);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));