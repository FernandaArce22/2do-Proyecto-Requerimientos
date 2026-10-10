import { create } from "zustand";
import { baseMonthJobs, defaultWorkSettings, seedApplications } from "../data/work";
import type { Application, Doc, WorkSettings } from "../data/work";
import type { User } from "../data/users";
import { refreshVisible, workers } from "../data/workers";
import { useAppStore } from "./useAppStore";
import { notifyAdmins, notifyUser } from "./useNotifStore";
import { useRequestsStore } from "./useRequestsStore";

export type SubmitData = {
  categories: string[];
  experience: string;
  zone: string;
  idDoc: Doc;
  backupDoc: Doc;
};

export type FullSettings = WorkSettings & { advancePercent: number; cancelFeePercent: number };

export type EvalVerdict = "cumple" | "incumple" | "gracia";
export type EvalRow = {
  workerId: string;
  name: string;
  monthJobs: number;
  min: number;
  lastJobDaysAgo: number;
  verdict: EvalVerdict;
  reason: string;
};

export type SettingsLogEntry = { at: number; by: string; changes: string[] };

const DAY = 86_400_000;

// Describe qué cambia entre dos configuraciones (se usa en el resumen y en el registro)
export function describeChanges(cur: FullSettings, next: FullSettings): string[] {
  const out: string[] = [];
  const diff = (label: string, a: number, b: number, unit: string) => {
    if (a !== b) out.push(`${label}: ${a}${unit} → ${b}${unit}`);
  };
  diff("Anticipo", cur.advancePercent, next.advancePercent, " %");
  diff("Tarifa de cancelación", cur.cancelFeePercent, next.cancelFeePercent, " %");
  diff("Mínimo mensual de trabajos", cur.minMonthly, next.minMonthly, "");
  diff("Días de inactividad permitidos", cur.maxInactiveDays, next.maxInactiveDays, "");
  diff("Período de gracia (días)", cur.graceDays, next.graceDays, "");
  return out;
}

// Actualiza un usuario en la lista y en la sesión, si es la persona conectada
const patchUser = (id: string, patch: (u: User) => User) =>
  useAppStore.setState((s) => ({
    users: s.users.map((u) => (u.id === id ? patch(u) : u)),
    currentUser: s.currentUser && s.currentUser.id === id ? patch(s.currentUser) : s.currentUser,
  }));

type State = {
  applications: Application[];
  settings: WorkSettings;
  settingsLog: SettingsLogEntry[];
  joinedAt: Record<string, number>; // inicio del período de gracia por trabajador
  warned: Record<string, boolean>; // avisos preventivos enviados
  reactivations: string[]; // trabajadores que pidieron reactivar su cuenta
  lastEvaluation: { at: number; rows: EvalRow[]; deactivated: number } | null;

  // CU-03 y CU-04
  submitApplication: (userId: string, data: SubmitData) => void;
  replyInfo: (appId: string, text: string) => void;
  approve: (appId: string, admin: string) => boolean;
  reject: (appId: string, reason: string, admin: string) => boolean;
  requestInfo: (appId: string, text: string, admin: string) => boolean;

  // CU-14
  saveSettings: (next: FullSettings, by: string) => string[];

  // CU-13
  monthJobs: (workerId: string) => number;
  evaluate: () => EvalRow[];
  sendWarnings: () => number;
  closeMonth: () => EvalRow[];
  requestReactivation: (workerId: string) => void;
  resolveReactivation: (workerId: string, approve: boolean) => void;
};

export const useWorkStore = create<State>((set, get) => {
  const find = (id: string) => get().applications.find((a) => a.id === id);

  // Aplica cambios a una postulación y registra el evento en su historial
  const updateApp = (id: string, changes: Partial<Application>, label: string) =>
    set((s) => ({
      applications: s.applications.map((a) =>
        a.id === id ? { ...a, ...changes, history: [...a.history, { label, at: Date.now() }] } : a,
      ),
    }));

  return {
    applications: seedApplications,
    settings: defaultWorkSettings,
    settingsLog: [],
    joinedAt: {},
    warned: {},
    reactivations: [],
    lastEvaluation: null,

    submitApplication: (userId, data) => {
      const now = Date.now();
      const prev = get().applications.find((a) => a.userId === userId);
      const app: Application = {
        id: `app${now}`,
        userId,
        ...data,
        status: "en_revision",
        submittedAt: now,
        history: [
          ...(prev ? prev.history : []),
          { label: prev ? "Postulación corregida y reenviada" : "Postulación enviada", at: now },
        ],
      };
      set((s) => ({ applications: [app, ...s.applications.filter((a) => a.userId !== userId)] }));
      patchUser(userId, (u) => ({ ...u, workerStatus: "en_revision" }));
      const name = useAppStore.getState().users.find((u) => u.id === userId)?.name ?? "Un usuario";
      notifyAdmins("Postulación nueva", `${name} envió su postulación para ser trabajador.`, "/admin/postulaciones");
    },

    replyInfo: (appId, text) => {
      updateApp(appId, { infoReply: text }, "Información adicional enviada");
      const app = find(appId);
      const name = app ? (useAppStore.getState().users.find((u) => u.id === app.userId)?.name ?? "El postulante") : "El postulante";
      notifyAdmins("Respuesta recibida", `${name} respondió a tu solicitud de información.`, "/admin/postulaciones");
    },

    approve: (appId, admin) => {
      const app = find(appId);
      const user = app ? useAppStore.getState().users.find((u) => u.id === app.userId) : undefined;
      // CU-04, excepción B: otra persona ya resolvió la postulación
      if (!app || !user || app.status !== "en_revision") return false;

      updateApp(appId, { status: "verificado", reviewedBy: admin, reviewedAt: Date.now() }, `Aprobada por ${admin}`);
      patchUser(user.id, (u) => ({
        ...u,
        roles: u.roles.includes("trabajador") ? u.roles : [...u.roles, "trabajador"],
        workerStatus: "verificado",
        accountActive: true,
      }));

      // Objetos en memoria: se crea el perfil del trabajador (aún sin publicar)
      const existing = workers.find((w) => w.userId === user.id);
      const workerId = existing?.id ?? `w${Date.now()}`;
      if (existing) {
        existing.verified = true;
        existing.active = true;
      } else {
        workers.push({
          id: workerId,
          userId: user.id,
          name: user.name,
          zone: app.zone,
          bio: app.experience,
          verified: true,
          active: true,
          published: false,
          rating: 0,
          reviewCount: 0,
          jobsDone: 0,
          lastJobDaysAgo: 0,
          memberSince: new Date().getFullYear(),
          services: [],
          photos: [],
          reviews: [],
        });
      }
      // Cuenta nueva: período de gracia para la evaluación mensual (CU-13)
      set((s) => ({ joinedAt: { ...s.joinedAt, [workerId]: Date.now() } }));
      refreshVisible();
      notifyUser(user.id, "¡Postulación aprobada!", "Ya eres trabajador verificado. Publica tus servicios para aparecer en las búsquedas.", "/postularme");
      return true;
    },

    reject: (appId, reason, admin) => {
      const app = find(appId);
      if (!app || app.status !== "en_revision") return false;
      updateApp(
        appId,
        { status: "rechazada", decisionReason: reason, reviewedBy: admin, reviewedAt: Date.now() },
        `Rechazada por ${admin}`,
      );
      patchUser(app.userId, (u) => ({ ...u, workerStatus: "rechazado" }));
      notifyUser(app.userId, "Postulación rechazada", reason, "/postularme");
      return true;
    },

    requestInfo: (appId, text, admin) => {
      const app = find(appId);
      if (!app || app.status !== "en_revision") return false;
      updateApp(appId, { infoRequest: text, infoReply: undefined }, `${admin} solicitó información adicional`);
      notifyUser(app.userId, "Necesitamos más información", text, "/postularme");
      return true;
    },

    saveSettings: (next, by) => {
      const req = useRequestsStore.getState().settings;
      const cur: FullSettings = { ...get().settings, advancePercent: req.advancePercent, cancelFeePercent: req.cancelFeePercent };
      const changes = describeChanges(cur, next);
      if (changes.length === 0) return changes;

      // El nuevo anticipo aplica solo a solicitudes nuevas: las existentes conservan su monto
      useRequestsStore.setState((s) => ({
        settings: { ...s.settings, advancePercent: next.advancePercent, cancelFeePercent: next.cancelFeePercent },
      }));
      set((s) => ({
        settings: { minMonthly: next.minMonthly, maxInactiveDays: next.maxInactiveDays, graceDays: next.graceDays },
        settingsLog: [{ at: Date.now(), by, changes }, ...s.settingsLog],
      }));
      return changes;
    },

    monthJobs: (workerId) =>
      (baseMonthJobs[workerId] ?? 0) +
      useRequestsStore.getState().requests.filter((r) => r.workerId === workerId && r.status === "finalizada").length,

    evaluate: () => {
      const { settings, joinedAt } = get();
      return workers
        .filter((w) => w.verified && w.active)
        .map((w): EvalRow => {
          const monthJobs = get().monthJobs(w.id);
          const joined = joinedAt[w.id];
          const inGrace = joined !== undefined && Date.now() - joined < settings.graceDays * DAY;
          const lowJobs = monthJobs < settings.minMonthly;
          const tooLong = w.lastJobDaysAgo > settings.maxInactiveDays;

          let verdict: EvalVerdict = "cumple";
          let reason = "Cumple el mínimo y su actividad es reciente.";
          if (inGrace) {
            verdict = "gracia";
            reason = "Cuenta nueva o reactivada: está en período de gracia.";
          } else if (lowJobs || tooLong) {
            verdict = "incumple";
            reason = [
              lowJobs ? `Solo ${monthJobs} de ${settings.minMonthly} trabajos` : "",
              tooLong ? `${w.lastJobDaysAgo} días sin trabajar (máximo ${settings.maxInactiveDays})` : "",
            ]
              .filter(Boolean)
              .join(" · ");
          }
          return {
            workerId: w.id,
            name: w.name,
            monthJobs,
            min: settings.minMonthly,
            lastJobDaysAgo: w.lastJobDaysAgo,
            verdict,
            reason,
          };
        });
    },

    // Flujo alterno 3a: aviso preventivo a quienes están por incumplir
    sendWarnings: () => {
      const rows = get()
        .evaluate()
        .filter((r) => r.verdict === "incumple");
      set((s) => ({
        warned: { ...s.warned, ...Object.fromEntries(rows.map((r) => [r.workerId, true])) },
      }));
      rows.forEach((r) =>
        notifyUser(
          workers.find((w) => w.id === r.workerId)?.userId,
          "Aviso de actividad mensual",
          `Llevas ${r.monthJobs} de ${r.min} trabajos. Si no llegas al mínimo, tu cuenta se inactivará.`,
          "/trabajador",
        ),
      );
      return rows.length;
    },

    closeMonth: () => {
      const rows = get().evaluate();
      let deactivated = 0;
      rows.forEach((row) => {
        if (row.verdict !== "incumple") return;
        const w = workers.find((x) => x.id === row.workerId);
        if (!w) return;
        w.active = false;
        deactivated += 1;
        if (w.userId) patchUser(w.userId, (u) => ({ ...u, accountActive: false }));
        notifyUser(w.userId, "Tu cuenta pasó a inactiva", "No alcanzaste el mínimo mensual. Puedes solicitar la reactivación.", "/trabajador");
      });
      refreshVisible();
      set({ lastEvaluation: { at: Date.now(), rows, deactivated }, warned: {} });
      return rows;
    },

    requestReactivation: (workerId) => {
      if (get().reactivations.includes(workerId)) return;
      set((s) => ({ reactivations: [...s.reactivations, workerId] }));
      const name = workers.find((x) => x.id === workerId)?.name ?? "Un trabajador";
      notifyAdmins("Solicitud de reactivación", `${name} pidió reactivar su cuenta.`, "/admin/actividad");
    },

    resolveReactivation: (workerId, approve) => {
      set((s) => ({ reactivations: s.reactivations.filter((id) => id !== workerId) }));
      const w = workers.find((x) => x.id === workerId);
      if (!approve) {
        notifyUser(w?.userId, "Reactivación rechazada", "Tu solicitud no fue aprobada por ahora.", "/trabajador");
        return;
      }
      if (!w) return;
      w.active = true;
      if (w.userId) patchUser(w.userId, (u) => ({ ...u, accountActive: true }));
      // Al reactivarla recibe un período de gracia
      set((s) => ({ joinedAt: { ...s.joinedAt, [workerId]: Date.now() }, warned: { ...s.warned, [workerId]: false } }));
      refreshVisible();
      notifyUser(w.userId, "¡Cuenta reactivada!", "Ya apareces de nuevo en las búsquedas. Tienes un período de gracia.", "/trabajador");
    },
  };
});
