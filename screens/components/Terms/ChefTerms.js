import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const isTablet = width > 600;

const ChefTerms = () => {
  return (
    <View style={styles.termsContent}>
      <Text style={styles.termsSectionTitle}>1. Professional Standards</Text>
      <View style={styles.termsBulletContainer}>
        <Text style={styles.termsBulletPoint}>• Maintain high professional standards in food preparation and service</Text>
        <Text style={styles.termsBulletPoint}>• Follow all food safety and hygiene regulations</Text>
        <Text style={styles.termsBulletPoint}>• Ensure proper handling and storage of ingredients</Text>
      </View>

      <Text style={styles.termsSectionTitle}>2. Service Commitment</Text>
      <View style={styles.termsBulletContainer}>
        <Text style={styles.termsBulletPoint}>• Arrive on time for all scheduled events</Text>
        <Text style={styles.termsBulletPoint}>• Provide accurate menu descriptions and pricing</Text>
        <Text style={styles.termsBulletPoint}>• Maintain clear communication with clients</Text>
      </View>

      <Text style={styles.termsSectionTitle}>3. Quality Assurance</Text>
      <View style={styles.termsBulletContainer}>
        <Text style={styles.termsBulletPoint}>• Use fresh, quality ingredients</Text>
        <Text style={styles.termsBulletPoint}>• Maintain consistent food quality</Text>
        <Text style={styles.termsBulletPoint}>• Follow proper cooking techniques and standards</Text>
      </View>

      <Text style={styles.termsSectionTitle}>4. Client Relations</Text>
      <View style={styles.termsBulletContainer}>
        <Text style={styles.termsBulletPoint}>• Maintain professional conduct with clients</Text>
        <Text style={styles.termsBulletPoint}>• Handle special requests and dietary restrictions appropriately</Text>
        <Text style={styles.termsBulletPoint}>• Address client concerns promptly and professionally</Text>
      </View>

      <Text style={styles.termsSectionTitle}>5. Platform Guidelines</Text>
      <View style={styles.termsBulletContainer}>
        <Text style={styles.termsBulletPoint}>• Maintain accurate profile information</Text>
        <Text style={styles.termsBulletPoint}>• Respond to booking requests within 24 hours</Text>
        <Text style={styles.termsBulletPoint}>• Keep availability calendar up to date</Text>
      </View>

      <Text style={styles.termsSectionTitle}>6. Compliance</Text>
      <View style={styles.termsBulletContainer}>
        <Text style={styles.termsBulletPoint}>• Hold necessary licenses and certifications</Text>
        <Text style={styles.termsBulletPoint}>• Comply with local health and safety regulations</Text>
        <Text style={styles.termsBulletPoint}>• Maintain appropriate insurance coverage</Text>
      </View>

      <Text style={styles.termsSectionTitle}>7. Confidentiality</Text>
      <View style={styles.termsBulletContainer}>
        <Text style={styles.termsBulletPoint}>• Protect client privacy and information</Text>
        <Text style={styles.termsBulletPoint}>• Maintain confidentiality of proprietary recipes and methods</Text>
        <Text style={styles.termsBulletPoint}>• Respect intellectual property rights</Text>
      </View>

      <Text style={styles.termsSectionTitle}>8. Termination</Text>
      <View style={styles.termsBulletContainer}>
        <Text style={styles.termsBulletPoint}>• Platform reserves the right to terminate accounts for violations</Text>
        <Text style={styles.termsBulletPoint}>• Chefs may terminate their account with proper notice</Text>
        <Text style={styles.termsBulletPoint}>• Outstanding obligations must be fulfilled before termination</Text>
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
    color: '#209E00',
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

export default ChefTerms; 