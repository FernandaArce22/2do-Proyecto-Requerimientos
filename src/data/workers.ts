import { categories } from "./mockData";

export type Service = {
  categoryId: string;
  title: string;
  description: string;
  rate: number; // tarifa de referencia en colones
  keywords: string; // palabras que la gente usaría al buscar
};

export type Review = { author: string; rating: number; comment: string; daysAgo: number };

export type Photo = {
  caption: string;
  categoryId: string;
  image: string; // ruta en /public (si no existe, se muestra una ilustración)
};

export type Worker = {
  id: string;
  userId?: string; // vínculo con una cuenta de demostración
  name: string;
  zone: string;
  bio: string;
  verified: boolean;
  active: boolean;
  published: boolean;
  rating: number;
  reviewCount: number;
  jobsDone: number;
  lastJobDaysAgo: number;
  memberSince: number;
  services: Service[];
  photos: Photo[];
  reviews: Review[];
};

export const zones = ["Ciudad Quesada", "Florencia", "Aguas Zarcas", "Pital", "La Fortuna", "Zarcero"];

export const colones = (n: number) => "₡" + n.toLocaleString("es-CR");

export const lastJobText = (days: number) =>
  days === 0 ? "hoy" : days === 1 ? "ayer" : `hace ${days} días`;

const pool: Review[] = [
  { author: "Ana R.", rating: 5, comment: "Llegó puntual y dejó todo limpio. Muy profesional.", daysAgo: 5 },
  { author: "Jorge M.", rating: 5, comment: "Resolvió el problema en una sola visita. Lo recomiendo.", daysAgo: 12 },
  { author: "Patricia S.", rating: 4, comment: "Buen trabajo y buen precio. Se atrasó un poco al llegar.", daysAgo: 20 },
  { author: "Mario V.", rating: 5, comment: "Explicó todo antes de empezar y cumplió lo acordado.", daysAgo: 31 },
  { author: "Laura C.", rating: 4, comment: "Quedó muy bien, volvería a contratarlo.", daysAgo: 45 },
  { author: "Daniel P.", rating: 5, comment: "Trato amable y trabajo de calidad.", daysAgo: 58 },
];

const photos = (workerId: string, categoryId: string, captions: string[]): Photo[] =>
  captions.map((caption, i) => ({ caption, categoryId, image: `/img/trabajos/${workerId}-${i + 1}.jpg` }));

export const workers: Worker[] = [
  {
    id: "w1",
    userId: "u2",
    name: "Luis Mora",
    zone: "Ciudad Quesada",
    bio: "Plomero con 12 años de experiencia en instalaciones residenciales. Atiendo emergencias y trabajos programados con garantía.",
    verified: true,
    active: true,
    published: true,
    rating: 4.8,
    reviewCount: 42,
    jobsDone: 42,
    lastJobDaysAgo: 3,
    memberSince: 2024,
    services: [
      { categoryId: "plomeria", title: "Reparación de fugas", description: "Detección y reparación de fugas en tuberías y llaves.", rate: 15000, keywords: "fuga agua tuberia tubo llave grifo gotera" },
      { categoryId: "plomeria", title: "Instalación de sanitarios", description: "Instalación y cambio de inodoros, lavatorios y duchas.", rate: 25000, keywords: "inodoro sanitario lavatorio ducha instalar" },
    ],
    photos: photos("w1", "plomeria", ["Cambio de tubería de cocina", "Instalación de lavatorio", "Reparación de fuga en baño", "Ducha nueva"]),
    reviews: pool.slice(0, 3),
  },
  {
    id: "w2",
    userId: "u3",
    name: "Marta Solís",
    zone: "Florencia",
    bio: "Jardinería y mantenimiento de zonas verdes.",
    verified: true,
    active: false, // cuenta inactiva (CU-13): no aparece en las búsquedas
    published: true,
    rating: 4.6,
    reviewCount: 20,
    jobsDone: 20,
    lastJobDaysAgo: 75,
    memberSince: 2024,
    services: [
      { categoryId: "jardineria", title: "Mantenimiento de jardines", description: "Corte, poda y limpieza.", rate: 18000, keywords: "jardin cesped poda" },
    ],
    photos: photos("w2", "jardineria", ["Jardín frontal"]),
    reviews: pool.slice(1, 3),
  },
  {
    id: "w3",
    name: "Carlos Jiménez",
    zone: "Aguas Zarcas",
    bio: "Plomería y destapado de drenajes con equipo profesional. Atención rápida en toda la zona norte.",
    verified: true,
    active: true,
    published: true,
    rating: 4.5,
    reviewCount: 18,
    jobsDone: 18,
    lastJobDaysAgo: 6,
    memberSince: 2025,
    services: [
      { categoryId: "plomeria", title: "Destapado de drenajes", description: "Limpieza de cañerías y drenajes obstruidos.", rate: 12000, keywords: "drenaje destapar cañeria obstruido atascado" },
      { categoryId: "plomeria", title: "Reparación de fugas", description: "Fugas visibles y ocultas en paredes y pisos.", rate: 16000, keywords: "fuga agua humedad tuberia" },
    ],
    photos: photos("w3", "plomeria", ["Destapado de cañería", "Reparación en pared", "Cambio de llave"]),
    reviews: pool.slice(2, 5),
  },
  {
    id: "w4",
    name: "Rosa Campos",
    zone: "Ciudad Quesada",
    bio: "Diseño y mantenimiento de jardines. Me encargo de que tu espacio se vea cuidado todo el año.",
    verified: true,
    active: true,
    published: true,
    rating: 4.9,
    reviewCount: 57,
    jobsDone: 57,
    lastJobDaysAgo: 2,
    memberSince: 2023,
    services: [
      { categoryId: "jardineria", title: "Poda y mantenimiento", description: "Poda de árboles, setos y arbustos.", rate: 20000, keywords: "poda arbol seto arbusto cortar" },
      { categoryId: "jardineria", title: "Diseño de jardín", description: "Diseño y siembra de plantas ornamentales.", rate: 60000, keywords: "diseño jardin plantas sembrar ornamental" },
    ],
    photos: photos("w4", "jardineria", ["Jardín con plantas ornamentales", "Poda de seto", "Diseño de patio", "Mantenimiento mensual"]),
    reviews: pool.slice(0, 4),
  },
  {
    id: "w5",
    name: "Andrés Vargas",
    zone: "La Fortuna",
    bio: "Carpintero artesanal. Muebles a medida, closets y reparaciones de puertas y ventanas.",
    verified: true,
    active: true,
    published: true,
    rating: 4.6,
    reviewCount: 31,
    jobsDone: 31,
    lastJobDaysAgo: 9,
    memberSince: 2024,
    services: [
      { categoryId: "carpinteria", title: "Muebles a medida", description: "Closets, cocinas y muebles diseñados para tu espacio.", rate: 80000, keywords: "mueble closet cocina madera medida" },
      { categoryId: "carpinteria", title: "Reparación de puertas", description: "Ajuste, cambio de bisagras y cerraduras.", rate: 18000, keywords: "puerta ventana bisagra cerradura reparar" },
    ],
    photos: photos("w5", "carpinteria", ["Closet empotrado", "Mesa de comedor", "Puerta nueva"]),
    reviews: pool.slice(1, 4),
  },
  {
    id: "w6",
    name: "Lucía Araya",
    zone: "Ciudad Quesada",
    bio: "Cuido de adultos mayores con paciencia y cariño. Acompañamiento, medicación y actividades diarias.",
    verified: true,
    active: true,
    published: true,
    rating: 4.9,
    reviewCount: 24,
    jobsDone: 24,
    lastJobDaysAgo: 1,
    memberSince: 2025,
    services: [
      { categoryId: "cuido", title: "Cuido de adultos mayores", description: "Acompañamiento diurno y apoyo en el hogar.", rate: 30000, keywords: "adulto mayor anciano abuelo abuela cuidar acompañamiento" },
    ],
    photos: photos("w6", "cuido", ["Acompañamiento en casa", "Paseo diario"]),
    reviews: pool.slice(3, 6),
  },
  {
    id: "w7",
    name: "Diego Rojas",
    zone: "Pital",
    bio: "Electricista residencial certificado. Instalaciones seguras y diagnóstico de fallas.",
    verified: true,
    active: true,
    published: true,
    rating: 4.4,
    reviewCount: 15,
    jobsDone: 15,
    lastJobDaysAgo: 14,
    memberSince: 2025,
    services: [
      { categoryId: "electricidad", title: "Fallas eléctricas", description: "Cortocircuitos, tomacorrientes y breakers.", rate: 15000, keywords: "corto luz electricidad breaker tomacorriente apagon" },
      { categoryId: "electricidad", title: "Instalación de lámparas", description: "Instalación de lámparas y ventiladores.", rate: 12000, keywords: "lampara ventilador luz instalar bombillo" },
    ],
    photos: photos("w7", "electricidad", ["Cambio de tablero", "Instalación de lámparas"]),
    reviews: pool.slice(2, 4),
  },
  {
    id: "w8",
    name: "Karla Mena",
    zone: "Florencia",
    bio: "Limpieza profunda de hogares y oficinas. Productos de calidad y atención al detalle.",
    verified: true,
    active: true,
    published: true,
    rating: 4.7,
    reviewCount: 66,
    jobsDone: 66,
    lastJobDaysAgo: 4,
    memberSince: 2023,
    services: [
      { categoryId: "limpieza", title: "Limpieza profunda", description: "Limpieza completa de casa o apartamento.", rate: 25000, keywords: "limpiar casa aseo profunda apartamento" },
      { categoryId: "limpieza", title: "Limpieza post-obra", description: "Retiro de polvo y residuos tras construcción.", rate: 45000, keywords: "obra construccion polvo remodelacion" },
    ],
    photos: photos("w8", "limpieza", ["Cocina después de la limpieza", "Sala y comedor", "Baño"]),
    reviews: pool.slice(0, 3),
  },
  {
    id: "w9",
    name: "Esteban Quesada",
    zone: "Zarcero",
    bio: "Mantenimiento de zonas verdes, césped y sistemas de riego.",
    verified: true,
    active: true,
    published: true,
    rating: 4.3,
    reviewCount: 12,
    jobsDone: 12,
    lastJobDaysAgo: 20,
    memberSince: 2025,
    services: [
      { categoryId: "jardineria", title: "Césped y riego", description: "Corte de césped e instalación de riego.", rate: 18000, keywords: "cesped zacate riego aspersor jardin" },
    ],
    photos: photos("w9", "jardineria", ["Césped recién cortado", "Sistema de riego"]),
    reviews: pool.slice(4, 6),
  },
  {
    id: "w10",
    name: "Sofía Brenes",
    zone: "Ciudad Quesada",
    bio: "Cuido de niños y apoyo en tareas del hogar. Con referencias verificables.",
    verified: true,
    active: true,
    published: true,
    rating: 4.7,
    reviewCount: 38,
    jobsDone: 38,
    lastJobDaysAgo: 5,
    memberSince: 2024,
    services: [
      { categoryId: "cuido", title: "Cuido de niños", description: "Cuido en casa por horas o por día.", rate: 20000, keywords: "niño niña bebe cuidar cuido nana" },
    ],
    photos: photos("w10", "cuido", ["Actividades con niños", "Hora de la merienda"]),
    reviews: pool.slice(1, 4),
  },
];


   export const visibleWorkers: Worker[] = workers.filter((w) => w.verified && w.active && w.published);
   export const refreshVisible = () => {
     visibleWorkers.splice(0, visibleWorkers.length, ...workers.filter((w) => w.verified && w.active && w.published));
   };

export const searchText = (w: Worker) =>
  [
    w.name,
    w.zone,
    w.bio,
    ...w.services.flatMap((s) => [
      s.title,
      s.description,
      s.keywords,
      categories.find((c) => c.id === s.categoryId)?.name ?? "",
    ]),
  ].join(" ");

// Tarifa "desde" del trabajador (dentro de una categoría, si se indica)
export const fromRate = (w: Worker, category: string) =>
  Math.min(...w.services.filter((s) => category === "todos" || s.categoryId === category).map((s) => s.rate));