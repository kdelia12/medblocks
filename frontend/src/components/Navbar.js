import React from 'react';
import { Shield, Pill, Truck, Store, User, LogOut } from 'lucide-react';

const Navbar = ({ isConnected, connectWallet, disconnectWallet, account, userRole, loading }) => {

  const getRoleBadge = () => {
    switch (userRole) {
      case 'admin':
        return <span className="role-badge role-admin"><Shield size={14} /> ADMIN</span>;
      case 'producer':
        return <span className="role-badge role-producer"><Pill size={14} /> PRODUCER</span>;
      case 'distributor':
        return <span className="role-badge role-distributor"><Truck size={14} /> DISTRIBUTOR</span>;
      case 'pharmacy':
        return <span className="role-badge role-pharmacy"><Store size={14} /> PHARMACY</span>;
      default:
        return <span className="role-badge" style={{ background: 'rgba(255,255,255,0.1)' }}><User size={14} /> GUEST</span>;
    }
  };

  const formatAddress = (addr) => {
    return addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Pill className="text-blue-500" size={24} />
        <span style={{ fontWeight: '700', fontSize: '1.2rem' }}>MedBlock</span>
      </div>

      <div className="navbar-actions">
        {isConnected ? (
          <>
            {getRoleBadge()}
            <div className="wallet-info">
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {formatAddress(account)}
              </span>
            </div>
            <button className="btn btn-danger" onClick={disconnectWallet} style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LogOut size={16} /> Disconnect
            </button>
          </>
        ) : (
          <button
            className="btn btn-primary"
            onClick={connectWallet}
            disabled={loading}
            style={{ minWidth: '140px' }}
          >
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
