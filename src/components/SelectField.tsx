import { useId } from "react";
import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  children: ReactNode;
};

export default function SelectField({ label, value, onChange, error, children }: Props) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-forest-900">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className={`w-full cursor-pointer rounded-xl border-2 bg-white px-4 py-3 text-forest-950 outline-none transition-all duration-200 ${
          error
            ? "border-terracotta-500"
            : "border-forest-900/15 hover:border-forest-900/40 focus:border-forest-700 focus:shadow-md focus:shadow-forest-700/15"
        }`}
      >
        {children}
      </select>
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-terracotta-600">
          <AlertCircle size={13} /> {error}
        </p>
      )}
    </div>
  );
}
