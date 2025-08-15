"use client";

import { useEffect, useState } from 'react';

const COOKIE = 'bl_consent=v1:analytics=';

function getConsent(): boolean | null {
  const m = document.cookie.match(/bl_consent=v1:analytics=(true|false)/);
  return m ? m[1] === 'true' : null;
}

export default function CookieBanner() {
  const [choice, setChoice] = useState<boolean | null>(null);

  useEffect(() => setChoice(getConsent()), []);

  if (choice !== null) return null;

  const set = (val: boolean) => {
    const oneYear = 60 * 60 * 24 * 365;
    document.cookie = `${COOKIE}${val}; Max-Age=${oneYear}; Path=/; SameSite=Lax`;
    location.reload(); // so server layout can pick up cookie
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-black/80 text-white p-4">
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-3 items-center justify-between">
        <p className="text-sm">
          We use essential cookies. Analytics only with your consent.
        </p>
        <div className="flex gap-2">
          <button onClick={() => set(false)} className="px-3 py-2 rounded bg-neutral-700">Reject</button>
          <button onClick={() => set(true)} className="px-3 py-2 rounded bg-white text-black">Accept</button>
        </div>
      </div>
    </div>
  );
}
