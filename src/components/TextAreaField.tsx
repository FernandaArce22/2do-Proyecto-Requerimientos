import { useId } from "react";
import { AlertCircle } from "lucide-react";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  rows?: number;
  max?: number;
};

export default function TextAreaField({ label, value, onChange, error, placeholder, rows = 4, max }: Props) {
  const id = useId();
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-semibold text-forest-900">
          {label}
        </label>
        {max && (
          <span className="text-xs text-forest-900/50">
            {value.length}/{max}
          </span>
        )}
      </div>
      <textarea
        id={id}
        value={value}
        rows={rows}
        maxLength={max}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={!!error}
        className={`w-full resize-none rounded-xl border-2 bg-white px-4 py-3 text-forest-950 outline-none transition-all duration-200 placeholder:text-forest-900/35 ${
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
