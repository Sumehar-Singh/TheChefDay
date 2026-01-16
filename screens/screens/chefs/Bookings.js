import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, RefreshControl, Platform, SafeAreaView } from 'react-native';


import ChefBookingList from '../../components/ChefBookingList';
import CustomStatusBar from '../../components/CustomStatusBar';
import CenterLoading from '../../components/CenterLoading';

import { useAuth } from '../../../components/contexts/AuthContext';
const { width } = Dimensions.get('window');
const isTablet = width > 600;

const Bookings = ({ navigation }) => {

  return (
    <SafeAreaView style={styles.container}>
      <CustomStatusBar title="My Bookings" includeTopInset={false} />
      <View style={styles.content}>
        <ChefBookingList navigation={navigation} userId={profile.Id} showHeader={false} limit={null} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    paddingHorizontal: isTablet ? 12 : 15, // Match User side padding
    paddingTop: 10,
  },
});

export default Bookings;
