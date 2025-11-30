# Scripts Directory

This directory contains essential scripts for the Medicine Supply Chain project.

## Essential Scripts

### 1. `deploy-simple.js`
- **Purpose**: Deploy the MedicineSupplyChain contract
- **Usage**: `npx hardhat run scripts/deploy-simple.js --network localhost`
- **Description**: Deploys the contract and grants admin role to the deployer

### 2. `extract-abi.js`
- **Purpose**: Extract ABI from compiled contract artifacts
- **Usage**: `npx hardhat run scripts/extract-abi.js`
- **Description**: Generates `frontend/src/contractABI.json` for frontend integration

## Test Scripts

### 3. `test-full-flow.js`
- **Purpose**: Test complete system functionality
- **Usage**: `npx hardhat run scripts/test-full-flow.js --network localhost`
- **Description**: Tests all features including batch creation, transfer, recall, pause/unpause

### 4. `test-batch-available.js`
- **Purpose**: Test "Batch Available" feature for all roles
- **Usage**: `npx hardhat run scripts/test-batch-available.js --network localhost`
- **Description**: Tests batch ownership tracking and transfer functionality

## Usage Instructions

1. **Start Hardhat Node**: `npx hardhat node`
2. **Deploy Contract**: `npx hardhat run scripts/deploy-simple.js --network localhost`
3. **Extract ABI**: `npx hardhat run scripts/extract-abi.js`
4. **Test System**: `npx hardhat run scripts/test-full-flow.js --network localhost`

## File Cleanup

The following test files have been removed as they are no longer needed:
- `debug-batch-functions.js` - Debugging script (replaced by comprehensive tests)
- `test-auto-increment.js` - Auto-increment test (feature removed)
- `test-batch-operations.js` - Basic batch test (replaced by full flow test)
- `test-batch-only.js` - Batch-only test (replaced by full flow test)
- `test-form-vs-result-cards.js` - UI test (replaced by full flow test)
- `test-frontend-batch.js` - Frontend test (replaced by full flow test)
- `test-result-cards.js` - Result cards test (replaced by full flow test)
- `test-tx-hash-display.js` - TX hash test (replaced by full flow test)
- `test-tx-hash-tracking.js` - TX hash tracking test (replaced by full flow test)

## Current Status

✅ **Clean and organized** - Only essential scripts remain
✅ **Comprehensive testing** - `test-full-flow.js` covers all functionality
✅ **Easy maintenance** - Clear purpose for each script
✅ **Production ready** - All scripts are essential for deployment and testing