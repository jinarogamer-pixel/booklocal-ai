"use client";

export function BenefitsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <div className="text-2xl mb-2" aria-hidden>💰</div>
        <h3 className="font-semibold mb-1">Keep More Money</h3>
        <p className="text-sm text-neutral-300">Only 3-5% platform fee vs 15-25% elsewhere</p>
      </div>
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <div className="text-2xl mb-2" aria-hidden>🎯</div>
        <h3 className="font-semibold mb-1">Quality Leads</h3>
        <p className="text-sm text-neutral-300">Customers with real budgets and instant estimates</p>
      </div>
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <div className="text-2xl mb-2" aria-hidden>🛡️</div>
        <h3 className="font-semibold mb-1">Payment Protection</h3>
        <p className="text-sm text-neutral-300">Guaranteed payment with BookLocal Shield</p>
      </div>
    </div>
  );
}
