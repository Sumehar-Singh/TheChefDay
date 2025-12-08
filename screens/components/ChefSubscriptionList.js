import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { View, Text, StyleSheet, ActivityIndicator, FlatList, Dimensions } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../../config';
import { useAuth } from '../../components/contexts/AuthContext';


const { width } = Dimensions.get('window');
const isTablet = width > 600;

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr.replace(' ', 'T'));
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const isExpired = (edate) => {
  if (!edate) return false;
  const now = new Date();
  const end = new Date(edate.replace(' ', 'T'));
  return end < now;
};

const ChefSubscriptionList = () => {
  const {profile}=useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState('');
  
  useFocusEffect(
    useCallback(() => {
      if (!profile.Id) return;

      setLoading(true);
      setError(null);

      axios
        .get(`${BASE_URL}chefs/get_chef_subscriptions.php`, {
          params: { ChefId: profile.Id },
        })
        .then((response) => {
          if (response.data.success) {
            setSubscriptions(response.data.data || []);
          } else {
            setError(response.data.message || 'Failed to fetch subscriptions');
          }
        })
        .catch(() => setError('Error fetching subscriptions'))
        .finally(() => setLoading(false));
    }, [profile.Id]));


  if (loading) {
    return <ActivityIndicator size="large" color="#ff0000" style={{ marginVertical: 30 }} />;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Subscriptions</Text>
      <Text style={styles.countLabel}>Total Subscriptions: <Text style={styles.count}>{subscriptions.length}</Text></Text>
      {subscriptions.length === 0 ? (
        <Text style={styles.noSubs}>No subscriptions found.</Text>
      ) : (
        <FlatList
          data={subscriptions}
          keyExtractor={(item) => item.Id}
          renderItem={({ item }) => {
            const expired = isExpired(item.EDate);
            return (
              <View style={[styles.card, expired && styles.expiredCard]}>
                <View style={styles.headerRow}>
                  <Text style={styles.planHeader}>{item.Header}</Text>
                  <Text style={[styles.status, expired ? styles.expired : styles.active]}>
                    {expired ? 'Expired' : 'Active'}
                  </Text>
                </View>
                <Text style={styles.planDesc}>{item.Desc}</Text>
                <View style={styles.row}>
                  <Text style={styles.label}>Duration:</Text>
                  <Text style={styles.value}>{item.Duration}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Price:</Text>
                  <Text style={styles.value}>$ {item.Price}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Start Date:</Text>
                  <Text style={styles.value}>{formatDate(item.SDate)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>End Date:</Text>
                  <Text style={styles.value}>{formatDate(item.EDate)}</Text>
                </View>


                {!expired && (
                  <>
                    <View style={styles.row}>
                      <Text style={styles.label}>Spent Amount:</Text>
                      <Text style={styles.value}>$ {item.SpentAmount}</Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.label}>Remaining Amount:</Text>
                      <Text style={styles.value}>$ {item.RemainingAmount}</Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.label}>Remaining Days:</Text>
                      <Text style={styles.value}>{item.RemainingDays}</Text>
                    </View></>
                )}



              </View>
            );
          }}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: isTablet ? 20 : 15,
    marginBottom: isTablet ? 15 : 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    margin: 10,
  },
  title: {
    fontSize: isTablet ? 22 : 18,
    fontWeight: '700',
    color: '#262626',
    marginBottom: 5,
  },
  countLabel: {
    fontSize: isTablet ? 16 : 14,
    color: '#ff0000',
    marginBottom: 10,
  },
  count: {
    fontWeight: 'bold',
    color: '#262626',
  },
  noSubs: {
    color: '#888',
    fontSize: isTablet ? 16 : 14,
    textAlign: 'center',
    marginVertical: 20,
  },
  card: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: isTablet ? 18 : 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  expiredCard: {
    backgroundColor: '#fff0f0',
    borderColor: '#e57373',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  planHeader: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    color: '#333',
  },
  status: {
    fontWeight: 'bold',
    fontSize: isTablet ? 14 : 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  active: {
    backgroundColor: '#e0f7e9',
    color: '#388e3c',
  },
  expired: {
    backgroundColor: '#ffeaea',
    color: '#d32f2f',
  },
  planDesc: {
    fontSize: isTablet ? 15 : 13,
    color: '#666',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  label: {
    fontWeight: '600',
    color: '#805500',
    width: 130,
    fontSize: isTablet ? 14 : 12,
  },
  value: {
    color: '#333',
    fontSize: isTablet ? 14 : 12,
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
    marginVertical: 20,
    fontSize: isTablet ? 16 : 14,
  },
});

export default ChefSubscriptionList; 