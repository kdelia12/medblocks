const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Finding All Contracts in Network");
  console.log("=" .repeat(40));
  
  try {
    // Get signers
    const [admin] = await ethers.getSigners();
    console.log("👤 Admin:", admin.address);
    
    // Check network info
    const network = await ethers.provider.getNetwork();
    console.log("🌐 Network:", network.name, "(Chain ID:", network.chainId.toString() + ")");
    
    // Check block number
    const blockNumber = await ethers.provider.getBlockNumber();
    console.log("📦 Block number:", blockNumber);
    
    // Check balance
    const balance = await ethers.provider.getBalance(admin.address);
    console.log("💰 Admin balance:", ethers.formatEther(balance), "ETH");
    
    // Check common contract addresses
    const commonAddresses = [
      "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
      "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c",
      "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
      "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
    ];
    
    console.log("\n🔍 Checking common contract addresses:");
    
    for (const address of commonAddresses) {
      try {
        const code = await ethers.provider.getCode(address);
        if (code !== "0x") {
          console.log("✅ Contract found at:", address);
          console.log("   Code length:", code.length);
          
          // Try to get contract instance
          try {
            const contract = await ethers.getContractAt("MedicineSupplyChain", address);
            const totalBatches = await contract.getTotalBatches();
            console.log("   Total batches:", totalBatches.toString());
            console.log("   ✅ This is a MedicineSupplyChain contract!");
          } catch (error) {
            console.log("   ⚠️  Not a MedicineSupplyChain contract");
          }
        } else {
          console.log("❌ No contract at:", address);
        }
      } catch (error) {
        console.log("❌ Error checking:", address, "-", error.message);
      }
    }
    
    // Check recent transactions
    console.log("\n📜 Recent transactions:");
    try {
      const block = await ethers.provider.getBlock(blockNumber);
      console.log("   Block timestamp:", new Date(block.timestamp * 1000).toLocaleString());
      console.log("   Transactions:", block.transactions.length);
    } catch (error) {
      console.log("   ⚠️  Could not get block info:", error.message);
    }
    
  } catch (error) {
    console.error("❌ Script failed:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });

