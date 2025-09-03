#!/bin/bash

# install.sh - Automated installation and setup script
# The script will terminate if any step fails

set -e  # Exit immediately on error

echo "Starting installation script..."

# Step 1: Move .1024 file to /home/runner/.clackyai/.environments.yaml
echo "Step 1: Moving configuration file..."
if ! mkdir -p /home/runner/.clackyai/; then
    echo "❌ Failed to create directory /home/runner/.clackyai/"
    echo "Suggestion: Agent please check the 'Handling environment configuration file' playbook"
    exit 1
fi

if ! cp .1024 /home/runner/.clackyai/.environments.yaml; then
    echo "❌ Failed to copy .1024 file to /home/runner/.clackyai/.environments.yaml"
    echo "Please check if .1024 file exists and target path permissions"
    echo "Suggestion: Please check the 'Handling environment configuration file' playbook"
    exit 1
fi
echo "✓ Configuration file move completed"

# Step 2: Check PostgreSQL database connection
echo "Step 2: Checking PostgreSQL database connection..."
if which psql >/dev/null 2>&1; then
  echo "psql exists"
else
  echo "psql not found"
  echo "Suggestion: Please check middleware-related playbook to install postgres database and run install.sh again"
fi

# Check if .env.local file exists, copy from .env.example if it doesn't
if [ ! -f ".env.local" ]; then
    echo "Detected .env.local file does not exist, copying from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo "✓ .env.local file created"
    else
        echo "❌ .env.example file does not exist, cannot create .env.local"
        exit 1
    fi
else
    echo "✓ .env.local file already exists"
fi

# Read database configuration from .env.local
if [ -f ".env.local" ]; then
    source .env.local
    echo "✓ Environment variables loaded"
else
    echo "❌ Cannot read .env.local file"
    exit 1
fi

# Step 3: Execute database initialization
echo "Step 3: Executing database initialization..."
npm run db:init
echo "✓ Database initialization completed"

# Step 4: Execute ls
echo "Step 4: Listing current directory files..."
ls -la
echo "✓ Directory listing completed"

# Step 5: Print package.json file to console
echo "Step 5: Displaying package.json content..."
echo "==================== package.json ===================="
cat package.json
echo "==================== package.json end ===================="
echo "✓ package.json display completed"

# Step 6: Print tailwind.config.ts file to console
echo "Step 6: Displaying tailwind.config.ts content..."
echo "==================== tailwind.config.ts ===================="
cat tailwind.config.ts
echo "==================== tailwind.config.ts end ===================="
echo "✓ tailwind.config.ts display completed"

# Step 7: Clean up files
echo "Step 7: Cleaning up files..."

# Delete .1024 file
if [ -f ".1024" ]; then
    rm -f .1024
    echo "✓ .1024 file deleted"
else
    echo "✓ .1024 file does not exist, skipping deletion"
fi

# Delete installation script
# echo "All steps executed successfully!"
# echo "Deleting installation script..."
# rm -f "$0"
# echo "✓ Installation script deleted"

echo "🎉 Installation complete! All steps have been executed successfully."