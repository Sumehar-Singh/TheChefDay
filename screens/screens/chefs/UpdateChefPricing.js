import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity, Dimensions, StyleSheet, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../../../config';
import { Ionicons } from '@expo/vector-icons';
import CustomStatusBar from '../../components/CustomStatusBar';
const { width, height } = Dimensions.get('window');
const isTablet = width > 600;

const UpdateChefPricing = ({ route, navigation }) => {
  const { ChefID } = route.params;

  const [HourlyRate, setHourlyRate] = useState('');
  const [DayRate, setDayRate] = useState('');

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const form = new FormData();
        form.append('ChefID', ChefID);
  
        const response = await axios.post(`${BASE_URL}/chefs/get_chef_pricing.php`, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
  
        if (response.data.success && response.data.data) {
          setHourlyRate(response.data.data.HourlyRate.toString());
          setDayRate(response.data.data.DayRate.toString());
        }
      } catch (error) {
        console.error('Error fetching pricing:', error);
      }
    };
  
    fetchPricing();
  }, []);

  const handleSubmit = async () => {
    if (!ChefID || !HourlyRate || !DayRate) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    const form = new FormData();
    form.append('ChefID', ChefID);
    form.append('HourlyRate', HourlyRate);
    form.append('DayRate', DayRate);

    try {
      const response = await axios.post(`${BASE_URL}/chefs/update_chef_pricing.php`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        Alert.alert('Success', response.data.message);
        navigation.goBack();
      } else {
        Alert.alert('Error', response.data.message);
      }
    } catch (error) {
      console.error('Error updating pricing:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
      <CustomStatusBar title="Update Pricing" />


        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Hourly Rate</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Hourly Rate"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={HourlyRate}
                onChangeText={setHourlyRate}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Day Rate</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Day Rate"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={DayRate}
                onChangeText={setDayRate}
              />
            </View>
          </View>

          <TouchableOpacity 
            onPress={handleSubmit} 
            style={styles.submitButton}
          >
            <Text style={styles.submitButtonText}>Update Pricing</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: isTablet ? 20 : 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
    marginRight: isTablet ? 20 : 15,
  },
  headerTitle: {
    fontSize: isTablet ? 24 : 18,
    fontWeight: '700',
    color: '#805500',
  },
  formContainer: {
    padding: isTablet ? 30 : 20,
  },
  inputContainer: {
    marginBottom: isTablet ? 30 : 20,
  },
  label: {
    fontSize: isTablet ? 20 : 16,
    color: '#ff0000',
   
    marginBottom: isTablet ? 15 : 10,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: isTablet ? 20 : 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  currencySymbol: {
    fontSize: isTablet ? 22 : 18,
    color: '#ff0000',
    marginRight: 10,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    height: isTablet ? 60 : 50,
    fontSize: isTablet ? 20 : 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#ff0000',
    padding: isTablet ? 20 : 15,
    borderRadius: 12,
    marginTop: isTablet ? 30 : 20,
    ...Platform.select({
      ios: {
        shadowColor: '#805500',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  submitButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: isTablet ? 20 : 16,
  },
});

export default UpdateChefPricing;
