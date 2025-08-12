import { useAdminDashboard } from './useAdminDashboard';

export default function AdminPanel() {
  const { users, providers, loading } = useAdminDashboard();
  return (
    <div>
      <div className="glass-card mb-6">
        <h2 className="section-title mb-2">User & Provider Management</h2>
        {loading ? <div>Loading...</div> : (
          <>
            <div style={{ display: 'flex', gap: 32 }}>
              <div>
                <b>Users:</b>
                <ul className="list-disc pl-6">
                  {users.map((u) => (
                    <li key={u.id}>{u.email || u.name || u.id}</li>
                  ))}
                </ul>
              </div>
              <div>
                <b>Providers:</b>
                <ul className="list-disc pl-6">
                  {providers.map((p) => (
                    <li key={p.id}>{p.email || p.name || p.id}</li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="glass-card mb-6">
        <h2 className="section-title mb-2">Analytics & Reports</h2>
        <button className="btn-primary">View Analytics</button>
      </div>
      <div className="glass-card mb-6">
        <h2 className="section-title mb-2">Moderation</h2>
        <button className="btn-primary">Moderate Content</button>
      </div>
      <div className="glass-card">
        <h2 className="section-title mb-2">Platform Settings</h2>
        <button className="btn-primary">Settings</button>
      </div>
    </div>
  );
}
