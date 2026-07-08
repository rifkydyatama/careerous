// Latar "aurora": blob gradient cerah yang melayang untuk nuansa vibrant.
// Server component murni (CSS animation) agar hemat & bisa dipakai di mana saja.

type AuroraBackgroundProps = {
  /** Tampilkan grid halus di atas blob (default true). */
  grid?: boolean;
};

export default function AuroraBackground({ grid = true }: AuroraBackgroundProps) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#0b0616]"
    >
      {/* Blob-blob gradient melayang */}
      <div className="absolute -left-24 -top-32 h-[40rem] w-[40rem] rounded-full bg-fuchsia-500/30 blur-[130px] animate-blob" />
      <div className="absolute -right-24 top-1/4 h-[36rem] w-[36rem] rounded-full bg-violet-500/30 blur-[130px] animate-blob [animation-delay:-6s]" />
      <div className="absolute -bottom-40 left-1/3 h-[34rem] w-[34rem] rounded-full bg-sky-500/25 blur-[130px] animate-blob [animation-delay:-3s]" />
      <div className="absolute right-1/4 top-2/3 h-[24rem] w-[24rem] rounded-full bg-cyan-400/20 blur-[110px] animate-blob [animation-delay:-9s]" />

      {/* Grid halus */}
      {grid && (
        <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      )}
    </div>
  );
}
