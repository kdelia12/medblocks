import React, { useState } from 'react';
import { ArrowRight, User, X } from 'lucide-react';

const TransferBatchForm = ({ batch, onSubmit, onClose, loading }) => {
    const [toAddress, setToAddress] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(batch.batchId, toAddress);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>
                    <X size={20} />
                </button>

                <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ArrowRight className="text-blue-500" /> Transfer Batch
                </h2>

                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                    <p style={{ margin: '0 0 0.5rem 0', color: '#94a3b8', fontSize: '0.9rem' }}>Transferring Batch:</p>
                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem' }}>{batch.productName}</p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', fontFamily: 'monospace' }}>ID: {batch.batchId}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Recipient Address</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
                            <input
                                type="text"
                                required
                                placeholder="0x..."
                                value={toAddress}
                                onChange={(e) => setToAddress(e.target.value)}
                                style={{ paddingLeft: '40px' }}
                            />
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                            Note: Recipient must be a registered Distributor or Pharmacy.
                        </p>
                    </div>

                    <button type="submit" className="btn btn-info" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
                        {loading ? 'Transferring...' : 'Confirm Transfer'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TransferBatchForm;
