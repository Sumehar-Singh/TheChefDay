import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, Switch, ScrollView, Dimensions, Alert, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Checkbox } from 'react-native-paper';
import CustomStatusBar from '../../components/CustomStatusBar';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
const { width } = Dimensions.get('window');
const isTablet = width > 600;
import { BASE_URL } from '../../../config';
import { storeUserCoords } from '../../components/utils';
import { useAuth } from '../../../components/contexts/AuthContext';




const UserEditProfile = ({ navigation }) => {
  const [geoLoading, setGeoLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { profile } = useAuth();

  const [name, setName] = useState('');
  const [middle, setMiddle] = useState('');
  const [last, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState(0);
  const [phone, setPhone] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [oldProfileImage, setOldProfileImage] = useState(null);
  const [userId, setUserId] = useState('');
  const [isOldImageRemoved, setIsOldImageRemoved] = useState(false);
  const [geoAddress, setGeoAddress] = useState('');


  const [cuisines, setCuisine] = useState({

  });
  const [dietary, setDietary] = useState({

  });

  const [mealType, setMealTypes] = useState({

  })



  const toggleCuisine = (cuisine) => {
    setCuisine((prevState) => {
      const newState = { ...prevState };
      newState[cuisine].checked = !newState[cuisine].checked;
      return newState;
    });
  };


  const toggleDietaryPreference = (preference) => {
    setDietary((prevState) => {
      const newState = { ...prevState };
      newState[preference].checked = !newState[preference].checked;
      return newState;
    });
  };


  const toggleEventType = (mealType) => {
    setMealTypes((prevState) => {
      const newState = { ...prevState };
      newState[mealType].checked = !newState[mealType].checked;
      return newState;
    });
  };




  useEffect(() => {


    getUserData();
    getCuisineSpecialities();
  }, []);

  const getAssignedSpecialities = async () => {
    try {
      const response = await axios.get(`${BASE_URL}users/get_user_specialities_assigned.php`, {
        params: { UserId: profile.Id },
      });

      if (response.data.status === 'success') {
        return response.data.data;  // Array of SpecialityIds assigned to the chef
      } else {
        console.error('Error fetching assigned specialities:', response.data.message);
        return [];
      }
    } catch (error) {
      console.error('Error fetching assigned specialities:', error);
      return [];
    }
  };

  const getCuisineSpecialities = async () => {
    try {
      // Fetching all specialities without any filtering
      const response = await axios.get(`${BASE_URL}users/get_user_preferences_main.php`);

      if (response.data.status === 'success') {
        const specialities = response.data.data;

        // Filter specialities based on ChefPropertiesId for each group

        const filteredDietPrefs = specialities.filter(speciality => speciality.UserPropertiesId === 1);
        const filteredCuisines = specialities.filter(speciality => speciality.UserPropertiesId === 2);
        const filteredMealTypes = specialities.filter(speciality => speciality.UserPropertiesId === 3);


        // Fetch assigned specialities for the chef
        const assignedSpecialities = await getAssignedSpecialities();

        // Map the filtered data into the corresponding state variables
        let newCuisineState = {};
        let newChefDietaryState = {};
        let newMealTypesState = {};

        // Populate state for each group
        filteredCuisines.forEach((speciality) => {
          newCuisineState[speciality.Name] = {
            Id: speciality.Id,
            Name: speciality.Name,
            checked: assignedSpecialities.includes(speciality.Id)
          };
        });

        filteredDietPrefs.forEach((speciality) => {
          newChefDietaryState[speciality.Name] = {
            Id: speciality.Id,
            Name: speciality.Name,
            checked: assignedSpecialities.includes(speciality.Id)
          };
        });

        filteredMealTypes.forEach((speciality) => {
          newMealTypesState[speciality.Name] = {
            Id: speciality.Id,
            Name: speciality.Name,
            checked: assignedSpecialities.includes(speciality.Id)
          };
        });



        // Set the states with the filtered and mapped data
        setCuisine(newCuisineState);
        setDietary(newChefDietaryState);
        setMealTypes(newMealTypesState);

      } else {
        console.error('No specialities found:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching cuisines:', error);
    }
  };


  const getUserData = async () => {

    try {
      const response = await axios.get(`${BASE_URL}users/get_user_data.php`, {
        params: { UserId: profile.Id }
      });


      if (response.data.status === "success") {

        const user = response.data.data;
        //console.log(user[0]);
        setName(user[0].FirstName);
        setMiddle(user[0].MiddleName);
        setLast(user[0].LastName);
        setEmail(user[0].Email);
        setAddress(user[0].Address); // Convert number to string for TextInput
        setPhone(user[0].Phone);
        setOldProfileImage(user[0].Image);
        setPinCode(user[0].PinCode);
        setLat(user[0].Lat);
        setLon(user[0].Lon);
      } else {
        console.log("Error:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleImagePick = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission to access camera roll is required!');
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.5,
    });

    console.log('Image picker result:', pickerResult);

    if (!pickerResult.cancelled) {
      setProfileImage(pickerResult.assets[0].uri);
      setOldProfileImage(pickerResult.assets[0].uri);
      setIsOldImageRemoved(false);
      console.log(pickerResult.assets[0].uri);
    }
  };
  const handleSuccessUpdate = () => {
    navigation.replace("PopUpScreen", {
      title: "Profile Updated!",
      type: "success",
      detail: "Your profile has been updated successfully.",
      returnTo: "UserDashboard",
    });
  };

  const updateProfile = async () => {
    setIsUpdating(true);
    // Step 1: Validation

    if (
      !name ||
      !email ||
      !address ||
      !phone ||
      !pinCode ||
      !lat ||
      !lon ||
      !last
    ) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }


    const isCuisineSelected = Object.values(cuisines).some((cuisine) => cuisine.checked);
    const isDietaryPrefSelected = Object.values(dietary).some((diet) => diet.checked);
    const isMealTypeSelected = Object.values(mealType).some((meal) => meal.checked);


    if (!isCuisineSelected) {
      alert('Please select at least one cuisine.');
      return;
    }

    if (!isDietaryPrefSelected) {
      alert('Please select at least one dietary preference.');
      return;
    }

    if (!isMealTypeSelected) {
      alert('Please select at least one meal type.');
      return;
    }


    const formData = new FormData();
    const isRmvd = isOldImageRemoved ? "Yes" : "No";
    formData.append('UserId', profile.Id);
    formData.append('FirstName', name);
    formData.append('MiddleName', middle);
    formData.append('LastName', last);
    formData.append('Email', email);
    formData.append('Address', address);
    formData.append('Phone', phone);
    formData.append('IsImageRemoved', isRmvd);
    formData.append('PinCode', pinCode);
    formData.append('Lat', lat);
    formData.append('Lon', lon);

    if (lat && lon) {
      storeUserCoords(lat, lon); // store if updated
    }

    const selectedSpecialities = [];


    Object.keys(cuisines).forEach((cuisine) => {
      if (cuisines[cuisine].checked) {
        selectedSpecialities.push(cuisines[cuisine].Id);
      }
    });

    // For dietary preferences
    Object.keys(dietary).forEach((diet) => {
      if (dietary[diet].checked) {
        selectedSpecialities.push(dietary[diet].Id);
      }
    });

    // For event types
    Object.keys(mealType).forEach((meal) => {
      if (mealType[meal].checked) {
        selectedSpecialities.push(mealType[meal].Id);
      }
    });

    // Append the selected specialities to formData
    formData.append('SelectedSpecialities', JSON.stringify(selectedSpecialities));



    if (profileImage) {
      const uriParts = profileImage.split('.');
      const fileType = uriParts[uriParts.length - 1];

      formData.append('ProfileImage', {
        uri: profileImage,
        name: `profile_${profile.Id}.${fileType}`,
        type: `image/${fileType}`
      });
    }

    try {
      const response = await axios.post(
        `${BASE_URL}users/update_user.php`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log("Update response:", response.data);
      if (response.data.success) {
        handleSuccessUpdate();
      } else {
        alert('Failed to update profile: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'An error occurred while updating profile.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteImage = () => {
    Alert.alert(
      'Delete Profile Image',
      'Are you sure you want to delete your profile picture?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Handle image deletion logic here
            console.log('Image deleted');
            setOldProfileImage(null); // Reset image state
            setIsOldImageRemoved(true);
          },
        },
      ],
      { cancelable: false }
    );
  };

  const fetchLatLon = async () => {
    if (!pinCode) {
      Alert.alert('Error', 'Please enter a Pin Code');
      return;
    }
    setGeoLoading(true);
    try {
      const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json`, {
        params: {
          q: pinCode,
          key: '6bd2e50a75924061b83d8f50e760d4ef',
          language: 'en',
          pretty: 1,
        },
      });

      if (response.data && response.data.results && response.data.results.length > 0) {
        const geometry = response.data.results[0].geometry;
        const addresss = response.data.results[0].formatted;
        console.log(addresss);
        setLat(geometry.lat.toString());  // <--- Convert to string
        setLon(geometry.lng.toString());  // <--- Convert to string
        setGeoAddress(addresss);
        //Alert.alert('Coordinates', `Lat: ${geometry.lat}\nLon: ${geometry.lng}`);
      } else {
        Alert.alert('Error', 'No location found for this Pin Code.');
      }
    } catch (error) {
      console.error('API Error:', error);
      Alert.alert('Error', 'Failed to fetch location. Please try again.');
    } finally {
      setGeoLoading(false);
    }
  };

  // Call the function with a UserId

  return (

    <LinearGradient colors={['white', '#f2f2f2', '#e6e6e6']} style={styles.superContainer}>
      <CustomStatusBar title="Update Profile" />


      <ScrollView contentContainerStyle={styles.container}>


        <View style={styles.profilePictureContainer}>
          {/* Profile Image */}
          <TouchableOpacity onPress={handleImagePick} style={styles.imageWrapper}>
            <Image
              source={oldProfileImage ? { uri: oldProfileImage } : require('../../../assets/DefaultImage.jpg')}
              style={styles.profilePicture}
              resizeMode="cover"
            />
          </TouchableOpacity>

          {/* Icons Below Image in One Row */}
          <View style={styles.iconWrapper}>
            {/* Upload Image Icon */}
            <TouchableOpacity style={styles.editIcon} onPress={handleImagePick}>
              <MaterialCommunityIcons name="camera" size={isTablet ? 30 : 20} color="white" />
            </TouchableOpacity>

            {/* Delete Image Icon */}
            {oldProfileImage && (
              <TouchableOpacity
                style={styles.editIcon}
                onPress={handleDeleteImage}
              >
                <MaterialCommunityIcons name="delete" size={isTablet ? 30 : 20} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>



        <View style={styles.section}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter First Name"
            value={name}
            onChangeText={setName}
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Middle Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Middle Name"
            value={middle}
            onChangeText={setMiddle}
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter First Name"
            value={last}
            onChangeText={setLast}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your Email"
            value={email}
            onChangeText={setEmail}

          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter your Address"
            value={address}
            onChangeText={setAddress}
            multiline
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Phone"
            value={phone}
            onChangeText={setPhone}

          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Pin Code</Text>
          <Text style={{ fontSize: 12, color: '#6c757d', marginBottom: 8 }}>
            💡 Enter your Pin Code to become more visible to nearby users and improve your searchability.
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 8 }]} // Adjust to fit beside button
              placeholder="Enter Pin Code"
              value={pinCode}
              onChangeText={setPinCode}
            />

            <TouchableOpacity
              style={{
                backgroundColor: '#007bff',
                paddingVertical: 10,
                paddingHorizontal: 15,
                borderRadius: 8,
                marginHorizontal: 10,
              }}
              onPress={fetchLatLon}
            >


              {geoLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Verify</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Add a note or message below */}


          <Text style={{ fontSize: 15, color: '#6c757d', marginTop: 8 }}>

            {geoAddress && <Text style={{ fontWeight: 'bold' }}>📌</Text>}  {geoAddress}
          </Text>
        </View>


        <View style={styles.section}>
          <Text style={styles.label}>Latitude</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Latitude"
            value={lat}
            onChangeText={setLat}
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Longitude</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Longitude"
            value={lon}
            onChangeText={setLon}
          />
        </View>



        <View style={styles.section}>
          <Text style={styles.heading}>Fill out the below sections to make more searchable</Text>

        </View>



        <View style={styles.section}>
          <Text style={styles.label}>What type of cuisine preferences you want?</Text>
          {Object.keys(cuisines).map((cuis) => (
            <View key={cuis} style={styles.switchContainer}>
              <Text style={styles.chkLabel}>{cuis}</Text>
              <Switch
                value={cuisines[cuis].checked}
                onValueChange={() => toggleCuisine(cuis)}
                trackColor={{ false: '#ccc', true: '#ff0000' }}
                thumbColor={cuisines[cuis].checked ? '#fff' : '#f4f3f4'}
              />
            </View>
          ))}
        </View>


        <View style={styles.section}>
          <Text style={styles.label}>What dietary preferences can you cater to?</Text>
          {Object.keys(dietary).map((diet) => (
            <View key={diet} style={styles.switchContainer}>
              <Text style={styles.chkLabel}>{diet}</Text>
              <Switch
                value={dietary[diet].checked}
                onValueChange={() => toggleDietaryPreference(diet)}
                trackColor={{ false: '#ccc', true: '#ff0000' }}
                thumbColor={dietary[diet].checked ? '#fff' : '#f4f3f4'}
              />
            </View>
          ))}
        </View>




        <View style={styles.section}>
          <Text style={styles.label}>What types of meals do you want?</Text>
          {Object.keys(mealType).map((meal) => (
            <View key={meal} style={styles.switchContainer}>
              <Text style={styles.chkLabel}>{meal}</Text>
              <Switch
                value={mealType[meal].checked}
                onValueChange={() => toggleEventType(meal)}
                trackColor={{ false: '#ccc', true: '#ff0000' }}
                thumbColor={mealType[meal].checked ? '#fff' : '#f4f3f4'}
              />
            </View>
          ))}
        </View>



        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={updateProfile} disabled={isUpdating}>
            {isUpdating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Update</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>


    </LinearGradient>

  );
};

const styles = StyleSheet.create({
  superContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  container: {

    paddingHorizontal: isTablet ? 30 : 20,
    paddingVertical: 20,
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },

  imageWrapper: {
    width: isTablet ? 220 : 140,
    height: isTablet ? 220 : 140,
    borderRadius: isTablet ? 110 : 70,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#aee99f',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  profilePicture: {
    width: '100%',
    height: '100%',
  },
  iconWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    gap: 15,
  },
  editIcon: {
    backgroundColor: '#209E00',
    borderRadius: 25,
    padding: isTablet ? 12 : 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  section: {
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
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
  label: {
    fontSize: isTablet ? 20 : 16,
    color: '#209E00',
    marginBottom: 10,
    fontWeight: '600',
  },
  heading: {
    fontSize: isTablet ? 21 : 16,
    color: '#7a705b',
    marginTop: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  chkLabel: {
    fontSize: isTablet ? 18 : 14,
    color: '#000',
    marginLeft: 10,
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: isTablet ? 15 : 12,
    fontSize: isTablet ? 18 : 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: isTablet ? 120 : 80,
    textAlignVertical: 'top',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    paddingVertical: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#ff0000',
    paddingVertical: isTablet ? 15 : 12,
    paddingHorizontal: isTablet ? 30 : 25,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cancelButton: {
    backgroundColor: '#999',
    paddingVertical: isTablet ? 15 : 12,
    paddingHorizontal: isTablet ? 30 : 25,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonText: {
    color: 'white',
    fontSize: isTablet ? 18 : 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default UserEditProfile;
