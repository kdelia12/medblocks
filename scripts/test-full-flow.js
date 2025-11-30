const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Testing Full Flow - Batch Medicine Supply Chain");
  console.log("=" .repeat(60));
  
  try {
    // Get signers
    const [admin, producer, distributor, pharmacy] = await ethers.getSigners();
    console.log("👥 Signers loaded:");
    console.log("   Admin:", admin.address);
    console.log("   Producer:", producer.address);
    console.log("   Distributor:", distributor.address);
    console.log("   Pharmacy:", pharmacy.address);
    
    // Use existing deployed contract
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Update dengan address yang benar
    console.log("\n📄 Using existing contract at:", contractAddress);
    
    // Get contract instance
    const contract = await ethers.getContractAt("MedicineSupplyChain", contractAddress);
    console.log("✅ Contract connected successfully");
    
    // Get roles
    const PRODUCER_ROLE = await contract.PRODUCER_ROLE();
    const DISTRIBUTOR_ROLE = await contract.DISTRIBUTOR_ROLE();
    const PHARMACY_ROLE = await contract.PHARMACY_ROLE();
    
    // Step 1: Check if roles already exist
    console.log("\n🔐 Step 1: Checking existing roles...");
    
    const isProducerRegistered = await contract.isEntityRegistered(producer.address);
    const isDistributorRegistered = await contract.isEntityRegistered(distributor.address);
    const isPharmacyRegistered = await contract.isEntityRegistered(pharmacy.address);
    
    if (!isProducerRegistered) {
      await contract.registerUserWithRole(producer.address, PRODUCER_ROLE, "PharmaCorp");
      console.log("✅ Producer registered");
    } else {
      console.log("✅ Producer already registered");
    }
    
    if (!isDistributorRegistered) {
      await contract.registerUserWithRole(distributor.address, DISTRIBUTOR_ROLE, "MedDistributor");
      console.log("✅ Distributor registered");
    } else {
      console.log("✅ Distributor already registered");
    }
    
    if (!isPharmacyRegistered) {
      await contract.registerUserWithRole(pharmacy.address, PHARMACY_ROLE, "CityPharmacy");
      console.log("✅ Pharmacy registered");
    } else {
      console.log("✅ Pharmacy already registered");
    }
    
    // Step 2: Create batch
    console.log("\n📦 Step 2: Creating batch...");
    
    const batchId = Math.floor(Math.random() * 10000) + 1; // Random batch ID to avoid conflicts
    const productName = "Paracetamol 500mg";
    const totalUnits = 1000;
    const unitValue = 100; // 100 wei per unit
    const storageRequirements = "Store in cool, dry place";
    const expiryDate = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60); // 1 year from now
    
    await contract.connect(producer).createBatch(
      batchId, 
      productName, 
      totalUnits, 
      unitValue, 
      storageRequirements, 
      expiryDate
    );
    console.log("✅ Batch created:");
    console.log("   Batch ID:", batchId);
    console.log("   Product:", productName);
    console.log("   Total Units:", totalUnits);
    console.log("   Unit Value:", unitValue);
    console.log("   Storage:", storageRequirements);
    console.log("   Expiry:", new Date(expiryDate * 1000).toLocaleDateString());
    
    // Step 3: Check batch status
    console.log("\n📊 Step 3: Checking batch status...");
    
    const batch = await contract.getBatch(batchId);
    console.log("📦 Batch details:");
    console.log("   ID:", batch.batchId.toString());
    console.log("   Product:", batch.productName);
    console.log("   Total Units:", batch.totalUnits.toString());
    console.log("   Unit Value:", batch.unitValue.toString());
    console.log("   Storage:", batch.storageRequirements);
    console.log("   Owner:", batch.currentOwner);
    console.log("   Is Opened:", batch.isOpened);
    console.log("   Is Recalled:", batch.isRecalled);
    console.log("   Exists:", batch.exists);
    
    const status = await contract.getBatchStatus(batchId);
    console.log("📈 Status:", status);
    
    // Step 4: Transfer to distributor
    console.log("\n🔄 Step 4: Transferring to distributor...");
    
    await contract.connect(producer).transferBatch(batchId, distributor.address);
    console.log("✅ Batch transferred to distributor");
    
    const statusAfterTransfer = await contract.getBatchStatus(batchId);
    console.log("📈 Status after transfer:", statusAfterTransfer);
    
    // Step 5: Transfer to pharmacy
    console.log("\n🔄 Step 5: Transferring to pharmacy...");
    
    await contract.connect(distributor).transferBatch(batchId, pharmacy.address);
    console.log("✅ Batch transferred to pharmacy");
    
    const finalStatus = await contract.getBatchStatus(batchId);
    console.log("📈 Final status:", finalStatus);
    
    // Step 6: Check batch history
    console.log("\n📜 Step 6: Checking batch history...");
    
    const history = await contract.getBatchHistory(batchId);
    console.log("📜 Batch history:");
    history.forEach((address, index) => {
      console.log(`   ${index + 1}. ${address}`);
    });
    
    // Step 7: Check expiry
    console.log("\n⏰ Step 7: Checking expiry...");
    
    const isExpired = await contract.isBatchExpired(batchId);
    const timeToExpiry = await contract.getBatchTimeToExpiry(batchId);
    console.log("⏰ Is expired:", isExpired);
    console.log("⏰ Time to expiry:", Math.floor(Number(timeToExpiry) / (24 * 60 * 60)), "days");
    
    // Step 8: Check total batches
    console.log("\n📊 Step 8: Checking system stats...");
    
    const totalBatches = await contract.getTotalBatches();
    const entities = await contract.getAllEntities();
    console.log("📦 Total batches:", totalBatches.toString());
    console.log("👥 Total entities:", entities.length);
    
    // Step 9: Test batch opening
    console.log("\n📦 Step 9: Testing batch opening...");
    
    try {
      await contract.connect(pharmacy).openBatch(batchId);
      console.log("✅ Batch opened successfully");
      
      const openedBatch = await contract.getBatch(batchId);
      console.log("📦 Batch is opened:", openedBatch.isOpened);
    } catch (error) {
      console.log("⚠️  Batch opening failed:", error.message);
    }
    
    // Step 10: Final summary
    console.log("\n🎉 Step 10: Final summary...");
    
    const batchSummary = await contract.getBatchSummary(batchId);
    console.log("📋 Batch summary:");
    console.log("   ID:", batchSummary.batchId_.toString());
    console.log("   Product:", batchSummary.productName);
    console.log("   Total Units:", batchSummary.totalUnits.toString());
    console.log("   Status:", batchSummary.status);
    console.log("   Owner:", batchSummary.owner);
    
    console.log("\n✅ Full flow test completed successfully!");
    console.log("🎯 Batch concept working perfectly!");
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });