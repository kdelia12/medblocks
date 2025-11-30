// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title MedicineSupplyChain
 * @dev Smart contract untuk tracking supply chain obat dari produsen hingga pharmacy
 * Box = Batch (unified concept) untuk gas efficiency dan real-world alignment
 * @author Your Name
 */
contract MedicineSupplyChain is AccessControl, Pausable {
    // Admin = Owner (deployer gets DEFAULT_ADMIN_ROLE automatically)
    
    // Role definitions
    bytes32 public constant PRODUCER_ROLE = keccak256("PRODUCER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant PHARMACY_ROLE = keccak256("PHARMACY_ROLE");

    // Removed individual Box struct - using Batch-only operations for gas efficiency

    // Batch struct untuk gas efficiency
    struct Batch {
        uint256 batchId;           // Batch ID
        string productName;        // Nama produk
        uint256 totalUnits;        // Total unit dalam batch
        uint256 unitValue;         // Nilai per unit
        string storageRequirements; // Persyaratan penyimpanan
        uint256 expiryDate;        // Tanggal kadaluarsa batch
        address currentOwner;      // Pemilik saat ini
        bool isOpened;            // Batch sudah dibuka atau belum
        bool isRecalled;          // Batch sedang direcall
        string recallReason;      // Alasan recall (opsional)
        bytes32 productionTxHash;  // TX hash saat batch diproduksi
        bool exists;              // Flag keberadaan
    }

    // Entity struct for storing names
    struct Entity {
        address wallet;
        string name;
        string entityType; // "PRODUCER", "DISTRIBUTOR", or "PHARMACY"
        bool exists;
    }

    // Transfer record struct untuk audit trail
    struct TransferRecord {
        address from;
        address to;
        uint256 timestamp;
        bytes32 txHash;
    }

    // State variables - Batch-only operations
    mapping(uint256 => Batch) public batches;
    mapping(uint256 => address[]) public batchHistory;
    mapping(uint256 => TransferRecord[]) public transferRecords; // Detailed transfer history with TX hash
    mapping(address => Entity) public entities;
    address[] public entityList;
    
    uint256[] public batchIds; // Array to store all batch IDs for iteration
    uint256 public totalBatches;
    uint256 public totalOpenedBatches;
    uint256 public totalRecalledBatches;

    // Events - Batch-only operations
    event BatchCreated(uint256 indexed batchId, string productName, uint256 totalUnits, uint256 unitValue, address indexed owner);
    event BatchTransferred(uint256 indexed batchId, address indexed from, address indexed to, uint256 timestamp);
    event BatchOpened(uint256 indexed batchId, address indexed opener);
    event BatchRecalled(uint256 indexed batchId, string reason, uint256 timestamp);
    event BatchRecallCleared(uint256 indexed batchId, uint256 timestamp);
    event RoleAssigned(address indexed user, bytes32 indexed role);
    event EntityRegistered(address indexed wallet, string name, string entityType);

    // Modifiers - Batch-only operations
    modifier validRecipient(address _to) {
        require(_to != address(0), "Cannot transfer to zero address");
        require(
            hasRole(DISTRIBUTOR_ROLE, _to) || hasRole(PHARMACY_ROLE, _to),
            "Recipient must have valid role"
        );
        _;
    }

    modifier batchExists(uint256 _batchId) {
        require(batches[_batchId].exists, "Batch does not exist");
        _;
    }

    modifier onlyCurrentBatchOwner(uint256 _batchId) {
        require(batches[_batchId].currentOwner == msg.sender, "Only current batch owner can transfer");
        _;
    }

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // ===== Pause Controls (Admin Only) =====
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Check if address is admin (has DEFAULT_ADMIN_ROLE)
     * @param account Address to check
     * @return bool True if admin
     */
    function isAdmin(address account) external view returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, account);
    }

    /**
     * @dev Check if address is owner (deployer)
     * @param account Address to check
     * @return bool True if owner
     */
    function isOwner(address account) external view returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, account);
    }

    /**
     * @dev Register user dengan role dan nama entity (hanya ADMIN)
     * @param user Address yang akan diberi role
     * @param role Role yang akan diberikan
     * @param name Nama entity/user
     */
    function registerUserWithRole(address user, bytes32 role, string calldata name) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(
            role == PRODUCER_ROLE || role == DISTRIBUTOR_ROLE || role == PHARMACY_ROLE,
            "Invalid role"
        );
        require(bytes(name).length > 0, "Name cannot be empty");
        require(!entities[user].exists, "User already registered");

        // Assign role
        _grantRole(role, user);
        
        // Determine entity type based on role
        string memory entityType;
        if (role == PRODUCER_ROLE) {
            entityType = "PRODUCER";
        } else if (role == DISTRIBUTOR_ROLE) {
            entityType = "DISTRIBUTOR";
        } else if (role == PHARMACY_ROLE) {
            entityType = "PHARMACY";
        }

        // Register entity
        entities[user] = Entity({
            wallet: user,
            name: name,
            entityType: entityType,
            exists: true
        });

        entityList.push(user);
        
        emit RoleAssigned(user, role);
        emit EntityRegistered(user, name, entityType);
    }

    /**
     * @dev Register user dengan role saja (hanya ADMIN) - untuk backward compatibility
     * @param user Address yang akan diberi role
     * @param role Role yang akan diberikan
     */
    function registerRole(address user, bytes32 role) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(
            role == PRODUCER_ROLE || role == DISTRIBUTOR_ROLE || role == PHARMACY_ROLE,
            "Invalid role"
        );

        // Assign role
        _grantRole(role, user);
        
        // Determine entity type based on role
        string memory entityType;
        if (role == PRODUCER_ROLE) {
            entityType = "PRODUCER";
        } else if (role == DISTRIBUTOR_ROLE) {
            entityType = "DISTRIBUTOR";
        } else if (role == PHARMACY_ROLE) {
            entityType = "PHARMACY";
        }

        // Register entity with default name
        entities[user] = Entity({
            wallet: user,
            name: entityType,
            entityType: entityType,
            exists: true
        });

        entityList.push(user);
        
        emit RoleAssigned(user, role);
        emit EntityRegistered(user, entityType, entityType);
    }

    // Removed individual box operations - using batch-only operations for gas efficiency

    // Removed individual box query functions - using batch-only operations

    /**
     * @dev Get informasi entity berdasarkan address
     * @param wallet Alamat wallet entity
     * @return Entity struct
     */
    function getEntity(address wallet) external view returns (Entity memory) {
        require(entities[wallet].exists, "Entity not found");
        return entities[wallet];
    }

    /**
     * @dev Get semua entity yang terdaftar
     * @return Array alamat entity
     */
    function getAllEntities() external view returns (address[] memory) {
        return entityList;
    }

    /**
     * @dev Check apakah entity terdaftar
     * @param wallet Alamat wallet
     * @return True jika entity terdaftar
     */
    function isEntityRegistered(address wallet) external view returns (bool) {
        return entities[wallet].exists;
    }

    // Removed individual box helpers and date utilities to reduce bytecode size

    // ========== BATCH OPERATIONS ==========

    /**
     * @dev Create batch (hanya PRODUCER_ROLE)
     * @param batchId ID batch
     * @param productName Nama produk
     * @param totalUnits Total unit dalam batch
     * @param unitValue Nilai per unit
     * @param storageRequirements Persyaratan penyimpanan
     * @param expiryDate Tanggal kadaluarsa (timestamp)
     */
    function createBatch(
        uint256 batchId,
        string calldata productName,
        uint256 totalUnits,
        uint256 unitValue,
        string calldata storageRequirements,
        uint256 expiryDate
    ) external onlyRole(PRODUCER_ROLE) whenNotPaused {
        require(!batches[batchId].exists, "Batch ID already exists");
        require(bytes(productName).length > 0, "Product name cannot be empty");
        require(totalUnits > 0, "Total units must be greater than 0");
        require(unitValue > 0, "Unit value must be greater than 0");
        require(bytes(storageRequirements).length > 0, "Storage requirements cannot be empty");
        require(expiryDate > block.timestamp, "Expiry date must be in the future");

        batches[batchId] = Batch({
            batchId: batchId,
            productName: productName,
            totalUnits: totalUnits,
            unitValue: unitValue,
            storageRequirements: storageRequirements,
            expiryDate: expiryDate,
            currentOwner: msg.sender,
            isOpened: false,
            isRecalled: false,
            recallReason: "",
            productionTxHash: bytes32(0), // Will be set after transaction
            exists: true
        });

        batchHistory[batchId].push(msg.sender);
        totalBatches++;
        batchIds.push(batchId);

        emit BatchCreated(batchId, productName, totalUnits, unitValue, msg.sender);
    }

    /**
     * @dev Transfer batch ke alamat lain
     * @param batchId ID batch yang akan ditransfer
     * @param to Alamat penerima
     */
    function transferBatch(uint256 batchId, address to) 
        external 
        batchExists(batchId) 
        onlyCurrentBatchOwner(batchId) 
        validRecipient(to) 
        whenNotPaused
    {
        require(!batches[batchId].isRecalled, "Batch recalled");
        address from = batches[batchId].currentOwner;
        
        batches[batchId].currentOwner = to;
        batchHistory[batchId].push(to);

        // Record transfer with TX hash for audit trail
        transferRecords[batchId].push(TransferRecord({
            from: from,
            to: to,
            timestamp: block.timestamp,
            txHash: bytes32(0) // Will be set by frontend after transaction
        }));

        emit BatchTransferred(batchId, from, to, block.timestamp);
    }

    /**
     * @dev Open batch (hanya PHARMACY_ROLE)
     * @param batchId ID batch yang akan dibuka
     */
    function openBatch(uint256 batchId) 
        external 
        batchExists(batchId) 
        onlyRole(PHARMACY_ROLE) 
        whenNotPaused
    {
        require(batches[batchId].currentOwner == msg.sender, "Only batch owner can open");
        require(!batches[batchId].isOpened, "Batch already opened");
        require(!batches[batchId].isRecalled, "Batch recalled");

        batches[batchId].isOpened = true;
        totalOpenedBatches++;

        emit BatchOpened(batchId, msg.sender);
    }

    // ===== Recall Operations (Admin Only) =====
    function initiateRecall(uint256 batchId, string calldata reason)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        batchExists(batchId)
    {
        require(!batches[batchId].isRecalled, "Already recalled");
        require(bytes(reason).length > 0, "Reason required");
        batches[batchId].isRecalled = true;
        batches[batchId].recallReason = reason;
        totalRecalledBatches++;
        emit BatchRecalled(batchId, reason, block.timestamp);
    }

    function clearRecall(uint256 batchId)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        batchExists(batchId)
    {
        require(batches[batchId].isRecalled, "Not recalled");
        batches[batchId].isRecalled = false;
        batches[batchId].recallReason = "";
        if (totalRecalledBatches > 0) {
            unchecked { totalRecalledBatches--; }
        }
        emit BatchRecallCleared(batchId, block.timestamp);
    }

    /**
     * @dev Get detail batch
     * @param batchId ID batch
     * @return Batch struct
     */
    function getBatch(uint256 batchId) external view batchExists(batchId) returns (Batch memory) {
        return batches[batchId];
    }

    /**
     * @dev Get riwayat transfer batch
     * @param batchId ID batch
     * @return Array alamat yang pernah memegang batch
     */
    function getBatchHistory(uint256 batchId) external view batchExists(batchId) returns (address[] memory) {
        return batchHistory[batchId];
    }

    /**
     * @dev Get total jumlah batch
     * @return Total batch
     */
    function getTotalBatches() external view returns (uint256) {
        return totalBatches;
    }

    /**
     * @dev Check apakah batch ada
     * @param batchId ID batch
     * @return True jika batch ada
     */
    function isBatchExists(uint256 batchId) external view returns (bool) {
        return batches[batchId].exists;
    }

    /**
     * @dev Get batch status (posisi batch dalam supply chain)
     * @param batchId ID batch
     * @return String status batch
     */
    function getBatchStatus(uint256 batchId) external view batchExists(batchId) returns (string memory) {
        address currentOwner = batches[batchId].currentOwner;
        if (batches[batchId].isRecalled) {
            return "RECALLED";
        }
        
        if (hasRole(PRODUCER_ROLE, currentOwner)) {
            return "PRODUCER";
        } else if (hasRole(DISTRIBUTOR_ROLE, currentOwner)) {
            return "DISTRIBUTOR";
        } else if (hasRole(PHARMACY_ROLE, currentOwner)) {
            return "PHARMACY";
        } else {
            return "UNKNOWN";
        }
    }

    /**
     * @dev Check apakah batch sudah dibuka
     * @param batchId ID batch
     * @return True jika batch sudah dibuka
     */
    function isBatchOpened(uint256 batchId) external view batchExists(batchId) returns (bool) {
        return batches[batchId].isOpened;
    }

    /**
     * @dev Check apakah batch sudah kadaluarsa
     * @param batchId ID batch
     * @return True jika batch sudah kadaluarsa
     */
    function isBatchExpired(uint256 batchId) external view batchExists(batchId) returns (bool) {
        return batches[batchId].expiryDate <= block.timestamp;
    }

    /**
     * @dev Get sisa waktu sebelum batch kadaluarsa
     * @param batchId ID batch
     * @return Sisa waktu dalam detik (0 jika sudah kadaluarsa)
     */
    function getBatchTimeToExpiry(uint256 batchId) external view batchExists(batchId) returns (uint256) {
        uint256 expiryDate = batches[batchId].expiryDate;
        if (expiryDate <= block.timestamp) {
            return 0;
        }
        return expiryDate - block.timestamp;
    }

    // ===== Analytics & Queries =====
    function getAllBatchIds() external view returns (uint256[] memory) {
        return batchIds;
    }

    function getBatchesByOwner(address owner) external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < batchIds.length; i++) {
            if (batches[batchIds[i]].currentOwner == owner && batches[batchIds[i]].exists) {
                count++;
            }
        }
        uint256[] memory result = new uint256[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < batchIds.length; i++) {
            if (batches[batchIds[i]].currentOwner == owner && batches[batchIds[i]].exists) {
                result[idx++] = batchIds[i];
            }
        }
        return result;
    }

    function getCountsSummary() external view returns (
        uint256 total,
        uint256 opened,
        uint256 recalled,
        uint256 expired
    ) {
        total = totalBatches;
        opened = totalOpenedBatches;
        recalled = totalRecalledBatches;
        uint256 expiredCount = 0;
        for (uint256 i = 0; i < batchIds.length; i++) {
            if (batches[batchIds[i]].exists && batches[batchIds[i]].expiryDate <= block.timestamp) {
                expiredCount++;
            }
        }
        expired = expiredCount;
    }

    /**
     * @dev Get batch summary (informasi lengkap batch)
     * @param batchId ID batch
     * @return batchId_ Batch ID
     * @return productName Nama produk
     * @return totalUnits Total unit
     * @return unitValue Nilai per unit
     * @return status Status batch
     * @return isOpened Batch sudah dibuka atau belum
     * @return owner Alamat owner
     */
    function getBatchSummary(uint256 batchId) external view batchExists(batchId) returns (
        uint256 batchId_,
        string memory productName,
        uint256 totalUnits,
        uint256 unitValue,
        string memory status,
        bool isOpened,
        address owner
    ) {
        Batch memory batch = batches[batchId];
        
        batchId_ = batch.batchId;
        productName = batch.productName;
        totalUnits = batch.totalUnits;
        unitValue = batch.unitValue;
        status = this.getBatchStatus(batchId);
        isOpened = batch.isOpened;
        owner = batch.currentOwner;
    }

    /**
     * @dev Admin function: Get all batches by specific address (owner)
     * @param owner Address to check
     * @return batchIds_ Array of batch IDs owned by the address
     * @return batchDetails Array of batch details
     */
    function getBatchesByAddress(address owner) external view returns (
        uint256[] memory batchIds_,
        Batch[] memory batchDetails
    ) {
        uint256 count = 0;
        for (uint256 i = 0; i < batchIds.length; i++) {
            if (batches[batchIds[i]].currentOwner == owner && batches[batchIds[i]].exists) {
                count++;
            }
        }
        
        batchIds_ = new uint256[](count);
        batchDetails = new Batch[](count);
        uint256 idx = 0;
        
        for (uint256 i = 0; i < batchIds.length; i++) {
            if (batches[batchIds[i]].currentOwner == owner && batches[batchIds[i]].exists) {
                batchIds_[idx] = batchIds[i];
                batchDetails[idx] = batches[batchIds[i]];
                idx++;
            }
        }
    }

    /**
     * @dev Admin function: Get all batches produced by specific address
     * @param producer Address of the producer
     * @return batchIds_ Array of batch IDs produced by the address
     * @return batchDetails Array of batch details
     */
    function getBatchesProducedBy(address producer) external view returns (
        uint256[] memory batchIds_,
        Batch[] memory batchDetails
    ) {
        uint256 count = 0;
        for (uint256 i = 0; i < batchIds.length; i++) {
            if (batches[batchIds[i]].exists && batchHistory[batchIds[i]].length > 0 && batchHistory[batchIds[i]][0] == producer) {
                count++;
            }
        }
        
        batchIds_ = new uint256[](count);
        batchDetails = new Batch[](count);
        uint256 idx = 0;
        
        for (uint256 i = 0; i < batchIds.length; i++) {
            if (batches[batchIds[i]].exists && batchHistory[batchIds[i]].length > 0 && batchHistory[batchIds[i]][0] == producer) {
                batchIds_[idx] = batchIds[i];
                batchDetails[idx] = batches[batchIds[i]];
                idx++;
            }
        }
    }

    /**
     * @dev Update production TX hash (called by frontend after transaction)
     * @param batchId ID batch
     * @param txHash Transaction hash
     */
    function updateProductionTxHash(uint256 batchId, bytes32 txHash) external batchExists(batchId) {
        require(batches[batchId].currentOwner == msg.sender, "Only batch owner can update");
        batches[batchId].productionTxHash = txHash;
    }

    /**
     * @dev Update transfer TX hash (called by frontend after transaction)
     * @param batchId ID batch
     * @param transferIndex Index of transfer record
     * @param txHash Transaction hash
     */
    function updateTransferTxHash(uint256 batchId, uint256 transferIndex, bytes32 txHash) external batchExists(batchId) {
        require(transferIndex < transferRecords[batchId].length, "Invalid transfer index");
        require(batches[batchId].currentOwner == msg.sender, "Only batch owner can update");
        transferRecords[batchId][transferIndex].txHash = txHash;
    }

    /**
     * @dev Get detailed transfer records for audit trail
     * @param batchId ID batch
     * @return records Array of transfer records with TX hashes
     */
    function getTransferRecords(uint256 batchId) external view batchExists(batchId) returns (TransferRecord[] memory records) {
        return transferRecords[batchId];
    }

    /**
     * @dev Get production TX hash
     * @param batchId ID batch
     * @return txHash Production transaction hash
     */
    function getProductionTxHash(uint256 batchId) external view batchExists(batchId) returns (bytes32 txHash) {
        return batches[batchId].productionTxHash;
    }

}