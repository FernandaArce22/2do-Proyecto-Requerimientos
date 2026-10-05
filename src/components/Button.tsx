import { motion } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  variant?: "terracotta" | "forest" | "light";
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
};

const variants = {
  terracotta: "bg-terracotta-500 text-white hover:bg-terracotta-600 shadow-terracotta-500/30",
  forest: "bg-forest-900 text-white hover:bg-forest-700 shadow-forest-900/30",
  light: "bg-white text-forest-900 hover:bg-cream-100 shadow-black/10",
};

export default function Button({
  children,
  variant = "terracotta",
  onClick,
  className = "",
  type = "button",
  disabled = false,
}: Props) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.95 }}
      className={`group inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold shadow-lg transition-[background-color,box-shadow] duration-200 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
}