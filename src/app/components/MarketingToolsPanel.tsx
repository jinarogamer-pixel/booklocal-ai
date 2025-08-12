"use client";
// MarketingToolsPanel: Promo codes, referrals, campaigns
import { useState } from 'react';

export default function MarketingToolsPanel() {
  const [promoCodes, setPromoCodes] = useState<string[]>(['WELCOME10', 'SUMMER20']);
  const [newCode, setNewCode] = useState('');

  function addPromoCode() {
    if (newCode && !promoCodes.includes(newCode)) {
      setPromoCodes([...promoCodes, newCode]);
      setNewCode('');
    }
  }

  return (
    <div className="glass-card animate-fade-in-up p-6">
      <h2 className="font-bold text-lg mb-4">Marketing Tools</h2>
      <div className="mb-4">
        <input
          className="px-3 py-2 rounded-lg border border-gray-200 mr-2"
          placeholder="New promo code"
          value={newCode}
          onChange={e => setNewCode(e.target.value.toUpperCase())}
        />
        <button className="btn-primary" onClick={addPromoCode}>Add</button>
      </div>
      <ul className="space-y-2">
        {promoCodes.map(code => (
          <li key={code} className="bg-white/70 rounded px-3 py-1 text-sm font-mono border border-gray-100">{code}</li>
        ))}
      </ul>
      <div className="mt-6 text-xs text-gray-500">Referrals and campaigns coming soon.</div>
    </div>
  );
}
