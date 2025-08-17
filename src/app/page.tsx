"use client";

import { ProNavbar } from '@/components/ProNavbar';
import RoomViewer from '@/components/RoomViewer';
import { useState } from 'react';

export default function Home() {
  const [finish, setFinish] = useState<'oak' | 'tile' | 'concrete'>('oak');

  return (
    <>
      <ProNavbar authed={false} />
      <main className="stack" style={{ padding: 'min(6vw,64px)' }}>
        {/* Hero Section */}
        <section className="stack" style={{ textAlign: 'center', paddingTop: 'var(--s-10)' }}>
          <h1 className="h1">Trusted local pros. Beautiful results.</h1>
          <p className="muted" style={{ maxWidth: 680, margin: '0 auto' }}>
            BookLocal helps you visualize materials in 3D, compare options, and book the highest-trust providers in your area.
          </p>
          <div className="row" style={{ justifyContent: 'center', marginTop: 'var(--s-6)' }}>
            <a className="btn" href="/estimate">Get an instant estimate</a>
            <a className="btn ghost" href="/cases">See case studies</a>
          </div>
        </section>

        {/* 3D Visualizer */}
        <section className="stack" style={{ marginTop: 'var(--s-10)' }}>
          <RoomViewer finish={finish} />

          {/* Material selector */}
          <div className="row" style={{ justifyContent: 'center', gap: 'var(--s-2)' }}>
            {(['oak', 'tile', 'concrete'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFinish(f)}
                className={finish === f ? 'btn' : 'btn ghost'}
                style={{ textTransform: 'capitalize' }}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="row muted" style={{ justifyContent: 'space-between', fontSize: '.875rem' }}>
            <span>Interactive preview (no signup required)</span>
            <a href="/visualizer" className="muted link-underline">Open full visualizer →</a>
          </div>
        </section>

        {/* Features */}
        <section className="stack" style={{ marginTop: 'var(--s-10)', textAlign: 'center' }}>
          <h2 className="h2">Why BookLocal works</h2>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--s-6)', marginTop: 'var(--s-8)' }}>
            {[
              {
                icon: '🎯',
                title: 'Trust-First Matching',
                desc: 'AI-powered provider scoring based on reviews, completion rates, and verified credentials.'
              },
              {
                icon: '📱',
                title: '3D Material Preview',
                desc: 'See exactly how materials will look in your space before making any decisions.'
              },
              {
                icon: '⚡',
                title: 'Instant Estimates',
                desc: 'Get accurate pricing from multiple providers in seconds, not days.'
              }
            ].map(feature => (
              <div key={feature.title} className="card hover-rise" style={{ padding: 'var(--s-6)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 'var(--s-4)' }}>{feature.icon}</div>
                <h3 style={{ marginBottom: 'var(--s-3)', color: 'hsl(var(--text-1))' }}>{feature.title}</h3>
                <p className="muted" style={{ lineHeight: 1.6 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="stack" style={{ marginTop: 'var(--s-10)', textAlign: 'center' }}>
          <div className="card" style={{ padding: 'var(--s-8)', maxWidth: 680, margin: '0 auto' }}>
            <h3 className="h2" style={{ marginBottom: 'var(--s-4)' }}>Ready to start your project?</h3>
            <p className="muted" style={{ marginBottom: 'var(--s-6)' }}>
              Join thousands of homeowners who found their perfect provider through BookLocal.
            </p>
            <a className="btn" href="/get-started">Get Started Free</a>
          </div>
        </section>
      </main>
    </>
  );
}
