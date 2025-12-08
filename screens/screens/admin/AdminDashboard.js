import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const isTablet = width > 600;

const DashboardCard = ({ title, value, icon, color, onPress }) => (
  <TouchableOpacity style={[styles.card, { borderLeftColor: color }]} onPress={onPress}>
    <View style={styles.cardContent}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={isTablet ? 32 : 24} color={color} />
      </View>
      <View style={styles.cardTextContainer}>
        <Text style={styles.cardValue}>{value}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const AdminDashboard = ({ navigation }) => {
  const stats = [
    {
      title: 'Total Users',
      value: '1,234',
      icon: 'people-outline',
      color: '#805500',
      screen: 'UserManagement',
    },
    {
      title: 'Active Chefs',
      value: '89',
      icon: 'restaurant-outline',
      color: '#4CAF50',
      screen: 'ChefManagement',
    },
    {
      title: 'Subscription Plans',
      value: '3',
      icon: 'card-outline',
      color: '#2980b9',
      screen: 'ManageSubscriptionPlans',
    },
    {
      title: 'Pending Reviews',
      value: '45',
      icon: 'star-outline',
      color: '#FFA500',
      screen: 'ReviewsManagement',
    },
    {
      title: 'Contact Messages',
      value: '12',
      icon: 'mail-outline',
      color: '#FF4F4F',
      screen: 'ContactMessages',
    },
    {
      title: 'Total Bookings',
      value: '567',
      icon: 'calendar-outline',
      color: '#9b59b6',
      screen: 'BookingManagement',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={isTablet ? 28 : 24} color="#805500" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <DashboardCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              onPress={() => navigation.navigate(stat.screen)}
            />
          ))}
        </View>

        <View style={styles.recentActivitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: '#80550020' }]}>
                <Ionicons name="person-add-outline" size={20} color="#805500" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>New User Registration</Text>
                <Text style={styles.activityTime}>2 minutes ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: '#4CAF5020' }]}>
                <Ionicons name="restaurant-outline" size={20} color="#4CAF50" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>New Chef Application</Text>
                <Text style={styles.activityTime}>15 minutes ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: '#FF4F4F20' }]}>
                <Ionicons name="alert-circle-outline" size={20} color="#FF4F4F" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Booking Cancellation</Text>
                <Text style={styles.activityTime}>1 hour ago</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
   
    paddingHorizontal: isTablet ? 30 : 20,
    paddingVertical: isTablet ? 20 : 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginTop:25,
  },
  headerTitle: {
    fontSize: isTablet ? 28 : 22,
    fontWeight: 'bold',
    color: '#805500',
  },
  settingsButton: {
    padding: 8,
  },
  container: {
    flex: 1,
    padding: isTablet ? 20 : 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: isTablet ? 30 : 20,
  },
  card: {
    width: isTablet ? '48%' : '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: isTablet ? 20 : 15,
    marginBottom: isTablet ? 20 : 15,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: isTablet ? 60 : 45,
    height: isTablet ? 60 : 45,
    borderRadius: isTablet ? 30 : 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isTablet ? 15 : 10,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardValue: {
    fontSize: isTablet ? 28 : 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  cardTitle: {
    fontSize: isTablet ? 16 : 14,
    color: '#666',
  },
  recentActivitySection: {
    marginTop: isTablet ? 10 : 5,
  },
  sectionTitle: {
    fontSize: isTablet ? 22 : 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: isTablet ? 20 : 15,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: isTablet ? 20 : 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: isTablet ? 15 : 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  activityIcon: {
    width: isTablet ? 40 : 35,
    height: isTablet ? 40 : 35,
    borderRadius: isTablet ? 20 : 17.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isTablet ? 15 : 10,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: isTablet ? 16 : 14,
    color: '#333',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: isTablet ? 14 : 12,
    color: '#666',
  },
});

export default AdminDashboard;
