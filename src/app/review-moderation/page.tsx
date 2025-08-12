export default function ReviewModeration() {
  return (
    <div className="glass-card" style={{ maxWidth: 800, margin: '3rem auto' }}>
      <h1 className="hero-title" style={{ marginBottom: '1.5rem' }}>Review Moderation</h1>
      <ul style={{ marginBottom: '2rem', paddingLeft: 20 }}>
        <li>• Approve/reject new reviews</li>
        <li>• Flag inappropriate content</li>
        <li>• View reported reviews</li>
      </ul>
      <button className="btn-primary">Moderate Reviews</button>
    </div>
  );
}
