const hre = require("hardhat");

async function main() {
    console.log("=".repeat(70));
    console.log("GAS MEASUREMENT - Base Mainnet");
    console.log("WARNING: This script consumes REAL ETH!");
    console.log("=".repeat(70));

    // Setup
    const [deployer] = await hre.ethers.getSigners();
    const nonceManager = new hre.ethers.NonceManager(deployer);
    console.log("\nDeploying with account:", deployer.address);
    
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");
    
    const network = await hre.ethers.provider.getNetwork();
    console.log("Network:", network.name, "(Chain ID:", network.chainId.toString() + ")");

    // 1. Deploy Contract
    console.log("\n" + "=".repeat(70));
    console.log("1. Deploying Contract");
    console.log("=".repeat(70));
    
    const MedicineSupplyChain = await hre.ethers.getContractFactory("MedicineSupplyChain", nonceManager);
    const contract = await MedicineSupplyChain.deploy();
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    console.log("Contract deployed to:", contractAddress);
    
    const deployTx = contract.deploymentTransaction();
    const deployReceipt = await deployTx.wait();
    logGas("Deployment", deployReceipt);

    // Wait for contract to be fully available on network
    console.log("Waiting for contract to be available on network...");
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

    // Get roles
    const PRODUCER_ROLE = await contract.PRODUCER_ROLE();
    const DISTRIBUTOR_ROLE = await contract.DISTRIBUTOR_ROLE();
    const PHARMACY_ROLE = await contract.PHARMACY_ROLE();

    // 2. Register User with Role
    console.log("\n" + "=".repeat(70));
    console.log("2. Register User with Role (Producer)");
    console.log("=".repeat(70));
    
    const managedContract = contract.connect(nonceManager);

    const tx1 = await managedContract.registerUserWithRole(deployer.address, PRODUCER_ROLE, "PharmaCorp");
    const receipt1 = await tx1.wait();
    logGas("registerUserWithRole", receipt1);

    // 3. Grant Role (Distributor)
    console.log("\n" + "=".repeat(70));
    console.log("3. Grant Role (Distributor)");
    console.log("=".repeat(70));
    
    const tx2 = await managedContract.grantRole(DISTRIBUTOR_ROLE, deployer.address);
    const receipt2 = await tx2.wait();
    logGas("grantRole", receipt2);

    // 4. Grant Role (Pharmacy)
    console.log("\n" + "=".repeat(70));
    console.log("4. Grant Role (Pharmacy)");
    console.log("=".repeat(70));
    
    const tx3 = await managedContract.grantRole(PHARMACY_ROLE, deployer.address);
    const receipt3 = await tx3.wait();
    logGas("grantRole", receipt3);

    // 5. Create Batch
    console.log("\n" + "=".repeat(70));
    console.log("5. Create Batch");
    console.log("=".repeat(70));
    
    const batchId = Math.floor(Date.now() / 1000);
    const expiryDate = Math.floor(Date.now() / 1000) + 86400 * 365;
    
    const tx4 = await managedContract.createBatch(
        batchId,
        "Paracetamol 500mg",
        1000,
        5000,
        "Store in cool dry place",
        expiryDate
    );
    const receipt4 = await tx4.wait();
    logGas("createBatch", receipt4);

    // 6. Transfer Batch
    console.log("\n" + "=".repeat(70));
    console.log("6. Transfer Batch");
    console.log("=".repeat(70));
    
    const tx5 = await managedContract.transferBatch(batchId, deployer.address);
    const receipt5 = await tx5.wait();
    logGas("transferBatch", receipt5);

    // 7. Open Batch
    console.log("\n" + "=".repeat(70));
    console.log("7. Open Batch");
    console.log("=".repeat(70));
    
    const tx6 = await managedContract.openBatch(batchId);
    const receipt6 = await tx6.wait();
    logGas("openBatch", receipt6);

    // 8. Initiate Recall
    console.log("\n" + "=".repeat(70));
    console.log("8. Initiate Recall");
    console.log("=".repeat(70));
    
    const tx7 = await managedContract.initiateRecall(batchId, "Quality control issue");
    const receipt7 = await tx7.wait();
    logGas("initiateRecall", receipt7);

    // Summary
    console.log("\n" + "=".repeat(70));
    console.log("MEASUREMENT COMPLETE");
    console.log("=".repeat(70));
    console.log("Contract Address:", contractAddress);
    console.log("=".repeat(70));
}

function logGas(funcName, receipt) {
    const gasUsed = receipt.gasUsed;
    const gasPrice = receipt.gasPrice ?? receipt.effectiveGasPrice;
    const costWei = gasUsed * gasPrice;
    const costEth = hre.ethers.formatEther(costWei);

    // ETH price (update as needed)
    const ethPriceUsd = 2900;
    const costUsd = parseFloat(costEth) * ethPriceUsd;

    console.log(`\n ${funcName}`);
    console.log(`  Gas Used: ${gasUsed.toString()}`);
    console.log(`  Gas Price: ${hre.ethers.formatUnits(gasPrice, "gwei")} gwei`);
    console.log(`  Cost: ${costEth} ETH (~$${costUsd.toFixed(4)} USD)`);
    console.log(`  Tx Hash: ${receipt.hash}`);
}

main().catch((error) => {
    console.error("\n❌ Error:", error);
    process.exitCode = 1;
});
