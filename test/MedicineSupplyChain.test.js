const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MedicineSupplyChain - Box-based Contract", function () {
  let medicineSupplyChain;
  let owner, producer, distributor, pharmacy, admin;
  let producerRole, distributorRole, pharmacyRole, adminRole;

  beforeEach(async function () {
    [owner, producer, distributor, pharmacy, admin] = await ethers.getSigners();
    
    // Deploy contract
    const MedicineSupplyChain = await ethers.getContractFactory("MedicineSupplyChain");
    medicineSupplyChain = await MedicineSupplyChain.deploy();
    await medicineSupplyChain.waitForDeployment();

    // Get role constants
    producerRole = await medicineSupplyChain.PRODUCER_ROLE();
    distributorRole = await medicineSupplyChain.DISTRIBUTOR_ROLE();
    pharmacyRole = await medicineSupplyChain.PHARMACY_ROLE();
    adminRole = await medicineSupplyChain.DEFAULT_ADMIN_ROLE();

    // Assign roles using registerUserWithRole (only PRODUCER, DISTRIBUTOR, PHARMACY)
    await medicineSupplyChain.connect(owner).registerUserWithRole(producer.address, producerRole, "Producer ABC");
    await medicineSupplyChain.connect(owner).registerUserWithRole(distributor.address, distributorRole, "Distributor XYZ");
    await medicineSupplyChain.connect(owner).registerUserWithRole(pharmacy.address, pharmacyRole, "Pharmacy 123");
    
    // Admin role is already assigned to owner in constructor
  });

  describe("Box Management", function () {
    it("Should mint a box successfully", async function () {
      const boxId = 1;
      const medicineName = "Paracetamol 500mg";
      const quantity = 100;
      const expiryDate = Math.floor(Date.now() / 1000) + 86400 * 30; // 30 days from now

      await expect(
        medicineSupplyChain.connect(producer).mintBox(boxId, medicineName, quantity, expiryDate)
      ).to.emit(medicineSupplyChain, "BoxMinted")
        .withArgs(boxId, medicineName, quantity, producer.address);

      const box = await medicineSupplyChain.getBox(boxId);
      expect(box.boxId).to.equal(boxId);
      expect(box.medicineName).to.equal(medicineName);
      expect(box.quantity).to.equal(quantity);
      expect(box.expiryDate).to.equal(expiryDate);
      expect(box.currentOwner).to.equal(producer.address);
      expect(box.exists).to.be.true;
    });

    it("Should transfer box successfully", async function () {
      // First mint a box
      const boxId = 1;
      const medicineName = "Paracetamol 500mg";
      const quantity = 100;
      const expiryDate = Math.floor(Date.now() / 1000) + 86400 * 30;

      await medicineSupplyChain.connect(producer).mintBox(boxId, medicineName, quantity, expiryDate);

      // Transfer to distributor
      await expect(
        medicineSupplyChain.connect(producer).transferBox(boxId, distributor.address)
      ).to.emit(medicineSupplyChain, "BoxTransferred");

      const box = await medicineSupplyChain.getBox(boxId);
      expect(box.currentOwner).to.equal(distributor.address);
    });

    it("Should get box status correctly", async function () {
      // Mint box
      const boxId = 1;
      const medicineName = "Paracetamol 500mg";
      const quantity = 100;
      const expiryDate = Math.floor(Date.now() / 1000) + 86400 * 30;

      await medicineSupplyChain.connect(producer).mintBox(boxId, medicineName, quantity, expiryDate);

      // Check status at producer
      let status = await medicineSupplyChain.getBoxStatus(boxId);
      expect(status).to.equal("PRODUCER");

      // Transfer to distributor
      await medicineSupplyChain.connect(producer).transferBox(boxId, distributor.address);
      status = await medicineSupplyChain.getBoxStatus(boxId);
      expect(status).to.equal("DISTRIBUTOR");

      // Transfer to pharmacy
      await medicineSupplyChain.connect(distributor).transferBox(boxId, pharmacy.address);
      status = await medicineSupplyChain.getBoxStatus(boxId);
      expect(status).to.equal("PHARMACY");
    });

    it("Should get box progress correctly", async function () {
      // Mint box
      const boxId = 1;
      const medicineName = "Paracetamol 500mg";
      const quantity = 100;
      const expiryDate = Math.floor(Date.now() / 1000) + 86400 * 30;

      await medicineSupplyChain.connect(producer).mintBox(boxId, medicineName, quantity, expiryDate);

      // Check progress at producer (25%)
      let progress = await medicineSupplyChain.getBoxProgress(boxId);
      expect(progress).to.equal(25);

      // Transfer to distributor (50%)
      await medicineSupplyChain.connect(producer).transferBox(boxId, distributor.address);
      progress = await medicineSupplyChain.getBoxProgress(boxId);
      expect(progress).to.equal(50);

      // Transfer to pharmacy (100%)
      await medicineSupplyChain.connect(distributor).transferBox(boxId, pharmacy.address);
      progress = await medicineSupplyChain.getBoxProgress(boxId);
      expect(progress).to.equal(100);
    });

    it("Should track box history correctly", async function () {
      // Mint box
      const boxId = 1;
      const medicineName = "Paracetamol 500mg";
      const quantity = 100;
      const expiryDate = Math.floor(Date.now() / 1000) + 86400 * 30;

      await medicineSupplyChain.connect(producer).mintBox(boxId, medicineName, quantity, expiryDate);

      // Transfer to distributor
      await medicineSupplyChain.connect(producer).transferBox(boxId, distributor.address);

      // Transfer to pharmacy
      await medicineSupplyChain.connect(distributor).transferBox(boxId, pharmacy.address);

      // Check history
      const history = await medicineSupplyChain.getBoxHistory(boxId);
      expect(history.length).to.equal(3);
      expect(history[0]).to.equal(producer.address);
      expect(history[1]).to.equal(distributor.address);
      expect(history[2]).to.equal(pharmacy.address);
    });

    it("Should check expiry correctly", async function () {
      // Mint box with future expiry date first
      const boxId = 1;
      const medicineName = "Paracetamol 500mg";
      const quantity = 100;
      const expiryDate = Math.floor(Date.now() / 1000) + 86400; // 1 day from now

      await medicineSupplyChain.connect(producer).mintBox(boxId, medicineName, quantity, expiryDate);

      // Check if expired (should be false)
      const isExpired = await medicineSupplyChain.isBoxExpired(boxId);
      expect(isExpired).to.be.false;

      // Check time to expiry
      const timeToExpiry = await medicineSupplyChain.getTimeToExpiry(boxId);
      expect(timeToExpiry).to.be.greaterThan(0);
    });

    it("Should get boxes by owner", async function () {
      // Mint multiple boxes
      const boxIds = [1, 2, 3];
      const medicineName = "Paracetamol 500mg";
      const quantity = 100;
      const expiryDate = Math.floor(Date.now() / 1000) + 86400 * 30;

      for (const boxId of boxIds) {
        await medicineSupplyChain.connect(producer).mintBox(boxId, medicineName, quantity, expiryDate);
      }

      // Transfer one box to distributor
      await medicineSupplyChain.connect(producer).transferBox(1, distributor.address);

      // Check boxes owned by producer
      const producerBoxes = await medicineSupplyChain.getBoxesByOwner(producer.address);
      expect(producerBoxes.length).to.equal(2);
      expect(producerBoxes).to.include(2n);
      expect(producerBoxes).to.include(3n);

      // Check boxes owned by distributor
      const distributorBoxes = await medicineSupplyChain.getBoxesByOwner(distributor.address);
      expect(distributorBoxes.length).to.equal(1);
      expect(distributorBoxes).to.include(1n);
    });
  });

  describe("Access Control", function () {
    it("Should only allow producer to mint boxes", async function () {
      const boxId = 1;
      const medicineName = "Paracetamol 500mg";
      const quantity = 100;
      const expiryDate = Math.floor(Date.now() / 1000) + 86400 * 30;

      // Producer can mint
      await expect(
        medicineSupplyChain.connect(producer).mintBox(boxId, medicineName, quantity, expiryDate)
      ).to.not.be.reverted;

      // Others cannot mint
      await expect(
        medicineSupplyChain.connect(distributor).mintBox(2, medicineName, quantity, expiryDate)
      ).to.be.reverted;

      await expect(
        medicineSupplyChain.connect(pharmacy).mintBox(3, medicineName, quantity, expiryDate)
      ).to.be.reverted;
    });

    it("Should only allow current owner to transfer", async function () {
      // Mint box
      const boxId = 1;
      const medicineName = "Paracetamol 500mg";
      const quantity = 100;
      const expiryDate = Math.floor(Date.now() / 1000) + 86400 * 30;

      await medicineSupplyChain.connect(producer).mintBox(boxId, medicineName, quantity, expiryDate);

      // Only producer can transfer (current owner)
      await expect(
        medicineSupplyChain.connect(producer).transferBox(boxId, distributor.address)
      ).to.not.be.reverted;

      // Now distributor is the owner, so distributor can transfer
      await expect(
        medicineSupplyChain.connect(distributor).transferBox(boxId, pharmacy.address)
      ).to.not.be.reverted;

      // But producer (no longer owner) cannot transfer
      await expect(
        medicineSupplyChain.connect(producer).transferBox(boxId, distributor.address)
      ).to.be.reverted;
    });

    it("Should only allow valid recipients", async function () {
      // Mint box
      const boxId = 1;
      const medicineName = "Paracetamol 500mg";
      const quantity = 100;
      const expiryDate = Math.floor(Date.now() / 1000) + 86400 * 30;

      await medicineSupplyChain.connect(producer).mintBox(boxId, medicineName, quantity, expiryDate);

      // Cannot transfer to zero address
      await expect(
        medicineSupplyChain.connect(producer).transferBox(boxId, ethers.ZeroAddress)
      ).to.be.revertedWith("Cannot transfer to zero address");

      // Cannot transfer to address without valid role
      await expect(
        medicineSupplyChain.connect(producer).transferBox(boxId, owner.address)
      ).to.be.revertedWith("Recipient must have valid role");
    });
  });

  describe("Entity Management", function () {
    it("Should register user with role and name", async function () {
      // Use a new address that hasn't been registered yet
      const [, , , , newUser] = await ethers.getSigners();
      const userName = "PT. New Producer";
      const userRole = producerRole;

      await expect(
        medicineSupplyChain.connect(owner).registerUserWithRole(newUser.address, userRole, userName)
      ).to.emit(medicineSupplyChain, "RoleAssigned")
        .withArgs(newUser.address, userRole)
        .and.to.emit(medicineSupplyChain, "EntityRegistered")
        .withArgs(newUser.address, userName, "PRODUCER");

      const entity = await medicineSupplyChain.getEntity(newUser.address);
      expect(entity.name).to.equal(userName);
      expect(entity.entityType).to.equal("PRODUCER");
      expect(entity.exists).to.be.true;
    });

    it("Should get all entities", async function () {
      // Entities are already registered in beforeEach, just check they exist
      const entities = await medicineSupplyChain.getAllEntities();
      expect(entities.length).to.be.greaterThan(0);
      expect(entities).to.include(producer.address);
      expect(entities).to.include(distributor.address);
      expect(entities).to.include(pharmacy.address);
    });
  });

  describe("Error Handling", function () {
    it("Should revert when minting box with existing ID", async function () {
      const boxId = 1;
      const medicineName = "Paracetamol 500mg";
      const quantity = 100;
      const expiryDate = Math.floor(Date.now() / 1000) + 86400 * 30;

      // Mint first box
      await medicineSupplyChain.connect(producer).mintBox(boxId, medicineName, quantity, expiryDate);

      // Try to mint with same ID
      await expect(
        medicineSupplyChain.connect(producer).mintBox(boxId, "Another Medicine", 50, expiryDate)
      ).to.be.revertedWith("Box ID already exists");
    });

    it("Should revert when minting box with empty name", async function () {
      const boxId = 1;
      const quantity = 100;
      const expiryDate = Math.floor(Date.now() / 1000) + 86400 * 30;

      await expect(
        medicineSupplyChain.connect(producer).mintBox(boxId, "", quantity, expiryDate)
      ).to.be.revertedWith("Medicine name cannot be empty");
    });

    it("Should revert when minting box with zero quantity", async function () {
      const boxId = 1;
      const medicineName = "Paracetamol 500mg";
      const expiryDate = Math.floor(Date.now() / 1000) + 86400 * 30;

      await expect(
        medicineSupplyChain.connect(producer).mintBox(boxId, medicineName, 0, expiryDate)
      ).to.be.revertedWith("Quantity must be greater than 0");
    });

    it("Should revert when minting box with past expiry date", async function () {
      const boxId = 1;
      const medicineName = "Paracetamol 500mg";
      const quantity = 100;
      const expiryDate = Math.floor(Date.now() / 1000) - 86400; // 1 day ago

      await expect(
        medicineSupplyChain.connect(producer).mintBox(boxId, medicineName, quantity, expiryDate)
      ).to.be.revertedWith("Expiry date must be in the future");
    });

    it("Should revert when querying non-existent box", async function () {
      await expect(
        medicineSupplyChain.getBox(999)
      ).to.be.revertedWith("Box does not exist");
    });
  });

  describe("Supply Chain Flow", function () {
    it("Should complete full supply chain flow", async function () {
      // 1. Producer mints box
      const boxId = 1;
      const medicineName = "Paracetamol 500mg";
      const quantity = 100;
      const expiryDate = Math.floor(Date.now() / 1000) + 86400 * 30;

      await medicineSupplyChain.connect(producer).mintBox(boxId, medicineName, quantity, expiryDate);

      // Check initial status
      let status = await medicineSupplyChain.getBoxStatus(boxId);
      let progress = await medicineSupplyChain.getBoxProgress(boxId);
      expect(status).to.equal("PRODUCER");
      expect(progress).to.equal(25);

      // 2. Producer transfers to Distributor
      await medicineSupplyChain.connect(producer).transferBox(boxId, distributor.address);

      status = await medicineSupplyChain.getBoxStatus(boxId);
      progress = await medicineSupplyChain.getBoxProgress(boxId);
      expect(status).to.equal("DISTRIBUTOR");
      expect(progress).to.equal(50);

      // 3. Distributor transfers to Pharmacy
      await medicineSupplyChain.connect(distributor).transferBox(boxId, pharmacy.address);

      status = await medicineSupplyChain.getBoxStatus(boxId);
      progress = await medicineSupplyChain.getBoxProgress(boxId);
      expect(status).to.equal("PHARMACY");
      expect(progress).to.equal(100);

      // 4. Check final destination
      const isAtPharmacy = await medicineSupplyChain.isBoxAtPharmacy(boxId);
      const isAtFinalDestination = await medicineSupplyChain.isBoxAtFinalDestination(boxId);
      expect(isAtPharmacy).to.be.true;
      expect(isAtFinalDestination).to.be.true;

      // 5. Check complete history
      const history = await medicineSupplyChain.getBoxHistory(boxId);
      expect(history.length).to.equal(3);
      expect(history[0]).to.equal(producer.address);
      expect(history[1]).to.equal(distributor.address);
      expect(history[2]).to.equal(pharmacy.address);
    });
  });
});