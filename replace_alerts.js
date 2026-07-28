const fs = require('fs');
const path = require('path');

const filesToUpdate = [
    'mobile/src/screens/delivery/DeliveryDashboardScreen.js',
    'mobile/src/screens/auth/LoginScreen.js',
    'mobile/src/screens/auth/RegisterScreen.js',
    'mobile/src/screens/customer/CheckoutScreen.js',
    'mobile/src/screens/admin/AdminSettingsScreen.js',
    'mobile/src/screens/admin/SubadminDashboardScreen.js',
    'mobile/src/screens/admin/SuperadminDashboardScreen.js',
    'mobile/src/screens/admin/UserManagementScreen.js',
    'mobile/src/screens/chef/ChefDashboardScreen.js',
    'mobile/src/screens/customer/KitchenMenuScreen.js',
    'mobile/src/screens/customer/SubscriptionsScreen.js',
    'mobile/src/components/superadmin/RefundsTab.js',
    'mobile/src/components/superadmin/PromotionsTab.js',
    'mobile/src/screens/chef/ChefMenuScreen.js'
];

filesToUpdate.forEach(relativePath => {
    const fullPath = path.join(__dirname, relativePath);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let modified = false;

        if (content.includes('Alert.alert')) {
            const getType = (title) => {
                const t = title.toLowerCase();
                if (t.includes('error') || t.includes('denied') || t.includes('failed')) return 'error';
                if (t.includes('success') || t.includes('added')) return 'success';
                return 'info';
            };

            let newContent = content;
            
            // Handle specific multi-line Alerts or ones that regex won't catch easily:
            // Let's just use regex for the simple ones:
            newContent = newContent.replace(/Alert\.alert\(([^,]+),\s*([^)]+)\)/g, (match, p1, p2) => {
                if (p2.includes('[')) return match;
                if (match.includes('\n')) return match; // multi-line might break

                const type = getType(p1);
                return `Toast.show({ type: '${type}', text1: ${p1.trim()}, text2: ${p2.trim()} })`;
            });
            
            newContent = newContent.replace(/Alert\.alert\(([^,)]+)\)/g, (match, p1) => {
                const type = getType(p1);
                return `Toast.show({ type: '${type}', text1: 'Notice', text2: ${p1.trim()} })`;
            });

            if (newContent !== content) {
                if (!newContent.includes('react-native-toast-message')) {
                    const importMatch = newContent.match(/import .*?;?\n/g);
                    if (importMatch) {
                        const lastImport = importMatch[importMatch.length - 1];
                        newContent = newContent.replace(lastImport, lastImport + "import Toast from 'react-native-toast-message';\n");
                    } else {
                        newContent = "import Toast from 'react-native-toast-message';\n" + newContent;
                    }
                }
                fs.writeFileSync(fullPath, newContent);
                console.log(`Updated ${relativePath}`);
            }
        }
    } else {
        console.log(`File not found: ${relativePath}`);
    }
});
