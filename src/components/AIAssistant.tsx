import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { motion } from "framer-motion";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { normalize } from "../utils/search";

type Msg = { from: "ai" | "user"; text: string };
type Question = { ask: string; label: string };
type Topic = { categoryId: string; label: string; words: string[]; questions: Question[] };
export type AIResult = { description: string; categoryId: string | null };

const generic: Question[] = [
  { ask: "¿Dónde ocurre el problema?", label: "Dónde" },
  { ask: "¿Qué tan urgente es?", label: "Urgencia" },
];

const topics: Topic[] = [
  {
    categoryId: "plomeria",
    label: "Plomería",
    words: ["fuga", "agua", "tuberia", "llave", "grifo", "drenaje", "inodoro", "lavatorio", "gotera", "caneria", "ducha"],
    questions: [
      { ask: "¿En qué parte de la casa ocurre (baño, cocina, patio)?", label: "Dónde" },
      { ask: "¿Qué tan urgente es? Por ejemplo, si gotea poco o hay inundación.", label: "Urgencia" },
    ],
  },
  {
    categoryId: "electricidad",
    label: "Electricidad",
    words: ["luz", "corto", "breaker", "tomacorriente", "electric", "apagon", "bombillo", "lampara", "ventilador", "cable"],
    questions: [
      { ask: "¿Qué área de la casa está afectada?", label: "Dónde" },
      { ask: "¿Salta el breaker, huele a quemado o es solo que no enciende?", label: "Detalle" },
    ],
  },
  {
    categoryId: "jardineria",
    label: "Jardinería",
    words: ["jardin", "cesped", "zacate", "poda", "podar", "arbol", "seto", "planta", "riego"],
    questions: [
      { ask: "¿Qué tan grande es el área o cuántos árboles o plantas son?", label: "Tamaño" },
      { ask: "¿Hay que retirar los residuos o solo hacer el trabajo?", label: "Detalle" },
    ],
  },
  {
    categoryId: "carpinteria",
    label: "Carpintería",
    words: ["mueble", "puerta", "madera", "closet", "ventana", "bisagra", "gabinete", "repisa"],
    questions: [
      { ask: "¿Es una reparación o algo nuevo hecho a medida?", label: "Tipo" },
      { ask: "¿Tienes medidas aproximadas o una idea del diseño?", label: "Detalle" },
    ],
  },
  {
    categoryId: "cuido",
    label: "Cuido de personas",
    words: ["abuelo", "abuela", "adulto", "anciano", "nino", "nina", "bebe", "cuidar", "cuido"],
    questions: [
      { ask: "¿Qué horario o cuántas horas necesitas?", label: "Horario" },
      { ask: "¿Hay alguna necesidad especial (medicación, movilidad)?", label: "Detalle" },
    ],
  },
  {
    categoryId: "limpieza",
    label: "Limpieza",
    words: ["limpiar", "limpieza", "aseo", "polvo", "obra", "desorden"],
    questions: [
      { ask: "¿Qué tamaño tiene el lugar (habitaciones o metros cuadrados)?", label: "Tamaño" },
      { ask: "¿Es una limpieza general o profunda (por ejemplo, después de una obra)?", label: "Tipo" },
    ],
  },
];

const detect = (text: string): Topic | null => {
  const t = normalize(text);
  return topics.find((topic) => topic.words.some((w) => t.includes(w))) ?? null;
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

type Props = {
  hasAttachments: boolean;
  onAccept: (result: AIResult) => void;
  onClose: () => void;
};

export default function AIAssistant({ hasAttachments, onAccept, onClose }: Props) {
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      from: "ai",
      text: "¡Hola! Soy tu asistente. Cuéntame con tus propias palabras qué está pasando y te ayudo a armar la descripción.",
    },
  ]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<Question[]>(generic);
  const [proposal, setProposal] = useState<(AIResult & { label: string }) | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, typing, proposal]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const aiSay = (fn: () => void) => {
    setTyping(true);
    timer.current = window.setTimeout(() => {
      setTyping(false);
      fn();
    }, 1000);
  };

  const send = (e: FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value || typing || proposal) return;

    setText("");
    const next = [...answers, value];
    setAnswers(next);
    setMsgs((m) => [...m, { from: "user", text: value }]);

    if (next.length === 1) {
      const found = detect(value);
      const qs = found ? found.questions : generic;
      setTopic(found);
      setQuestions(qs);
      aiSay(() =>
        setMsgs((m) => [
          ...m,
          { from: "ai", text: `${found ? `Entiendo, parece un tema de ${found.label.toLowerCase()}. ` : ""}${qs[0].ask}` },
        ]),
      );
    } else if (next.length === 2) {
      aiSay(() => setMsgs((m) => [...m, { from: "ai", text: questions[1].ask }]));
    } else {
      aiSay(() => {
        const lines = [
          `${cap(next[0])}.`,
          `${questions[0].label}: ${next[1]}.`,
          `${questions[1].label}: ${next[2]}.`,
        ];
        if (hasAttachments) lines.push("Se adjuntó evidencia (foto o video) para facilitar el diagnóstico.");
        setProposal({
          description: lines.join("\n"),
          categoryId: topic?.categoryId ?? null,
          label: topic?.label ?? "Otros",
        });
        setMsgs((m) => [
          ...m,
          {
            from: "ai",
            text: hasAttachments
              ? "Revisé también tu foto o video (análisis simulado). Esto es lo que entendí:"
              : "Listo, esto es lo que entendí:",
          },
        ]);
      });
    }
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Asistente de IA"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 grid place-items-end bg-black/60 sm:place-items-center sm:p-4"
    >
      <motion.div
        initial={{ y: 60, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="flex h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:h-[34rem] sm:rounded-3xl"
      >
        <header className="flex items-center gap-3 bg-forest-900 px-4 py-3 text-white">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-gold-400 text-forest-900">
            <Sparkles size={20} />
          </span>
          <div className="flex-1">
            <p className="font-display text-lg uppercase leading-none tracking-wide">Asistente de IA</p>
            <p className="text-xs text-white/70">Te ayuda a describir el problema · versión demo</p>
          </div>
          <motion.button
            type="button"
            aria-label="Cerrar asistente"
            onClick={onClose}
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition-colors hover:bg-terracotta-500"
          >
            <X size={18} />
          </motion.button>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto bg-cream-50 px-4 py-4">
          {msgs.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex gap-2 ${m.from === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.from === "ai" && (
                <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-forest-900 text-white">
                  <Bot size={15} />
                </span>
              )}
              <p
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                  m.from === "user" ? "rounded-br-sm bg-terracotta-500 text-white" : "rounded-bl-sm bg-white text-forest-900 shadow"
                }`}
              >
                {m.text}
              </p>
            </motion.div>
          ))}

          {typing && (
            <div className="flex items-center gap-2" aria-label="El asistente está escribiendo">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-forest-900 text-white">
                <Bot size={15} />
              </span>
              <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    className="h-2 w-2 rounded-full bg-forest-900/50"
                  />
                ))}
              </div>
            </div>
          )}

          {proposal && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="ml-9 space-y-3 rounded-2xl border-2 border-forest-700/30 bg-white p-4 shadow-md"
            >
              <p className="whitespace-pre-line text-sm text-forest-900">{proposal.description}</p>
              <p className="text-xs font-bold uppercase tracking-wide text-forest-700">
                Categoría sugerida: {proposal.label}
              </p>
              <div className="flex flex-wrap gap-2">
                <motion.button
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onAccept({ description: proposal.description, categoryId: proposal.categoryId })}
                  className="rounded-full bg-terracotta-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-terracotta-500/30 transition-colors hover:bg-terracotta-600"
                >
                  Usar esta descripción
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="rounded-full bg-forest-900/5 px-4 py-2 text-sm font-semibold text-forest-900 transition-colors hover:bg-forest-900 hover:text-white"
                >
                  No, gracias
                </motion.button>
              </div>
            </motion.div>
          )}
          <div ref={bottom} />
        </div>

        <form onSubmit={send} className="flex items-center gap-2 border-t border-forest-900/10 bg-white p-3">
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={typing || !!proposal}
            placeholder={proposal ? "Elige una opción arriba" : "Escribe aquí…"}
            aria-label="Mensaje para el asistente"
            className="flex-1 rounded-full border-2 border-forest-900/15 bg-white px-4 py-2.5 text-sm outline-none transition-all hover:border-forest-900/40 focus:border-terracotta-500 disabled:bg-forest-900/5"
          />
          <motion.button
            type="submit"
            aria-label="Enviar"
            disabled={typing || !!proposal || !text.trim()}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.9 }}
            className="grid h-10 w-10 place-items-center rounded-full bg-terracotta-500 text-white transition-colors hover:bg-terracotta-600 disabled:opacity-40"
          >
            <Send size={17} />
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}