import { useId } from "react";
import { AlertCircle } from "lucide-react";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  inputMode?: "text" | "numeric";
};

export default function TextField({ label, value, onChange, error, inputMode = "text" }: Props) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-forest-900">
        {label}
      </label>
      <input
        id={id}
        value={value}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className={`w-full rounded-xl border-2 bg-white px-4 py-3 text-forest-950 outline-none transition-all duration-200 ${
          error
            ? "border-terracotta-500 shadow-md shadow-terracotta-500/10"
            : "border-forest-900/15 hover:border-forest-900/40 focus:border-forest-700 focus:shadow-md focus:shadow-forest-700/15"
        }`}
      />
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-terracotta-600">
          <AlertCircle size={13} /> {error}
        </p>
      )}
    </div>
  );
}
