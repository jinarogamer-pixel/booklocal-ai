import React, { useEffect, useState } from 'react';

interface TeamAgent {
    name: string;
    color: string;
    icon: string;
}

interface Collaboration {
    id?: string;
    query?: string;
    type?: string;
    status?: string;
    agents?: string[];
    timeline?: {
        started?: string;
    };
}

interface TeamStatus {
    active_agents: number;
    active_collaborations: number;
    team_health: string;
    recent_collaborations?: Collaboration[];
}

const TEAM_AGENTS: Record<string, TeamAgent> = {
    'product-owner': { name: 'Product Engineering Lead', color: 'bg-blue-500', icon: '👔' },
    'tech-lead': { name: 'Principal Architect', color: 'bg-purple-500', icon: '🏗️' },
    'frontend-dev': { name: 'Frontend Architect', color: 'bg-green-500', icon: '🎨' },
    'backend-dev': { name: 'Backend Architect', color: 'bg-orange-500', icon: '⚙️' },
    'ai-engineer': { name: 'AI/ML Architect', color: 'bg-pink-500', icon: '🤖' },
    'security-expert': { name: 'Security Auditor', color: 'bg-red-500', icon: '🛡️' },
    'performance-engineer': { name: 'Performance Expert', color: 'bg-yellow-500', icon: '⚡' },
    'devops-engineer': { name: 'DevOps Infrastructure', color: 'bg-indigo-500', icon: '🚀' },
    'qa-engineer': { name: 'QA Engineering', color: 'bg-teal-500', icon: '🧪' },
    'project-manager': { name: 'Technical Project Director', color: 'bg-gray-500', icon: '📋' }
};

export default function TeamDashboard() {
    const [teamStatus, setTeamStatus] = useState<TeamStatus | null>(null);
    const [activeCollaborations, setActiveCollaborations] = useState<Collaboration[]>([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    // Fetch team status
    useEffect(() => {
        fetchTeamStatus();
        const interval = setInterval(fetchTeamStatus, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchTeamStatus = async () => {
        try {
            const response = await fetch('/api/team/status');
            const data = await response.json();
            setTeamStatus(data);
            setActiveCollaborations(data.recent_collaborations || []);
            setLastUpdate(new Date());
        } catch (error) {
            console.error('Failed to fetch team status:', error);
        }
    };

    const triggerTeamQuery = async () => {
        if (!query.trim()) return;

        setLoading(true);
        try {
            const response = await fetch('/api/team/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query,
                    context: {
                        source: 'dashboard',
                        timestamp: new Date().toISOString()
                    }
                })
            });

            const result = await response.json();
            if (result.success) {
                setQuery('');
                fetchTeamStatus(); // Refresh status after query
            }
        } catch (error) {
            console.error('Failed to trigger team query:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!teamStatus) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 animate-pulse">🤖</div>
                    <p>Loading team dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        👥 BookLocal AI Development Team
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Multi-agent collaboration system • Last updated: {lastUpdate.toLocaleTimeString()}
                    </p>
                </div>
                <button
                    onClick={fetchTeamStatus}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                    🔄 Refresh Status
                </button>
            </div>

            {/* Team Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium">Active Agents</h3>
                        <span>👥</span>
                    </div>
                    <div className="text-2xl font-bold">{teamStatus.active_agents}</div>
                    <p className="text-xs text-gray-500">All systems operational</p>
                </div>

                <div className="p-4 border rounded-lg bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium">Active Collaborations</h3>
                        <span>💬</span>
                    </div>
                    <div className="text-2xl font-bold">{teamStatus.active_collaborations}</div>
                    <p className="text-xs text-gray-500">Real-time coordination</p>
                </div>

                <div className="p-4 border rounded-lg bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium">Team Health</h3>
                        <span className="text-green-500">✓</span>
                    </div>
                    <div className="text-2xl font-bold text-green-500">100%</div>
                    <p className="text-xs text-gray-500">{teamStatus.team_health}</p>
                </div>

                <div className="p-4 border rounded-lg bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium">Response Time</h3>
                        <span className="text-yellow-500">⚡</span>
                    </div>
                    <div className="text-2xl font-bold">&lt; 2s</div>
                    <p className="text-xs text-gray-500">Average routing time</p>
                </div>
            </div>

            {/* Team Query Interface */}
            <div className="p-6 border rounded-lg bg-white shadow-sm">
                <div className="mb-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        🤖 Team Query Interface
                    </h2>
                    <p className="text-gray-600">
                        Ask a question and watch the AI team coordinate automatically
                    </p>
                </div>
                <div className="flex gap-2">
                    <input
                        value={query}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                        placeholder="Ask your development team anything... (e.g., 'Optimize the 3D room performance', 'Review authentication security')"
                        onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && triggerTeamQuery()}
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    <button
                        onClick={triggerTeamQuery}
                        disabled={loading || !query.trim()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                        {loading ? '⏳ Processing...' : '💬 Ask Team'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Team Members */}
                <div className="p-6 border rounded-lg bg-white shadow-sm">
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold">Team Members</h2>
                        <p className="text-gray-600">All agents online and ready for collaboration</p>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        {Object.entries(TEAM_AGENTS).map(([id, agent]) => (
                            <div key={id} className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <div className="text-lg">{agent.icon}</div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium">{agent.name}</p>
                                    <p className="text-xs text-gray-500">Online</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Collaborations */}
                <div className="p-6 border rounded-lg bg-white shadow-sm">
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold">Recent Collaborations</h2>
                        <p className="text-gray-600">Latest team coordination activities</p>
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {activeCollaborations.length > 0 ? (
                            activeCollaborations.map((collaboration, index) => (
                                <div key={collaboration.id || index} className="p-3 rounded-lg border bg-gray-50">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{collaboration.query}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {collaboration.type && `Type: ${collaboration.type} • `}
                                                {collaboration.timeline?.started && new Date(collaboration.timeline.started).toLocaleString()}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs rounded-full ${collaboration.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {collaboration.status || 'active'}
                                        </span>
                                    </div>

                                    {collaboration.agents && collaboration.agents.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {collaboration.agents.map(agentId => {
                                                const agent = TEAM_AGENTS[agentId];
                                                return agent ? (
                                                    <span key={agentId} className="text-xs px-2 py-1 bg-white border rounded">
                                                        {agent.icon} {agentId.replace('-', ' ')}
                                                    </span>
                                                ) : null;
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 py-8">
                                <div className="text-4xl mb-2">💬</div>
                                <p>No recent collaborations</p>
                                <p className="text-xs">Ask a question above to start team coordination</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* System Status */}
            <div className="p-6 border rounded-lg bg-white shadow-sm">
                <div className="mb-4">
                    <h2 className="text-xl font-semibold">System Status</h2>
                    <p className="text-gray-600">BookLocal AI platform health and performance</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 rounded-lg border bg-green-50">
                        <div className="text-green-500 text-2xl mb-2">✓</div>
                        <p className="text-sm font-medium">Frontend</p>
                        <p className="text-xs text-gray-500">Next.js 15 • Operational</p>
                    </div>
                    <div className="text-center p-3 rounded-lg border bg-green-50">
                        <div className="text-green-500 text-2xl mb-2">✓</div>
                        <p className="text-sm font-medium">Backend</p>
                        <p className="text-xs text-gray-500">Supabase • All services up</p>
                    </div>
                    <div className="text-center p-3 rounded-lg border bg-green-50">
                        <div className="text-green-500 text-2xl mb-2">✓</div>
                        <p className="text-sm font-medium">AI Systems</p>
                        <p className="text-xs text-gray-500">OpenAI • Embeddings ready</p>
                    </div>
                    <div className="text-center p-3 rounded-lg border bg-green-50">
                        <div className="text-green-500 text-2xl mb-2">✓</div>
                        <p className="text-sm font-medium">Database</p>
                        <p className="text-xs text-gray-500">PostgreSQL • pgvector enabled</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
