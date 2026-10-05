import type { Role } from "./data/users";

// Pantalla principal según el rol activo
export const homeFor = (role: Role | null): string =>
  role === "trabajador" ? "/trabajador" : role === "administrador" ? "/admin" : "/";