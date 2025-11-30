const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Skenario Pengujian BAB 4 - MedicineSupplyChain", function () {
    let medicineSupplyChain;
    let owner, producer, distributor, pharmacy, otherAccount;
    let producerRole, distributorRole, pharmacyRole, adminRole;

    // Helper for informative logging
    const logResult = (tcId, desc, input, expected, actual, status) => {
        console.log(`\n[${tcId}] ${desc}`);
        console.log(`   Input    : ${input}`);
        console.log(`   Expected : ${expected}`);
        console.log(`   Actual   : ${actual}`);
        console.log(`   Status   : ${status}`);
        console.log("---------------------------------------------------");
    };

    before(async function () {
        console.log("\nStarting Thesis Scenarios Test Execution...");
        console.log("===================================================");
    });

    beforeEach(async function () {
        [owner, producer, distributor, pharmacy, otherAccount] = await ethers.getSigners();

        const MedicineSupplyChain = await ethers.getContractFactory("MedicineSupplyChain");
        medicineSupplyChain = await MedicineSupplyChain.deploy();
        await medicineSupplyChain.waitForDeployment();

        producerRole = await medicineSupplyChain.PRODUCER_ROLE();
        distributorRole = await medicineSupplyChain.DISTRIBUTOR_ROLE();
        pharmacyRole = await medicineSupplyChain.PHARMACY_ROLE();
        adminRole = await medicineSupplyChain.DEFAULT_ADMIN_ROLE();
    });

    it("TC-01: Deployment & Inisialisasi - Owner memiliki Admin Role", async function () {
        const isAdmin = await medicineSupplyChain.hasRole(adminRole, owner.address);

        expect(isAdmin).to.be.true;
        logResult("TC-01", "Deployment & Inisialisasi",
            `Owner Address: ${owner.address}`,
            "Owner has Admin Role (true)",
            `isAdmin: ${isAdmin}`,
            "PASSED"
        );
    });

    it("TC-02: Registrasi Aktor - Role berhasil diberikan", async function () {
        const inputName = "Producer A";
        await medicineSupplyChain.connect(owner).registerUserWithRole(producer.address, producerRole, inputName);
        const isProducer = await medicineSupplyChain.hasRole(producerRole, producer.address);
        const entity = await medicineSupplyChain.getEntity(producer.address);

        expect(isProducer).to.be.true;
        logResult("TC-02", "Registrasi Aktor",
            `Address: ${producer.address}, Role: PRODUCER, Name: ${inputName}`,
            "Role assigned & Entity registered",
            `isProducer: ${isProducer}, Name: ${entity.name}`,
            "PASSED"
        );
    });

    it("TC-03: Create Batch (Positif) - Batch tersimpan, Event terpancar", async function () {
        // Setup producer
        await medicineSupplyChain.connect(owner).registerUserWithRole(producer.address, producerRole, "Producer A");

        const batchId = 101;
        const expiryDate = Math.floor(Date.now() / 1000) + 86400 * 365; // 1 year
        const inputData = `ID: ${batchId}, Name: Obat X, Qty: 1000`;

        await expect(
            medicineSupplyChain.connect(producer).createBatch(batchId, "Obat X", 1000, 5000, "Cool Storage", expiryDate)
        ).to.emit(medicineSupplyChain, "BatchCreated");

        const batch = await medicineSupplyChain.getBatch(batchId);

        expect(batch.exists).to.be.true;
        logResult("TC-03", "Create Batch (Positif)",
            inputData,
            "Batch created & Event emitted",
            `Batch Exists: ${batch.exists}, Owner: ${batch.currentOwner}`,
            "PASSED"
        );
    });

    it("TC-04: Create Batch (Negatif) - Revert: 'Batch ID already exists'", async function () {
        // Setup producer
        await medicineSupplyChain.connect(owner).registerUserWithRole(producer.address, producerRole, "Producer A");

        const batchId = 102;
        const expiryDate = Math.floor(Date.now() / 1000) + 86400 * 365;

        // First creation
        await medicineSupplyChain.connect(producer).createBatch(batchId, "Obat Y", 1000, 5000, "Cool Storage", expiryDate);

        // Second creation (Duplicate)
        let errorMsg = "";
        try {
            await medicineSupplyChain.connect(producer).createBatch(batchId, "Obat Y Duplicate", 1000, 5000, "Cool Storage", expiryDate);
        } catch (error) {
            errorMsg = error.message;
        }

        expect(errorMsg).to.include("Batch ID already exists");
        logResult("TC-04", "Create Batch (Negatif)",
            `Duplicate Batch ID: ${batchId}`,
            "Revert with 'Batch ID already exists'",
            `Error: ${errorMsg}`,
            "PASSED"
        );
    });

    it("TC-05: Transfer Batch (Otorisasi) - Revert: 'Only current owner...'", async function () {
        // Setup producer and distributor
        await medicineSupplyChain.connect(owner).registerUserWithRole(producer.address, producerRole, "Producer A");
        await medicineSupplyChain.connect(owner).registerUserWithRole(distributor.address, distributorRole, "Distributor B");

        const batchId = 103;
        const expiryDate = Math.floor(Date.now() / 1000) + 86400 * 365;
        await medicineSupplyChain.connect(producer).createBatch(batchId, "Obat Z", 1000, 5000, "Cool Storage", expiryDate);

        // Attempt transfer by non-owner
        let errorMsg = "";
        try {
            await medicineSupplyChain.connect(distributor).transferBatch(batchId, pharmacy.address);
        } catch (error) {
            errorMsg = error.message;
        }

        expect(errorMsg).to.include("Only current batch owner can transfer");
        logResult("TC-05", "Transfer Batch (Auth)",
            `Sender: ${distributor.address} (Not Owner), Batch Owner: ${producer.address}`,
            "Revert with 'Only current batch owner...'",
            `Error: ${errorMsg}`,
            "PASSED"
        );
    });

    it("TC-06: Recall Mekanisme - Status isRecalled = true", async function () {
        // Setup producer
        await medicineSupplyChain.connect(owner).registerUserWithRole(producer.address, producerRole, "Producer A");

        const batchId = 104;
        const expiryDate = Math.floor(Date.now() / 1000) + 86400 * 365;
        await medicineSupplyChain.connect(producer).createBatch(batchId, "Obat Recall", 1000, 5000, "Cool Storage", expiryDate);

        // Initiate Recall by Admin (Owner)
        const reason = "Defect Detected";
        await medicineSupplyChain.connect(owner).initiateRecall(batchId, reason);

        const batch = await medicineSupplyChain.getBatch(batchId);

        expect(batch.isRecalled).to.be.true;
        logResult("TC-06", "Recall Mekanisme",
            `Batch ID: ${batchId}, Reason: ${reason}`,
            "isRecalled = true",
            `isRecalled: ${batch.isRecalled}, Reason: ${batch.recallReason}`,
            "PASSED"
        );
    });
});
