import { create } from "zustand";
import type { ServiceRequest } from "../data/requests";

type NewRequest = Omit<ServiceRequest, "id" | "code" | "createdAt" | "status">;

type State = {
  requests: ServiceRequest[];
  // Parámetros del negocio (el administrador los configurará en CU-14)
  settings: { advancePercent: number; cancelFeePercent: number };
  addRequest: (data: NewRequest) => ServiceRequest;
};

let counter = 100;

export const useRequestsStore = create<State>((set) => ({
  requests: [],
  settings: { advancePercent: 20, cancelFeePercent: 50 },
  addRequest: (data) => {
    counter += 1;
    const request: ServiceRequest = {
      ...data,
      id: `r${Date.now()}`,
      code: `SOL-${counter}`,
      status: "pendiente",
      createdAt: Date.now(),
    };
    set((s) => ({ requests: [request, ...s.requests] }));
    return request;
  },
}));