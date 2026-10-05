import { Trees, Wrench, Hammer, HeartHandshake, Zap, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Category = {
  id: string;
  name: string; // nombre corto (chips)
  title: string; // título de la tarjeta
  icon: LucideIcon;
  rating: number;
  services: number;
  price: string;
  gradient: string;
  image?: string; // opcional: "/img/jardineria.jpg" (poner la foto en public/img)
};

export const categories: Category[] = [
  {
    id: "jardineria",
    name: "Jardinería",
    title: "Jardinería profesional",
    icon: Trees,
    rating: 4.8,
    services: 25,
    price: "₡15 000 – ₡120 000",
    gradient: "from-emerald-200 to-emerald-400",
    image: "/img/Jardineria1.jpg",
  },
  {
    id: "plomeria",
    name: "Plomería",
    title: "Plomería experta",
    icon: Wrench,
    rating: 4.7,
    services: 26,
    price: "₡12 000 – ₡90 000",
    gradient: "from-sky-200 to-sky-400",
    image: "/img/plomeria.jpg",
  },
  {
    id: "carpinteria",
    name: "Carpintería",
    title: "Carpintería a medida",
    icon: Hammer,
    rating: 4.6,
    services: 29,
    price: "₡20 000 – ₡250 000",
    gradient: "from-amber-200 to-amber-400",
    image: "/img/carpinteria.jpg",
  },
  {
    id: "cuido",
    name: "Cuido de personas",
    title: "Cuido de adultos mayores",
    icon: HeartHandshake,
    rating: 4.9,
    services: 13,
    price: "₡25 000 – ₡150 000",
    gradient: "from-rose-200 to-rose-400",
    image: "/img/cuido.png",
  },
  {
    id: "electricidad",
    name: "Electricidad",
    title: "Electricidad residencial",
    icon: Zap,
    rating: 4.5,
    services: 18,
    price: "₡15 000 – ₡110 000",
    gradient: "from-yellow-200 to-yellow-400",
    image: "/img/electricidad.webp",
  },
  {
    id: "limpieza",
    name: "Limpieza",
    title: "Limpieza del hogar",
    icon: Sparkles,
    rating: 4.7,
    services: 31,
    price: "₡10 000 – ₡60 000",
    gradient: "from-teal-200 to-teal-400",
    image: "/img/limpieza.webp",
  },
];