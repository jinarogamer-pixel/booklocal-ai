"use client";
import { useState } from 'react';

const steps = [
  'Business Profile',
  'Services & Pricing',
  'Availability',
  'Payment Setup',
  'Preview',
];

export default function OnboardingStepper() {
  const [step, setStep] = useState(0);
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {steps.map((label, i) => (
          <div key={i} style={{
            flex: 1,
            padding: '0.7rem 0',
            background: i === step ? 'linear-gradient(90deg,#0ea5e9,#10b981)' : '#f1f5f9',
            color: i === step ? '#fff' : '#171717',
            borderRadius: 12,
            fontWeight: 600,
            textAlign: 'center',
            opacity: i > step ? 0.5 : 1,
            cursor: i <= step ? 'pointer' : 'default',
            transition: 'background 0.18s,color 0.18s',
          }} onClick={() => i <= step && setStep(i)}>
            {label}
          </div>
        ))}
      </div>
      <div className="glass-card" style={{ minHeight: 220 }}>
        {step === 0 && <BusinessProfileForm onNext={() => setStep(step+1)} />}
        {step === 1 && <ServicesForm onNext={() => setStep(step+1)} onBack={() => setStep(step-1)} />}
        {step === 2 && <AvailabilityForm onNext={() => setStep(step+1)} onBack={() => setStep(step-1)} />}
        {step === 3 && <PaymentSetupForm onNext={() => setStep(step+1)} onBack={() => setStep(step-1)} />}
        {step === 4 && <PreviewPage onBack={() => setStep(step-1)} />}
      </div>
    </div>
  );
}

function BusinessProfileForm({ onNext }: { onNext: () => void }) {
  return (
    <form onSubmit={e => { e.preventDefault(); onNext(); }}>
      <h2 className="section-title mb-2">Business Profile</h2>
      <input className="w-full mb-3" placeholder="Business Name" required />
      <input className="w-full mb-3" placeholder="Location" required />
      <textarea className="w-full mb-3" placeholder="Description" required />
      <button className="btn-primary" type="submit">Next</button>
    </form>
  );
}
function ServicesForm({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <form onSubmit={e => { e.preventDefault(); onNext(); }}>
      <h2 className="section-title mb-2">Services & Pricing</h2>
      <input className="w-full mb-3" placeholder="Service Name" required />
      <input className="w-full mb-3" placeholder="Price" type="number" required />
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="btn-primary" style={{ background: '#f1f5f9', color: '#171717' }} onClick={onBack}>Back</button>
        <button className="btn-primary" type="submit">Next</button>
      </div>
    </form>
  );
}
function AvailabilityForm({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <form onSubmit={e => { e.preventDefault(); onNext(); }}>
      <h2 className="section-title mb-2">Availability</h2>
      <input className="w-full mb-3" placeholder="Available Days/Hours" required />
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="btn-primary" style={{ background: '#f1f5f9', color: '#171717' }} onClick={onBack}>Back</button>
        <button className="btn-primary" type="submit">Next</button>
      </div>
    </form>
  );
}
function PaymentSetupForm({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <form onSubmit={e => { e.preventDefault(); onNext(); }}>
      <h2 className="section-title mb-2">Payment Setup</h2>
      <input className="w-full mb-3" placeholder="Stripe Account Email" type="email" required />
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="btn-primary" style={{ background: '#f1f5f9', color: '#171717' }} onClick={onBack}>Back</button>
        <button className="btn-primary" type="submit">Next</button>
      </div>
    </form>
  );
}
function PreviewPage({ onBack }: { onBack: () => void }) {
  return (
    <div>
      <h2 className="section-title mb-2">Preview</h2>
      <p className="mb-3">Your provider profile is ready! 🎉</p>
      <button type="button" className="btn-primary" style={{ background: '#f1f5f9', color: '#171717' }} onClick={onBack}>Back</button>
      <button className="btn-primary ml-3">Finish</button>
    </div>
  );
}
