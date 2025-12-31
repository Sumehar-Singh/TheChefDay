import {
    initConnection,
    endConnection,
    getSubscriptions,
    requestSubscription,
    getAvailablePurchases,
    getProducts
} from 'react-native-iap';
import { Platform, Alert } from 'react-native';

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
            console.log('IAP: Starting getSubscriptions...');
            await this.init();

            if (!itemSkus || itemSkus.length === 0) return [];

            console.log('Fetcher: itemSkus:', itemSkus);

            let products = [];

            // Fallback Logic: Try getSubscriptions, then getProducts
            if (typeof getSubscriptions === 'function') {
                console.log('Calling getSubscriptions({ skus: ... })');
                products = await getSubscriptions({ skus: itemSkus });
            } else if (typeof getProducts === 'function') {
                console.log('getSubscriptions not found (undefined). Using getProducts({ skus: ... }) instead.');
                products = await getProducts({ skus: itemSkus }); // Fallback
            } else {
                console.error("IAP CRITICAL: No fetch function (getSubscriptions/getProducts) found.");
                throw new Error("RNIap fetch functions are missing from import.");
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

            // Standard purchase method
            const offer = await requestSubscription({ sku });

            return { success: true, offer };
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
