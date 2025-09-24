@echo off
REM Orbix Smart Contract Deployment Script for Windows
REM This script deploys the Orbix payment contracts to Aptos testnet

echo 🚀 Deploying Orbix Smart Contracts to Aptos Testnet
echo ==================================================

REM Check if Aptos CLI is installed
aptos --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Aptos CLI is not installed. Please install it first:
    echo    https://aptos.dev/cli-tools/aptos-cli-tool/install-aptos-cli
    exit /b 1
)

REM Navigate to contracts directory
cd contracts
if %errorlevel% neq 0 (
    echo ❌ Failed to navigate to contracts directory
    exit /b 1
)

echo 📁 Working directory: %cd%

REM Check if Move.toml exists
if not exist "Move.toml" (
    echo ❌ Move.toml not found. Make sure you're in the contracts directory.
    exit /b 1
)

REM Compile the contracts
echo 🔨 Compiling contracts...
aptos move compile
if %errorlevel% neq 0 (
    echo ❌ Compilation failed
    exit /b 1
)
echo ✅ Compilation successful

REM Deploy to testnet
echo 🌐 Deploying to Aptos testnet...
echo Note: Make sure your testnet profile is configured and funded
echo Run 'aptos init --profile testnet' if not configured

aptos move publish --profile testnet --assume-yes
if %errorlevel% neq 0 (
    echo ❌ Deployment failed
    echo Make sure:
    echo 1. Your testnet profile is configured: aptos init --profile testnet
    echo 2. Your account is funded: https://faucet.testnet.aptoslabs.com/
    exit /b 1
)

echo ✅ Deployment successful!

REM Get the deployed address (simplified for Windows)
echo 📍 Getting deployed contract address...
aptos account list --profile testnet

echo.
echo 🎯 Next Steps:
echo 1. Copy the contract address from above
echo 2. Update PAYMENT_PROCESSOR_ADDRESS in src/utils/aptos.ts
echo 3. Update VAT_REFUND_ADDRESS in src/utils/aptos.ts
echo 4. Replace '0x1' with your deployed address
echo.
echo 5. Initialize the contracts:
echo    aptos move run --function-id YOUR_ADDRESS::payment_processor::initialize --profile testnet
echo    aptos move run --function-id YOUR_ADDRESS::vat_refund::initialize --profile testnet

echo.
echo 🎉 Deployment complete!