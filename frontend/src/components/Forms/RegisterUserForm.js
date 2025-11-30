import React, { useState } from 'react';
import { UserPlus, User, Shield, X } from 'lucide-react';

const RegisterUserForm = ({ onSubmit, onClose, loading }) => {
    const [formData, setFormData] = useState({
        user: '',
        name: '',
        role: ''
    });

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
                    <UserPlus className="text-blue-500" /> Register New User
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Wallet Address</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
                            <input
                                type="text"
                                required
                                placeholder="0x..."
                                value={formData.user}
                                onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                                style={{ paddingLeft: '40px' }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Entity Name</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. PT. Pharma Indonesia"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Role</label>
                        <div style={{ position: 'relative' }}>
                            <Shield size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
                            <select
                                required
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                style={{ paddingLeft: '40px' }}
                            >
                                <option value="">Select Role</option>
                                <option value="PRODUCER_ROLE">Producer</option>
                                <option value="DISTRIBUTOR_ROLE">Distributor</option>
                                <option value="PHARMACY_ROLE">Pharmacy</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-success" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
                        {loading ? 'Registering...' : 'Register User'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterUserForm;
