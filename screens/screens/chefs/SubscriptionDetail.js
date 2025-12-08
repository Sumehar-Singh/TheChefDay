import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL } from '../../../config';
import moment from 'moment'; // Make sure to install moment: npm install moment
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const isTablet = width > 600;

const SubscriptionDetail = ({ route, navigation }) => {
  const { Id } = route.params;
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chefID, setChefId] = useState('');
  const fetchPlanDetail = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}chefs/get_subscription_detail.php`, {
        params: { Id }
      });

      if (response.data.status === 'success') {
        setPlan(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching subscription detail:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSuccessUpdate = () => {
    navigation.replace("PopUpScreen", {
      title: "Subscribed",
      type: "success",
      detail: "You have subscribed successfully.",
      returnTo: "ChefProfileStatus",
    });
  };
  const handleSubscription = async () => {

    console.log("ChefID",chefID);

    if (!chefID || !plan || !plan.Duration) {
      console.error('Chef ID or Plan details are missing');
      return;
    }
  
    const SDate = moment(); // today's date
    let EDate;
  
    // Parse Duration
    const durationParts = plan.Duration.split(' ');
    const value = parseInt(durationParts[0]);
    const unit = durationParts[1].toLowerCase();
  
    // Calculate EDate
    if (unit.includes('month')) {
      EDate = moment(SDate).add(value, 'months');
    } else if (unit.includes('year')) {
      EDate = moment(SDate).add(value, 'years');
    } else {
      console.error('Invalid plan duration format');
      return;
    }
  
    // Format dates as YYYY-MM-DD
    const formattedSDate = SDate.format('YYYY-MM-DD');
    const formattedEDate = EDate.format('YYYY-MM-DD');
  
    try {
      const response = await axios.post(`${BASE_URL}chefs/set_subscription.php`, {
        ChefId: chefID,
        PlanId: Id,
        SDate: formattedSDate,
        EDate: formattedEDate,
      });
  
      if (response.data.success) {
        handleSuccessUpdate();
        // Handle success (e.g., navigate, show message, etc.)
      } else {
        console.error('Subscription failed:', response.data.message);
      }
    } catch (error) {
      console.error('Error saving subscription:', error);
    }
  };
  
  useEffect(() => {
    fetchPlanDetail();

    const getChefId = async () => {
      const cId = await AsyncStorage.getItem("userid");
      setChefId(cId);
  };
  getChefId();
  }, []);

  if (isLoading || !plan) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#805500" />
      </View>
    );
  }

  const isRecommended = plan.Recommended == 1;
  const isSpecial = plan.Special == 1;

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={isTablet ? 30 : 24} color="#805500" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Plan Detail</Text>
      </View>

      <View style={styles.detailBox}>
        <View style={styles.badgesContainer}>
          {isRecommended && (
            <View style={styles.recommendedBadge}>
              <Text style={styles.badgeText}>RECOMMENDED</Text>
            </View>
          )}
          {isSpecial && (
            <View style={styles.specialBadge}>
              <Text style={styles.badgeText}>SPECIAL</Text>
            </View>
          )}
        </View>

        <Text style={styles.planHeader}>{plan.Header}</Text>
        <Text style={styles.planPrice}>Price: $ {plan.Price}</Text>
        <Text style={styles.planDuration}>Duration: {plan.Duration}</Text>
        <Text style={styles.planDesc}>{plan.Desc}</Text>
      </View>

      <TouchableOpacity
        style={styles.getStartedButton}
        onPress={() => handleSubscription()}
      >
        <Text style={styles.getStartedText}>Get Started</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
   
    backgroundColor: '#f8f8f8',
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 20,
   
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
    marginRight: 15,
  },
  headerTitle: {
    fontSize: isTablet ? 24 : 18,
    fontWeight: '700',
    color: '#805500',
  },
  detailBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: isTablet ? 24 : 18,
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 30,
    marginHorizontal:20

  },
  badgesContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  recommendedBadge: {
    backgroundColor: '#d32f2f',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 10,
  },
  specialBadge: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: isTablet ? 16 : 14,
  },
  planHeader: {
    fontSize: isTablet ? 22 : 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  planPrice: {
    fontSize: isTablet ? 20 : 18,
    color: '#805500',
    fontWeight: '600',
    marginBottom: 5,
  },
  planDuration: {
    fontSize: isTablet ? 18 : 16,
    color: '#666',
    marginBottom: 10,
  },
  planDesc: {
    fontSize: isTablet ? 16 : 14,
    color: '#444',
    lineHeight: 22,
  },
  getStartedButton: {
    backgroundColor: '#805500',
    paddingVertical: isTablet ? 16 : 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal:20
  },
  getStartedText: {
    color: '#fff',
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default SubscriptionDetail;
