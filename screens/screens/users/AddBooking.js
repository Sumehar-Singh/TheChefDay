import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal, ScrollView, Image } from 'react-native';
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
const AddBooking = ({ navigation }) => {
  // Define individual states for each field
  const [UserID, setUserID] = useState(0);
  const [ChefID, setChefID] = useState(0);
  const [Name, setName] = useState('');
  const [PhoneNo, setPhoneNo] = useState('');
  const [Address, setAddress] = useState('');
  const [PinCode, setPinCode] = useState('');
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
const {profile}=useAuth();
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
      <Text style={styles.label}>Pin Code</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter pin code"
        value={PinCode}
        onChangeText={setPinCode}
        keyboardType="number-pad"
      />

      <View style={styles.hiringTypeContainer}>
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Select Hiring Type</Text>
          <Picker
            selectedValue={selection}
            style={styles.picker}
            onValueChange={(itemValue) => setSelection(itemValue)}>
            <Picker.Item label="Hourly Hiring" value="Hourly Hiring" />
            <Picker.Item label="Day Hiring" value="Day Hiring" />
          </Picker>
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
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    margin: 20,
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
});
