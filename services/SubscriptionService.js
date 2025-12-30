import * as RNIap from 'react-native-iap';
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
                this.connectionPromise = RNIap.initConnection();
            }
            await this.connectionPromise;
            return true;
        } catch (e) {
            console.error('IAP Init Error:', e);
            return false;
        }
    }

    async getSubscriptions() {
        try {
            await this.init();
            if (!itemSkus || itemSkus.length === 0) return [];

            console.log('Fetching subscriptions for:', itemSkus);

            // Standard method for auto-renewable subscriptions
            const products = await RNIap.getSubscriptions({ skus: itemSkus });

            console.log(`Found ${products.length} subscriptions`);
            return products;
        } catch (e) {
            console.error('Error fetching subscriptions:', e);
            return [];
        }
    }

    async requestSubscription(sku) {
        try {
            await this.init();
            console.log('Requesting purchase for:', sku);

            // Standard purchase method
            const offer = await RNIap.requestSubscription({ sku });

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
            const purchases = await RNIap.getAvailablePurchases();
            Alert.alert("Restore Successful", `Restored ${purchases.length} transactions.`);
            return purchases;
        } catch (e) {
            console.error('Restore failed:', e);
            Alert.alert("Restore Failed", e.message);
            return [];
        }
    }

    // Call this when the component unmounts if needed, 
    // mostly handled by RNIap internal cleanup but good practice.
    async endConnection() {
        try {
            await RNIap.endConnection();
            this.connectionPromise = null;
        } catch (e) {
            console.error('Error ending connection', e);
        }
    }
}

export default new SubscriptionService();
