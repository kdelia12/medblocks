const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking contract deployment...");
  
  try {
    // Contract address (update dengan address yang benar)
    const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    
    // Check if address is valid
    if (!ethers.isAddress(contractAddress)) {
      console.error("❌ Invalid contract address:", contractAddress);
      return;
    }
    
    // Check if contract exists at address
    const code = await ethers.provider.getCode(contractAddress);
    if (code === "0x") {
      console.error("❌ No contract found at address:", contractAddress);
      console.log("💡 Make sure to deploy contract first:");
      console.log("   npx hardhat run scripts/deploy-simple.js --network localhost");
      return;
    }
    
    console.log("✅ Contract found at:", contractAddress);
    
    // Get contract instance
    const contract = await ethers.getContractAt("MedicineSupplyChain", contractAddress);
    
    // Check contract info
    try {
      const totalBoxes = await contract.getTotalBatches();
      console.log("📦 Total boxes:", totalBoxes.toString());
    } catch (error) {
      console.log("⚠️  Could not get total boxes:", error.message);
    }
    
    // Check if admin role exists
    try {
      const adminRole = await contract.DEFAULT_ADMIN_ROLE();
      console.log("🔐 Admin role:", adminRole);
    } catch (error) {
      console.log("⚠️  Could not get admin role:", error.message);
    }
    
    // Check total entities
    try {
      const entities = await contract.getAllEntities();
      console.log("👥 Total entities:", entities.length);
    } catch (error) {
      console.log("⚠️  Could not get entities:", error.message);
    }
    
    console.log("✅ Contract is deployed and working!");
    
  } catch (error) {
    console.error("❌ Error checking contract:", error.message);
    console.log("💡 Make sure to deploy contract first:");
    console.log("   npx hardhat run scripts/deploy-simple.js --network localhost");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });