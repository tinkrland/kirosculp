// hero section.
//
// right column: three memo-style cards inspired by paper memo boards. each
// card is a coloured slip with a header label, a ruled body, and a small
// "flip" tab in the bottom-right corner. cards can be:
//   - dragged around the right panel to rearrange (framer-motion)
//   - clicked (not dragged) to open a larger preview dialog
//   - flipped front<->back by clicking the bottom-right corner tab
//
// the front of each card carries a procedurally generated pixel swirl as the
// "artifact" preview; the back carries handwritten-style notes.

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// deterministic pseudo-random
function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function PixelSwirl({ seed, palette, size = 40 }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    const rand = mulberry32(seed);
    const cx = size / 2 + (rand() - 0.5) * 6;
    const cy = size / 2 + (rand() - 0.5) * 6;
    const swirlStrength = 2 + rand() * 3;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) + (dist / size) * swirlStrength;
        let t =
          (Math.sin(angle * 2) * 0.5 + 0.5) * 0.6 +
          (1 - dist / (size * 0.7)) * 0.4;
        t += (rand() - 0.5) * 0.18;
        t = Math.max(0, Math.min(1, t));
        const stops = palette;
        const scaled = t * (stops.length - 1);
        const idx = Math.floor(scaled);
        const frac = scaled - idx;
        const a = stops[idx];
        const b = stops[Math.min(stops.length - 1, idx + 1)];
        const r = Math.round(a[0] + (b[0] - a[0]) * frac);
        const g = Math.round(a[1] + (b[1] - a[1]) * frac);
        const bl = Math.round(a[2] + (b[2] - a[2]) * frac);
        ctx.fillStyle = `rgb(${r},${g},${bl})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }, [seed, palette, size]);
  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ imageRendering: "pixelated" }}
      aria-hidden="true"
    />
  );
}

// memo cards. soft paper colours, header line, ruled body lines, flip corner.
const cards = [
  {
    id: "ring_03",
    title: "a sketch for",
    to: "anya",
    from: "studio nb",
    headerStyle: "italic",
    bg: "#cfd9f2",
    ink: "#2a3a66",
    seed: 91823,
    palette: [
      [232, 226, 214],
      [193, 216, 223],
      [123, 178, 186],
      [60, 98, 112],
    ],
    note: "twisted band, brushed silver. matte interior. size 6.",
    rotate: -9,
    offset: { x: -180, y: -10 },
  },
  {
    id: "pendant_01",
    title: "a memo for self",
    to: "—",
    from: "the bench",
    headerStyle: "italic",
    bg: "#f8e29a",
    ink: "#4b3a12",
    seed: 47210,
    palette: [
      [248, 230, 232],
      [228, 188, 196],
      [200, 130, 158],
      [88, 50, 78],
    ],
    note: "drop pendant, lost-wax cast in bronze. polish to soft gloss.",
    rotate: 4,
    offset: { x: 0, y: 30 },
  },
  {
    id: "cuff_07",
    title: "today i carved",
    to: "felix",
    from: "studio nb",
    headerStyle: "italic",
    bg: "#e8b8c4",
    ink: "#5a2535",
    seed: 30571,
    palette: [
      [251, 233, 215],
      [240, 188, 138],
      [200, 110, 70],
      [80, 38, 30],
    ],
    note: "hammered cuff, raw edges. patina'd brass. one of one.",
    rotate: -3,
    offset: { x: 180, y: 0 },
  },
];

// a single memo card. handles drag, click-to-open, and corner-flip.
function MemoCard({ data, dragArea, baseZ, onPickUp, onOpen, size = "normal" }) {
  const [z, setZ] = useState(baseZ);
  const [flipped, setFlipped] = useState(false);
  const draggedRef = useRef(false);

  const dim = size === "lg" ? { w: 280, h: 360 } : { w: 200, h: 256 };

  return (
    <motion.div
      drag
      dragConstraints={dragArea}
      dragElastic={0.18}
      dragMomentum={false}
      onDragStart={() => {
        draggedRef.current = true;
        const next = onPickUp();
        setZ(next);
      }}
      onDragEnd={() => {
        // small delay so click handler can read the flag
        setTimeout(() => (draggedRef.current = false), 50);
      }}
      whileDrag={{ scale: 1.04, rotate: data.rotate * 0.3 }}
      initial={{ opacity: 0, y: 20, rotate: data.rotate }}
      animate={{ opacity: 1, y: 0, rotate: data.rotate }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      className="absolute cursor-grab active:cursor-grabbing select-none"
      style={{
        left: `calc(50% + ${data.offset.x}px)`,
        top: `calc(50% + ${data.offset.y}px)`,
        translateX: "-50%",
        translateY: "-50%",
        zIndex: z,
        width: dim.w,
        height: dim.h,
        perspective: 1000,
        filter:
          "drop-shadow(0 1px 1px rgba(40,30,20,0.18)) drop-shadow(0 14px 22px rgba(40,30,20,0.18))",
      }}
      onClick={() => {
        if (draggedRef.current) return;
        onOpen?.(data);
      }}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* front */}
        <div
          className="absolute inset-0 rounded-[3px] border border-black/10 p-4 flex flex-col"
          style={{
            backgroundColor: data.bg,
            color: data.ink,
            backfaceVisibility: "hidden",
          }}
        >
          <div
            className="text-[11px] tracking-wide pb-1 border-b"
            style={{ borderColor: data.ink + "55", fontStyle: "italic" }}
          >
            {data.title}
          </div>
          <div className="text-[9px] mt-2 space-y-0.5 font-mono opacity-80">
            <div>TO : {data.to}</div>
            <div>FROM : {data.from}</div>
          </div>
          <div className="flex-1 mt-3 overflow-hidden rounded-[2px]">
            <PixelSwirl seed={data.seed} palette={data.palette} />
          </div>
          <div className="flex items-end justify-between mt-2">
            <span className="text-[9px] font-mono opacity-70">
              date : __ /__
            </span>
            <button
              type="button"
              aria-label="flip card"
              onClick={(e) => {
                e.stopPropagation();
                setFlipped((f) => !f);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="w-5 h-5 rounded-tl-[6px] -mr-1 -mb-1 cursor-pointer transition-colors"
              style={{
                background: `linear-gradient(135deg, transparent 50%, ${data.ink}33 50%)`,
              }}
            />
          </div>
        </div>

        {/* back */}
        <div
          className="absolute inset-0 rounded-[3px] border border-black/10 p-4 flex flex-col"
          style={{
            backgroundColor: data.bg,
            color: data.ink,
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div
            className="text-[11px] tracking-wide pb-1 border-b italic"
            style={{ borderColor: data.ink + "55" }}
          >
            notes
          </div>
          <div className="flex-1 mt-3 font-serif italic text-sm leading-relaxed opacity-90">
            {data.note}
          </div>
          <div className="flex items-end justify-between mt-2">
            <span className="text-[9px] font-mono opacity-70">{data.id}</span>
            <button
              type="button"
              aria-label="flip back"
              onClick={(e) => {
                e.stopPropagation();
                setFlipped((f) => !f);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="w-5 h-5 rounded-tl-[6px] -mr-1 -mb-1 cursor-pointer"
              style={{
                background: `linear-gradient(135deg, transparent 50%, ${data.ink}33 50%)`,
              }}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// preview dialog content — re-uses the same card but bigger and centered.
function CardPreview({ data }) {
  const [flipped, setFlipped] = useState(false);
  if (!data) return null;
  return (
    <div className="relative mx-auto" style={{ width: 320, height: 420, perspective: 1200 }}>
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          className="absolute inset-0 rounded-[4px] border border-black/10 p-5 flex flex-col shadow-paper-lg"
          style={{ backgroundColor: data.bg, color: data.ink, backfaceVisibility: "hidden" }}
        >
          <div className="text-sm italic pb-2 border-b" style={{ borderColor: data.ink + "55" }}>
            {data.title}
          </div>
          <div className="text-[11px] mt-2 space-y-0.5 font-mono opacity-80">
            <div>TO : {data.to}</div>
            <div>FROM : {data.from}</div>
          </div>
          <div className="flex-1 mt-3 overflow-hidden rounded-[2px]">
            <PixelSwirl seed={data.seed} palette={data.palette} size={56} />
          </div>
          <div className="flex items-end justify-between mt-3">
            <span className="text-[10px] font-mono opacity-70">date : __ /__</span>
            <button
              type="button"
              onClick={() => setFlipped((f) => !f)}
              className="w-7 h-7 rounded-tl-[10px] -mr-1 -mb-1 cursor-pointer"
              style={{ background: `linear-gradient(135deg, transparent 50%, ${data.ink}44 50%)` }}
              aria-label="flip"
            />
          </div>
        </div>
        <div
          className="absolute inset-0 rounded-[4px] border border-black/10 p-5 flex flex-col shadow-paper-lg"
          style={{
            backgroundColor: data.bg,
            color: data.ink,
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="text-sm italic pb-2 border-b" style={{ borderColor: data.ink + "55" }}>
            notes
          </div>
          <div className="flex-1 mt-4 font-serif italic text-lg leading-relaxed">
            {data.note}
          </div>
          <div className="flex items-end justify-between mt-3">
            <span className="text-[10px] font-mono opacity-70">{data.id}</span>
            <button
              type="button"
              onClick={() => setFlipped((f) => !f)}
              className="w-7 h-7 rounded-tl-[10px] -mr-1 -mb-1 cursor-pointer"
              style={{ background: `linear-gradient(135deg, transparent 50%, ${data.ink}44 50%)` }}
              aria-label="flip back"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function HeroSection() {
  const dragAreaRef = useRef(null);
  const topZRef = useRef(cards.length);
  const [openCard, setOpenCard] = useState(null);

  const bringToFront = () => {
    topZRef.current += 1;
    return topZRef.current;
  };

  return (
    <section className="relative px-6 pt-20 pb-20 md:pt-28 md:pb-28 overflow-hidden">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center min-h-[520px]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-xl"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-foreground/15 bg-background/60 backdrop-blur-sm mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 flex-shrink-0" />
            <span className="text-[10px] tracking-[0.18em] text-foreground/55 uppercase font-mono">
              cad to metal, a new way to create
            </span>
          </div>

          <h1 className="font-serif font-light leading-[0.95] tracking-tight text-foreground mb-6">
            <span className="block text-6xl md:text-7xl lg:text-[88px]">from cad</span>
            <span className="block text-6xl md:text-7xl lg:text-[88px] text-foreground/35 italic">
              to metal
            </span>
          </h1>

          <p className="text-sm md:text-[15px] text-foreground/55 font-light tracking-wide leading-relaxed mb-9 max-w-[380px]">
            publish your designs. choose materials. let your artifacts become real
            objects, <span className="text-foreground/80">crafted, shipped, loved.</span>
          </p>

          <div className="flex flex-wrap gap-3">
            <Link to="/store/create">
              <Button className="rounded-full px-6 py-5 text-sm tracking-wide gap-2 bg-foreground text-background hover:bg-foreground/90">
                open a store
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
            <Link to="/explore">
              <Button
                variant="outline"
                className="rounded-full px-6 py-5 text-sm tracking-wide border-foreground/20 bg-background/40 text-foreground/70 hover:text-foreground hover:bg-background/60 backdrop-blur-sm"
              >
                explore artifacts
              </Button>
            </Link>
          </div>
        </motion.div>

        <div ref={dragAreaRef} className="relative h-[520px] hidden md:block">
          {cards.map((c, i) => (
            <MemoCard
              key={c.id}
              data={c}
              dragArea={dragAreaRef}
              baseZ={i + 1}
              onPickUp={bringToFront}
              onOpen={setOpenCard}
            />
          ))}
          <p className="absolute bottom-2 right-2 font-mono text-[10px] tracking-[0.16em] text-foreground/35 lowercase">
            drag · click to open · corner to flip
          </p>
        </div>
      </div>

      <Dialog open={!!openCard} onOpenChange={(o) => !o && setOpenCard(null)}>
        <DialogContent className="max-w-md bg-background/95 backdrop-blur">
          <DialogTitle className="sr-only">{openCard?.title}</DialogTitle>
          <DialogDescription className="sr-only">memo card preview</DialogDescription>
          <CardPreview data={openCard} />
        </DialogContent>
      </Dialog>
    </section>
  );
}
