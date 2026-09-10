import React, { useState, useCallback, createContext, useContext } from 'react';
import { X, AlertTriangle, CheckCircle, MessageSquare } from 'lucide-react';

const ModalContext = createContext(null);

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) throw new Error('useModal must be used within a ModalProvider');
    return context;
};

const overlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 99999, animation: 'fadeIn 0.2s ease'
};

const cardStyle = {
    background: '#fff', borderRadius: '16px', padding: '28px',
    width: '90%', maxWidth: '420px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
    animation: 'slideUp 0.25s ease'
};

const btnBase = {
    padding: '10px 20px', borderRadius: '10px', fontSize: '0.9rem',
    fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.2s'
};

export const ModalProvider = ({ children }) => {
    const [modal, setModal] = useState(null);

    const showConfirm = useCallback(({ title = 'Are you sure?', message = '', confirmText = 'Confirm', cancelText = 'Cancel', variant = 'danger' }) => {
        return new Promise((resolve) => {
            setModal({
                type: 'confirm', title, message, confirmText, cancelText, variant,
                onConfirm: () => { setModal(null); resolve(true); },
                onCancel: () => { setModal(null); resolve(false); }
            });
        });
    }, []);

    const showPrompt = useCallback(({ title = 'Enter value', message = '', placeholder = '', confirmText = 'Submit', cancelText = 'Cancel', variant = 'primary' }) => {
        return new Promise((resolve) => {
            setModal({
                type: 'prompt', title, message, placeholder, confirmText, cancelText, variant,
                onConfirm: (val) => { setModal(null); resolve(val); },
                onCancel: () => { setModal(null); resolve(null); }
            });
        });
    }, []);

    return (
        <ModalContext.Provider value={{ showConfirm, showPrompt }}>
            {children}
            {modal && <ModalOverlay modal={modal} />}
        </ModalContext.Provider>
    );
};

const ModalOverlay = ({ modal }) => {
    const [inputValue, setInputValue] = useState('');

    const iconColor = modal.variant === 'danger' ? '#ef4444' : modal.variant === 'warning' ? '#f59e0b' : '#2E7D32';
    const Icon = modal.variant === 'danger' ? AlertTriangle : modal.variant === 'warning' ? AlertTriangle : CheckCircle;
    const confirmBtnColor = modal.variant === 'danger' ? '#ef4444' : modal.variant === 'warning' ? '#f59e0b' : '#2E7D32';

    return (
        <div style={overlayStyle} onClick={modal.onCancel}>
            <div style={cardStyle} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${iconColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {modal.type === 'prompt' ? <MessageSquare size={20} color={iconColor} /> : <Icon size={20} color={iconColor} />}
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1a1a1a' }}>{modal.title}</h3>
                    </div>
                    <button onClick={modal.onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#999' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Message */}
                {modal.message && (
                    <p style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 20px', lineHeight: 1.5 }}>{modal.message}</p>
                )}

                {/* Input for prompt */}
                {modal.type === 'prompt' && (
                    <textarea
                        autoFocus
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={modal.placeholder || 'Enter your response...'}
                        rows={3}
                        style={{
                            width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e0e0e0',
                            fontSize: '0.9rem', fontFamily: 'inherit', resize: 'vertical', marginBottom: '20px',
                            outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box'
                        }}
                        onFocus={(e) => e.target.style.borderColor = iconColor}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                    />
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button
                        onClick={modal.onCancel}
                        style={{ ...btnBase, background: '#f5f5f5', color: '#666' }}
                        onMouseOver={(e) => e.target.style.background = '#e8e8e8'}
                        onMouseOut={(e) => e.target.style.background = '#f5f5f5'}
                    >
                        {modal.cancelText}
                    </button>
                    <button
                        onClick={() => modal.type === 'prompt' ? modal.onConfirm(inputValue) : modal.onConfirm()}
                        style={{ ...btnBase, background: confirmBtnColor, color: '#fff' }}
                        onMouseOver={(e) => e.target.style.opacity = '0.9'}
                        onMouseOut={(e) => e.target.style.opacity = '1'}
                    >
                        {modal.confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalProvider;
