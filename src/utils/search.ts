// Quita tildes y pasa a minúsculas: "Plomería" -> "plomeria"
export const normalize = (s: string) =>
  s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

// Distancia de edición (tolera errores de tipeo)
function distance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  return dp[a.length][b.length];
}

// Coincidencia aproximada: cada palabra buscada debe aparecer (o parecerse) en el texto
export function matchesQuery(text: string, query: string): boolean {
  const tokens = normalize(query)
    .split(/\s+/)
    .filter((t) => t.length >= 3); // ignora "de", "la", "el"...
  if (tokens.length === 0) return true;

  const words = normalize(text).split(/[^a-z0-9]+/).filter(Boolean);
  return tokens.every((t) => words.some((w) => w.includes(t) || (t.length >= 4 && distance(w, t) <= 1)));
}