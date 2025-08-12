export default function ProviderOnboarding() {
  return (
    <div className="glass-card" style={{ maxWidth: 600, margin: '3rem auto' }}>
      <h1 className="hero-title" style={{ marginBottom: '1.5rem' }}>Provider Onboarding</h1>
      <ol style={{ marginBottom: '2rem', paddingLeft: 20 }}>
        <li>1. Complete your profile</li>
        <li>2. Add your services</li>
        <li>3. Set your availability</li>
        <li>4. Submit verification documents</li>
        <li>5. Go live!</li>
      </ol>
      <button className="btn-primary">Start Onboarding</button>
    </div>
  );
}
