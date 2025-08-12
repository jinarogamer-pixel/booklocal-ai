

import ReviewModerationPanel from '../components/ReviewModerationPanel';
import MarketingToolsPanel from '../components/MarketingToolsPanel';
import AuthGuard from '../components/AuthGuard';

export default function AdminDashboard() {

  return (
    <AuthGuard>
      <div style={{ maxWidth: 900, margin: '3rem auto' }}>
        <h1 className="hero-title mb-4">Admin Dashboard</h1>
        {/* AdminPanel removed for now, wiring new features */}
        <div className="mb-10">
          <ReviewModerationPanel />
        </div>
        <div className="mb-10">
          <MarketingToolsPanel />
        </div>
      </div>
    </AuthGuard>
  );
}
