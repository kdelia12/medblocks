import React from 'react';
import BatchCard from './BatchCard';
import { PackageX } from 'lucide-react';

const BatchList = ({ batches, userRole, account, onTransfer, onOpen, onRecall, onClearRecall, onViewDetails, isPaused }) => {
    if (!batches || batches.length === 0) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)'
            }}>
                <PackageX size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <h3>No batches found</h3>
                <p>Create a new batch or wait for transfers.</p>
            </div>
        );
    }

    return (
        <div className="grid">
            {batches.map((batch) => (
                <BatchCard
                    key={batch.batchId}
                    batch={batch}
                    userRole={userRole}
                    isOwner={batch.currentOwner.toLowerCase() === account.toLowerCase()}
                    onTransfer={() => onTransfer(batch)}
                    onOpen={() => onOpen(batch)}
                    onRecall={() => onRecall(batch)}
                    onClearRecall={() => onClearRecall(batch)}
                    onViewDetails={() => onViewDetails(batch)}
                    isPaused={isPaused}
                />
            ))}
        </div>
    );
};

export default BatchList;
