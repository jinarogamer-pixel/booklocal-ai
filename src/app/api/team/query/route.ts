import { NextRequest, NextResponse } from 'next/server';

const TEAM_AGENTS = {
    'product-owner': { name: 'Product Engineering Lead', expertise: ['requirements', 'user-stories'] },
    'tech-lead': { name: 'Principal Architect', expertise: ['architecture', 'technical-decisions'] },
    'frontend-dev': { name: 'Frontend Architect', expertise: ['react', 'nextjs', 'ui-ux'] },
    'backend-dev': { name: 'Backend Architect', expertise: ['api', 'database', 'supabase'] },
    'ai-engineer': { name: 'AI/ML Architect', expertise: ['openai', 'embeddings', 'semantic-search'] },
    'security-expert': { name: 'Security Auditor', expertise: ['owasp', 'vulnerability-assessment'] },
    'performance-engineer': { name: 'Performance Expert', expertise: ['core-web-vitals', 'optimization'] },
    'devops-engineer': { name: 'DevOps Infrastructure', expertise: ['deployment', 'ci-cd', 'monitoring'] },
    'qa-engineer': { name: 'QA Engineering', expertise: ['testing', 'automation'] },
    'project-manager': { name: 'Technical Project Director', expertise: ['coordination', 'timeline'] }
};

interface Collaboration {
    id: string;
    query: string;
    agents: string[];
    status: string;
    type?: string;
    timeline: {
        started: string;
        estimated?: string;
    };
}

// In-memory storage for demo (use database in production)
let activeCollaborations: Collaboration[] = [];
let collaborationCounter = 1;

function analyzeQuery(query: string): { agents: string[]; type: string } {
    const keywords = query.toLowerCase();
    const assignedAgents: string[] = [];
    let collaborationType = 'general';

    // Feature development
    if (hasKeywords(keywords, ['feature', 'new', 'implement', 'build'])) {
        assignedAgents.push('product-owner', 'tech-lead', 'frontend-dev', 'backend-dev', 'qa-engineer');
        collaborationType = 'feature-development';
    }

    // Security issues
    if (hasKeywords(keywords, ['security', 'auth', 'vulnerability', 'compliance'])) {
        assignedAgents.push('security-expert', 'tech-lead');
        if (hasKeywords(keywords, ['api', 'backend'])) {
            assignedAgents.push('backend-dev');
        }
        collaborationType = 'security-review';
    }

    // Performance issues
    if (hasKeywords(keywords, ['performance', 'slow', 'optimization', 'speed'])) {
        assignedAgents.push('performance-engineer', 'tech-lead');
        if (hasKeywords(keywords, ['frontend', 'ui'])) {
            assignedAgents.push('frontend-dev');
        }
        collaborationType = 'performance-optimization';
    }

    // AI/ML features
    if (hasKeywords(keywords, ['ai', 'search', 'recommendation', 'embeddings'])) {
        assignedAgents.push('ai-engineer', 'backend-dev', 'performance-engineer');
        collaborationType = 'ai-enhancement';
    }

    // DevOps/deployment
    if (hasKeywords(keywords, ['deploy', 'production', 'infrastructure'])) {
        assignedAgents.push('devops-engineer', 'security-expert', 'performance-engineer');
        collaborationType = 'deployment';
    }

    // Testing/QA
    if (hasKeywords(keywords, ['test', 'bug', 'quality'])) {
        assignedAgents.push('qa-engineer', 'tech-lead');
        collaborationType = 'quality-assurance';
    }

    // Always include project manager for coordination if multiple agents
    if (assignedAgents.length > 2) {
        assignedAgents.push('project-manager');
    }

    // Remove duplicates and ensure at least tech lead is involved
    const uniqueAgents = [...new Set(assignedAgents)];
    if (uniqueAgents.length === 0) {
        uniqueAgents.push('tech-lead');
    }

    return { agents: uniqueAgents, type: collaborationType };
}

function hasKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
}

export async function POST(request: NextRequest) {
    try {
        const { query, context } = await request.json();

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        // Analyze query and assign team
        const { agents, type } = analyzeQuery(query);

        // Create new collaboration
        const collaboration: Collaboration = {
            id: `collab-${collaborationCounter++}`,
            query,
            agents,
            status: 'active',
            type,
            timeline: {
                started: new Date().toISOString(),
                estimated: '2-3 days'
            }
        };

        // Store collaboration
        activeCollaborations.push(collaboration);

        // Keep only last 10 collaborations
        if (activeCollaborations.length > 10) {
            activeCollaborations = activeCollaborations.slice(-10);
        }

        // Generate team responses
        const teamResponses = agents.map(agentId => {
            const agent = TEAM_AGENTS[agentId as keyof typeof TEAM_AGENTS];
            return {
                agent: agent?.name || agentId,
                role: agentId,
                analysis: getAgentAnalysis(agentId, query, type),
                timestamp: new Date().toISOString()
            };
        });

        return NextResponse.json({
            success: true,
            team_assigned: true,
            collaboration: {
                id: collaboration.id,
                query: collaboration.query,
                type: collaboration.type,
                agents: collaboration.agents,
                team_response: teamResponses,
                timeline: collaboration.timeline,
                next_steps: generateNextSteps(type)
            }
        });
    } catch (error) {
        console.error('Team query error:', error);
        return NextResponse.json(
            { error: 'Failed to process team query' },
            { status: 500 }
        );
    }
}

function getAgentAnalysis(agentId: string, query: string, type: string) {
    const bookLocalContext = {
        architecture: "Next.js 15, React 19, TypeScript 5.x, Supabase",
        phase: "Phase 3 complete, production-ready",
        features: "3D visualization, AI search, trust scoring, real-time chat",
        tech_stack: "PostgreSQL, pgvector, OpenAI, Three.js, GSAP"
    };

    switch (agentId) {
        case 'product-owner':
            return {
                focus: "User experience and business impact assessment",
                deliverables: ["User stories", "Acceptance criteria", "Success metrics"],
                timeline: "1-2 days for requirements gathering",
                context: bookLocalContext
            };

        case 'tech-lead':
            return {
                focus: "Technical architecture and implementation strategy",
                deliverables: ["Technical specification", "Architecture decisions", "Code review plan"],
                timeline: "2-3 days for technical design",
                context: bookLocalContext
            };

        case 'frontend-dev':
            return {
                focus: "React 19/Next.js 15 implementation with Three.js integration",
                deliverables: ["Component implementation", "3D optimization", "Responsive design"],
                timeline: "3-5 days for frontend development",
                context: bookLocalContext
            };

        case 'backend-dev':
            return {
                focus: "Supabase integration and API development",
                deliverables: ["API endpoints", "Database schema updates", "Performance optimization"],
                timeline: "2-4 days for backend implementation",
                context: bookLocalContext
            };

        case 'ai-engineer':
            return {
                focus: "AI/ML integration with OpenAI and vector embeddings",
                deliverables: ["Model optimization", "Embedding improvements", "Semantic search enhancement"],
                timeline: "3-5 days for AI implementation",
                context: bookLocalContext
            };

        case 'security-expert':
            return {
                focus: "Security assessment and OWASP compliance",
                deliverables: ["Vulnerability assessment", "Security recommendations", "Compliance checklist"],
                timeline: "1-2 days for security review",
                context: bookLocalContext
            };

        case 'performance-engineer':
            return {
                focus: "Performance optimization and Core Web Vitals",
                deliverables: ["Performance audit", "Optimization plan", "Monitoring setup"],
                timeline: "2-3 days for performance improvements",
                context: bookLocalContext
            };

        default:
            return {
                focus: `${TEAM_AGENTS[agentId as keyof typeof TEAM_AGENTS]?.name || 'Specialist'} analysis`,
                deliverables: ["Specialized recommendations", "Implementation plan"],
                timeline: "1-3 days for completion",
                context: bookLocalContext
            };
    }
}

function generateNextSteps(type: string): string[] {
    const baseSteps = [
        "Team coordination meeting to align on approach",
        "Technical specification and architecture review",
        "Implementation phase with parallel development",
        "Code review and quality assurance",
        "Testing and performance validation",
        "Deployment and monitoring setup"
    ];

    switch (type) {
        case 'security-review':
            return [
                "Immediate security assessment and threat modeling",
                "Vulnerability scanning and penetration testing",
                "Security fix implementation with priority ranking",
                "Compliance verification and documentation",
                "Security monitoring and alerting setup"
            ];

        case 'performance-optimization':
            return [
                "Performance baseline measurement and analysis",
                "Bottleneck identification and prioritization",
                "Optimization implementation with A/B testing",
                "Performance monitoring and regression testing",
                "Documentation and team training on best practices"
            ];

        case 'feature-development':
            return [
                "Requirements gathering and user story creation",
                "Technical design and architecture planning",
                "Sprint planning and task breakdown",
                "Development with continuous integration",
                "Testing, review, and deployment pipeline"
            ];

        default:
            return baseSteps;
    }
}
