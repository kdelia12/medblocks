import React from 'react';
import { Package, Calendar, Thermometer, Activity, ArrowRight, AlertTriangle, Unlock, Box, CheckCircle, FileText } from 'lucide-react';

const BatchCard = ({ batch, onTransfer, onOpen, onRecall, onClearRecall, onViewDetails, userRole, isOwner, isPaused }) => {
    const isExpired = new Date(batch.expiryDate) <= new Date();

    const getStatusColor = (status) => {
        switch (status) {
            case 'PRODUCER': return 'var(--info)';
            case 'DISTRIBUTOR': return 'var(--warning)';
            case 'PHARMACY': return 'var(--success)';
            case 'RECALLED': return 'var(--danger)';
            default: return 'var(--text-muted)';
        }
    };

    return (
        <div className={`card ${batch.isRecalled ? 'border-red-500' : ''}`}>
            {batch.isRecalled && (
                <div style={{
                    background: 'var(--danger-bg)',
                    color: 'var(--danger)',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertTriangle size={18} /> RECALLED: {batch.recallReason}
                    </div>
                    {userRole === 'admin' && (
                        <button
                            className="btn btn-sm btn-outline"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                            onClick={() => onClearRecall(batch)}
                            disabled={isPaused}
                        >
                            Clear
                        </button>
                    )}
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer'
                    }} onClick={() => onViewDetails(batch)}>
                        <Box size={24} color="var(--primary)" />
                    </div>
                    <div>
                        <h3
                            style={{ fontSize: '1.1rem', margin: '0 0 0.25rem 0', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.2)' }}
                            onClick={() => onViewDetails(batch)}
                        >
                            {batch.productName}
                        </h3>
                        <span style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            fontFamily: 'monospace',
                            background: 'rgba(0,0,0,0.2)',
                            padding: '2px 6px',
                            borderRadius: '4px'
                        }}>
                            #{batch.batchId}
                        </span>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{
                        color: getStatusColor(batch.status),
                        fontWeight: '600',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '6px',
                        background: 'var(--bg-dark)',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        border: '1px solid var(--border-color)'
                    }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: getStatusColor(batch.status) }}></div>
                        {batch.status}
                    </div>
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1.5rem',
                background: 'rgba(0,0,0,0.2)',
                padding: '1rem',
                borderRadius: 'var(--radius-lg)'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quantity</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: '500' }}>
                        <Package size={14} className="text-blue-400" />
                        <span>{batch.totalUnits} Units</span>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Storage</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: '500' }}>
                        <Thermometer size={14} className="text-amber-400" />
                        <span>{batch.storageRequirements}</span>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Expiry Date</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isExpired ? 'var(--danger)' : 'var(--text-primary)', fontWeight: '500' }}>
                        <Calendar size={14} className={isExpired ? 'text-red-400' : 'text-emerald-400'} />
                        <span>{batch.expiryDate}</span>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Owner</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: '500' }}>
                        <Activity size={14} className="text-purple-400" />
                        <span title={batch.currentOwner} style={{ cursor: 'help' }}>
                            {batch.currentOwner.slice(0, 6)}...{batch.currentOwner.slice(-4)}
                        </span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button className="btn btn-outline" style={{ flex: 1, minWidth: '120px' }} onClick={() => onViewDetails(batch)}>
                    <FileText size={16} /> History
                </button>

                {isOwner && !batch.isOpened && !batch.isRecalled && (
                    <button className="btn btn-primary" style={{ flex: 1, minWidth: '120px' }} onClick={() => onTransfer(batch)} disabled={isPaused}>
                        <ArrowRight size={16} /> Transfer
                    </button>
                )}

                {userRole === 'pharmacy' && isOwner && !batch.isOpened && !batch.isRecalled && (
                    <button className="btn btn-success" style={{ flex: 1, minWidth: '120px' }} onClick={() => onOpen(batch)} disabled={isPaused}>
                        <Unlock size={16} /> Open
                    </button>
                )}

                {batch.isOpened && (
                    <div style={{
                        flex: 1,
                        minWidth: '120px',
                        textAlign: 'center',
                        padding: '0.6rem',
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: 'var(--success)',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                    }}>
                        <CheckCircle size={16} /> Opened
                    </div>
                )}

                {userRole === 'admin' && !batch.isRecalled && (
                    <button className="btn btn-danger" style={{ flex: 1, minWidth: '120px' }} onClick={() => onRecall(batch)} disabled={isPaused}>
                        <AlertTriangle size={16} /> Recall
                    </button>
                )}
            </div>
        </div>
    );
};

export default BatchCard;
