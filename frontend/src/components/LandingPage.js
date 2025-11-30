import React from 'react';
import { Shield, Activity, Box, ArrowRight, Hexagon, Database, Lock } from 'lucide-react';

const LandingPage = ({ onConnect, loading }) => {
    return (
        <div className="landing-page">
            <div className="hero-section">
                <div className="hero-content">
                    <div className="hero-badge">
                        <Hexagon size={16} />
                        <span>Blockchain Supply Chain</span>
                    </div>

                    <h1 className="hero-title">
                        The Future of <br />
                        <span className="text-gradient">Medicine Tracking</span>
                    </h1>

                    <p className="hero-subtitle">
                        Ensure authenticity and safety with our decentralized supply chain solution.
                        Track every step from production to pharmacy with immutable transparency.
                    </p>

                    <div className="hero-actions">
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={onConnect}
                            disabled={loading}
                        >
                            {loading ? (
                                <>Connecting...</>
                            ) : (
                                <>
                                    Connect Wallet <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                        <button className="btn btn-outline btn-lg">
                            Learn More
                        </button>
                    </div>
                </div>
            </div>

            <div className="features-grid">
                <div className="feature-card">
                    <div className="feature-icon-wrapper icon-blue">
                        <Shield size={32} />
                    </div>
                    <h3>Secure Tracking</h3>
                    <p>Immutable record keeping on the Ethereum blockchain ensures data can never be tampered with.</p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon-wrapper icon-green">
                        <Activity size={32} />
                    </div>
                    <h3>Real-time Status</h3>
                    <p>Monitor the exact status and location of medicine batches as they move through the supply chain.</p>
                </div>


                <div className="feature-card">
                    <div className="feature-icon-wrapper icon-purple">
                        <Database size={32} />
                    </div>
                    <h3>Transparent Data</h3>
                    <p>Complete visibility into the history of every product, building trust between all stakeholders.</p>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
