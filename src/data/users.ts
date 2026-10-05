export type Role = "cliente" | "trabajador" | "administrador";
export type WorkerStatus = "ninguno" | "en_revision" | "verificado" | "rechazado";

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string; // solo prototipo: en memoria
  roles: Role[];
  workerStatus: WorkerStatus;
  accountActive: boolean;
};

// Contraseña única de las cuentas de demostración
export const DEMO_PASSWORD = "Hogar#Demo26";

// Usuarios de demostración
export const seedUsers: User[] = [
  {
    id: "u1",
    name: "Ana Rojas",
    email: "ana@correo.com",
    phone: "88881111",
    password: DEMO_PASSWORD,
    roles: ["cliente"],
    workerStatus: "ninguno",
    accountActive: true,
  },
  {
    id: "u2",
    name: "Luis Mora",
    email: "luis@correo.com",
    phone: "88882222",
    password: DEMO_PASSWORD,
    roles: ["cliente", "trabajador"],
    workerStatus: "verificado",
    accountActive: true,
  },
  {
    id: "u3",
    name: "Marta Solís",
    email: "marta@correo.com",
    phone: "88883333",
    password: DEMO_PASSWORD,
    roles: ["cliente", "trabajador"],
    workerStatus: "verificado",
    accountActive: false, // cuenta inactiva (CU-13)
  },
  {
    id: "u4",
    name: "Pedro Vargas",
    email: "pedro@correo.com",
    phone: "88884444",
    password: DEMO_PASSWORD,
    roles: ["cliente"],
    workerStatus: "en_revision", // postulación en revisión (CU-03)
    accountActive: true,
  },
  {
    id: "u5",
    name: "Admin Plataforma",
    email: "admin@correo.com",
    phone: "88885555",
    password: DEMO_PASSWORD,
    roles: ["administrador"],
    workerStatus: "ninguno",
    accountActive: true,
  },
];