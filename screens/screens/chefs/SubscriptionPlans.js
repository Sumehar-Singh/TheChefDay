import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, RefreshControl, TouchableOpacity, Platform, KeyboardAvoidingView, Alert } from 'react-native';
import SubscriptionService from '../../../services/SubscriptionService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomStatusBar from '../../components/CustomStatusBar';
import CenterLoading from '../../components/CenterLoading';
import axios from 'axios';
import { BASE_URL } from '../../../config';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const isTablet = width > 600;

const SubscriptionPlans = ({ navigation }) => {
  const [plans, setPlans] = useState([]);
  const [appleProducts, setAppleProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${BASE_URL}admin/get_subscription_plans.php`);
      if (response.data.status === 'success') {
        setPlans(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setIsLoading(true);
    try {
      await fetchPlans();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const products = await SubscriptionService.getSubscriptions();
      setAppleProducts(products);
    } catch (e) {
      console.error(e);
    }
  };

  const getAppleProduct = (plan) => {
    if (!appleProducts.length) return null;

    // Explicit mapping from Backend Title to Apple Product ID
    let productId = '';
    const header = plan.Header || '';

    // Logical Ladder: Entry(1m) -> Business(3m) -> Pro(6m) -> Pro+(1y)
    if (header.includes('Entry')) productId = 'chef_access_1m';
    else if (header.includes('Business')) productId = 'chef_access_3m';
    else if (header.includes('Pro+')) productId = 'chef_access_1y';
    else if (header.includes('Pro')) productId = 'chef_access_6m';

    // Safety: Check both p.productId (standard) and p.product_id (legacy/alternative)
    return appleProducts.find(p => {
      const id = p.productId || p.product_id;
      return id && (id === productId || id?.endsWith(productId));
    });
  };

  const handlePurchase = async (product) => {
    setIsLoading(true);
    // Request subscription - the actual result is handled by the global listener in App.js
    // but we can catch immediate errors here
    const sku = product.productId || product.product_id;
    const { success, error } = await SubscriptionService.requestSubscription(sku);
    setIsLoading(false);

    if (!success && error) {
      // Alert handled by listener globally for most errors, but if needed we can log
      console.log('Purchase initialization failed:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#ff0000']}
            tintColor="#ff0000"
          />
        }
      >
        <CustomStatusBar title="Subscription Plans" />



        <View style={styles.subscriptionNotice}>
          <Text style={styles.noticeTitle}>Subscribe Now</Text>
          <Text style={styles.noticeText}>
            Choose a plan below to unlock premium features. Managed securely by the App Store.
          </Text>
          <TouchableOpacity onPress={() => SubscriptionService.restorePurchases()} style={{ marginTop: 10 }}>
            <Text style={{ color: '#209E00', textDecorationLine: 'underline' }}>Restore Purchases</Text>
          </TouchableOpacity>
        </View>


        <View style={styles.subscriptionContainer}>
          {plans.map((plan) => {
            const isRecommended = plan.Recommended == 1;
            const isSpecial = plan.Special == 1;

            // Standard retrieval without debug hacks
            const appleProduct = getAppleProduct(plan);

            return (
              <View
                key={plan.Id}
                style={[styles.planBox, isSpecial && styles.specialBox]}
              >
                {isRecommended && (
                  <View style={styles.recommendedHeader}>
                    <Text style={styles.recommendedText}>RECOMMENDED</Text>
                  </View>
                )}
                {appleProduct ? (
                  <>
                    <Text style={styles.planPrice}>{appleProduct.localizedPrice}</Text>
                    <Text style={styles.planDuration}>{appleProduct.title || plan.Header}</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.planPrice}>Price: $ {plan.Price}</Text>
                    <Text style={styles.planDuration}>Duration: {plan.Duration}</Text>
                  </>
                )}

                <Text style={styles.planDesc}>{plan.Desc}</Text>

                {appleProduct ? (
                  <TouchableOpacity
                    style={[styles.websiteButton, { width: '100%', alignItems: 'center', marginTop: 15 }]}
                    onPress={() => handlePurchase(appleProduct)}
                  >
                    <Text style={styles.websiteButtonText}>Subscribe</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={{ color: '#999', marginTop: 10, fontStyle: 'italic' }}>
                    {appleProducts.length > 0 ? "Plan unavailable" : "Loading Store info..."}
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        {/* DEBUG INFO */}
        <View style={{ padding: 20, backgroundColor: '#eee' }}>
          <Text style={{ fontWeight: 'bold' }}>Debug Info:</Text>
          <Text>Apple Products Found: {appleProducts.length}</Text>
        </View>

        {isLoading && <CenterLoading />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',

  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,

  },

  subscriptionNotice: {
    backgroundColor: '#DEF7D8',
    borderRadius: 10,
    padding: 16,

    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#e0c78c',
  },

  noticeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#209E00',
    marginBottom: 8,
  },

  noticeText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  websiteButton: {
    marginTop: 16,
    backgroundColor: '#ff0000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },

  websiteButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },

  subscriptionContainer: {
    padding: 15
  },
  planBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: isTablet ? 24 : 16,
    marginBottom: 20,
    backgroundColor: '#fff',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  specialBox: {
    backgroundColor: '#e0f7e9', // light green
  },
  recommendedHeader: {
    backgroundColor: '#d32f2f',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  recommendedText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: isTablet ? 16 : 14,
  },
  planHeader: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  planPrice: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
    color: '#209E00',
    marginBottom: 4,
  },
  planDuration: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 6,
  },
  planDesc: {
    fontSize: isTablet ? 16 : 14,
    color: '#444',
    lineHeight: 22,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: isTablet ? 20 : 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',


    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButton: {
    marginRight: isTablet ? 20 : 15,
  },
  headerTitle: {
    fontSize: isTablet ? 24 : 18,
    fontWeight: '700',
    color: '#ff0000',
  },
});

export default SubscriptionPlans;
