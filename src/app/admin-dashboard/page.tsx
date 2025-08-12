export default function AdminDashboard() {
  return (
    <div className="glass-card" style={{ maxWidth: 800, margin: '3rem auto' }}>
      <h1 className="hero-title" style={{ marginBottom: '1.5rem' }}>Admin Dashboard</h1>
      <ul style={{ marginBottom: '2rem', paddingLeft: 20 }}>
        <li>• View all providers</li>
        <li>• Approve/reject onboarding</li>
        <li>• Moderate reviews</li>
        <li>• Manage users</li>
        <li>• Site analytics</li>
      </ul>
      <button className="btn-primary">Go to Moderation</button>
    </div>
  );
}
