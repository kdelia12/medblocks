import React from 'react';
import { X, Clock, FileText, CheckCircle, Truck, AlertTriangle, Box, Copy, ExternalLink, User } from 'lucide-react';

const BatchDetailsModal = ({ batch, history, productionTxHash, entityNames = {}, onClose }) => {
    if (!batch) return null;

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(Number(timestamp) * (timestamp > 1e12 ? 1 : 1000));
        return date.toLocaleString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    const getEntityName = (address) => {
        if (!address) return 'Unknown';
        return entityNames[address] || 'Unknown Entity';
    };

    // Determine producer address: either from history (first transfer from) or current owner if no transfers
    // But wait, if no transfers, current owner IS producer.
    // If transfers exist, history[0].from IS producer.
    const producerAddress = history.length > 0 ? history[0].from : batch.currentOwner;

    return (
        <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
        }}>
            <div className="modal-content" style={{
                width: '100%',
                maxWidth: '700px',
                maxHeight: '90vh',
                overflowY: 'auto',
                background: 'rgba(30, 41, 59, 0.95)',
                borderRadius: '24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.5rem 2rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(to right, rgba(255,255,255,0.05), transparent)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            padding: '10px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                        }}>
                            <FileText size={24} color="white" />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.02em' }}>Batch Journey</h2>
                            <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem' }}>
                                Tracking history for <span style={{ color: '#fff', fontWeight: '600' }}>{batch.productName}</span>
                            </p>
                        </div>
                    </div>
                    <button
                        className="modal-close"
                        onClick={onClose}
                        style={{ position: 'static' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '2rem' }}>
                    {/* Batch Info Card */}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        padding: '1.25rem',
                        borderRadius: '16px',
                        marginBottom: '2.5rem',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255, 255, 255, 0.5)' }}>Batch ID</span>
                            <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: '600', marginTop: '0.25rem', color: '#818cf8' }}>
                                {batch.batchId}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255, 255, 255, 0.5)' }}>Current Status</span>
                            <div style={{
                                marginTop: '0.25rem',
                                fontWeight: '600',
                                color: batch.isRecalled ? '#ef4444' : (batch.isOpened ? '#10b981' : '#fbbf24'),
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                justifyContent: 'flex-end'
                            }}>
                                {batch.isRecalled ? <AlertTriangle size={16} /> : (batch.isOpened ? <CheckCircle size={16} /> : <Clock size={16} />)}
                                {batch.isRecalled ? 'RECALLED' : (batch.isOpened ? 'CONSUMED' : 'IN CIRCULATION')}
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="timeline" style={{ position: 'relative', paddingLeft: '24px' }}>
                        {/* Vertical Line */}
                        <div style={{
                            position: 'absolute',
                            left: '11px',
                            top: '10px',
                            bottom: '0',
                            width: '2px',
                            background: 'linear-gradient(to bottom, #6366f1, rgba(99, 102, 241, 0.1))'
                        }}></div>

                        {/* 1. Production Event */}
                        <div className="timeline-item" style={{ position: 'relative', marginBottom: '2.5rem', paddingLeft: '24px' }}>
                            <div style={{
                                position: 'absolute',
                                left: '-13px',
                                top: '0',
                                width: '24px',
                                height: '24px',
                                background: '#1e293b',
                                borderRadius: '50%',
                                border: '2px solid #6366f1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 2
                            }}>
                                <Box size={12} color="#6366f1" />
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>Manufactured</h4>
                                    <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Origin</span>
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem' }}>Producer</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                        <User size={14} color="#818cf8" />
                                        <span style={{ fontWeight: '600', color: '#fff' }}>{getEntityName(producerAddress)}</span>
                                    </div>
                                    <div style={{
                                        fontFamily: 'monospace',
                                        background: 'rgba(0,0,0,0.3)',
                                        padding: '0.5rem',
                                        borderRadius: '6px',
                                        fontSize: '0.85rem',
                                        wordBreak: 'break-all',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '0.5rem'
                                    }}>
                                        {producerAddress}
                                        <Copy size={14} style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => copyToClipboard(producerAddress)} />
                                    </div>
                                </div>

                                {productionTxHash && productionTxHash !== '0x0000000000000000000000000000000000000000000000000000000000000000' && (
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem' }}>Transaction Hash</div>
                                        <div style={{
                                            fontFamily: 'monospace',
                                            color: '#94a3b8',
                                            fontSize: '0.8rem',
                                            wordBreak: 'break-all',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            <ExternalLink size={12} />
                                            {productionTxHash}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. Transfer History */}
                        {history.map((record, index) => (
                            <div key={index} className="timeline-item" style={{ position: 'relative', marginBottom: '2.5rem', paddingLeft: '24px' }}>
                                <div style={{
                                    position: 'absolute',
                                    left: '-13px',
                                    top: '0',
                                    width: '24px',
                                    height: '24px',
                                    background: '#1e293b',
                                    borderRadius: '50%',
                                    border: '2px solid #8b5cf6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 2
                                }}>
                                    <Truck size={12} color="#8b5cf6" />
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>Transfer #{index + 1}</h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
                                            <Clock size={12} />
                                            {formatDate(record.timestamp)}
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gap: '1rem', marginBottom: '1rem' }}>
                                        <div>
                                            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem' }}>From</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                <User size={14} color="#cbd5e1" />
                                                <span style={{ fontWeight: '500', color: '#e2e8f0' }}>{getEntityName(record.from)}</span>
                                            </div>
                                            <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all', color: '#94a3b8' }}>{record.from}</div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.2)' }}>
                                            <div style={{ height: '1px', flex: 1, background: 'currentColor' }}></div>
                                            <div style={{ transform: 'rotate(90deg)' }}>➔</div>
                                            <div style={{ height: '1px', flex: 1, background: 'currentColor' }}></div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem' }}>To</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                <User size={14} color="#cbd5e1" />
                                                <span style={{ fontWeight: '500', color: '#e2e8f0' }}>{getEntityName(record.to)}</span>
                                            </div>
                                            <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all', color: '#94a3b8' }}>{record.to}</div>
                                        </div>
                                    </div>

                                    {record.txHash && record.txHash !== '0x0000000000000000000000000000000000000000000000000000000000000000' && (
                                        <div style={{ paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem' }}>Transaction Hash</div>
                                            <div style={{
                                                fontFamily: 'monospace',
                                                color: '#94a3b8',
                                                fontSize: '0.8rem',
                                                wordBreak: 'break-all',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <ExternalLink size={12} />
                                                {record.txHash}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* 3. Final State - Either Opened or Current Status */}
                        <div className="timeline-item" style={{ position: 'relative', paddingLeft: '24px' }}>
                            <div style={{
                                position: 'absolute',
                                left: '-13px',
                                top: '0',
                                width: '24px',
                                height: '24px',
                                background: '#1e293b',
                                borderRadius: '50%',
                                border: `2px solid ${batch.isRecalled ? '#ef4444' : (batch.isOpened ? '#10b981' : '#fbbf24')}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 2
                            }}>
                                {batch.isRecalled ? <AlertTriangle size={12} color="#ef4444" /> : (batch.isOpened ? <CheckCircle size={12} color="#10b981" /> : <Clock size={12} color="#fbbf24" />)}
                            </div>

                            {batch.isOpened ? (
                                // Opened & Consumed State (Final)
                                <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#10b981' }}>Opened & Consumed</h4>
                                        <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Final State</span>
                                    </div>

                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem' }}>Opened By (Pharmacy)</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                            <User size={14} color="#34d399" />
                                            <span style={{ fontWeight: '600', color: '#10b981' }}>{getEntityName(batch.currentOwner)}</span>
                                        </div>
                                        <div style={{
                                            fontFamily: 'monospace',
                                            background: 'rgba(0,0,0,0.3)',
                                            padding: '0.5rem',
                                            borderRadius: '6px',
                                            fontSize: '0.85rem',
                                            wordBreak: 'break-all',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: '0.5rem',
                                            color: '#94a3b8'
                                        }}>
                                            {batch.currentOwner}
                                            <Copy size={14} style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => copyToClipboard(batch.currentOwner)} />
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '0.85rem', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <CheckCircle size={14} />
                                            <span>This batch has been opened and is no longer in circulation</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Current State (Not Yet Opened)
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '600' }}>Current State</h4>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem' }}>Current Owner</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                            <User size={14} color="#818cf8" />
                                            <span style={{ fontWeight: '600', color: '#fff' }}>{getEntityName(batch.currentOwner)}</span>
                                        </div>
                                        <div style={{
                                            fontFamily: 'monospace',
                                            background: 'rgba(0,0,0,0.3)',
                                            padding: '0.5rem',
                                            borderRadius: '6px',
                                            fontSize: '0.85rem',
                                            wordBreak: 'break-all',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: '0.5rem'
                                        }}>
                                            {batch.currentOwner}
                                            <Copy size={14} style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => copyToClipboard(batch.currentOwner)} />
                                        </div>
                                    </div>
                                    {batch.isRecalled && (
                                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                            <div style={{ color: '#ef4444', fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Recall Reason</div>
                                            <div style={{ color: '#fca5a5', fontSize: '0.9rem' }}>{batch.recallReason}</div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BatchDetailsModal;
