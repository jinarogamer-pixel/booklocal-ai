"use client";

export default function ShaderBg() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-20 opacity-[0.9]"
        style={{
          background:
            "radial-gradient(1200px 800px at 70% -10%, rgba(72,84,255,.15), transparent 60%), radial-gradient(1000px 600px at -10% 20%, rgba(204,0,255,.10), transparent 60%), radial-gradient(800px 600px at 50% 120%, rgba(0,180,255,.10), transparent 60%), #0a0b0f",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 mix-blend-overlay opacity-[0.5]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml;utf8,\
<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'140\' height=\'140\' viewBox=\'0 0 140 140\'>\
<filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'.95\' numOctaves=\'1\' stitchTiles=\'stitch\'/>\
<feColorMatrix type=\'saturate\' values=\'0\'/><feComponentTransfer><feFuncA type=\'table\' tableValues=\'0 0 0 .1\'/></feComponentTransfer></filter>\
<rect width=\'100%\' height=\'100%\' filter=\'url(#n)\'/></svg>")',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-5"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,.55) 80%, rgba(0,0,0,.9) 100%)",
        }}
      />
    </>
  );
}
