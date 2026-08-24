import React, { useState, useEffect, useContext } from 'react';
import { Clock, Upload, CheckCircle, XCircle } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../config';
import toast from 'react-hot-toast';

const ChefSettingsPage = () => {
    const { user, updateUser } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('Operating Hours');
    
    // Operating Hours State
    const [lunchActive, setLunchActive] = useState(true);
    const [lunchStart, setLunchStart] = useState("12:00");
    const [lunchEnd, setLunchEnd] = useState("14:30");
    const [lunchCutoff, setLunchCutoff] = useState("10:30");
    
    const [dinnerActive, setDinnerActive] = useState(true);
    const [dinnerStart, setDinnerStart] = useState("19:00");
    const [dinnerEnd, setDinnerEnd] = useState("21:00");
    const [dinnerCutoff, setDinnerCutoff] = useState("17:30");

    // Delivery Settings State
    const [maxOrdersPerSlot, setMaxOrdersPerSlot] = useState(20);
    const [deliveryRadius, setDeliveryRadius] = useState(6);

    // Kitchen Information State
    const [businessName, setBusinessName] = useState("");
    const [description, setDescription] = useState("");
    const [kitchenImage, setKitchenImage] = useState("");

    // Documents State
    const [idProof, setIdProof] = useState("");
    const [fssaiCertificate, setFssaiCertificate] = useState("");
    const [verificationStatus, setVerificationStatus] = useState({ id: false, fssai: false, kitchen: false });

    // Bank Details State
    const [accountName, setAccountName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [ifscCode, setIfscCode] = useState("");
    const [bankName, setBankName] = useState("");

    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingDoc, setUploadingDoc] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${API_URL}/users/profile`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    
                    // Populate operating hours if they exist
                    if (data.operatingHours) {
                        if (data.operatingHours.lunch) {
                            setLunchActive(data.operatingHours.lunch.active);
                            setLunchStart(data.operatingHours.lunch.start || "12:00");
                            setLunchEnd(data.operatingHours.lunch.end || "14:30");
                            setLunchCutoff(data.operatingHours.lunch.cutoff || "10:30");
                        }
                        if (data.operatingHours.dinner) {
                            setDinnerActive(data.operatingHours.dinner.active);
                            setDinnerStart(data.operatingHours.dinner.start || "19:00");
                            setDinnerEnd(data.operatingHours.dinner.end || "21:00");
                            setDinnerCutoff(data.operatingHours.dinner.cutoff || "17:30");
                        }
                    }

                    if (data.maxOrdersPerSlot !== undefined) setMaxOrdersPerSlot(data.maxOrdersPerSlot);
                    if (data.deliveryRadius !== undefined) setDeliveryRadius(data.deliveryRadius);
                    
                    setBusinessName(data.businessName || "");
                    setDescription(data.description || "");
                    setKitchenImage(data.kitchenImage || "");

                    if (data.documents) {
                        setIdProof(data.documents.idProof || "");
                        setFssaiCertificate(data.documents.fssaiCertificate || "");
                    }

                    if (data.bankDetails) {
                        setAccountName(data.bankDetails.accountName || "");
                        setAccountNumber(data.bankDetails.accountNumber || "");
                        setIfscCode(data.bankDetails.ifscCode || "");
                        setBankName(data.bankDetails.bankName || "");
                    }

                    setVerificationStatus({
                        id: data.isIdVerified || false,
                        fssai: data.isFssaiVerified || false,
                        kitchen: data.isKitchenVerified || false
                    });
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
            }
        };
        
        if (user) {
            fetchSettings();
        }
    }, [user]);

    const handleFileUpload = async (e, setUrl, setLoader) => {
        const file = e.target.files[0];
        if (!file) return;
        setLoader(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${user.token}`
                },
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                setUrl(data.url);
                toast.success('File uploaded successfully!');
            } else {
                toast.error(data.message || 'File upload failed');
            }
        } catch (error) {
            toast.error('An error occurred during upload');
        } finally {
            setLoader(false);
        }
    };

    const handleSave = async () => {
        try {
            const payload = {
                operatingHours: {
                    lunch: { active: lunchActive, start: lunchStart, end: lunchEnd, cutoff: lunchCutoff },
                    dinner: { active: dinnerActive, start: dinnerStart, end: dinnerEnd, cutoff: dinnerCutoff }
                },
                maxOrdersPerSlot,
                deliveryRadius,
                businessName,
                description,
                kitchenImage,
                documents: { idProof, fssaiCertificate },
                bankDetails: { accountName, accountNumber, ifscCode, bankName }
            };

            const res = await fetch(`${API_URL}/users/chef-settings`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}` 
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const updatedSettings = await res.json();
                updateUser({
                    ...user,
                    businessName: updatedSettings.businessName,
                    description: updatedSettings.description,
                    kitchenImage: updatedSettings.kitchenImage,
                    operatingHours: updatedSettings.operatingHours,
                    deliveryRadius: updatedSettings.deliveryRadius,
                    maxOrdersPerSlot: updatedSettings.maxOrdersPerSlot,
                    isOpen: updatedSettings.isOpen,
                    documents: updatedSettings.documents,
                    bankDetails: updatedSettings.bankDetails
                });
                toast.success('Settings saved successfully!');
            } else {
                toast.error('Failed to save settings');
            }
        } catch (error) {
            toast.error('An error occurred');
        }
    };

    const tabs = [
        'Operating Hours',
        'Delivery Settings',
        'Kitchen Information',
        'Documents',
        'Bank Details'
    ];

    const tabStyle = (isActive) => ({
        padding: '12px 16px',
        borderRadius: '8px',
        fontSize: '0.9rem',
        fontWeight: 600,
        cursor: 'pointer',
        background: isActive ? '#EAF5F0' : 'transparent',
        color: isActive ? '#0F3F26' : 'var(--text-muted)',
        border: 'none',
        textAlign: 'left',
        width: '100%',
        transition: 'all 0.2s ease',
        marginBottom: '4px'
    });

    const inputWrapperStyle = {
        background: '#F8F9FA',
        borderRadius: '8px',
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '1px solid var(--border-subtle)',
        marginTop: '8px',
        marginBottom: '20px'
    };
    
    const standardInputStyle = {
        background: '#F8F9FA',
        borderRadius: '8px',
        padding: '12px 16px',
        width: '100%',
        border: '1px solid var(--border-subtle)',
        marginTop: '8px',
        marginBottom: '20px',
        outline: 'none',
        color: '#0F3F26',
        fontWeight: 500
    };

    const VerificationBadge = ({ isVerified, label }) => (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderRadius: '20px', background: isVerified ? '#EAF5F0' : '#FFF0F0', color: isVerified ? '#27ae60' : '#e74c3c', fontSize: '0.75rem', fontWeight: 700, marginLeft: '12px' }}>
            {isVerified ? <CheckCircle size={14} /> : <XCircle size={14} />}
            {isVerified ? 'Verified' : 'Pending Verification'}
        </div>
    );

    return (
        <div style={{ maxWidth: '1000px' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F3F26', margin: '0 0 8px 0' }}>Kitchen Settings</h1>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>Manage your kitchen operations, verification documents, and payouts.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '32px', alignItems: 'start' }}>
                
                {/* Inner Sidebar */}
                <div style={{ background: '#fff', borderRadius: '12px', padding: '12px', border: '1px solid var(--border-subtle)' }}>
                    {tabs.map(tab => (
                        <button key={tab} style={tabStyle(activeTab === tab)} onClick={() => setActiveTab(tab)}>
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Main Settings Area */}
                <div style={{ background: '#fff', borderRadius: '12px', padding: '32px', border: '1px solid var(--border-subtle)' }}>
                    
                    {activeTab === 'Operating Hours' && (
                        <div>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F3F26', margin: '0 0 8px 0' }}>Operating Hours</h2>
                            <p style={{ color: 'var(--text-muted)', margin: '0 0 32px 0', fontSize: '0.9rem' }}>Set your lunch and dinner serving times and cut-off times for orders.</p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                                {/* Lunch Section */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                        <span style={{ fontWeight: 700, color: '#0F3F26' }}>Lunch</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <input type="checkbox" id="lunchActive" checked={lunchActive} onChange={e => setLunchActive(e.target.checked)} style={{ accentColor: '#27ae60' }} />
                                            <label htmlFor="lunchActive" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F3F26' }}>Active</label>
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Start Time</label>
                                        <div style={inputWrapperStyle}>
                                            <input type="time" value={lunchStart} onChange={(e) => setLunchStart(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontWeight: 600, color: '#0F3F26' }} />
                                            <Clock size={16} color="var(--text-muted)" />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>End Time</label>
                                        <div style={inputWrapperStyle}>
                                            <input type="time" value={lunchEnd} onChange={(e) => setLunchEnd(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontWeight: 600, color: '#0F3F26' }} />
                                            <Clock size={16} color="var(--text-muted)" />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Order Cut-off Time</label>
                                        <div style={inputWrapperStyle}>
                                            <input type="time" value={lunchCutoff} onChange={(e) => setLunchCutoff(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontWeight: 600, color: '#0F3F26' }} />
                                            <Clock size={16} color="var(--text-muted)" />
                                        </div>
                                    </div>
                                </div>

                                {/* Dinner Section */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                        <span style={{ fontWeight: 700, color: '#0F3F26' }}>Dinner</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <input type="checkbox" id="dinnerActive" checked={dinnerActive} onChange={e => setDinnerActive(e.target.checked)} style={{ accentColor: '#27ae60' }} />
                                            <label htmlFor="dinnerActive" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F3F26' }}>Active</label>
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Start Time</label>
                                        <div style={inputWrapperStyle}>
                                            <input type="time" value={dinnerStart} onChange={(e) => setDinnerStart(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontWeight: 600, color: '#0F3F26' }} />
                                            <Clock size={16} color="var(--text-muted)" />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>End Time</label>
                                        <div style={inputWrapperStyle}>
                                            <input type="time" value={dinnerEnd} onChange={(e) => setDinnerEnd(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontWeight: 600, color: '#0F3F26' }} />
                                            <Clock size={16} color="var(--text-muted)" />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Order Cut-off Time</label>
                                        <div style={inputWrapperStyle}>
                                            <input type="time" value={dinnerCutoff} onChange={(e) => setDinnerCutoff(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontWeight: 600, color: '#0F3F26' }} />
                                            <Clock size={16} color="var(--text-muted)" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Delivery Settings' && (
                        <div>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F3F26', margin: '0 0 8px 0' }}>Delivery Settings</h2>
                            <p style={{ color: 'var(--text-muted)', margin: '0 0 32px 0', fontSize: '0.9rem' }}>Configure how far you deliver and your capacity.</p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                                <div>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F3F26', display: 'block', marginBottom: '4px' }}>Maximum Orders / Slot</label>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>Limit the number of orders you can handle in a time slot.</p>
                                    <div style={{ ...inputWrapperStyle, marginTop: 0 }}>
                                        <input type="number" value={maxOrdersPerSlot} onChange={(e) => setMaxOrdersPerSlot(Number(e.target.value))} style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontWeight: 600, color: '#0F3F26' }} />
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>orders</span>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F3F26', display: 'block', marginBottom: '4px' }}>Delivery Radius</label>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>Set the maximum delivery distance from your kitchen.</p>
                                    <div style={{ ...inputWrapperStyle, marginTop: 0 }}>
                                        <select value={deliveryRadius} onChange={(e) => setDeliveryRadius(Number(e.target.value))} style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontWeight: 600, color: '#0F3F26', appearance: 'none' }}>
                                            <option value="3">3 KM</option>
                                            <option value="6">6 KM</option>
                                            <option value="10">10 KM</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Kitchen Information' && (
                        <div>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F3F26', margin: '0 0 8px 0' }}>Kitchen Information</h2>
                            <p style={{ color: 'var(--text-muted)', margin: '0 0 32px 0', fontSize: '0.9rem' }}>Public details about your kitchen visible to customers.</p>

                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F3F26' }}>Business Name <VerificationBadge isVerified={verificationStatus.kitchen} /></label>
                                <input type="text" style={standardInputStyle} value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="E.g. Simhadri's Authentic Kitchen" />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F3F26' }}>Description</label>
                                <textarea style={{ ...standardInputStyle, minHeight: '100px', resize: 'vertical' }} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your cooking style and specialties..." />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F3F26', display: 'block', marginBottom: '12px' }}>Kitchen Cover Image</label>
                                {kitchenImage && <img src={kitchenImage} alt="Kitchen Cover" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }} />}
                                <label className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--border-subtle)' }}>
                                    <Upload size={16} /> {uploadingImage ? 'Uploading...' : 'Upload Image'}
                                    <input type="file" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, setKitchenImage, setUploadingImage)} disabled={uploadingImage} accept="image/*" />
                                </label>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Documents' && (
                        <div>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F3F26', margin: '0 0 8px 0' }}>Verification Documents</h2>
                            <p style={{ color: 'var(--text-muted)', margin: '0 0 32px 0', fontSize: '0.9rem' }}>Upload mandatory documents to get verified and open your kitchen.</p>

                            <div style={{ marginBottom: '32px', padding: '20px', border: '1px dashed var(--border-subtle)', borderRadius: '12px', background: '#fafafa' }}>
                                <label style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F3F26', display: 'block', marginBottom: '8px' }}>
                                    ID Proof (Aadhar / PAN) <VerificationBadge isVerified={verificationStatus.id} />
                                </label>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Upload a clear image or PDF of your government-issued ID.</p>
                                
                                {idProof && (
                                    <div style={{ marginBottom: '16px' }}>
                                        <a href={idProof} target="_blank" rel="noreferrer" style={{ color: '#27ae60', fontWeight: 600, fontSize: '0.9rem' }}>View Uploaded ID Document</a>
                                    </div>
                                )}
                                
                                <label className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', background: '#fff', border: '1px solid var(--border-subtle)' }}>
                                    <Upload size={16} /> {uploadingDoc ? 'Uploading...' : 'Upload ID Proof'}
                                    <input type="file" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, setIdProof, setUploadingDoc)} disabled={uploadingDoc} accept="image/*,application/pdf" />
                                </label>
                            </div>

                            <div style={{ padding: '20px', border: '1px dashed var(--border-subtle)', borderRadius: '12px', background: '#fafafa' }}>
                                <label style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F3F26', display: 'block', marginBottom: '8px' }}>
                                    FSSAI Certificate <VerificationBadge isVerified={verificationStatus.fssai} />
                                </label>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Upload your valid Food Safety and Standards Authority of India certificate.</p>
                                
                                {fssaiCertificate && (
                                    <div style={{ marginBottom: '16px' }}>
                                        <a href={fssaiCertificate} target="_blank" rel="noreferrer" style={{ color: '#27ae60', fontWeight: 600, fontSize: '0.9rem' }}>View Uploaded FSSAI Certificate</a>
                                    </div>
                                )}

                                <label className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', background: '#fff', border: '1px solid var(--border-subtle)' }}>
                                    <Upload size={16} /> {uploadingDoc ? 'Uploading...' : 'Upload FSSAI Certificate'}
                                    <input type="file" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, setFssaiCertificate, setUploadingDoc)} disabled={uploadingDoc} accept="image/*,application/pdf" />
                                </label>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Bank Details' && (
                        <div>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F3F26', margin: '0 0 8px 0' }}>Bank Details</h2>
                            <p style={{ color: 'var(--text-muted)', margin: '0 0 32px 0', fontSize: '0.9rem' }}>Provide your bank account details for payouts and settlements.</p>

                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F3F26' }}>Account Holder Name</label>
                                <input type="text" style={standardInputStyle} value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="Name exactly as it appears on bank account" />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F3F26' }}>Bank Account Number</label>
                                <input type="text" style={standardInputStyle} value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="e.g. 0123456789" />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F3F26' }}>IFSC Code</label>
                                    <input type="text" style={standardInputStyle} value={ifscCode} onChange={(e) => setIfscCode(e.target.value.toUpperCase())} placeholder="e.g. SBIN0001234" />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F3F26' }}>Bank Name</label>
                                    <input type="text" style={standardInputStyle} value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. State Bank of India" />
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-subtle)', paddingTop: '24px' }}>
                        <button onClick={handleSave} className="btn btn-primary" style={{ width: '100%', padding: '14px', borderRadius: '8px', fontWeight: 600 }}>
                            Save {activeTab} Settings
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ChefSettingsPage;
