# Medicine Supply Chain Frontend

Modern React frontend untuk berinteraksi dengan Medicine Supply Chain smart contract.

## Features

- 🔗 **Wallet Integration**: MetaMask integration
- 👤 **Role-based UI**: Different interfaces based on user role
- 💊 **Medicine Management**: Mint, transfer, and query medicines
- 📊 **Real-time Updates**: Live contract interaction
- 📱 **Responsive Design**: Mobile-friendly interface
- 🎨 **Modern UI**: Clean and intuitive design

## Prerequisites

- Node.js (versi 16 atau lebih baru)
- MetaMask browser extension
- Hardhat local network running

## Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm start
```

### 3. Open Browser
Navigate to `http://localhost:3000`

## Usage

### 1. Connect Wallet
- Click "Connect Wallet" button
- Approve MetaMask connection
- Your role will be automatically detected

### 2. Role-based Actions

#### Admin
- Assign roles to users
- View all medicines

#### Producer
- Mint new medicines
- Transfer medicines to distributors/pharmacies

#### Distributor
- Transfer medicines to pharmacies

#### Pharmacy
- Transfer medicines to other pharmacies

#### All Users
- Query medicine details
- View transfer history

### 3. Medicine Operations

#### Mint Medicine (Producer only)
1. Enter Medicine ID (unique number)
2. Enter Medicine Name
3. Click "Mint Medicine"

#### Transfer Medicine
1. Enter Medicine ID
2. Enter recipient address
3. Click "Transfer Medicine"

#### Query Medicine
1. Enter Medicine ID
2. Click "Query Medicine"
3. View details and transfer history

## Network Configuration

The frontend is configured to connect to:
- **Local Network**: http://localhost:8545
- **Contract Address**: 0x5FbDB2315678afecb367f032d93F642f64180aa3
- **Chain ID**: 31337

## Troubleshooting

### MetaMask Not Detected
- Install MetaMask browser extension
- Refresh the page
- Make sure MetaMask is unlocked

### Contract Not Found
- Ensure Hardhat local network is running
- Check contract address is correct
- Verify contract is deployed

### Transaction Failed
- Check if you have the required role
- Verify recipient address is valid
- Ensure you have sufficient ETH for gas

### Network Mismatch
- Add local network to MetaMask:
  - Network Name: "Hardhat Local"
  - RPC URL: "http://localhost:8545"
  - Chain ID: 31337
  - Currency Symbol: ETH

## Development

### Project Structure
```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── App.js          # Main application component
│   ├── App.css         # Component styles
│   ├── index.js        # React entry point
│   └── index.css      # Global styles
├── package.json        # Dependencies
└── README.md          # This file
```

### Key Components

#### App.js
- Main application component
- Wallet connection logic
- Contract interaction functions
- Role-based UI rendering

#### Contract Integration
- Uses ethers.js for blockchain interaction
- Handles transaction signing
- Manages contract state

#### UI Components
- Role-based interface
- Form handling
- Status notifications
- Medicine display

## Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Security Notes

- Never share your private keys
- Only use test accounts for development
- Verify contract addresses before transactions
- Be cautious with real funds

## Support

For issues and questions:
- Check browser console for errors
- Verify network connection
- Ensure all prerequisites are met
- Check contract deployment status




