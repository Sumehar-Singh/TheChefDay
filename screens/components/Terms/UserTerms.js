import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const isTablet = width > 600;

const UserTerms = () => {
  return (
    <View style={styles.termsContent}>
      <Text style={styles.termsSectionTitle}>1. Account Responsibilities</Text>
      <View style={styles.termsBulletContainer}>
        <Text style={styles.termsBulletPoint}>• Maintain accurate personal information</Text>
        <Text style={styles.termsBulletPoint}>• Keep login credentials secure</Text>
        <Text style={styles.termsBulletPoint}>• Notify platform of any security concerns</Text>
      </View>

      <Text style={styles.termsSectionTitle}>2. Booking Guidelines</Text>
      <View style={styles.termsBulletContainer}>
        <Text style={styles.termsBulletPoint}>• Provide accurate booking details</Text>
        <Text style={styles.termsBulletPoint}>• Respect chef's cancellation policies</Text>
        <Text style={styles.termsBulletPoint}>• Communicate dietary requirements in advance</Text>
      </View>

      <Text style={styles.termsSectionTitle}>3. Payment Terms</Text>
      <View style={styles.termsBulletContainer}>
        <Text style={styles.termsBulletPoint}>• Agree to platform's payment terms</Text>
        <Text style={styles.termsBulletPoint}>• Understand refund policies</Text>
        <Text style={styles.termsBulletPoint}>• Maintain valid payment methods</Text>
      </View>

      <Text style={styles.termsSectionTitle}>4. User Conduct</Text>
      <View style={styles.termsBulletContainer}>
        <Text style={styles.termsBulletPoint}>• Treat chefs and staff with respect</Text>
        <Text style={styles.termsBulletPoint}>• Provide honest feedback</Text>
        <Text style={styles.termsBulletPoint}>• Follow platform's community guidelines</Text>
      </View>

      <Text style={styles.termsSectionTitle}>5. Privacy</Text>
      <View style={styles.termsBulletContainer}>
        <Text style={styles.termsBulletPoint}>• Understand data collection practices</Text>
        <Text style={styles.termsBulletPoint}>• Agree to privacy policy</Text>
        <Text style={styles.termsBulletPoint}>• Consent to communication preferences</Text>
      </View>

      <Text style={styles.termsSectionTitle}>6. Service Usage</Text>
      <View style={styles.termsBulletContainer}>
        <Text style={styles.termsBulletPoint}>• Use platform for intended purposes</Text>
        <Text style={styles.termsBulletPoint}>• Follow booking procedures</Text>
        <Text style={styles.termsBulletPoint}>• Report any issues promptly</Text>
      </View>

      <Text style={styles.termsSectionTitle}>7. Cancellation Policy</Text>
      <View style={styles.termsBulletContainer}>
        <Text style={styles.termsBulletPoint}>• Understand cancellation timeframes</Text>
        <Text style={styles.termsBulletPoint}>• Follow cancellation procedures</Text>
        <Text style={styles.termsBulletPoint}>• Accept cancellation fees when applicable</Text>
      </View>

      <Text style={styles.termsSectionTitle}>8. Dispute Resolution</Text>
      <View style={styles.termsBulletContainer}>
        <Text style={styles.termsBulletPoint}>• Follow platform's dispute process</Text>
        <Text style={styles.termsBulletPoint}>• Provide accurate information</Text>
        <Text style={styles.termsBulletPoint}>• Accept platform's final decisions</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  termsContent: {
    padding: 10,
    marginBottom:70
  },
  termsSectionTitle: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    color: '#4d3300',
    marginTop: 10,
    marginBottom: 10,
  },
  termsBulletContainer: {
    marginBottom: 15,
  },
  termsBulletPoint: {
    fontSize: isTablet ? 16 : 14,
    color: '#333',
    marginBottom: 8,
    paddingLeft: 10,
    lineHeight: isTablet ? 24 : 20,
  },
});

export default UserTerms; 