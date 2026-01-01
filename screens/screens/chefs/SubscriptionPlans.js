import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, RefreshControl, Platform, KeyboardAvoidingView } from 'react-native';
import CustomStatusBar from '../../components/CustomStatusBar';
import CenterLoading from '../../components/CenterLoading';
import axios from 'axios';
import { BASE_URL } from '../../../config';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const isTablet = width > 600;

const SubscriptionPlans = ({ navigation }) => {
  const [plans, setPlans] = useState([]);
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
  }, []);

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
          <Text style={styles.noticeTitle}>Subscription Plans</Text>
          <Text style={styles.noticeText}>
            View our available plans below. Subscriptions are managed on our website.
          </Text>
        </View>


        <View style={styles.subscriptionContainer}>
          {plans.map((plan) => {
            const isRecommended = plan.Recommended == 1;
            const isSpecial = plan.Special == 1;

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


                {/* Plan Title (e.g. Monthly, Quarterly) */}
                <Text style={styles.planHeaderTitle}>{plan.Header}</Text>

                <Text style={styles.planPrice}>Price: $ {plan.Price}</Text>
                <Text style={styles.planDuration}>Duration: {plan.Duration}</Text>
                <Text style={styles.planDesc}>{plan.Desc}</Text>

                {/* Informational message - NO clickable link */}
                <View style={styles.infoMessageBox}>
                  <Text style={styles.infoMessageText}>
                    To subscribe, please visit The Chef Day website
                  </Text>
                </View>
              </View>
            );
          })}
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
  infoMessageBox: {
    width: '100%',
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 12,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#209E00',
  },
  infoMessageText: {
    fontSize: isTablet ? 15 : 13,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  planHeaderTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 5,
  },
});

export default SubscriptionPlans;
