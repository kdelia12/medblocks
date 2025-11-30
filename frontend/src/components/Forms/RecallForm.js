import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const RecallForm = ({ batch, onSubmit, onClose, loading }) => {
    const [reason, setReason] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(batch.batchId, reason);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>
                    <X size={20} />
                </button>

                <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444' }}>
                    <AlertTriangle /> Initiate Recall
                </h2>

                <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <p style={{ margin: '0 0 0.5rem 0', color: '#fca5a5', fontSize: '0.9rem' }}>Recalling Batch:</p>
                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem', color: '#fecaca' }}>{batch.productName}</p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', fontFamily: 'monospace', color: '#fca5a5' }}>ID: {batch.batchId}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Recall Reason</label>
                        <textarea
                            required
                            rows="4"
                            placeholder="Describe the reason for this recall..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            style={{ resize: 'vertical' }}
                        />
                    </div>

                    <button type="submit" className="btn btn-danger" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
                        {loading ? 'Processing...' : 'Confirm Recall'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RecallForm;
