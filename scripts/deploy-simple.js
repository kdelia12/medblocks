const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Medicine Supply Chain Contract...");
  
  try {
    // Deploy contract
    console.log("📄 Deploying contract...");
    const MedicineSupplyChain = await ethers.getContractFactory("MedicineSupplyChain");
    const medicineSupplyChain = await MedicineSupplyChain.deploy();
    await medicineSupplyChain.waitForDeployment();
    
    const contractAddress = await medicineSupplyChain.getAddress();
    console.log("✅ Contract deployed to:", contractAddress);
    
    // Get deployer info
    const [deployer] = await ethers.getSigners();
    console.log("👤 Deployer address:", deployer.address);
    
    // Check admin role
    const DEFAULT_ADMIN_ROLE = await medicineSupplyChain.DEFAULT_ADMIN_ROLE();
    const isAdmin = await medicineSupplyChain.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
    console.log("🔐 Deployer has admin role:", isAdmin);
    
    // Display system information
    console.log("\n📝 System Information:");
    console.log("Contract Address:", contractAddress);
    console.log("Admin Address:", deployer.address);
    console.log("Network: Hardhat Local (Chain ID: 1337)");
    console.log("RPC URL: http://localhost:8545");
    
    console.log("\n🎉 Contract deployed successfully!");
    console.log("💡 Use the admin role to assign other roles manually");
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
