import { motion } from "framer-motion";
import { CreditCard, MapPin, Search, ShieldCheck, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Btn, Dialog } from "./Ui";

const steps: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Search, title: "Busca y compara", text: "Filtra por servicio, zona y calificación. Todos los trabajadores pasaron por una verificación de identidad." },
  { icon: MapPin, title: "Describe y ubica", text: "Cuéntanos el problema con fotos o video y marca en el mapa dónde necesitas el servicio." },
  { icon: CreditCard, title: "Anticipo protegido", text: "Pagas solo un anticipo al confirmar. El resto se paga cuando el trabajo termina." },
  { icon: ShieldCheck, title: "Seguimiento en tiempo real", text: "Ves el estado de tu solicitud: aceptada, en camino, en progreso y finalizada." },
  { icon: Star, title: "Califica", text: "Al terminar, valora al trabajador. Tu opinión ayuda a otros hogares a contratar con confianza." },
];

export default function HowItWorksModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  return (
    <Dialog
      open={open}
      wide
      title="¿Cómo funciona?"
      onClose={onClose}
      footer={
        <>
          <Btn variant="ghost" onClick={onClose}>
            Cerrar
          </Btn>
          <Btn
            onClick={() => {
              onClose();
              navigate("/buscar");
            }}
          >
            Buscar trabajadores
          </Btn>
        </>
      }
    >
      <ol className="space-y-3">
        {steps.map((s, i) => (
          <motion.li
            key={s.title}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            whileHover={{ x: 4 }}
            className="group flex items-start gap-4 rounded-2xl bg-cream-50 p-4 transition-colors hover:bg-cream-100"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-forest-900 text-white transition-all duration-300 group-hover:scale-110 group-hover:bg-terracotta-500">
              <s.icon size={20} />
            </span>
            <div>
              <p className="font-bold text-forest-950">
                <span className="mr-1 text-terracotta-500">{i + 1}.</span>
                {s.title}
              </p>
              <p className="text-sm text-forest-900/70">{s.text}</p>
            </div>
          </motion.li>
        ))}
      </ol>
    </Dialog>
  );
}