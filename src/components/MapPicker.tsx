import { useEffect, useRef, useState } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2, LocateFixed } from "lucide-react";
import { DEFAULT_CENTER } from "../data/requests";
import type { LatLng } from "../data/requests";

type Props = { value: LatLng | null; onChange: (value: LatLng) => void };

// Animación de "caída" del pin (se agrega una sola vez)
function ensureStyle() {
  if (document.getElementById("hs-map-style")) return;
  const s = document.createElement("style");
  s.id = "hs-map-style";
  s.textContent = "@keyframes hs-drop{from{transform:translateY(-26px);opacity:0}to{transform:none;opacity:1}}";
  document.head.appendChild(s);
}

const pinIcon = () =>
  L.divIcon({
    className: "",
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    html: `<div style="position:relative;width:36px;height:44px;animation:hs-drop .45s ease-out">
      <div style="position:absolute;left:0;top:0;width:36px;height:36px;border-radius:50% 50% 50% 0;background:#c8593b;transform:rotate(-45deg);box-shadow:0 6px 12px rgba(0,0,0,.35);display:grid;place-items:center">
        <div style="width:14px;height:14px;border-radius:50%;background:#fff"></div>
      </div></div>`,
  });

export default function MapPicker({ value, onChange }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  const [locating, setLocating] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  // Crear el mapa
  useEffect(() => {
    if (!el.current) return;
    ensureStyle();

    const start = value ?? DEFAULT_CENTER;
    const m = L.map(el.current).setView([start.lat, start.lng], value ? 16 : 14);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap",
    }).addTo(m);

    m.on("click", (e: L.LeafletMouseEvent) => onChangeRef.current({ lat: e.latlng.lat, lng: e.latlng.lng }));
    map.current = m;
    const t = window.setTimeout(() => m.invalidateSize(), 400);

    return () => {
      window.clearTimeout(t);
      m.remove();
      map.current = null;
      marker.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sincronizar el pin con el valor
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    if (!value) {
      marker.current?.remove();
      marker.current = null;
      return;
    }
    const ll = L.latLng(value.lat, value.lng);
    if (!marker.current) {
      const mk = L.marker(ll, { icon: pinIcon(), draggable: true }).addTo(m);
      mk.on("dragend", () => {
        const p = mk.getLatLng();
        onChangeRef.current({ lat: p.lat, lng: p.lng });
      });
      marker.current = mk;
    } else {
      marker.current.setLatLng(ll);
    }
    if (!m.getBounds().contains(ll)) m.panTo(ll);
  }, [value]);

  const locate = () => {
    if (!navigator.geolocation) {
      setMsg("Tu navegador no permite obtener la ubicación. Marca el punto en el mapa.");
      return;
    }
    setLocating(true);
    setMsg("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        onChangeRef.current(p);
        map.current?.setView([p.lat, p.lng], 17);
        setLocating(false);
      },
      () => {
        setLocating(false);
        setMsg("No pudimos obtener tu ubicación. Marca el punto directamente en el mapa.");
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  return (
    <div>
      <div className="relative isolate h-72 overflow-hidden rounded-xl border-2 border-forest-900/15 shadow-md shadow-black/10">
        <div ref={el} className="h-full w-full" />

        {!value && (
          <span className="pointer-events-none absolute left-1/2 top-3 z-[1000] -translate-x-1/2 rounded-full bg-forest-900/90 px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
            Toca el mapa para marcar el punto
          </span>
        )}

        <button
          type="button"
          onClick={locate}
          disabled={locating}
          className="absolute bottom-3 right-3 z-[1000] inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-forest-900 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-forest-900 hover:text-white active:scale-95 disabled:opacity-70"
        >
          {locating ? <Loader2 size={15} className="animate-spin" /> : <LocateFixed size={15} />}
          Usar mi ubicación
        </button>
      </div>
      {msg && <p className="mt-2 text-xs font-medium text-terracotta-600">{msg}</p>}
    </div>
  );
}