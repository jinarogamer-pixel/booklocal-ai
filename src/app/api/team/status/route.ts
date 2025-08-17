import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Simulate team status data
        const teamStatus = {
            team_health: "All systems operational",
            active_agents: 10,
            active_collaborations: 0,
            recent_collaborations: [],
            team_metrics: {
                totalTasks: 0,
                completedTasks: 0,
                activeAgents: 10,
                collaborationScore: 100
            },
            system_status: {
                frontend: { status: 'operational', details: 'Next.js 15 • All components loaded' },
                backend: { status: 'operational', details: 'Supabase • All services running' },
                ai_systems: { status: 'operational', details: 'OpenAI • Embeddings ready' },
                database: { status: 'operational', details: 'PostgreSQL • pgvector enabled' }
            },
            agents: {
                'product-owner': { name: 'Product Engineering Lead', status: 'online', current_tasks: 0 },
                'tech-lead': { name: 'Principal Architect', status: 'online', current_tasks: 0 },
                'frontend-dev': { name: 'Frontend Architect', status: 'online', current_tasks: 0 },
                'backend-dev': { name: 'Backend Architect', status: 'online', current_tasks: 0 },
                'ai-engineer': { name: 'AI/ML Architect', status: 'online', current_tasks: 0 },
                'security-expert': { name: 'Security Auditor', status: 'online', current_tasks: 0 },
                'performance-engineer': { name: 'Performance Expert', status: 'online', current_tasks: 0 },
                'devops-engineer': { name: 'DevOps Infrastructure', status: 'online', current_tasks: 0 },
                'qa-engineer': { name: 'QA Engineering', status: 'online', current_tasks: 0 },
                'project-manager': { name: 'Technical Project Director', status: 'online', current_tasks: 0 }
            }
        };

        return NextResponse.json(teamStatus);
    } catch (error) {
        console.error('Team status error:', error);
        return NextResponse.json(
            { error: 'Failed to get team status' },
            { status: 500 }
        );
    }
}
