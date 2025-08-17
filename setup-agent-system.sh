#!/bin/bash

# 🤖 BookLocal AI Agent System Setup
# Configures intelligent agent routing for your development environment

echo "🤖 BookLocal AI Agent System Setup"
echo "=================================="
echo

# Check current directory
if [[ ! -f "package.json" ]]; then
    echo "❌ Please run this script from your BookLocal project root"
    exit 1
fi

# Verify agent files exist
AGENT_DIR=".github/chatmodes"
if [[ ! -d "$AGENT_DIR" ]]; then
    echo "❌ Agent directory not found: $AGENT_DIR"
    echo "Please ensure all agent files are created first"
    exit 1
fi

echo "✅ Found agent directory: $AGENT_DIR"

# List available agents
echo
echo "📋 Available Agents:"
echo "==================="
for file in "$AGENT_DIR"/*.chatmode.md; do
    if [[ -f "$file" ]]; then
        basename "$file" .json.chatmode.md | sed 's/^/  ✓ /'
    fi
done

echo
echo "🎯 Agent System Configuration"
echo "============================"

# Check for VS Code/Cursor
if command -v code &> /dev/null; then
    echo "✅ VS Code detected"
    EDITOR="code"
elif command -v cursor &> /dev/null; then
    echo "✅ Cursor detected"  
    EDITOR="cursor"
else
    echo "⚠️  No supported editor found (VS Code/Cursor)"
    EDITOR="unknown"
fi

# Create configuration files
echo
echo "🔧 Creating Configuration Files..."

# Create .cursorrules if it doesn't exist
if [[ ! -f ".cursorrules" ]]; then
    cat > .cursorrules << 'EOF'
# BookLocal AI Agent System Rules

## Primary Rule: Always Route Through Master Coordinator
- EVERY query must first go to Master Coordinator for intelligent routing
- Master Coordinator analyzes query and routes to appropriate specialist
- Full BookLocal context is automatically injected

## Agent Routing Patterns:
- Frontend/UI → Frontend Architect
- Backend/API → Backend Architect  
- AI/ML → AI/ML Architect
- Security → Security Auditor
- Performance → Performance Expert
- DevOps → DevOps Infrastructure
- Testing → QA Engineering
- Product/UX → Product Engineering Lead
- Planning → Technical Project Director
- Architecture → Principal Architect

## BookLocal Project Context:
- Next.js 15 + React 19 + TypeScript 5.x
- Supabase backend with pgvector AI
- 3D visualization with Three.js
- Production-ready with all phases complete
- Enterprise features: chat, analytics, subscriptions
- AI integration: semantic search, recommendations

## Quality Standards:
- Production-ready code only
- TypeScript strict mode required
- 90%+ test coverage for critical paths  
- Performance targets: <3s loads, 95+ Lighthouse
- Security-first: OWASP compliance, zero-trust
EOF
    echo "✅ Created .cursorrules"
else
    echo "✅ .cursorrules already exists"
fi

# Create agent usage guide
cat > AGENT_SYSTEM_GUIDE.md << 'EOF'
# 🤖 BookLocal AI Agent System Guide

## 🎯 How It Works

### 1. Automatic Routing
Every query is automatically analyzed and routed to the best specialist agent:

```
Your Query → Master Coordinator → Specialist Agent → Expert Solution
```

### 2. Context Injection  
All agents automatically receive:
- Complete BookLocal project architecture
- Current implementation status (Phase 3 complete)
- Technical stack and performance targets
- Recent features and current priorities

### 3. Specialist Expertise
Each agent has deep domain knowledge:
- **Frontend Architect**: React 19, Next.js 15, Three.js, animations
- **Backend Architect**: Supabase, APIs, databases, authentication  
- **AI/ML Architect**: OpenAI, embeddings, semantic search, recommendations
- **Security Auditor**: OWASP compliance, threat modeling, zero-trust
- **Performance Expert**: Core Web Vitals, optimization, bundle analysis
- **DevOps Infrastructure**: Deployment, CI/CD, monitoring, scaling
- **QA Engineering**: Testing automation, quality assurance
- **Product Engineering Lead**: UX optimization, conversion analysis
- **Technical Project Director**: Coordination, planning, delivery

## 🚀 Usage Examples

### Frontend Issue
```
"The 3D room component is laggy on mobile devices"
→ Routes to Frontend Architect
→ Gets Three.js optimization recommendations
```

### Backend Problem  
```
"API responses are slow, need database optimization"
→ Routes to Backend Architect  
→ Gets PostgreSQL query optimization and indexing strategies
```

### AI Feature Request
```
"Want to improve the semantic search accuracy"
→ Routes to AI/ML Architect
→ Gets embedding optimization and model tuning advice
```

### Security Concern
```
"Need to review authentication flow for vulnerabilities"  
→ Routes to Security Auditor
→ Gets OWASP compliance audit and recommendations
```

## 📋 Available Agents

1. **master-coordinator** - Always-on intelligent routing (DEFAULT)
2. **principal-architect** - System architecture and technical leadership
3. **frontend-architect** - React, Next.js, UI/UX, 3D experiences  
4. **backend-architect** - APIs, databases, server-side logic
5. **ai-ml-architect** - AI integration, embeddings, recommendations
6. **security-auditor** - Security assessment and compliance
7. **performance-expert** - Optimization and Core Web Vitals
8. **devops-infrastructure** - Deployment and infrastructure
9. **qa-engineering** - Testing and quality assurance
10. **product-engineering-lead** - Feature development and UX
11. **technical-project-director** - Planning and coordination

## 🎯 Getting Started

### Option 1: Use Master Coordinator (Recommended)
Just start chatting! The Master Coordinator automatically routes your queries.

### Option 2: Direct Agent Access
If you know exactly which specialist you need, you can directly select them.

## 🔧 Configuration

### VS Code/Cursor Setup
1. Install GitHub Copilot Chat extension
2. Agent files are in `.github/chatmodes/`
3. Master Coordinator is set as default router

### Environment Variables
Ensure these are set for full functionality:
```bash
OPENAI_API_KEY=your_openai_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

## 📊 Success Metrics

The agent system is designed to:
- Route 95%+ of queries to the correct specialist
- Provide complete BookLocal context automatically  
- Deliver production-ready solutions with clear implementation steps
- Maintain consistent code quality and architectural patterns

---

**Your BookLocal AI development environment is now supercharged! 🚀**
EOF

echo "✅ Created AGENT_SYSTEM_GUIDE.md"

# Create environment check script
cat > scripts/check-agent-system.js << 'EOF'
#!/usr/bin/env node

/**
 * BookLocal Agent System Health Check
 * Verifies all agent files and configurations are properly set up
 */

const fs = require('fs');
const path = require('path');

const AGENT_DIR = '.github/chatmodes';
const REQUIRED_AGENTS = [
    'master-coordinator',
    'principal-architect', 
    'frontend-architect',
    'backend-architect',
    'ai-ml-architect',
    'security-auditor',
    'performance-expert',
    'devops-infrastructure',
    'qa-engineering',
    'product-engineering-lead',
    'technical-project-director'
];

function checkAgentSystem() {
    console.log('🤖 BookLocal Agent System Health Check');
    console.log('=====================================\n');

    let allGood = true;

    // Check agent directory exists
    if (!fs.existsSync(AGENT_DIR)) {
        console.log('❌ Agent directory missing:', AGENT_DIR);
        allGood = false;
        return;
    }

    console.log('✅ Agent directory found:', AGENT_DIR);

    // Check each required agent
    console.log('\n📋 Checking Agent Files:');
    REQUIRED_AGENTS.forEach(agent => {
        const filePath = path.join(AGENT_DIR, `${agent}.json.chatmode.md`);
        if (fs.existsSync(filePath)) {
            console.log(`  ✅ ${agent}`);
        } else {
            console.log(`  ❌ ${agent} - FILE MISSING`);
            allGood = false;
        }
    });

    // Check configuration files
    console.log('\n🔧 Checking Configuration:');
    const configFiles = ['.cursorrules', 'AGENT_SYSTEM_GUIDE.md'];
    configFiles.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`  ✅ ${file}`);
        } else {
            console.log(`  ⚠️  ${file} - Recommended but optional`);
        }
    });

    // Check project context
    const contextFile = path.join(AGENT_DIR, 'PROJECT_CONTEXT.md');
    if (fs.existsSync(contextFile)) {
        console.log(`  ✅ PROJECT_CONTEXT.md`);
    } else {
        console.log(`  ❌ PROJECT_CONTEXT.md - Required for context injection`);
        allGood = false;
    }

    console.log('\n📊 System Status:');
    if (allGood) {
        console.log('✅ All agent files and configurations are properly set up!');
        console.log('\n🚀 Your BookLocal AI Agent System is ready to use!');
        console.log('\n💡 Usage:');
        console.log('  • Master Coordinator automatically routes all queries');
        console.log('  • Full BookLocal context injected automatically');
        console.log('  • Production-ready solutions with expert guidance');
    } else {
        console.log('❌ Some agent files or configurations are missing');
        console.log('\n🔧 Please run the setup script again or check missing files');
    }
}

checkAgentSystem();
EOF

chmod +x scripts/check-agent-system.js
echo "✅ Created scripts/check-agent-system.js"

# Run the health check
echo
echo "🔍 Running Agent System Health Check..."
node scripts/check-agent-system.js

echo
echo "🎉 BookLocal AI Agent System Setup Complete!"
echo
echo "🚀 Next Steps:"
echo "1. Use Master Coordinator for automatic intelligent routing"
echo "2. All queries include full BookLocal project context automatically"
echo "3. Get expert solutions from specialized agents"
echo
echo "💡 Usage Tips:"
echo "  • Just start chatting - Master Coordinator handles routing"
echo "  • Each agent knows your complete project architecture" 
echo "  • Get production-ready code with comprehensive guidance"
echo
echo "📋 Check AGENT_SYSTEM_GUIDE.md for detailed usage instructions"
