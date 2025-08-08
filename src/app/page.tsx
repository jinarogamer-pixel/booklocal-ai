"use client";
import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ padding: '3rem 1.25rem', maxWidth: 1100, margin: '0 auto' }}>
      {/* HERO */}
      <section style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: 48, lineHeight: 1.1, margin: 0 }}>
          BookLocal — hire trusted local pros, fast.
        </h1>
        <p style={{ fontSize: 18, opacity: 0.8, marginTop: 16 }}>
          One place to find, compare and book verified small‑business pros in your neighborhood.
        </p>
        <div style={{ marginTop: 24 }}>
          <Link href="#join-waitlist"
            style={{ padding: '12px 20px', borderRadius: 8, background: '#111', color: '#fff' }}>
            Join the waitlist
          </Link>
          <Link href="#how-it-works" style={{ marginLeft: 12 }}>
            Learn more →
          </Link>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '3rem' }}>
        {['4.9/5 average rating', '2,300+ bookings completed', 'Verified background checks'].map((t, i) => (
          <div key={i} style={{ border: '1px solid #e5e5e5', borderRadius: 10, padding: 16 }}>{t}</div>
        ))}
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ marginBottom: '3rem' }}>
        <h2>How it works</h2>
        <ol style={{ lineHeight: 1.8 }}>
          <li>Tell us what you need and your location.</li>
          <li>Compare verified pros with transparent pricing & reviews.</li>
          <li>Book instantly and pay securely.</li>
        </ol>
      </section>

      {/* CATEGORIES PREVIEW (generic, not barber-specific) */}
      <section style={{ marginBottom: '3rem' }}>
        <h2>Popular categories</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {['Home Cleaning', 'Handyman', 'Catering', 'Personal Training', 'Photography', 'Pet Care']
            .map((c) => (
              <span key={c} style={{ border: '1px solid #e5e5e5', borderRadius: 20, padding: '8px 14px' }}>
                {c}
              </span>
            ))}
        </div>
      </section>

      {/* CTA */}
      <section id="join-waitlist" style={{ border: '1px solid #e5e5e5', borderRadius: 12, padding: 24 }}>
        <h3 style={{ marginTop: 0 }}>Be first to get access</h3>
        <form onSubmit={(e) => { e.preventDefault(); alert('Thanks! We’ll email you.'); }}>
          <input
            type="email"
            required
            placeholder="you@email.com"
            style={{ padding: 12, border: '1px solid #ccc', borderRadius: 8, width: '100%', maxWidth: 360 }}
          />
          <button type="submit"
            style={{ marginLeft: 12, padding: '12px 16px', borderRadius: 8, background: '#111', color: '#fff' }}>
            Join waitlist
          </button>
        </form>
      </section>

      <footer style={{ marginTop: 48, opacity: 0.6 }}>
        © {new Date().getFullYear()} BookLocal
      </footer>
    </main>
  );
}

