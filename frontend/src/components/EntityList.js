import React from 'react';
import { User, Shield, Truck, Pill, Store, Ban, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const EntityList = ({ entities, loading, onRevoke, onGrant }) => {
    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div className="loading" style={{ width: '30px', height: '30px', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 1rem' }}></div>
                <p style={{ color: 'var(--text-secondary)' }}>Loading entities...</p>
            </div>
        );
    }

    if (!entities || entities.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px dashed var(--border-color)' }}>
                <User size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }} />
                <p style={{ color: 'var(--text-secondary)' }}>No registered entities found.</p>
            </div>
        );
    }

    const getRoleIcon = (role) => {
        switch (role) {
            case 'PRODUCER': return <Pill size={16} className="text-blue-400" />;
            case 'DISTRIBUTOR': return <Truck size={16} className="text-amber-400" />;
            case 'PHARMACY': return <Store size={16} className="text-emerald-400" />;
            default: return <User size={16} className="text-gray-400" />;
        }
    };

    return (
        <div className="card" style={{ marginTop: '2rem', padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem' }}>
                    <Shield size={20} color="var(--primary)" /> Registered Entities
                </h3>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                            <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '500', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                            <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '500', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                            <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '500', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                            <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '500', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Wallet Address</th>
                            <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '500', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entities.map((entity, index) => (
                            <tr key={index} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} className="hover:bg-slate-800">
                                <td style={{ padding: '1rem 1.5rem', fontWeight: '600', color: 'var(--text-primary)' }}>{entity.name}</td>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                                        {getRoleIcon(entity.entityType)}
                                        <span style={{ fontSize: '0.9rem' }}>{entity.entityType}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    {entity.isActive ? (
                                        <span className="badge" style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                            background: 'var(--success-bg)', color: 'var(--success)',
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600'
                                        }}>
                                            <CheckCircle size={12} /> Active
                                        </span>
                                    ) : (
                                        <span className="badge" style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                            background: 'var(--danger-bg)', color: 'var(--danger)',
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600'
                                        }}>
                                            <XCircle size={12} /> Revoked
                                        </span>
                                    )}
                                </td>
                                <td style={{ padding: '1rem 1.5rem', fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    {entity.wallet}
                                </td>
                                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                    {entity.isActive ? (
                                        <button
                                            className="btn btn-danger"
                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                            onClick={() => onRevoke(entity)}
                                        >
                                            <Ban size={14} /> Revoke
                                        </button>
                                    ) : (
                                        <button
                                            className="btn btn-success"
                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                            onClick={() => onGrant(entity)}
                                        >
                                            <RefreshCw size={14} /> Activate
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EntityList;
