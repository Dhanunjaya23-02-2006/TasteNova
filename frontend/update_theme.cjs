const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/ambha/.gemini/antigravity/scratch/homechef-mern/frontend/src/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    // glass-card replacements
    content = content.replace(/className="glass-card"/g, "style={{ background: 'var(--bg-light)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}");
    content = content.replace(/className="glass-card (.*?)"/g, "className=\"$1\" style={{ background: 'var(--bg-light)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}");
    
    // gradient text
    content = content.replace(/background: 'linear-gradient\(135deg, var\(--primary-color\), var\(--secondary-color\)\)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'/g, "color: 'var(--primary-color)'");
    content = content.replace(/background: 'linear-gradient\(135deg, var\(--primary-color\), var\(--secondary-color\)\)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent'/g, "color: 'var(--primary-color)'");
    content = content.replace(/background: 'linear-gradient\(135deg, var\(--primary-color\), var\(--secondary-color\)\)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'/g, "color: 'var(--primary-color)'");

    // colors
    content = content.replace(/color: 'var\(--text-light\)'/g, "color: 'var(--text-dark)'");
    content = content.replace(/color: 'white'/g, "color: 'var(--text-dark)'");
    
    // borders
    content = content.replace(/borderColor: 'var\(--glass-border\)'/g, "borderColor: 'var(--border)'");
    content = content.replace(/border: '1px solid var\(--glass-border\)'/g, "border: '1px solid var(--border)'");
    content = content.replace(/borderBottom: '2px solid rgba\(255,255,255,0\.1\)'/g, "borderBottom: '2px solid var(--border)'");
    content = content.replace(/borderTop: '1px solid var\(--glass-border\)'/g, "borderTop: '1px solid var(--border)'");
    content = content.replace(/borderTop: '1px solid rgba\(255,255,255,0\.1\)'/g, "borderTop: '1px solid var(--border)'");
    content = content.replace(/border: '1px solid rgba\(255,255,255,0\.05\)'/g, "border: '1px solid var(--border)'");
    content = content.replace(/border: '1px solid rgba\(255,255,255,0\.1\)'/g, "border: '1px solid var(--border)'");
    
    // background
    content = content.replace(/background: 'rgba\(255,255,255,0\.02\)'/g, "background: 'var(--bg-body)'");
    content = content.replace(/background: 'rgba\(255,255,255,0\.03\)'/g, "background: 'var(--bg-body)'");
    content = content.replace(/background: 'rgba\(255,255,255,0\.05\)'/g, "background: 'var(--bg-body)'");
    content = content.replace(/background: 'rgba\(0,0,0,0\.1\)'/g, "background: 'var(--bg-body)'");
    content = content.replace(/background: 'rgba\(0,0,0,0\.2\)'/g, "background: 'var(--bg-body)'");
    content = content.replace(/background: '#121212'/g, "background: 'var(--bg-light)'");
    content = content.replace(/backgroundColor: 'rgba\(0,0,0,0\.8\)'/g, "backgroundColor: 'rgba(0,0,0,0.5)'");
    content = content.replace(/background: 'rgba\(0,0,0,0\.9\)'/g, "background: 'var(--bg-light)'");

    // forms
    content = content.replace(/className="input-field"/g, 'className="form-control"');
    content = content.replace(/className="input-label"/g, "style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}");
    content = content.replace(/className="input-group"/g, "style={{ marginBottom: '16px' }}");

    fs.writeFileSync(filePath, content);
});

console.log("Pages updated.");
