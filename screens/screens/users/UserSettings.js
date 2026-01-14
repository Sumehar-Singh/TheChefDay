import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import UserProfileImage from '../../components/strings/users/UserProfileImage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserFullName from '../../components/strings/users/UserFullName';
import { Ionicons } from '@expo/vector-icons';
import CustomStatusBar from '../../components/CustomStatusBar';
import { useAuth } from '../../../components/contexts/AuthContext';

const UserSettings = ({ navigation, route }) => {
  const { profile, logout } = useAuth();

  const handleLogout = async () => {
    const keysToRemove = ['userid', 'user_id', 'userCoods', 'role_id'];
    for (let key of keysToRemove) {
      await AsyncStorage.removeItem(key);
    }
    await logout(navigation, 'UserSettings');
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

  if (!profile) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomStatusBar title="Settings" includeTopInset={false} />
      <ScrollView style={styles.scrollView}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileContainer}>
            <UserProfileImage userId={profile.Id} height={80} width={80} mr={15} />
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>
                <UserFullName userId={profile.Id} />
              </Text>
            </View>
          </View>
        </View>

        {/* Settings Options Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.settingsGroup}>
            <SettingItem
              icon="person-outline"
              title="Update Profile"
              onPress={() => navigation.navigate("UserEditProfile")}
            />

            <SettingItem
              icon="document-text-outline"
              title="Terms and Conditions"
              onPress={() => navigation.navigate("UserTermsScreen")}
            />
            <SettingItem
              icon="remove-circle-outline"
              title="Delete Account"
              onPress={() => navigation.navigate("DeleteUserAccount")}
            />
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FFF" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
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
    backgroundColor: '#ff0000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 25,
    marginBottom: 30,
    gap: 8,
  },
  logoutText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default UserSettings;
