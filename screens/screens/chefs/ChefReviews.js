import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, RefreshControl, Platform, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChefReviewList from '../../components/ChefReviewList';
import CustomStatusBar from '../../components/CustomStatusBar';
import CenterLoading from '../../components/CenterLoading';
import axios from 'axios';
import { BASE_URL } from '../../../config';
import { useAuth } from '../../../components/contexts/AuthContext';
const { width } = Dimensions.get('window');
const isTablet = width > 600;

const ChefReviews = ({navigation}) => {
  const [userId, setUserId] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
const {profile}=useAuth();
 
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setIsLoading(true);
    try {
      await fetchChefReviews();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
      setIsLoading(false);
    }
  }, [profile.Id]);

 
  return (
    <SafeAreaView style={styles.container}>
      <CustomStatusBar title="Chef Reviews" includeTopInset={false} />
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#805500']}
            tintColor="#805500"
          />
        }
      >
        <ChefReviewList navigation={navigation} userId={profile.Id} />
        {isLoading && <CenterLoading />}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: isTablet ? 12 : 8,
    paddingVertical: '2%',
  },
});

export default ChefReviews;
