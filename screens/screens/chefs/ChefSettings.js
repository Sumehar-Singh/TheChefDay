import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ChefProfileImage from '../../components/strings/chefs/ChefProfileImage';
import ChefFullName from '../../components/strings/chefs/ChefFullName';
import CustomStatusBar from '../../components/CustomStatusBar';
import { useAuth } from '../../../components/contexts/AuthContext';

const ChefSettings = ({ navigation }) => {
  const { profile, logout } = useAuth();






  const navigateToChefSetPricing = () => {
    if (!profile) return;
    navigation.navigate('UpdateChefPricing', {
      ChefID: profile.Id,
    });
  };

  const handleLogout = async () => {

    await logout(navigation);

    // Remove the manual navigation reset since logout now handles it
  };


  const SettingItem = ({ icon, title, onPress }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingItemLeft}>
        <Ionicons name={icon} size={24} color="#FF4F4F" />
        <Text style={styles.settingItemText}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  // Don't render anything if there's no profile
  if (!profile) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomStatusBar title="Settings" includeTopInset={false} />
      <ScrollView style={styles.scrollView}>
        {/* Profile Section */}
        <TouchableOpacity
          style={styles.profileSection}
          onPress={() => navigation.navigate("ChefEditProfile")}
        >
          <View style={styles.profileContainer}>
            <ChefProfileImage height={80} width={80} userId={profile?.Id} mr={10} />
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>
                <ChefFullName userId={profile?.Id} />
              </Text>
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.settingsGroup}>

            <SettingItem
              icon="card-outline"
              title="Choose Subscription"
              onPress={() => navigation.navigate("SubscriptionPlans")}
            />

            <SettingItem
              icon="document-text-outline"
              title="Upload Documents"
              onPress={() => navigation.navigate("UploadDocuments")}
            />
            <SettingItem
              icon="pricetag-outline"
              title="Set Pricing"
              onPress={navigateToChefSetPricing}
            />
            <SettingItem
              icon="information-circle-outline"
              title="Profile Status"
              onPress={() => navigation.navigate("ChefProfileStatus")}
            />
            <SettingItem
              icon="document-text-outline"
              title="Terms and Conditions"
              onPress={() => navigation.navigate("ChefTermsScreen")}
            />
            <SettingItem
              icon="remove-circle-outline"
              title="Delete Account"
              onPress={() => navigation.navigate("DeleteChefAccount")}
            />
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >

          <Ionicons name="log-out-outline" size={24} color="#FFF" />
          <Text style={styles.logoutText}>Logout</Text>

        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  profileSection: {

    marginBottom: 15,
    padding: 18,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  profileContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  profileInfo: {
    marginTop: 10,
    alignItems: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  editProfileText: {
    fontSize: 14,
    color: '#FF4F4F',
    textAlign: 'center',
  },
  settingsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    marginLeft: 8,
  },
  settingsGroup: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  logoutButton: {
    backgroundColor: '#FF4F4F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 25,
    marginBottom: 30,
    gap: 8,
  },
  logoutButtonDisabled: {
    opacity: 0.7,
    shadowColor: '#FF4F4F',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  logoutText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default ChefSettings;
