import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';
import contractABI from './contractABI.json';

// Components
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import CreateBatchForm from './components/Forms/CreateBatchForm';
import TransferBatchForm from './components/Forms/TransferBatchForm';
import RegisterUserForm from './components/Forms/RegisterUserForm';
import RecallForm from './components/Forms/RecallForm';
import BatchDetailsModal from './components/BatchDetailsModal';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';
import { parseError } from './utils/errorParser';

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const LOCAL_NETWORK_URL = "http://localhost:8545";

function App() {
  // Wallet & Contract State
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // App State
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [batches, setBatches] = useState([]);
  const [entities, setEntities] = useState([]);
  const [isPaused, setIsPaused] = useState(false);

  // Modal State
  const [activeModal, setActiveModal] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchHistory, setBatchHistory] = useState([]);
  const [productionTxHash, setProductionTxHash] = useState(null);
  const [entityNames, setEntityNames] = useState({});

  // Auto-clear status after 5 seconds
  useEffect(() => {
    if (status.message) {
      const timer = setTimeout(() => {
        setStatus({ type: '', message: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  useEffect(() => {
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) disconnectWallet();
      else {
        setAccount(accounts[0]);
        window.location.reload();
      }
    };

    const handleChainChanged = () => window.location.reload();

    const initializeProvider = async () => {
      try {
        const provider = new ethers.JsonRpcProvider(LOCAL_NETWORK_URL);

        const code = await provider.getCode(CONTRACT_ADDRESS);
        if (code === '0x') {
          setStatus({ type: 'error', message: 'Contract not deployed. Please deploy the contract first.' });
          return;
        }

        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
        setContract(contract);
      } catch (error) {
        setStatus({ type: 'error', message: `Failed to connect: ${error.message}` });
      }
    };

    initializeProvider();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Wallet Connection
  const connectWallet = async () => {
    if (!window.ethereum) {
      setStatus({ type: 'error', message: 'MetaMask not installed.' });
      return;
    }

    try {
      setLoading(true);
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      setAccount(accounts[0]);
      setIsConnected(true);

      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
      setContract(contract);

      const role = await checkUserRole(contract, accounts[0]);
      setStatus({ type: 'success', message: 'Wallet connected successfully!' });

      // Load data
      await loadData(contract, accounts[0], role);

    } catch (error) {
      setStatus({ type: 'error', message: `Failed to connect wallet: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      // Optional: Force account selection on next connect if desired
    } catch (e) {
      console.log("Permission revocation not supported or cancelled");
    }

    setAccount(null);
    setIsConnected(false);
    setContract(null);
    setUserRole(null);
    setBatches([]);
    setEntities([]);
    setIsPaused(false);
    setStatus({ type: 'info', message: 'Wallet disconnected' });
  };

  // Role Management
  const checkUserRole = async (contract, userAddress) => {
    try {
      // Hardcoded roles to match contract
      const adminRole = "0x0000000000000000000000000000000000000000000000000000000000000000";
      const producerRole = "0x8eb467f061ca67f42a2d2ca4a346fc9fb645efc0ba75056ee9f71c3a0ccc10a8";
      const distributorRole = "0xfbd454f36a7e1a388bd6fc3ab10d434aa4578f811acbbcf33afb1c697486313c";
      const pharmacyRole = "0x2f3a5455f35aeca177ac653592f277fbe2fbafef01081a2030451bb2fb41c91d";

      const [isAdmin, isProducer, isDistributor, isPharmacy] = await Promise.all([
        contract.hasRole(adminRole, userAddress),
        contract.hasRole(producerRole, userAddress),
        contract.hasRole(distributorRole, userAddress),
        contract.hasRole(pharmacyRole, userAddress)
      ]);

      let role = 'none';
      if (isAdmin) role = 'admin';
      else if (isProducer) role = 'producer';
      else if (isDistributor) role = 'distributor';
      else if (isPharmacy) role = 'pharmacy';

      setUserRole(role);
      return role;

    } catch (error) {
      console.error('Error checking role:', error);
      setUserRole('none');
      return 'none';
    }
  };

  // Data Loading
  const loadData = async (contractInstance, address, role) => {
    if (!contractInstance || !address) return;

    try {
      setLoading(true);

      // Check paused state
      try {
        const paused = await contractInstance.paused();
        setIsPaused(paused);
      } catch (e) {
        console.warn('Failed to fetch paused state', e);
      }

      // 1. Load Batches
      let batchIds = [];
      let batchDetails = [];

      const [ids, details] = await contractInstance.getBatchesByAddress(address);
      batchIds = ids;
      batchDetails = details;

      const formattedBatches = batchIds.map((id, index) => ({
        batchId: id.toString(),
        productName: batchDetails[index].productName,
        totalUnits: batchDetails[index].totalUnits.toString(),
        unitValue: batchDetails[index].unitValue.toString(),
        storageRequirements: batchDetails[index].storageRequirements,
        expiryDate: new Date(Number(batchDetails[index].expiryDate) * 1000).toLocaleString(),
        currentOwner: batchDetails[index].currentOwner,
        isOpened: batchDetails[index].isOpened,
        isRecalled: batchDetails[index].isRecalled,
        recallReason: batchDetails[index].recallReason,
        exists: batchDetails[index].exists,
        status: 'UNKNOWN'
      }));

      for (let batch of formattedBatches) {
        try {
          const status = await contractInstance.getBatchStatus(batch.batchId);
          batch.status = status;
        } catch (e) {
          console.warn('Failed to fetch status for batch', batch.batchId);
        }
      }
      setBatches(formattedBatches);

      // 2. Load Entities (If Admin)
      if (role === 'admin') {
        const entityAddresses = await contractInstance.getAllEntities();
        const entityPromises = entityAddresses.map(addr => contractInstance.getEntity(addr));
        const entityData = await Promise.all(entityPromises);

        const producerRole = "0x8eb467f061ca67f42a2d2ca4a346fc9fb645efc0ba75056ee9f71c3a0ccc10a8";
        const distributorRole = "0xfbd454f36a7e1a388bd6fc3ab10d434aa4578f811acbbcf33afb1c697486313c";
        const pharmacyRole = "0x2f3a5455f35aeca177ac653592f277fbe2fbafef01081a2030451bb2fb41c91d";

        const formattedEntities = await Promise.all(entityData.map(async (e) => {
          let isActive = false;
          if (e.entityType === 'PRODUCER') isActive = await contractInstance.hasRole(producerRole, e.wallet);
          else if (e.entityType === 'DISTRIBUTOR') isActive = await contractInstance.hasRole(distributorRole, e.wallet);
          else if (e.entityType === 'PHARMACY') isActive = await contractInstance.hasRole(pharmacyRole, e.wallet);

          return {
            wallet: e.wallet,
            name: e.name,
            entityType: e.entityType,
            exists: e.exists,
            isActive: isActive
          };
        }));
        setEntities(formattedEntities);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      setStatus({ type: 'error', message: 'Failed to load data.' });
    } finally {
      setLoading(false);
    }
  };

  // Actions
  const handleCreateBatch = async (formData) => {
    try {
      setLoading(true);
      const expiryTimestamp = Math.floor(new Date(formData.expiryDate).getTime() / 1000);

      const tx = await contract.createBatch(
        formData.batchId,
        formData.productName,
        formData.totalUnits,
        formData.unitValue,
        formData.storageRequirements,
        expiryTimestamp
      );
      await tx.wait();

      // Update TX hash
      await contract.updateProductionTxHash(formData.batchId, tx.hash);

      setStatus({ type: 'success', message: 'Batch created successfully!' });
      setActiveModal(null);
      loadData(contract, account, userRole);
    } catch (error) {
      setStatus({ type: 'error', message: parseError(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleTransferBatch = async (batchId, toAddress) => {
    try {
      setLoading(true);
      const tx = await contract.transferBatch(batchId, toAddress);
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        try {
          const records = await contract.getTransferRecords(batchId);
          await contract.updateTransferTxHash(batchId, records.length - 1, tx.hash);
        } catch (e) {
          console.warn('Failed to update transfer hash', e);
        }
      }

      setStatus({ type: 'success', message: 'Batch transferred successfully!' });
      setActiveModal(null);
      loadData(contract, account, userRole);
    } catch (error) {
      setStatus({ type: 'error', message: parseError(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBatch = async (batch) => {
    if (!window.confirm(`Are you sure you want to open batch ${batch.productName}?`)) return;

    try {
      setLoading(true);
      const tx = await contract.openBatch(batch.batchId);
      await tx.wait();

      setStatus({ type: 'success', message: 'Batch opened successfully!' });
      loadData(contract, account, userRole);
    } catch (error) {
      setStatus({ type: 'error', message: parseError(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleRecallBatch = async (batchId, reason) => {
    try {
      setLoading(true);
      const tx = await contract.initiateRecall(batchId, reason);
      await tx.wait();

      setStatus({ type: 'success', message: 'Batch recalled successfully!' });
      setActiveModal(null);
      loadData(contract, account, userRole);
    } catch (error) {
      setStatus({ type: 'error', message: parseError(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterUser = async (formData) => {
    try {
      setLoading(true);
      let roleHash;
      if (formData.role === 'PRODUCER_ROLE') roleHash = "0x8eb467f061ca67f42a2d2ca4a346fc9fb645efc0ba75056ee9f71c3a0ccc10a8";
      else if (formData.role === 'DISTRIBUTOR_ROLE') roleHash = "0xfbd454f36a7e1a388bd6fc3ab10d434aa4578f811acbbcf33afb1c697486313c";
      else if (formData.role === 'PHARMACY_ROLE') roleHash = "0x2f3a5455f35aeca177ac653592f277fbe2fbafef01081a2030451bb2fb41c91d";

      const tx = await contract.registerUserWithRole(formData.user, roleHash, formData.name);
      await tx.wait();

      setStatus({ type: 'success', message: 'User registered successfully!' });
      setActiveModal(null);
      loadData(contract, account, userRole);
    } catch (error) {
      setStatus({ type: 'error', message: parseError(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeRole = async (entity) => {
    if (!window.confirm(`Are you sure you want to revoke the ${entity.entityType} role from ${entity.name}?`)) return;

    try {
      setLoading(true);
      let roleHash;
      if (entity.entityType === 'PRODUCER') roleHash = "0x8eb467f061ca67f42a2d2ca4a346fc9fb645efc0ba75056ee9f71c3a0ccc10a8";
      else if (entity.entityType === 'DISTRIBUTOR') roleHash = "0xfbd454f36a7e1a388bd6fc3ab10d434aa4578f811acbbcf33afb1c697486313c";
      else if (entity.entityType === 'PHARMACY') roleHash = "0x2f3a5455f35aeca177ac653592f277fbe2fbafef01081a2030451bb2fb41c91d";

      const tx = await contract.revokeRole(roleHash, entity.wallet);
      await tx.wait();

      setStatus({ type: 'success', message: 'Role revoked successfully!' });
      loadData(contract, account, userRole);
    } catch (error) {
      setStatus({ type: 'error', message: parseError(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleGrantRole = async (entity) => {
    if (!window.confirm(`Are you sure you want to re-activate the ${entity.entityType} role for ${entity.name}?`)) return;

    try {
      setLoading(true);
      let roleHash;
      if (entity.entityType === 'PRODUCER') roleHash = "0x8eb467f061ca67f42a2d2ca4a346fc9fb645efc0ba75056ee9f71c3a0ccc10a8";
      else if (entity.entityType === 'DISTRIBUTOR') roleHash = "0xfbd454f36a7e1a388bd6fc3ab10d434aa4578f811acbbcf33afb1c697486313c";
      else if (entity.entityType === 'PHARMACY') roleHash = "0x2f3a5455f35aeca177ac653592f277fbe2fbafef01081a2030451bb2fb41c91d";

      const tx = await contract.grantRole(roleHash, entity.wallet);
      await tx.wait();

      setStatus({ type: 'success', message: 'Role re-activated successfully!' });
      loadData(contract, account, userRole);
    } catch (error) {
      setStatus({ type: 'error', message: parseError(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (batchId) => {
    if (!batchId) return;
    try {
      setLoading(true);
      const batch = await contract.getBatch(batchId);
      if (!batch.exists) {
        setStatus({ type: 'error', message: 'Batch not found' });
        setBatches([]);
        return;
      }

      const status = await contract.getBatchStatus(batchId);

      const batchData = {
        batchId: batch.batchId.toString(),
        productName: batch.productName,
        totalUnits: batch.totalUnits.toString(),
        unitValue: batch.unitValue.toString(),
        storageRequirements: batch.storageRequirements,
        expiryDate: new Date(Number(batch.expiryDate) * 1000).toLocaleString(),
        currentOwner: batch.currentOwner,
        isOpened: batch.isOpened,
        isRecalled: batch.isRecalled,
        recallReason: batch.recallReason,
        exists: batch.exists,
        status: status
      };

      setBatches([batchData]);
      setStatus({ type: 'success', message: 'Batch found!' });
    } catch (error) {
      setStatus({ type: 'error', message: parseError(error) });
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async () => {
    if (!window.confirm('Are you sure you want to PAUSE the contract? This will stop all transfers and updates.')) return;
    try {
      setLoading(true);
      const tx = await contract.pause();
      await tx.wait();
      setStatus({ type: 'success', message: 'Contract paused successfully!' });
      loadData(contract, account, userRole);
    } catch (error) {
      setStatus({ type: 'error', message: parseError(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleUnpause = async () => {
    if (!window.confirm('Are you sure you want to UNPAUSE the contract?')) return;
    try {
      setLoading(true);
      const tx = await contract.unpause();
      await tx.wait();
      setStatus({ type: 'success', message: 'Contract unpaused successfully!' });
      loadData(contract, account, userRole);
    } catch (error) {
      setStatus({ type: 'error', message: parseError(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleClearRecall = async (batch) => {
    if (!window.confirm(`Are you sure you want to clear the recall for batch ${batch.productName}?`)) return;
    try {
      setLoading(true);
      const tx = await contract.clearRecall(batch.batchId);
      await tx.wait();
      setStatus({ type: 'success', message: 'Recall cleared successfully!' });
      loadData(contract, account, userRole);
    } catch (error) {
      setStatus({ type: 'error', message: parseError(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (batch) => {
    try {
      setLoading(true);
      setSelectedBatch(batch);
      setBatchHistory([]);
      setEntityNames({});

      // 1. Fetch Transfer History
      const history = await contract.getTransferRecords(batch.batchId);
      setBatchHistory(history);

      // 2. Fetch Production Tx Hash
      const txHash = await contract.getProductionTxHash(batch.batchId);
      setProductionTxHash(txHash);

      // 3. Fetch Entity Names
      const addressesToFetch = new Set();

      // Add current owner
      addressesToFetch.add(batch.currentOwner);

      // Add history participants
      history.forEach(record => {
        addressesToFetch.add(record.from);
        addressesToFetch.add(record.to);
      });

      // Add original producer from batch history
      try {
        const ownershipHistory = await contract.getBatchHistory(batch.batchId);
        if (ownershipHistory.length > 0) {
          addressesToFetch.add(ownershipHistory[0]);
        }
      } catch (e) {
        console.warn("Failed to fetch batch ownership history", e);
      }

      const names = {};
      await Promise.all(Array.from(addressesToFetch).map(async (addr) => {
        try {
          const isRegistered = await contract.isEntityRegistered(addr);
          if (isRegistered) {
            const entity = await contract.getEntity(addr);
            names[addr] = entity.name;
          } else {
            names[addr] = "Unknown Entity";
          }
        } catch (e) {
          names[addr] = "Unknown";
        }
      }));

      setEntityNames(names);
      setActiveModal('details');
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to load batch history.' });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <Navbar
        isConnected={isConnected}
        connectWallet={connectWallet}
        disconnectWallet={disconnectWallet}
        account={account}
        userRole={userRole}
        loading={loading && !isConnected}
      />

      <div className="container">
        {/* Toast Notifications */}
        {status.message && (
          <div className="status-container">
            <div className={`status status-${status.type}`}>
              {status.type === 'success' && <CheckCircle size={20} style={{ marginRight: '10px' }} />}
              {status.type === 'error' && <AlertCircle size={20} style={{ marginRight: '10px' }} />}
              {status.type === 'info' && <Info size={20} style={{ marginRight: '10px' }} />}
              {status.message}
            </div>
          </div>
        )}

        {!isConnected ? (
          <LandingPage onConnect={connectWallet} loading={loading} />
        ) : (
          <>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              {userRole === 'admin' && (
                <button className="btn btn-info" onClick={() => setActiveModal('register')}>
                  Register New User
                </button>
              )}
            </div>

            <Dashboard
              userRole={userRole}
              account={account}
              batches={batches}
              entities={entities}
              loading={loading}
              isPaused={isPaused}
              onRefresh={() => loadData(contract, account, userRole)}
              onCreateBatch={() => setActiveModal('create')}
              onTransferBatch={(batch) => { setSelectedBatch(batch); setActiveModal('transfer'); }}
              onOpenBatch={handleOpenBatch}
              onRecallBatch={(batch) => { setSelectedBatch(batch); setActiveModal('recall'); }}
              onClearRecall={handleClearRecall}
              onViewDetails={handleViewDetails}
              onSearch={handleSearch}
              onRevoke={handleRevokeRole}
              onGrant={handleGrantRole}
              onPause={handlePause}
              onUnpause={handleUnpause}
            />
          </>
        )}
      </div>

      {/* Modals */}
      {activeModal === 'create' && (
        <CreateBatchForm
          onSubmit={handleCreateBatch}
          onClose={() => setActiveModal(null)}
          loading={loading}
        />
      )}

      {activeModal === 'transfer' && selectedBatch && (
        <TransferBatchForm
          batch={selectedBatch}
          onSubmit={handleTransferBatch}
          onClose={() => { setActiveModal(null); setSelectedBatch(null); }}
          loading={loading}
        />
      )}

      {activeModal === 'recall' && selectedBatch && (
        <RecallForm
          batch={selectedBatch}
          onSubmit={handleRecallBatch}
          onClose={() => { setActiveModal(null); setSelectedBatch(null); }}
          loading={loading}
        />
      )}

      {activeModal === 'register' && (
        <RegisterUserForm
          onSubmit={handleRegisterUser}
          onClose={() => setActiveModal(null)}
          loading={loading}
        />
      )}

      {activeModal === 'details' && selectedBatch && (
        <BatchDetailsModal
          batch={selectedBatch}
          history={batchHistory}
          productionTxHash={productionTxHash}
          entityNames={entityNames}
          onClose={() => { setActiveModal(null); setSelectedBatch(null); }}
        />
      )}
    </div>
  );
}

export default App;
