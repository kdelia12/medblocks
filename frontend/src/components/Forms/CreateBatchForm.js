import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Package, DollarSign, Thermometer, X, RefreshCw } from 'lucide-react';

const CreateBatchForm = ({ onSubmit, onClose, loading }) => {
    const [formData, setFormData] = useState({
        batchId: '',
        productName: '',
        totalUnits: '',
        unitValue: '',
        storageRequirements: '',
        expiryDate: ''
    });

    const generateId = () => {
        const batchId = Math.floor(Date.now() / 1000) * 1000 + Math.floor(Math.random() * 1000);
        setFormData(prev => ({ ...prev, batchId: batchId.toString() }));
    };

    useEffect(() => {
        generateId();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>
                    <X size={20} />
                </button>

                <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Plus className="text-blue-500" /> Create New Batch
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Batch ID</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                value={formData.batchId}
                                onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                                placeholder="Enter Batch ID or Generate"
                                required
                            />
                            <button 
                                type="button" 
                                onClick={generateId}
                                className="btn btn-outline"
                                style={{ padding: '0.75rem', aspectRatio: '1/1' }}
                                title="Generate Random ID"
                            >
                                <RefreshCw size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Product Name</label>
                        <div style={{ position: 'relative' }}>
                            <Package size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
                            <input
                                type="text"
                                required
                                placeholder="e.g. Paracetamol 500mg"
                                value={formData.productName}
                                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                                style={{ paddingLeft: '40px' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Total Units</label>
                            <input
                                type="number"
                                required
                                min="1"
                                placeholder="1000"
                                value={formData.totalUnits}
                                onChange={(e) => setFormData({ ...formData, totalUnits: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Unit Value (Wei)</label>
                            <div style={{ position: 'relative' }}>
                                <DollarSign size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    placeholder="100"
                                    value={formData.unitValue}
                                    onChange={(e) => setFormData({ ...formData, unitValue: e.target.value })}
                                    style={{ paddingLeft: '40px' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Storage Requirements</label>
                        <div style={{ position: 'relative' }}>
                            <Thermometer size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
                            <input
                                type="text"
                                required
                                placeholder="e.g. Keep below 25°C"
                                value={formData.storageRequirements}
                                onChange={(e) => setFormData({ ...formData, storageRequirements: e.target.value })}
                                style={{ paddingLeft: '40px' }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Expiry Date</label>
                        <div style={{ position: 'relative' }}>
                            <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
                            <input
                                type="datetime-local"
                                required
                                value={formData.expiryDate}
                                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                style={{ paddingLeft: '40px' }}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-success" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
                        {loading ? 'Creating...' : 'Create Batch'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateBatchForm;
