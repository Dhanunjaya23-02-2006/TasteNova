import React from 'react';
import { CheckCircle2, Clock, AlertCircle, FileText, ChevronRight } from 'lucide-react';

const DeliveryDocumentsPage = () => {
    const documents = [
        { name: 'Driving Licence', status: 'Verified', date: 'Valid till 24 May 2028', color: 'var(--success)' },
        { name: 'Vehicle RC', status: 'Verified', date: 'Valid till 12 Oct 2029', color: 'var(--success)' },
        { name: 'Aadhaar / PAN', status: 'Verified', date: 'Permanent', color: 'var(--success)' },
        { name: 'Bank Details', status: 'Verified', date: 'HDFC **** 4567', color: 'var(--success)' },
        { name: 'Vehicle Insurance', status: 'Expiring Soon', date: 'Expires 15 Sep 2026', color: '#f39c12' },
    ];

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '1.8rem', margin: '0 0 24px', color: 'var(--text-main)', fontFamily: "'DM Serif Display', serif" }}>My Documents</h1>
            
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
        </div>
    );
};

export default DeliveryDocumentsPage;
