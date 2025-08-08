#!/bin/bash

# install.sh - Automated installation and setup script
# The script will terminate if any step fails

set -e  # Exit immediately on error

echo "Starting installation script..."

# Step 1: Execute npm install
echo "Step 1: Executing npm install..."
npm install
echo "✓ npm install completed"

# Step 2: Move .1024 file to /home/runner/.clackyai/.environments.yaml
echo "Step 2: Moving configuration file..."
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

# Step 3: Check PostgreSQL database connection
echo "Step 3: Checking PostgreSQL database connection..."
if ! command -v psql &> /dev/null; then
    echo "❌ psql command not found"
    echo "Please check if PostgreSQL is installed"
    echo "Suggestion: Please check middleware-related playbook to install postgres database"
    exit 1
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

# Set database connection parameters (use default values if environment variables are not set)
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-123456}
DB_NAME=${DB_NAME:-voting_system}

echo "Attempting to connect to database: $DB_HOST:$DB_PORT/$DB_NAME (user: $DB_USER)"

# Attempt to connect to database
if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\q" &> /dev/null; then
    echo "❌ PostgreSQL database connection failed"
    echo "Connection parameters: Host=$DB_HOST, Port=$DB_PORT, User=$DB_USER, Database=$DB_NAME"
    echo "Please check if database service is running and connection parameters are correct"
    echo "Suggestion: Agent please check middleware-related playbook to install postgres database"
    exit 1
fi
echo "✓ PostgreSQL database connection successful"

# Step 4: Execute database initialization
echo "Step 4: Executing database initialization..."
npx tsx scripts/init-db.ts
echo "✓ Database initialization completed"

# Step 5: Execute npm run build
echo "Step 5: Executing build..."
npm run build
echo "✓ Build completed"

# Step 6: Test server connection (server needs to be started first)
echo "Step 6: Testing server connection..."
echo "Note: Please ensure server is running on localhost:3000"
if curl -s http://localhost:3000/ > /dev/null; then
    echo "✓ Server connection test passed"
else
    echo "⚠️ Server connection test failed, please check if server is running"
    echo "You can run 'npm run dev' to start the development server"
fi

# Step 7: Execute ls
echo "Step 7: Listing current directory files..."
ls -la
echo "✓ Directory listing completed"

# Step 8: Print package.json file to console
echo "Step 8: Displaying package.json content..."
echo "==================== package.json ===================="
cat package.json
echo "==================== package.json end ===================="
echo "✓ package.json display completed"

# Step 9: Clean up files
echo "Step 9: Cleaning up files..."

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