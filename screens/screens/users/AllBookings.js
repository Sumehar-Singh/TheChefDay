import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../../components/contexts/AuthContext';
import BookingsList from '../../components/BookingsList';
import CustomStatusBar from '../../components/CustomStatusBar';
const PRIMARY = '#cc0000'; // matches your updated accent
const BG = '#F6F7FB';

const AllBookings = ({ navigation }) => {
  const { profile } = useAuth();

  return (
    <SafeAreaView style={styles.safe}>
      <CustomStatusBar title="All Bookings" includeTopInset={false} />


      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <BookingsList UserID={profile?.Id} navigation={navigation} showHeader={false} showViewAll={false} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    backgroundColor: PRIMARY,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 40, // balances the back button space for perfect center title
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingVertical: 12,
    marginBottom: 70
  },
});

export default AllBookings;