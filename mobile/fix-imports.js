const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            if (content.includes("SafeAreaView") && content.includes("'react-native'")) {
                // Find the react-native import line
                const rnImportRegex = /import\s+{([^}]+)}\s+from\s+['"]react-native['"];/;
                const match = content.match(rnImportRegex);
                
                if (match && match[1].includes('SafeAreaView')) {
                    // Remove SafeAreaView from the list
                    let newImportList = match[1].split(',')
                        .map(i => i.trim())
                        .filter(i => i !== 'SafeAreaView' && i !== '');
                    
                    let newRnImport = newImportList.length > 0 
                        ? `import { ${newImportList.join(', ')} } from 'react-native';`
                        : '';
                    
                    // Replace old import
                    content = content.replace(rnImportRegex, `${newRnImport}\nimport { SafeAreaView } from 'react-native-safe-area-context';`);
                    
                    fs.writeFileSync(fullPath, content);
                    console.log('Fixed', fullPath);
                }
            }
        }
    }
}

processDir(path.join(__dirname, 'src'));
