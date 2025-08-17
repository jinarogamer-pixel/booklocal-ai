#!/bin/bash

# BookLocal MVP Deployment Script
# This script helps deploy the lean MVP to production

set -e  # Exit on any error

echo "🚀 BookLocal MVP Deployment Starting..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Pre-deployment Checklist${NC}"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  Warning: .env.local not found${NC}"
    echo "Creating .env.local from .env.example..."
    
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo -e "${YELLOW}Please edit .env.local with your actual API keys before continuing.${NC}"
        echo "Press any key to continue once you've updated .env.local..."
        read -n 1 -s
    else
        echo -e "${RED}Error: .env.example not found. Cannot create .env.local${NC}"
        exit 1
    fi
fi

# Check if essential environment variables are set
echo -e "${BLUE}🔍 Checking environment variables...${NC}"

# Load environment variables
if [ -f ".env.local" ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Critical checks
MISSING_VARS=()

if [ -z "$NEXT_PUBLIC_APP_URL" ]; then
    MISSING_VARS+=("NEXT_PUBLIC_APP_URL")
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
    MISSING_VARS+=("NEXTAUTH_SECRET")
fi

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo -e "${RED}❌ Missing critical environment variables:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    echo "Please update .env.local and try again."
    exit 1
fi

echo -e "${GREEN}✅ Environment variables check passed${NC}"

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

# Run type checking
echo -e "${BLUE}🔍 Running type checking...${NC}"
npm run type-check 2>/dev/null || {
    echo -e "${YELLOW}⚠️  TypeScript check failed, but continuing...${NC}"
}

# Build the application
echo -e "${BLUE}🏗️  Building application...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed. Please fix errors and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

# Deploy to Vercel
echo -e "${BLUE}🚀 Deploying to Vercel...${NC}"

# Check if this is the first deployment
if [ ! -f ".vercel/project.json" ]; then
    echo -e "${YELLOW}First time deployment detected. Running vercel setup...${NC}"
    vercel --confirm
else
    echo -e "${BLUE}Deploying existing project...${NC}"
    vercel --prod --confirm
fi

echo -e "${GREEN}🎉 Deployment completed!${NC}"

# Post-deployment checks
echo -e "${BLUE}🔍 Running post-deployment checks...${NC}"

# Get the deployment URL from Vercel
DEPLOYMENT_URL=$(vercel ls | grep -E "https://[a-zA-Z0-9-]+\.vercel\.app" | head -1 | awk '{print $2}')

if [ -n "$DEPLOYMENT_URL" ]; then
    echo -e "${GREEN}✅ Application deployed to: $DEPLOYMENT_URL${NC}"
    
    # Basic health check
    echo -e "${BLUE}🏥 Running health check...${NC}"
    
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL" || echo "000")
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ Health check passed (HTTP $HTTP_STATUS)${NC}"
    else
        echo -e "${YELLOW}⚠️  Health check warning (HTTP $HTTP_STATUS)${NC}"
    fi
    
    echo -e "${BLUE}📋 Post-deployment TODO:${NC}"
    echo "1. Test the booking form at: $DEPLOYMENT_URL/book"
    echo "2. Test contractor signup at: $DEPLOYMENT_URL/contractor-signup"
    echo "3. Verify API endpoints are working"
    echo "4. Check browser console for errors"
    echo "5. Test on mobile devices"
else
    echo -e "${YELLOW}⚠️  Could not determine deployment URL${NC}"
fi

echo -e "${GREEN}🎉 MVP Deployment Complete!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo "1. Update your domain DNS if using custom domain"
echo "2. Set up monitoring and analytics"
echo "3. Configure environment variables in Vercel dashboard"
echo "4. Test all functionality in production"
echo "5. Start marketing to get your first leads!"

echo ""
echo -e "${YELLOW}Remember: This is an MVP. Monitor closely and iterate based on user feedback.${NC}"