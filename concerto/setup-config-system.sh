#!/bin/bash
# Configuration Management System - Setup Script

echo "==============================================="
echo "  CONCERTO Configuration Management Setup"
echo "==============================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Paths
ENGINE_DIR="./engine"
SERVER_DIR="$ENGINE_DIR/dashboard/server"
CLIENT_DIR="$ENGINE_DIR/dashboard/client"

# Step 1: Install backend dependencies
echo -e "${BLUE}[1/4]${NC} Installing backend dependencies..."
if [ ! -d "$ENGINE_DIR/node_modules" ]; then
    cd "$ENGINE_DIR"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}⚠ Failed to install engine dependencies${NC}"
        exit 1
    fi
    cd ../..
else
    echo -e "${GREEN}✓ Backend dependencies already installed${NC}"
fi

# Step 2: Verify YAML package
echo ""
echo -e "${BLUE}[2/4]${NC} Verifying YAML package..."
if npm list yaml --prefix "$ENGINE_DIR" | grep -q "yaml@"; then
    echo -e "${GREEN}✓ YAML package found${NC}"
else
    echo -e "${YELLOW}⚠ Installing YAML package...${NC}"
    npm install yaml --prefix "$ENGINE_DIR"
fi

# Step 3: Create required directories
echo ""
echo -e "${BLUE}[3/4]${NC} Creating required directories..."
mkdir -p ./concerto-config/spec
mkdir -p ./concerto-config/dev/prompts
mkdir -p ./concerto-config/test/prompts
mkdir -p ./concerto-config/deploy/prompts
mkdir -p ./maestros/core
mkdir -p ./maestros/dev
mkdir -p ./maestros/qa
mkdir -p ./workflows
echo -e "${GREEN}✓ Directories created${NC}"

# Step 4: Summary
echo ""
echo -e "${BLUE}[4/4]${NC} Setup complete!"
echo ""
echo -e "${GREEN}================================"
echo "  Ready to Run"
echo "================================${NC}"
echo ""
echo "Backend (Terminal 1):"
echo -e "  ${YELLOW}cd engine && npm run dashboard${NC}"
echo "  Server will run on: http://localhost:3500"
echo ""
echo "Frontend (Terminal 2):"
echo -e "  ${YELLOW}cd engine/dashboard/client && npm install && npm run dev${NC}"
echo "  Frontend will run on: http://localhost:3000"
echo ""
echo "Then:"
echo -e "  1. Open ${YELLOW}http://localhost:3000${NC} in browser"
echo -e "  2. Click Settings button (⚙️) in top bar"
echo -e "  3. Start managing configurations!"
echo ""
echo "Documentation:"
echo -e "  - See ${YELLOW}IMPLEMENTATION_SUMMARY.md${NC} for technical details"
echo -e "  - See ${YELLOW}CONFIGURATION_MANAGEMENT.md${NC} for user guide"
echo ""
