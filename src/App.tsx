import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { createRope, stepRope, type RopePoint } from "./useRope";
import { DEFAULT_CHARMS, type Charm } from "./charms";
import "./App.css";

const WINDOW_WIDTH = 220;
const WINDOW_HEIGHT = 300;
const ANCHOR_X = WINDOW_WIDTH / 2;
const ANCHOR_Y = 6;
const CHARM_INDEX = 6;
const BOUNDS = { width: WINDOW_WIDTH, height: WINDOW_HEIGHT, margin: 26 };

function loadCharm(): Charm {
  try {
    const saved = localStorage.getItem("deskcharm.charm");
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore corrupt storage
  }
  return DEFAULT_CHARMS[0];
}

export default function App() {
  const [charm, setCharm] = useState<Charm>(loadCharm);
  const [menuOpen, setMenuOpen] = useState(false);
  const [customEmoji, setCustomEmoji] = useState("");
  const [ritualPulse, setRitualPulse] = useState(false);
  const [charmPos, setCharmPos] = useState({ x: ANCHOR_X, y: ANCHOR_Y + CHARM_INDEX * 16 });

  const pointsRef = useRef<RopePoint[]>(createRope(ANCHOR_X, ANCHOR_Y));
  const dragIndexRef = useRef<number | null>(null);
  const dragPosRef = useRef<{ x: number; y: number } | null>(null);
  const windowDragRef = useRef<{ startScreenX: number; startWindowX: number; screenW: number } | null>(null);
  const downRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const timeRef = useRef(0);

  useEffect(() => {
    localStorage.setItem("deskcharm.charm", JSON.stringify(charm));
  }, [charm]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      timeRef.current += 1;
      const wind = Math.sin(timeRef.current * 0.02) * 0.06;
      stepRope(pointsRef.current, ANCHOR_X, ANCHOR_Y, wind, dragIndexRef.current, dragPosRef.current, BOUNDS);
      const tip = pointsRef.current[CHARM_INDEX];
      setCharmPos({ x: tip.x, y: tip.y });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const unlisten = listen<number>("perch-moved", () => {
      // Window relocated by the tray menu; rope stays anchored in window-local
      // coordinates so no local state needs to change here.
    });
    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  const onCharmPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    dragIndexRef.current = CHARM_INDEX;
    dragPosRef.current = { x: e.clientX, y: e.clientY };
    downRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    setMenuOpen(false);
  };

  const onCharmPointerMove = (e: React.PointerEvent) => {
    if (dragIndexRef.current === null) return;
    dragPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const onCharmPointerUp = (e: React.PointerEvent) => {
    dragIndexRef.current = null;
    dragPosRef.current = null;
    const down = downRef.current;
    if (down) {
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      if (moved < 4) {
        setRitualPulse(true);
        setTimeout(() => setRitualPulse(false), 500);
      }
    }
    downRef.current = null;
  };

  const onCharmContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen((v) => !v);
  };

  const onBackgroundPointerDown = async (e: React.PointerEvent) => {
    if ((e.target as Element).closest("[data-charm]") || (e.target as Element).closest("[data-menu]")) return;
    setMenuOpen(false);
    (e.target as Element).setPointerCapture(e.pointerId);
    const startWindowX = await invoke<number>("get_window_x");
    const screenW = await invoke<number>("get_screen_width");
    windowDragRef.current = { startScreenX: e.screenX, startWindowX, screenW };
  };

  const onBackgroundPointerMove = (e: React.PointerEvent) => {
    const drag = windowDragRef.current;
    if (!drag) return;
    const delta = e.screenX - drag.startScreenX;
    const clamped = Math.min(Math.max(drag.startWindowX + delta, 0), drag.screenW - WINDOW_WIDTH);
    invoke("set_perch_x", { x: clamped }).catch(() => {});
  };

  const onBackgroundPointerUp = () => {
    windowDragRef.current = null;
  };

  const chooseCharm = (c: Charm) => {
    setCharm(c);
    setMenuOpen(false);
  };

  const applyCustomEmoji = () => {
    const trimmed = customEmoji.trim();
    if (!trimmed) return;
    setCharm({ id: "custom", emoji: trimmed, name: "Custom" });
    setCustomEmoji("");
    setMenuOpen(false);
  };

  const rope = pointsRef.current;

  return (
    <div
      className="stage"
      onPointerDown={onBackgroundPointerDown}
      onPointerMove={onBackgroundPointerMove}
      onPointerUp={onBackgroundPointerUp}
    >
      <svg className="thread" width={WINDOW_WIDTH} height={WINDOW_HEIGHT}>
        <polyline
          points={rope.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke="rgba(60,50,40,0.55)"
          strokeWidth={1.5}
        />
      </svg>
      <div
        data-charm
        className={`charm ${ritualPulse ? "ritual" : ""}`}
        style={{ left: charmPos.x, top: charmPos.y }}
        onPointerDown={onCharmPointerDown}
        onPointerMove={onCharmPointerMove}
        onPointerUp={onCharmPointerUp}
        onContextMenu={onCharmContextMenu}
        title={`${charm.name} — click for a ritual, right-click to change`}
      >
        {charm.emoji}
      </div>

      {menuOpen && (
        <div data-menu className="menu" onPointerDown={(e) => e.stopPropagation()}>
          <div className="menu-row">
            {DEFAULT_CHARMS.map((c) => (
              <button key={c.id} className="menu-emoji" onClick={() => chooseCharm(c)} title={c.name}>
                {c.emoji}
              </button>
            ))}
          </div>
          <div className="menu-custom">
            <input
              value={customEmoji}
              placeholder="😀"
              maxLength={4}
              onChange={(e) => setCustomEmoji(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyCustomEmoji()}
            />
            <button onClick={applyCustomEmoji}>Set</button>
          </div>
        </div>
      )}
    </div>
  );
}
