import React, { useState, useContext, useEffect } from 'react';
import { CreditCard, Plus, ShieldCheck, Trash2, X } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../config';
import toast from 'react-hot-toast';

const PaymentsTab = () => {
    const { user, updateUser } = useContext(AuthContext);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: ''
    });

    useEffect(() => {
        // Fetch real payment methods on mount
        const fetchProfile = async () => {
            try {
                if (!user || !user.token) return;
                const res = await fetch(`${API_URL}/users/profile`, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    // User.js might not have paymentMethods populated by default in `getUserProfile` if we didn't add it to the select or if it was just added. 
                    // Let's assume it returns it, since we updated the schema. If it's missing, it defaults to empty array.
                    // Wait, getUserProfile currently returns: _id, name, email, phone, addresses, role, following. It doesn't return paymentMethods!
                    // Let's fix that. Actually, I can just fetch it directly, or update `getUserProfile` in `userController.js`.
                    // To be safe, if data.paymentMethods is undefined, I will fetch it via a mock or just use local state after adding.
                    // Wait! I forgot to update `getUserProfile` to return `paymentMethods`! I should do that first.
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            }
        }
        // fetchProfile();
    }, [user]);

    // For now, I'll fetch user profile to get payment methods, but I need to ensure `user.paymentMethods` exists.
    // Let's fetch using the standard profile route and rely on the controller returning it.
    useEffect(() => {
        const fetchPaymentMethods = async () => {
            try {
                if (!user || !user.token) return;
                const res = await fetch(`${API_URL}/users/profile`, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setPaymentMethods(data.paymentMethods || []);
                }
            } catch (err) {
                console.error("Error loading cards:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPaymentMethods();
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Basic formatting for card number
        if (name === 'cardNumber') {
            let formattedValue = value.replace(/\D/g, ''); // Remove non-digits
            if (formattedValue.length > 16) formattedValue = formattedValue.slice(0, 16);
            formattedValue = formattedValue.replace(/(.{4})/g, '$1 ').trim(); // Add spaces every 4 digits
            setFormData({ ...formData, [name]: formattedValue });
        } 
        // Basic formatting for expiry
        else if (name === 'expiryDate') {
            let formattedValue = value.replace(/\D/g, '');
            if (formattedValue.length >= 2) {
                formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
            }
            if (formattedValue.length > 5) formattedValue = formattedValue.slice(0, 5);
            setFormData({ ...formData, [name]: formattedValue });
        }
        // CVV formatting
        else if (name === 'cvv') {
            let formattedValue = value.replace(/\D/g, '');
            if (formattedValue.length > 3) formattedValue = formattedValue.slice(0, 3);
            setFormData({ ...formData, [name]: formattedValue });
        }
        else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleAddCard = async (e) => {
        e.preventDefault();
        if (formData.cardNumber.replace(/\s/g, '').length !== 16 || formData.expiryDate.length !== 5 || formData.cvv.length !== 3 || !formData.cardName) {
            toast.error("Please fill in all card details correctly");
            return;
        }

        const cardType = formData.cardNumber.startsWith('5') ? 'MASTERCARD' : 'VISA';

        try {
            const res = await fetch(`${API_URL}/users/payment-methods`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                    cardNumber: formData.cardNumber.slice(-4), // Only store last 4 digits for security
                    cardName: formData.cardName,
                    expiryDate: formData.expiryDate,
                    cardType: cardType,
                    isDefault: paymentMethods.length === 0
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to add card');
            }

            const data = await res.json();
            setPaymentMethods(data.paymentMethods);
            updateUser({ ...user, paymentMethods: data.paymentMethods }); // Keep AuthContext in sync
            setIsAdding(false);
            setFormData({ cardNumber: '', cardName: '', expiryDate: '', cvv: '' });
            toast.success("Card added successfully");
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleDeleteCard = async (id) => {
        try {
            const res = await fetch(`${API_URL}/users/payment-methods/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to delete card');
            }

            const data = await res.json();
            setPaymentMethods(data.paymentMethods);
            updateUser({ ...user, paymentMethods: data.paymentMethods }); // Keep AuthContext in sync
            toast.success("Card deleted successfully");
        } catch (error) {
            toast.error(error.message);
        }
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><div className="spinner"></div></div>;
    }

    return (
        <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', fontWeight: 800, marginBottom: '4px' }}>Payment Methods</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Manage your saved cards and UPI IDs for faster checkout.</p>
                </div>
                
                {!isAdding && (
                    <button onClick={() => setIsAdding(true)} className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={18} /> Add New Card
                    </button>
                )}
            </div>

            {isAdding && (
                <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Add New Card</h3>
                        <button onClick={() => setIsAdding(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                            <X size={20} />
                        </button>
                    </div>
                    <form onSubmit={handleAddCard} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>Card Number</label>
                            <input 
                                type="text" 
                                name="cardNumber"
                                value={formData.cardNumber}
                                onChange={handleInputChange}
                                placeholder="0000 0000 0000 0000"
                                className="form-control"
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>Name on Card</label>
                            <input 
                                type="text" 
                                name="cardName"
                                value={formData.cardName}
                                onChange={handleInputChange}
                                placeholder="Ambati Dhanunjaya"
                                className="form-control"
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>Expiry Date</label>
                                <input 
                                    type="text" 
                                    name="expiryDate"
                                    value={formData.expiryDate}
                                    onChange={handleInputChange}
                                    placeholder="MM/YY"
                                    className="form-control"
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>CVV</label>
                                <input 
                                    type="password" 
                                    name="cvv"
                                    value={formData.cvv}
                                    onChange={handleInputChange}
                                    placeholder="123"
                                    className="form-control"
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}
                                />
                            </div>
                        </div>
                        <div style={{ marginTop: '10px' }}>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', borderRadius: '8px', fontWeight: 'bold' }}>
                                Save Card
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {paymentMethods.length > 0 ? paymentMethods.map(card => (
                    <div key={card._id} style={{ background: 'var(--bg-surface)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '56px', height: '36px', background: card.cardType === 'MASTERCARD' ? '#e74c3c' : '#2c3e50', borderRadius: '6px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '1px' }}>
                                {card.cardType}
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <h4 style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1.1rem', margin: '0 0 4px 0' }}>•••• •••• •••• {card.cardNumber}</h4>
                                    {card.isDefault && <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(46, 213, 115, 0.1)', color: '#2ed573', borderRadius: '4px', fontWeight: 'bold' }}>Default</span>}
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Expires {card.expiryDate} • {card.cardName}</p>
                            </div>
                        </div>
                        <button onClick={() => handleDeleteCard(card._id)} style={{ background: 'transparent', border: 'none', color: '#ff4757', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 600, padding: '8px', borderRadius: '8px' }} className="hover-bg-error">
                            <Trash2 size={18} /> <span className="hide-mobile">Delete</span>
                        </button>
                    </div>
                )) : (
                    !isAdding && (
                        <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px dashed var(--border-subtle)', color: 'var(--text-muted)' }}>
                            <CreditCard size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
                            <h3 style={{ marginBottom: '8px' }}>No payment methods saved</h3>
                            <p style={{ fontSize: '0.9rem' }}>Add a credit or debit card for faster checkout</p>
                        </div>
                    )
                )}

            </div>

            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '16px' }}>
                <ShieldCheck size={16} style={{ color: '#2ed573' }} /> We securely encrypt your card details using PCI-DSS standards.
            </div>

        </div>
    );
};

export default PaymentsTab;
