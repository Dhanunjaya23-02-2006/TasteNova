import React, { useContext, useState } from 'react';
import { CheckCircle2, Clock, AlertCircle, FileText, ChevronRight, Upload, X, Loader } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api';
import toast from 'react-hot-toast';

const DeliveryDocumentsPage = () => {
    const { user, updateUser } = useContext(AuthContext);
    const [showModal, setShowModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        drivingLicence: user?.documents?.drivingLicence || '',
        vehicleRc: user?.documents?.vehicleRc || '',
        idProof: user?.documents?.idProof || '',
        vehicleInsurance: user?.documents?.vehicleInsurance || ''
    });

    const handleFileUpload = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;

        const data = new FormData();
        data.append('image', file); // API expects 'image' for both images and pdfs based on multer config

        setUploading(true);
        const toastId = toast.loading('Uploading document...');
        
        try {
            const res = await api.post('/upload', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData({ ...formData, [field]: res.data.url });
            toast.success('Document uploaded successfully', { id: toastId });
        } catch (error) {
            toast.error('Failed to upload document', { id: toastId });
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const handleSaveDocuments = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.put('/users/profile', {
                documents: formData
            });
            updateUser(res.data);
            toast.success('Documents saved successfully!');
            setShowModal(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save documents');
        } finally {
            setSaving(false);
        }
    };

    const documents = [
        { name: 'Driving Licence', status: user?.documents?.drivingLicence ? 'Verified' : 'Pending', date: user?.documents?.drivingLicence ? 'Permanent' : 'Required', color: user?.documents?.drivingLicence ? 'var(--success)' : '#f39c12' },
        { name: 'Vehicle RC', status: user?.documents?.vehicleRc ? 'Verified' : 'Pending', date: user?.documents?.vehicleRc ? 'Valid' : 'Required', color: user?.documents?.vehicleRc ? 'var(--success)' : '#f39c12' },
        { name: 'Aadhaar / PAN (ID Proof)', status: user?.isIdVerified ? 'Verified' : (user?.documents?.idProof ? 'Under Review' : 'Pending'), date: user?.isIdVerified ? 'Permanent' : 'Required', color: user?.isIdVerified ? 'var(--success)' : (user?.documents?.idProof ? '#3498db' : '#f39c12') },
        { name: 'Bank Details', status: user?.bankDetails?.accountNumber ? 'Verified' : 'Pending', date: user?.bankDetails?.accountNumber ? `${user.bankDetails.bankName || ''} **** ${user.bankDetails.accountNumber.slice(-4)}` : 'Required', color: user?.bankDetails?.accountNumber ? 'var(--success)' : '#f39c12' },
        { name: 'Vehicle Insurance', status: user?.documents?.vehicleInsurance ? 'Verified' : 'Pending', date: user?.documents?.vehicleInsurance ? 'Valid' : 'Required', color: user?.documents?.vehicleInsurance ? 'var(--success)' : '#f39c12' },
    ];

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.8rem', margin: 0, color: 'var(--text-main)', fontFamily: "'DM Serif Display', serif" }}>My Documents</h1>
                <button onClick={() => setShowModal(true)} style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
                    <Upload size={16} /> Update Docs
                </button>
            </div>
            
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                {documents.map((doc, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderBottom: idx < documents.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ padding: '12px', background: '#F8F9FA', borderRadius: '8px', color: 'var(--text-muted)' }}>
                                <FileText size={24} />
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', color: 'var(--text-main)' }}>{doc.name}</h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                                    <span style={{ color: doc.color, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {doc.status === 'Verified' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />} {doc.status}
                                    </span>
                                    <span style={{ color: 'var(--border-subtle)' }}>•</span>
                                    <span style={{ color: 'var(--text-muted)' }}>{doc.date}</span>
                                </div>
                            </div>
                        </div>
                        <ChevronRight size={20} color="var(--text-muted)" />
                    </div>
                ))}
            </div>

            {/* Update Documents Modal */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000, padding: '40px 20px', overflowY: 'auto' }}>
                    <div style={{ background: '#fff', width: '100%', maxWidth: '500px', borderRadius: '16px', padding: '24px', margin: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontFamily: "'DM Serif Display', serif" }}>Update Documents</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={24} /></button>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>Upload clear images or PDFs of your documents. Max file size: 5MB.</p>
                        
                        <form onSubmit={handleSaveDocuments} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            
                            {[
                                { key: 'drivingLicence', label: 'Driving Licence' },
                                { key: 'vehicleRc', label: 'Vehicle RC' },
                                { key: 'idProof', label: 'Aadhaar / PAN (ID Proof)' },
                                { key: 'vehicleInsurance', label: 'Vehicle Insurance' }
                            ].map((doc) => (
                                <div key={doc.key} style={{ border: '1px solid var(--border-subtle)', padding: '16px', borderRadius: '8px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--text-main)' }}>{doc.label}</label>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <input 
                                            type="file" 
                                            accept=".jpg,.jpeg,.png,.webp,.pdf" 
                                            onChange={(e) => handleFileUpload(e, doc.key)}
                                            style={{ display: 'none' }}
                                            id={`file-${doc.key}`}
                                        />
                                        <label htmlFor={`file-${doc.key}`} style={{ background: '#F8F9FA', border: '1px solid var(--border-subtle)', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                            <Upload size={16} /> Choose File
                                        </label>
                                        <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem', color: formData[doc.key] ? 'var(--success)' : 'var(--text-muted)' }}>
                                            {formData[doc.key] ? 'Document Uploaded ✓' : 'No file chosen'}
                                        </div>
                                    </div>
                                    {formData[doc.key] && (
                                        <div style={{ marginTop: '8px' }}>
                                            <a href={formData[doc.key]} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none' }}>View Uploaded Document</a>
                                        </div>
                                    )}
                                </div>
                            ))}

                            <button disabled={uploading || saving} type="submit" style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 600, fontSize: '1rem', cursor: (uploading || saving) ? 'not-allowed' : 'pointer', marginTop: '8px', opacity: (uploading || saving) ? 0.7 : 1 }}>
                                {saving ? 'Saving...' : 'Submit Documents'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliveryDocumentsPage;
