import { useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { HashRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import Button from "./components/Button";
import Header from "./components/Header";
import QuickNav from "./components/QuickNav";
import Toaster from "./components/Toaster";
import type { Role } from "./data/users";
import AdminActivity from "./pages/AdminActivity";
import AdminDisputes from "./pages/AdminDisputes";
import AdminSettings from "./pages/AdminSettings";
import Apply from "./pages/Apply";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import MyRequests from "./pages/MyRequests";
import { AdminHome, WorkerHome } from "./pages/Panels";
import RequestService from "./pages/RequestService";
import ReviewApplications from "./pages/ReviewApplications";
import Search from "./pages/Search";
import WorkerProfile from "./pages/WorkerProfile";
import WorkerRequests from "./pages/WorkerRequests";
import WorkerServices from "./pages/WorkerServices";
import { homeFor } from "./routes";
import { useAppStore } from "./store/useAppStore";

// Estructura común: encabezado y accesos rápidos (menos en la pantalla de acceso)
function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      {pathname !== "/acceso" && <Header />}
      {pathname !== "/acceso" && <QuickNav />}
      <Outlet />
    </>
  );
}

// Inicio: público para visitantes y clientes; los otros roles van a su panel
function HomeRoute() {
  const activeRole = useAppStore((s) => s.activeRole);
  if (activeRole && activeRole !== "cliente") return <Navigate to={homeFor(activeRole)} replace />;
  return <Home />;
}

// Protege rutas por rol activo. Si la cuenta tiene ese rol pero está en otro modo,
// ofrece cambiar de modo en lugar de mandar al usuario a otra pantalla.
const ROLE_LABEL: Record<Role, string> = { cliente: "cliente", trabajador: "trabajador", administrador: "administrador" };

function RequireRole({ role }: { role: Role }) {
  const currentUser = useAppStore((s) => s.currentUser);
  const activeRole = useAppStore((s) => s.activeRole);
  const switchRole = useAppStore((s) => s.switchRole);
  const showToast = useAppStore((s) => s.showToast);
  if (!currentUser) return <Navigate to="/acceso" replace />;
  if (activeRole === role) return <Outlet />;

  const canSwitch =
    currentUser.roles.includes(role) && (role !== "trabajador" || currentUser.workerStatus === "verificado");
  if (!canSwitch) return <Navigate to={homeFor(activeRole)} replace />;

  return (
    <main className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="font-display text-2xl uppercase text-forest-900">Esta pantalla es del modo {ROLE_LABEL[role]}</h1>
      <p className="mt-3 text-sm text-forest-900/70">
        Ahora estás en modo {activeRole ? ROLE_LABEL[activeRole] : "visitante"}. Cambia de modo para ver esta pantalla.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button
          onClick={() => {
            const res = switchRole(role);
            if (!res.ok) showToast("error", res.error);
          }}
        >
          Cambiar a modo {ROLE_LABEL[role]}
        </Button>
        <Button variant="light" onClick={() => window.history.back()} className="ring-1 ring-forest-900/15">
          Volver
        </Button>
      </div>
    </main>
  );
}

export default function App() {
  const addNotification = useAppStore((s) => s.addNotification);

  // Demo: a los 6 s llega una notificación nueva y el globo "salta"
  useEffect(() => {
    const t = setTimeout(addNotification, 6000);
    return () => clearTimeout(t);
  }, [addNotification]);

  return (
    <MotionConfig reducedMotion="user">
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/acceso" element={<Auth />} />
            <Route path="/buscar" element={<Search />} />
            <Route path="/trabajadores/:id" element={<WorkerProfile />} />
            <Route element={<RequireRole role="cliente" />}>
              <Route path="/solicitar/:id" element={<RequestService />} />
              <Route path="/solicitudes" element={<MyRequests />} />
              <Route path="/postularme" element={<Apply />} />
            </Route>
            <Route element={<RequireRole role="trabajador" />}>
              <Route path="/trabajador" element={<WorkerHome />} />
              <Route path="/trabajador/solicitudes" element={<WorkerRequests />} />
              <Route path="/trabajador/servicios" element={<WorkerServices />} />
            </Route>
            <Route element={<RequireRole role="administrador" />}>
              <Route path="/admin" element={<AdminHome />} />
              <Route path="/admin/postulaciones" element={<ReviewApplications />} />
              <Route path="/admin/actividad" element={<AdminActivity />} />
              <Route path="/admin/disputas" element={<AdminDisputes />} />
              <Route path="/admin/configuracion" element={<AdminSettings />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
      <Toaster />
    </MotionConfig>
  );
}