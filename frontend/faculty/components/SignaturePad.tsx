"use client";

import { useEffect, useRef, useState } from "react";
import { Eraser } from "lucide-react";

interface Props {
  initialUrl?: string | null;
  onChange: (dataUrl: string | null) => void;
}

export default function SignaturePad({ initialUrl, onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [empty, setEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#18181b";

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);

    if (initialUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setEmpty(false);
      };
      img.src = initialUrl;
    }
  }, [initialUrl]);

  function pointFromEvent(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const t = e.touches[0];
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    drawing.current = true;
    const ctx = canvasRef.current?.getContext("2d");
    const p = pointFromEvent(e);
    ctx?.beginPath();
    ctx?.moveTo(p.x, p.y);
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    const p = pointFromEvent(e);
    ctx?.lineTo(p.x, p.y);
    ctx?.stroke();
    setEmpty(false);
  }

  function endDraw() {
    if (!drawing.current) return;
    drawing.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange(canvas.toDataURL("image/png"));
  }

  function clear() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);
    setEmpty(true);
    onChange(null);
  }

  return (
    <div className="space-y-2">
      <div className="rounded-xl border border-border bg-white overflow-hidden touch-none">
        <canvas
          ref={canvasRef}
          className="w-full h-36 cursor-crosshair block"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-muted-foreground text-xs">
          {empty ? "Draw your signature above" : "Signature captured — save to store as PNG"}
        </p>
        <button
          type="button"
          onClick={clear}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-muted transition-colors"
        >
          <Eraser size={14} /> Clear
        </button>
      </div>
    </div>
  );
}
