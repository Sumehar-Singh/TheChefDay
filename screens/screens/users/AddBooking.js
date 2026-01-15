import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { BASE_URL } from '../../../config';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar } from 'react-native-calendars';
import { formatDate } from '../../components/utils';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import Material Icons
import { useAuth } from '../../../components/contexts/AuthContext';
import CustomStatusBar from '../../components/CustomStatusBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AddBooking = ({ navigation }) => {
  const insets = useSafeAreaInsets(); // Hook for safe offsets
  // Define individual states for each field
  const [UserID, setUserID] = useState(0);
  const [ChefID, setChefID] = useState(0);
  const [Name, setName] = useState('');
  const [PhoneNo, setPhoneNo] = useState('');
  const [Address, setAddress] = useState('');
  const [PinCode, setPinCode] = useState('');
  const [isValidPin, setIsValidPin] = useState(false); // Track verification status
  const [geoLoading, setGeoLoading] = useState(false); // Track API loading status
  const [chefData, setChefData] = useState([]);

  const [selection, setSelection] = useState('Hourly Hiring');
  const [HourlyRate, setHourlyRate] = useState('');
  const [DayRate, setDayRate] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [EventDate, setEventDate] = useState('');
  const [fmtEventDate, setFmtEventDate] = useState('');
  const [ServiceType, setServiceType] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const { profile } = useAuth();
  const getTomorrowDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Add one day to today's date
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // Month is zero-indexed
    const day = today.getDate();

    // Format as YYYY-MM-DD (e.g., "2025-03-22")
    return `${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`;
  };
  const unavailableDates = [
    '2025-03-25',  // Example of an unavailable date
    '2025-04-05',
    '2025-04-23',  // Add more unavailable dates
    '2025-05-22',
  ];
  const route = useRoute();
  const { ChefId } = route.params; // Its Int


  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);
  const onDayPress = (day) => {
    if (unavailableDates.includes(day.dateString)) {
      alert('This date is unavailable for booking.');
    } else {

      const frmtDate = formatDate(day.dateString);

      setEventDate(day.dateString);
      setFmtEventDate(frmtDate);

      closeModal();
    }


  };

  // Mark unavailable dates as unavailable
  const markedDates = unavailableDates.reduce((acc, date) => {
    acc[date] = {
      disabled: true, // Disable the date
      selected: false, // Ensure it's not selected
      marked: true,    // Mark the date to show visually
      selectedColor: 'red',
      selectedTextColor: 'white',
    };
    return acc;
  }, {});
  const calculateTotal = () => {
    const rate = selection === 'Hourly Hiring' ? HourlyRate : DayRate;
    const tPrice = (parseFloat(inputValue) || 0) * rate;
    return tPrice;
  };



  const checkIfAlreadyBooked = async () => {

    const form = new FormData();
    form.append('UserID', UserID);
    form.append('ChefID', ChefID);
    form.append('EventDate', EventDate);

    try {
      const response = await axios.post(`${BASE_URL}users/is_already_booking.php`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        return response.data.alreadyBooked === true;
      } else {
        console.log('Check failed:', response.data.message);
        return false;
      }
    } catch (error) {
      console.error('Error checking booking:', error);
      return false;
    }
  };

  const fetchPricing = async (ChefID) => {
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


  const getChefData = async (ChefID) => {
    console.log("ChefIDDD", ChefID);
    try {
      const response = await axios.get(`${BASE_URL}chefs/get_chef_data.php`, {
        params: { ChefID: ChefID }
      });

      if (response.data.status === "success") {


        const chef = response.data.data;
        setChefData(chef[0]);


      } else {
        console.log("Error:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching chef data:", error);
    }
  };

  const verifyPinCode = async () => {
    if (!PinCode) {
      Alert.alert('Error', 'Please enter a Zip Code');
      return;
    }

    // Client-side check: updates for "00000" or similar invalid patterns
    if (/^0+$/.test(PinCode) || PinCode.length < 5) {
      setIsValidPin(false);
      Alert.alert('Error', 'Invalid Zip Code. Please enter a valid code.');
      return;
    }

    setGeoLoading(true);
    setIsValidPin(false);
    try {
      const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json`, {
        params: {
          q: PinCode,
          key: '6bd2e50a75924061b83d8f50e760d4ef',
          language: 'en',
          pretty: 1,
        },
      });

      if (response.data && response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];
        // Strict check: Ensure the API actually found a postcode component
        const foundPostcode = result.components.postcode || result.components.postal_code;

        if (foundPostcode) {
          // Optional: You could compare foundPostcode with PinCode here for partial matching if strictness varies
          setIsValidPin(true);
        } else {
          // API found a place, but it wasn't a postcode (e.g. a street number match)
          setIsValidPin(false);
          Alert.alert('Error', 'Invalid Zip Code. No postal region found.');
        }

      } else {
        setIsValidPin(false);
        Alert.alert('Error', 'Invalid Zip Code. Please check and try again.');
      }
    } catch (error) {
      console.error('API Error:', error);
      Alert.alert('Error', 'Failed to verify Zip Code. Please try again.');
      setIsValidPin(false);
    } finally {
      setGeoLoading(false);
    }
  };

  const getUserData = async (userId) => {

    try {
      const response = await axios.get(`${BASE_URL}users/get_user_data.php`, {
        params: { UserId: userId }
      });

      if (response.data.status === "success") {

        const user = response.data.data;

        setName(user[0].FirstName + " " + user[0].MiddleName + " " + user[0].LastName);

        setAddress(user[0].Address); // Convert number to string for TextInput
        setPhoneNo(user[0].Phone);

      } else {
        console.log("Error:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {



    const getUserId = async () => {
      const usrId = await AsyncStorage.getItem("userid"); // this is the User's UserId (ID)

      setUserID(profile.Id);
      setChefID(ChefId);
      getUserData(profile.Id);
      fetchPricing(ChefId);
      getChefData(ChefId);



    };
    getUserId();





  }, []);




  const handleSubmit = async () => {

    const alreadyBooked = await checkIfAlreadyBooked();
    if (alreadyBooked) {
      Alert.alert("Notice", "You have already booked this chef for this date.");
      return;
    }
    // Check if all fields are filled
    if (!UserID || !ChefID || !Name || !PhoneNo || !Address || !PinCode || !EventDate || !ServiceType) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    // Calculate TotalPrice based on DaysNo

    const TotalPrice = calculateTotal();
    const form = new FormData();
    form.append('UserID', UserID);
    form.append('ChefID', ChefID);
    form.append('Name', Name);
    form.append('PhoneNo', PhoneNo);
    form.append('Address', Address);
    form.append('PinCode', PinCode);

    form.append('EventDate', EventDate);
    form.append('ServiceType', ServiceType);
    form.append('TotalPrice', TotalPrice);
    console.log("Form", form);
    try {
      const response = await axios.post(`${BASE_URL}/users/add_booking.php`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        Alert.alert('Success', 'Booking added successfully');
        navigation.goBack();
      } else {
        Alert.alert('Error', response.data.message);
      }
    } catch (error) {
      console.error('Error adding booking:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F6F7FB' }}>
      <CustomStatusBar title="Add Booking" includeTopInset={false} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.chefInfoContainer}>
          {/* Chef's Profile Picture */}
          <Image
            source={chefData.Image ? { uri: chefData.Image } : require('../../../assets/userImage.jpg')}
            style={styles.profileImage}
            resizeMode="cover"
          />

          {/* Chef Info */}
          <View style={styles.chefDetails}>
            <Text style={styles.sectionTitle}>You are hiring</Text>
            <Text style={styles.nameText}>{chefData.FirstName} {chefData.MiddleName} {chefData.LastName}</Text>

            {/* Hourly and Day Rate with icons */}
            <View style={styles.ratesContainer}>
              <View style={styles.rateBox}>
                <Icon name="access-time" size={30} color="#fff" style={styles.icon} />
                <Text style={styles.rateText}>${HourlyRate}</Text>
                <Text style={styles.rateLabel}>Hourly Rate</Text>
              </View>

              <View style={styles.rateBox}>
                <Icon name="date-range" size={30} color="#fff" style={styles.icon} />
                <Text style={styles.rateText}>${DayRate}</Text>
                <Text style={styles.rateLabel}>Day Rate</Text>
              </View>
            </View>
          </View>
        </View>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          value={Name}
          onChangeText={setName}
        />
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter phone number"
          value={PhoneNo}
          onChangeText={setPhoneNo}
          keyboardType="phone-pad"
        />
        <Text style={styles.label}>Event Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter event address"
          value={Address}
          onChangeText={setAddress}
        />
        <Text style={styles.label}>Zip Code</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <View style={{ flex: 1, position: 'relative' }}>
            <TextInput
              style={[styles.input, { marginBottom: 0 }]}
              placeholder="Enter Zip Code"
              value={PinCode}
              onChangeText={(text) => {
                setPinCode(text);
                setIsValidPin(false); // Reset verification on change
              }}
              keyboardType="number-pad"
            />
            {isValidPin && (
              <View style={{ position: 'absolute', right: 15, top: 15 }}>
                <Icon name="check-circle" size={24} color="#4CAF50" />
              </View>
            )}
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: '#007bff',
              paddingVertical: 15,
              paddingHorizontal: 20,
              borderRadius: 12,
              marginLeft: 10,
              height: 55,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#007bff',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 4,
            }}
            onPress={verifyPinCode}
            disabled={geoLoading}
          >
            {geoLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Verify</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.hiringTypeContainer}>
          <View style={styles.selectionRow}>
            <TouchableOpacity
              style={[styles.selectionBtn, selection === 'Hourly Hiring' && styles.selectedBtn]}
              onPress={() => setSelection('Hourly Hiring')}
              activeOpacity={0.8}
            >
              <Icon
                name="access-time"
                size={24}
                color={selection === 'Hourly Hiring' ? '#fff' : '#666'}
                style={{ marginBottom: 5 }}
              />
              <Text style={[styles.selectionBtnText, selection === 'Hourly Hiring' && styles.selectedBtnText]}>
                Hourly
              </Text>
              <Text style={[styles.selectionBtnSubText, selection === 'Hourly Hiring' && styles.selectedBtnText]}>
                ${HourlyRate}/hr
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.selectionBtn, selection === 'Day Hiring' && styles.selectedBtn]}
              onPress={() => setSelection('Day Hiring')}
              activeOpacity={0.8}
            >
              <Icon
                name="date-range"
                size={24}
                color={selection === 'Day Hiring' ? '#fff' : '#666'}
                style={{ marginBottom: 5 }}
              />
              <Text style={[styles.selectionBtnText, selection === 'Day Hiring' && styles.selectedBtnText]}>
                Daily
              </Text>
              <Text style={[styles.selectionBtnSubText, selection === 'Day Hiring' && styles.selectedBtnText]}>
                ${DayRate}/day
              </Text>
            </TouchableOpacity>
          </View>

          {/* Row for input and total calculation */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputRate}
              value={inputValue}
              onChangeText={setInputValue}
              placeholder={`Enter ${selection === 'Hourly Hiring' ? 'hours' : 'days'}`}
              keyboardType="numeric"
            />

            <View style={styles.resultContainer}>
              <Text style={styles.resultLabel}>Total: </Text>
              <Text style={styles.resultValue}>${calculateTotal().toFixed(2)}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.label}>Service Type</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Dinner, Birthday"
          value={ServiceType}
          onChangeText={setServiceType}
        />
        <View style={styles.selectedDateCard}>
          <View style={styles.selectedDateHeader}>
            <Icon name="event" size={20} color="#cc0000" />
            <Text style={styles.selectedDateLabel}>Event Date</Text>
          </View>
          <Text style={styles.selectedDateValue}>{fmtEventDate || 'Not selected'}</Text>
          <TouchableOpacity style={styles.dateButton} onPress={openModal}>
            <Icon name="calendar-today" size={18} color="#fff" />
            <Text style={styles.dateButtonText}>Choose date</Text>
          </TouchableOpacity>
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          {/* Dynamic padding to clear header + status bar */}
          <View style={[styles.centeredModalView, { paddingTop: insets.top + 60 }]}>
            <View style={styles.modalView}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Event Date</Text>
                <TouchableOpacity onPress={closeModal} style={styles.modalClose}>
                  <Icon name="close" size={22} color="#111" />
                </TouchableOpacity>
              </View>
              <Calendar
                onDayPress={onDayPress}
                markedDates={{
                  ...markedDates,
                  [EventDate]: {
                    selected: true,
                    selectedColor: '#0A84FF',
                    selectedTextColor: 'white',
                  },
                }}
                minDate={getTomorrowDate()}
                theme={{
                  todayTextColor: '#0A84FF',
                  arrowColor: '#0A84FF',
                  monthTextColor: '#111827',
                  textDayHeaderFontWeight: 'bold',
                }}
              />
            </View>
          </View>
        </Modal>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Book Now</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddBooking;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F6F7FB',
  },
  chefInfoContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#0A84FF',
  },
  chefDetails: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 15,
  },
  nameText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#34495e',
    textAlign: 'center',
    marginBottom: 20,
  },
  ratesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  rateBox: {
    backgroundColor: '#cc0000',
    borderRadius: 12,
    padding: 20,
    width: '48%',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  icon: {
    marginBottom: 12,
  },
  rateText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  rateLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ecf0f1',
    marginTop: 5,
  },
  input: {
    height: 55,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
    marginLeft: 2,
  },
  pickerContainer: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  pickerLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
    color: '#2c3e50',
    paddingLeft: 5,
  },
  picker: {
    height: 60,
    width: '100%',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  inputRate: {
    height: 55,
    width: '45%',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    backgroundColor: '#ffffff',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 12,
    height: 55,
    width: '53%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  resultValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginLeft: 5,
  },
  button: {
    backgroundColor: '#cc0000',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectedDateCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedDateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedDateLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
  },
  selectedDateValue: {
    fontSize: 16,
    color: '#374151',
    marginTop: 8,
    marginBottom: 12,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#cc0000',
    paddingVertical: 12,
    borderRadius: 10,
  },
  dateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  centeredModalView: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    // paddingTop is now handled dynamically in JSX
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0', // Light grey border for definition
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalClose: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  hiringTypeContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  selectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  selectionBtn: {
    flex: 1,
    backgroundColor: '#f6f7fb',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedBtn: {
    backgroundColor: '#cc0000',
    borderColor: '#cc0000',
  },
  selectionBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  selectedBtnText: {
    color: '#ffffff',
  },
  selectionBtnSubText: {
    fontSize: 12,
    color: '#666',
  },
});
