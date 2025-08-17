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
