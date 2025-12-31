import { Platform, Alert } from 'react-native';

// --- IAP IMPORT DEBUGGING ---
const RNIapModule = require('react-native-iap');
console.log('--- RNIap EXPORT DEBUG ---');
console.log('Keys:', Object.keys(RNIapModule));
if (RNIapModule.default) console.log('Default Keys:', Object.keys(RNIapModule.default));
console.log('--------------------------');

const {
    initConnection,
    endConnection,
    fetchProducts, // Found in logs
    getAvailablePurchases,
    requestPurchase // Found in logs, replaces requestSubscription
} = RNIapModule.default || RNIapModule;

const BUNDLE_ID = 'com.coder.chefday';

const itemSkus = Platform.select({
    ios: [
        `${BUNDLE_ID}.chef_access_1m_v2`,
        `${BUNDLE_ID}.chef_access_3m_v2`,
        `${BUNDLE_ID}.chef_access_6m_v2`,
        `${BUNDLE_ID}.chef_access_1y_v2`
    ],
    android: [
        'chef_access_1m',
        'chef_access_3m',
        'chef_access_6m',
        'chef_access_1y'
    ]
});

class SubscriptionService {
    constructor() {
        this.connectionPromise = null;
    }

    async init() {
        try {
            if (!this.connectionPromise) {
                console.log('IAP: Initializing connection...');
                this.connectionPromise = initConnection();
            }
            await this.connectionPromise;
            console.log('IAP: Connection initialized.');
            return true;
        } catch (e) {
            console.error('IAP Init Error:', e);
            return false;
        }
    }

    async getSubscriptions() {
        try {
            console.log('IAP: Starting fetchProducts...');
            await this.init();

            if (!itemSkus || itemSkus.length === 0) return [];

            console.log('Fetcher: itemSkus:', itemSkus);

            let products = [];

            // USE FOUND FUNCTION: fetchProducts
            if (typeof fetchProducts === 'function') {
                console.log('Calling fetchProducts({ skus: itemSkus })');
                // Fix: Pass as object with 'skus' key
                products = await fetchProducts({ skus: itemSkus });
            } else {
                console.error("IAP CRITICAL: fetchProducts is missing (despite being in keys).");
                throw new Error("IAP Function Missing: fetchProducts");
            }

            console.log('--- RAW IAP RESPONSE ---');
            console.log(JSON.stringify(products, null, 2));
            console.log('------------------------');

            console.log(`Found ${products.length} subscriptions`);

            // DEBUG: Show alert to user on device
            Alert.alert(
                "IAP Debug",
                `Requested ${itemSkus.length} SKUs.\nFound ${products.length} products.\n\nSKUs: ${itemSkus.join('\n')}`
            );

            return products;
        } catch (e) {
            console.error('Error fetching subscriptions:', e);
            Alert.alert("IAP Error", e.message || "Unknown Error");
            return [];
        }
    }

    async requestSubscription(sku) {
        try {
            await this.init();
            console.log('Requesting purchase for:', sku);

            // USE FOUND FUNCTION: requestPurchase
            if (typeof requestPurchase === 'function') {
                // Try object param first { sku }, if fails, might need just sku string.
                const offer = await requestPurchase({ sku });
                return { success: true, offer };
            } else {
                throw new Error("IAP Function Missing: requestPurchase");
            }

        } catch (e) {
            console.error('Purchase failed:', e);
            // Don't alert here, let the UI handle the error message
            return { success: false, error: e.message };
        }
    }

    async restorePurchases() {
        try {
            await this.init();
            const purchases = await getAvailablePurchases();
            Alert.alert("Restore Successful", `Restored ${purchases.length} transactions.`);
            return purchases;
        } catch (e) {
            console.error('Restore failed:', e);
            Alert.alert("Restore Failed", e.message);
            return [];
        }
    }

    // Call this when the component unmounts if needed
    async endConnection() {
        try {
            await endConnection();
            this.connectionPromise = null;
        } catch (e) {
            console.error('Error ending connection', e);
        }
    }
}

export default new SubscriptionService();
