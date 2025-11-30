import React, { useState } from 'react';
import { Plus, RefreshCw, Search, Shield, Users, PauseCircle, PlayCircle } from 'lucide-react';
import BatchList from './BatchList';
import EntityList from './EntityList';

const Dashboard = ({
    userRole,
    account,
    batches,
    entities,
    loading,
    isPaused,
    onRefresh,
    onCreateBatch,
    onTransferBatch,
    onOpenBatch,
    onRecallBatch,
    onClearRecall,
    onViewDetails,
    onSearch,
    onRevoke,
    onGrant,
    onPause,
    onUnpause
}) => {
    const [searchId, setSearchId] = useState('');

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        onSearch(searchId);
    };

    // Calculate stats
    const totalBatches = batches.length;
    const activeBatches = batches.filter(b => !b.isRecalled && !b.isOpened).length;
    const recalledBatches = batches.filter(b => b.isRecalled).length;
    const completedBatches = batches.filter(b => b.isOpened).length;

    return (
        <div className="dashboard">
            {/* Stats Section */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8' }}>
                        <Shield />
                    </div>
                    <div className="stat-info">
                        <h4>Total Batches</h4>
                        <p>{totalBatches}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                        <ActivityIcon />
                    </div>
                    <div className="stat-info">
                        <h4>Active</h4>
                        <p>{activeBatches}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                        <AlertIcon />
                    </div>
                    <div className="stat-info">
                        <h4>Recalled</h4>
                        <p>{recalledBatches}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                        <CheckIcon />
                    </div>
                    <div className="stat-info">
                        <h4>Completed</h4>
                        <p>{completedBatches}</p>
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {userRole === 'producer' && (
                            <button className="btn btn-primary" onClick={onCreateBatch} disabled={loading || isPaused}>
                                <Plus size={18} /> New Batch
                            </button>
                        )}
                        <button className="btn btn-outline" onClick={onRefresh} disabled={loading}>
                            <RefreshCw size={18} className={loading ? 'loading' : ''} /> Refresh
                        </button>

                        {userRole === 'admin' && (
                            isPaused ? (
                                <button className="btn btn-success" onClick={onUnpause} disabled={loading}>
                                    <PlayCircle size={18} /> Unpause Contract
                                </button>
                            ) : (
                                <button className="btn btn-danger" onClick={onPause} disabled={loading}>
                                    <PauseCircle size={18} /> Pause Contract
                                </button>
                            )
                        )}
                    </div>

                    <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, maxWidth: '400px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="text"
                                placeholder="Search Batch ID..."
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                                style={{ paddingLeft: '2.5rem' }}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>Search</button>
                    </form>
                </div>
            </div>

            {userRole === 'admin' && (
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={20} /> Registered Entities
                    </h3>
                    <EntityList entities={entities} onRevoke={onRevoke} onGrant={onGrant} />
                </div>
            )}

            <h3 style={{ marginBottom: '1rem' }}>Recent Batches</h3>
            <BatchList
                batches={batches}
                userRole={userRole}
                account={account}
                onTransfer={onTransferBatch}
                onOpen={onOpenBatch}
                onRecall={onRecallBatch}
                onClearRecall={onClearRecall}
                onViewDetails={onViewDetails}
                isPaused={isPaused}
            />
        </div>
    );
};

// Helper icons for stats
const ActivityIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
);

const AlertIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
);

const CheckIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);

export default Dashboard;
