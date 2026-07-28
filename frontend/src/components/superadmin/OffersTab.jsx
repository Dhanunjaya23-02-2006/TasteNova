import React from 'react';
import { motion } from 'framer-motion';

const OffersTab = ({ offers, offerData, setOfferData, handleCreateGlobalOffer }) => {
    return (
        <motion.div key="offers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '30px' }}>Global Promos</h2>
            <div className="glass-panel mb-5" style={{ padding: '24px', maxWidth: '600px', marginBottom: '30px' }}>
                <h4 className="mb-4">Create Global Promo</h4>
                <form onSubmit={handleCreateGlobalOffer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="input-group">
                        <label>Promo Code</label>
                        <input type="text" className="form-control" placeholder="e.g. WELCOME100" required value={offerData.code} onChange={(e) => setOfferData({...offerData, code: e.target.value.toUpperCase()})} />
                    </div>
                    <div className="input-group">
                        <label>Description</label>
                        <input type="text" className="form-control" placeholder="Describe this offer" required value={offerData.description} onChange={(e) => setOfferData({...offerData, description: e.target.value})} />
                    </div>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div className="input-group flex-1">
                            <label>Discount (%)</label>
                            <input type="number" className="form-control" placeholder="15" required value={offerData.discountPercentage} onChange={(e) => setOfferData({...offerData, discountPercentage: e.target.value})} />
                        </div>
                        <div className="input-group flex-1">
                            <label>Max Amount (₹)</label>
                            <input type="number" className="form-control" placeholder="200" required value={offerData.maxDiscountAmount} onChange={(e) => setOfferData({...offerData, maxDiscountAmount: e.target.value})} />
                        </div>
                    </div>
                    <div className="input-group">
                        <label>Valid Until</label>
                        <input type="date" className="form-control" required value={offerData.validUntil} onChange={(e) => setOfferData({...offerData, validUntil: e.target.value})} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>Launch Global Promo</button>
                </form>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {offers.filter(o => o.scope === 'Global').map(offer => (
                    <div key={offer._id} className="glass-panel" style={{ padding: '20px' }}>
                        <div className="flex justify-between align-center mb-3">
                            <h4 style={{ margin: 0, color: 'var(--primary-color)' }}>{offer.code}</h4>
                            <span className="status-badge status-info">Global</span>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{offer.description}</p>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default OffersTab;
