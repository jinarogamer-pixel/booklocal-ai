export default function TestPage() {
    return (
        <div style={{ padding: '2rem', background: '#111', color: '#fff', minHeight: '100vh' }}>
            <h1>Environment Test</h1>
            <p>If you can see this, the basic Next.js environment is working.</p>
            <div style={{ marginTop: '2rem' }}>
                <h2>System Status</h2>
                <ul>
                    <li>✅ Next.js 15 rendering</li>
                    <li>✅ React components working</li>
                    <li>✅ TypeScript compilation</li>
                    <li>✅ CSS styling applied</li>
                </ul>
            </div>
            <div style={{ marginTop: '2rem' }}>
                <button
                    style={{
                        padding: '0.5rem 1rem',
                        background: '#10B981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer'
                    }}
                    onClick={() => alert('JavaScript is working!')}
                >
                    Test Interactivity
                </button>
            </div>
        </div>
    );
}
