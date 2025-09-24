#!/bin/bash

# Orbix Smart Contract Deployment Script
# This script deploys the Orbix payment contracts to Aptos testnet

echo "🚀 Deploying Orbix Smart Contracts to Aptos Testnet"
echo "=================================================="

# Check if Aptos CLI is installed
if ! command -v aptos &> /dev/null; then
    echo "❌ Aptos CLI is not installed. Please install it first:"
    echo "   https://aptos.dev/cli-tools/aptos-cli-tool/install-aptos-cli"
    exit 1
fi

# Navigate to contracts directory
cd contracts || exit 1

echo "📁 Working directory: $(pwd)"

# Check if Move.toml exists
if [ ! -f "Move.toml" ]; then
    echo "❌ Move.toml not found. Make sure you're in the contracts directory."
    exit 1
fi

# Compile the contracts
echo "🔨 Compiling contracts..."
if aptos move compile; then
    echo "✅ Compilation successful"
else
    echo "❌ Compilation failed"
    exit 1
fi

# Deploy to testnet
echo "🌐 Deploying to Aptos testnet..."
echo "Note: Make sure your testnet profile is configured and funded"
echo "Run 'aptos init --profile testnet' if not configured"

if aptos move publish --profile testnet --assume-yes; then
    echo "✅ Deployment successful!"
    
    # Get the deployed address
    DEPLOYED_ADDRESS=$(aptos account list --profile testnet | grep "default" | awk '{print $2}')
    echo "📍 Deployed contract address: $DEPLOYED_ADDRESS"
    
    echo ""
    echo "🎯 Next Steps:"
    echo "1. Update PAYMENT_PROCESSOR_ADDRESS in src/utils/aptos.ts"
    echo "2. Update VAT_REFUND_ADDRESS in src/utils/aptos.ts"
    echo "3. Replace '0x1' with: $DEPLOYED_ADDRESS"
    echo ""
    echo "4. Initialize the contracts:"
    echo "   aptos move run --function-id ${DEPLOYED_ADDRESS}::payment_processor::initialize --profile testnet"
    echo "   aptos move run --function-id ${DEPLOYED_ADDRESS}::vat_refund::initialize --profile testnet"
    
else
    echo "❌ Deployment failed"
    echo "Make sure:"
    echo "1. Your testnet profile is configured: aptos init --profile testnet"
    echo "2. Your account is funded: https://faucet.testnet.aptoslabs.com/"
    exit 1
fi

echo ""
echo "🎉 Deployment complete!"