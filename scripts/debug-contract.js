const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Debug Contract Status");
  console.log("=" .repeat(40));
  
  try {
    // Get signers
    const [admin, producer, distributor, pharmacy] = await ethers.getSigners();
    console.log("👥 Signers:");
    console.log("   Admin:", admin.address);
    console.log("   Producer:", producer.address);
    console.log("   Distributor:", distributor.address);
    console.log("   Pharmacy:", pharmacy.address);
    
    // Check contract address
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    console.log("\n📄 Checking contract at:", contractAddress);
    
    // Check if address is valid
    if (!ethers.isAddress(contractAddress)) {
      console.error("❌ Invalid contract address:", contractAddress);
      return;
    }
    
    // Check if contract exists at address
    const code = await ethers.provider.getCode(contractAddress);
    console.log("📄 Contract code length:", code.length);
    
    if (code === "0x") {
      console.error("❌ No contract found at address:", contractAddress);
      console.log("💡 Solutions:");
      console.log("   1. Deploy contract first: npx hardhat run scripts/deploy-simple.js --network localhost");
      console.log("   2. Check if Hardhat node is running: npx hardhat node");
      console.log("   3. Use correct contract address");
      return;
    }
    
    console.log("✅ Contract found at address");
    
    // Try to get contract instance
    try {
      const contract = await ethers.getContractAt("MedicineSupplyChain", contractAddress);
      console.log("✅ Contract instance created");
      
      // Test basic functions
      try {
        const totalBatches = await contract.getTotalBatches();
        console.log("📦 Total batches:", totalBatches.toString());
      } catch (error) {
        console.log("⚠️  Could not get total batches:", error.message);
      }
      
      // Test role functions
      try {
        const PRODUCER_ROLE = await contract.PRODUCER_ROLE();
        console.log("🔐 Producer role:", PRODUCER_ROLE);
        
        const hasRole = await contract.hasRole(PRODUCER_ROLE, producer.address);
        console.log("👤 Producer has role:", hasRole);
      } catch (error) {
        console.log("⚠️  Could not check roles:", error.message);
      }
      
      // Test entity functions
      try {
        const isRegistered = await contract.isEntityRegistered(producer.address);
        console.log("👤 Producer registered:", isRegistered);
      } catch (error) {
        console.log("⚠️  Could not check entity registration:", error.message);
      }
      
    } catch (error) {
      console.error("❌ Could not create contract instance:", error.message);
    }
    
    // Check network info
    console.log("\n🌐 Network Info:");
    const network = await ethers.provider.getNetwork();
    console.log("   Chain ID:", network.chainId.toString());
    console.log("   Name:", network.name);
    
    // Check block number
    const blockNumber = await ethers.provider.getBlockNumber();
    console.log("   Block number:", blockNumber);
    
    // Check balance
    const balance = await ethers.provider.getBalance(admin.address);
    console.log("   Admin balance:", ethers.formatEther(balance), "ETH");
    
  } catch (error) {
    console.error("❌ Debug failed:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });

