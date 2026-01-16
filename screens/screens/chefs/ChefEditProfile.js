import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ScrollView, Dimensions, Switch, Alert, Platform, ActivityIndicator, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Checkbox } from 'react-native-paper';
import CustomStatusBar from '../../components/CustomStatusBar';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Shadow } from 'react-native-shadow-2';
const { width, height } = Dimensions.get('window');
const isTablet = width > 600;
const isSmallDevice = height < 700;
import { BASE_URL } from '../../../config';
import { useAuth } from '../../../components/contexts/AuthContext';

const ChefEditProfile = ({ navigation }) => {
  const { profile } = useAuth();
  const [geoLoading, setGeoLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [name, setName] = useState('');
  const [middle, setMiddle] = useState('');
  const [last, setLast] = useState('');
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState(0);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [geoAddress, setGeoAddress] = useState('');

  const [profileImage, setProfileImage] = useState(null);
  const [oldProfileImage, setOldProfileImage] = useState(null);
  const [userId, setUserId] = useState('');
  const [isOldImageRemoved, setIsOldImageRemoved] = useState(false);


  // const userId = "8fddrRcT-NEgR-8f7t-WJZz-bFBvkb98lRnL"; // Example UserId
  const [languages, setLanguages] = useState({
    // Bind this for ChefPropertiesId=1
  });
  const [cuisines, setCuisine] = useState({
    // Bind this for ChefPropertiesId=1
  });
  const [cDietPrefs, setChefDietaryPreferences] = useState({
    // Bind this for ChefPropertiesId=2
  });

  const [eventTypes, setEventTypes] = useState({
    // Bind this for ChefPropertiesId=4
  })

  const [cExperience, SetCExperience] = useState({

    // Bind this for ChefPropertiesId=3
  });
  const toggleLanguage = (language) => {
    setLanguages({ ...languages, [language]: !languages[language] });
  };


  // Toggle method for cuisines (ChefPropertiesId = 1)
  const toggleCuisine = (cuisine) => {
    setCuisine((prevState) => {
      const newState = { ...prevState };
      newState[cuisine].checked = !newState[cuisine].checked;
      return newState;
    });
  };

  // Toggle method for Chef Dietary Preferences (ChefPropertiesId = 2)
  const toggleDietaryPreference = (preference) => {
    setChefDietaryPreferences((prevState) => {
      const newState = { ...prevState };
      newState[preference].checked = !newState[preference].checked;
      return newState;
    });
  };

  // Toggle method for Event Types (ChefPropertiesId = 4)
  const toggleEventType = (eventType) => {
    setEventTypes((prevState) => {
      const newState = { ...prevState };
      newState[eventType].checked = !newState[eventType].checked;
      return newState;
    });
  };

  // Toggle method for Chef Experience (ChefPropertiesId = 3)
  const toggleExperience = (experience) => {
    SetCExperience((prevState) => {
      const newState = { ...prevState };
      newState[experience].checked = !newState[experience].checked;
      return newState;
    });
  };



  useEffect(() => {

    getChefData();
    getCuisineSpecialities();

  }, []);

  const getAssignedSpecialities = async () => {
    try {
      const response = await axios.get(`${BASE_URL}chefs/get_chef_specialities_assigned.php`, {
        params: { ChefId: profile.Id },
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
      const response = await axios.get(`${BASE_URL}chefs/get_chef_specialities_main.php`);

      if (response.data.status === 'success') {
        const specialities = response.data.data;

        // Filter specialities based on ChefPropertiesId for each group
        const filteredCuisines = specialities.filter(speciality => speciality.ChefPropertiesId === 1);
        const filteredDietPrefs = specialities.filter(speciality => speciality.ChefPropertiesId === 2);
        const filteredEventTypes = specialities.filter(speciality => speciality.ChefPropertiesId === 4);
        const filteredExperience = specialities.filter(speciality => speciality.ChefPropertiesId === 3);

        // Fetch assigned specialities for the chef
        const assignedSpecialities = await getAssignedSpecialities();

        // Map the filtered data into the corresponding state variables
        let newCuisineState = {};
        let newChefDietaryState = {};
        let newEventTypesState = {};
        let newExperienceState = {};

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

        filteredEventTypes.forEach((speciality) => {
          newEventTypesState[speciality.Name] = {
            Id: speciality.Id,
            Name: speciality.Name,
            checked: assignedSpecialities.includes(speciality.Id)
          };
        });

        filteredExperience.forEach((speciality) => {
          newExperienceState[speciality.Name] = {
            Id: speciality.Id,
            Name: speciality.Name,
            checked: assignedSpecialities.includes(speciality.Id)
          };
        });

        // Set the states with the filtered and mapped data
        setCuisine(newCuisineState);
        setChefDietaryPreferences(newChefDietaryState);
        setEventTypes(newEventTypesState);
        SetCExperience(newExperienceState);
      } else {
        console.error('No specialities found:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching cuisines:', error);
    }
  };


  const getChefData = async () => {

    try {
      const response = await axios.get(`${BASE_URL}chefs/get_chef_data.php`, {
        params: { ChefID: profile.Id }
      });

      if (response.data.status === "success") {


        const chef = response.data.data;

        setName(chef[0].FirstName);
        setMiddle(chef[0].MiddleName);
        setLast(chef[0].LastName);

        setBio(chef[0].Bio);
        setExperience(chef[0].ExperienceYears); // Convert number to string for TextInput
        setPhone(chef[0].Phone);
        setAddress(chef[0].Address);
        setLat(chef[0].Lat);
        setLon(chef[0].Lon);
        setPinCode(chef[0].PinCode);


        setOldProfileImage(chef[0].Image);
        console.log(chef[0].Image);
      } else {
        console.log("Error:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching chef data:", error);
    }
  };

  const handleImagePick = async () => {
    try {
      if (Platform.OS === 'ios') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Please enable media library access in your settings to upload images.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() }
            ]
          );
          return;
        }
      }

      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please enable media library access in your settings to upload images.'
        );
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      console.log('Image picker result:', pickerResult);

      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
        setProfileImage(pickerResult.assets[0].uri);
        setOldProfileImage(pickerResult.assets[0].uri);
        setIsOldImageRemoved(false);
        console.log('Selected image URI:', pickerResult.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };
  const handleSuccessUpdate = () => {
    navigation.replace("PopUpScreen", {
      title: "Profile Updated!",
      type: "success",
      detail: "Your profile has been updated successfully.",
      returnTo: "ChefSettings",
    });
  };

  const updateProfile = async () => {
    setIsUpdating(true);
    // Step 1: Validation

    // Validate required fields
    // Validate required fields individually for better UX
    if (!name) { alert('Please enter your First Name.'); setIsUpdating(false); return; }
    if (!middle && !last) { alert('Please enter either a Middle Name or a Last Name.'); setIsUpdating(false); return; }
    if (!bio) { alert('Please write a short Bio about yourself.'); setIsUpdating(false); return; }
    if (!experience) { alert('Please enter your defined Experience (Years).'); setIsUpdating(false); return; }
    if (!phone) { alert('Please enter your Phone Number.'); setIsUpdating(false); return; }
    if (!address) { alert('Please enter your Address.'); setIsUpdating(false); return; }
    if (!pinCode) { alert('Please enter your Pin Code.'); setIsUpdating(false); return; }
    if (!lat || !lon) { alert('Please click "Verify" to confirm your location coordinates.'); setIsUpdating(false); return; }


    // Validate that at least one checkbox is selected in each category
    const isCuisineSelected = Object.values(cuisines).some((cuisine) => cuisine.checked);
    const isDietaryPrefSelected = Object.values(cDietPrefs).some((diet) => diet.checked);
    const isEventTypeSelected = Object.values(eventTypes).some((event) => event.checked);
    const isExperienceSelected = Object.values(cExperience).some((experience) => experience.checked);

    if (!isCuisineSelected) {
      alert('Please select at least one cuisine.');
      setIsUpdating(false);
      return;
    }

    if (!isDietaryPrefSelected) {
      alert('Please select at least one dietary preference.');
      setIsUpdating(false);
      return;
    }

    if (!isEventTypeSelected) {
      alert('Please select at least one event type.');
      setIsUpdating(false);
      return;
    }

    if (!isExperienceSelected) {
      alert('Please select at least one experience.');
      setIsUpdating(false);
      return;
    }


    const formData = new FormData();
    const isRmvd = isOldImageRemoved ? "Yes" : "No";
    formData.append('UserId', profile.Id); // Ensure UserId is included
    formData.append('FirstName', name.trim());
    formData.append('MiddleName', middle.trim());
    formData.append('LastName', last.trim());
    formData.append('Bio', bio);
    formData.append('Experience', experience);
    formData.append('Phone', phone);
    formData.append('IsImageRemoved', isRmvd);
    formData.append('Address', address);
    formData.append('Lat', lat);
    formData.append('Lon', lon);
    formData.append('PinCode', pinCode);
    // Collect selected specialities from cuisines, dietary preferences, event types, and experience
    const selectedSpecialities = [];

    // For cuisines
    Object.keys(cuisines).forEach((cuisine) => {
      if (cuisines[cuisine].checked) {
        selectedSpecialities.push(cuisines[cuisine].Id);
      }
    });

    // For dietary preferences
    Object.keys(cDietPrefs).forEach((diet) => {
      if (cDietPrefs[diet].checked) {
        selectedSpecialities.push(cDietPrefs[diet].Id);
      }
    });

    // For event types
    Object.keys(eventTypes).forEach((event) => {
      if (eventTypes[event].checked) {
        selectedSpecialities.push(eventTypes[event].Id);
      }
    });

    // For experience
    Object.keys(cExperience).forEach((experience) => {
      if (cExperience[experience].checked) {
        selectedSpecialities.push(cExperience[experience].Id);
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
        `${BASE_URL}chefs/update_chef.php`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );


      if (response.data.success) {
        handleSuccessUpdate();
      } else {
        alert('Failed to update profile: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      console.log('Error.response:', error.response);
      console.log('Error.response.data:', error.response?.data);
      console.log('Error.response.status:', error.response?.status);
      alert('An error occurred while updating profile.');
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

  // 
  const fetchLatLon = async () => {
    if (!pinCode) {
      Alert.alert('Error', 'Please enter a Zip Code');
      return;
    }

    // Strict Validation: Reject "00000" and short codes
    if (/^0+$/.test(pinCode) || pinCode.length < 5) {
      Alert.alert('Error', 'Invalid Zip Code. Please enter a valid code.');
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
        const result = response.data.results[0];
        // Strict check: Ensure the API actually found a postcode component
        const foundPostcode = result.components.postcode || result.components.postal_code;

        if (foundPostcode) {
          const geometry = result.geometry;
          const addresss = result.formatted;
          console.log(addresss);
          setLat(geometry.lat.toString());
          setLon(geometry.lng.toString());
          setGeoAddress(addresss);
        } else {
          Alert.alert('Error', 'Invalid Zip Code. No postal region found.');
        }
      } else {
        Alert.alert('Error', 'No location found for this Zip Code.');
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


      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profilePictureContainer}>
          <TouchableOpacity onPress={handleImagePick} style={styles.imageWrapper}>
            <Image
              source={oldProfileImage ? { uri: oldProfileImage } : require('../../../assets/userImage.jpg')}
              style={styles.profilePicture}
              resizeMethod='cover'
            />
          </TouchableOpacity>

          <View style={styles.iconWrapper}>
            <TouchableOpacity style={styles.editIcon} onPress={handleImagePick}>
              <MaterialCommunityIcons name="camera" size={isTablet ? 30 : 20} color="white" />
            </TouchableOpacity>

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
            placeholder="Enter Last Name"
            value={last}
            onChangeText={setLast}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Write something about yourself"
            value={bio}
            onChangeText={setBio}
            multiline
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Experience (Years)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Experience"
            value={experience ? String(experience) : ''}
            onChangeText={setExperience}
            keyboardType="numeric"
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
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Address"
            value={address}
            onChangeText={setAddress}
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Zip Code</Text>
          <Text style={{ fontSize: 12, color: '#6c757d', marginBottom: 8 }}>
            Enter your Zip Code to become more visible to nearby users and improve your searchability.
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 8 }]} // Adjust to fit beside button
              placeholder="Enter Zip Code"
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
            style={[styles.input, { backgroundColor: '#f0f0f0', color: '#666' }]}
            placeholder="Generated from Zip Code"
            value={lat}
            onChangeText={setLat}
            editable={false}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Longitude</Text>
          <TextInput
            style={[styles.input, { backgroundColor: '#f0f0f0', color: '#666' }]}
            placeholder="Generated from Zip Code"
            value={lon}
            onChangeText={setLon}
            editable={false}
          />
        </View>



        <View style={styles.section}>
          <Text style={styles.heading}>Fill out the below sections to make more searchable</Text>
        </View>

        {/* <View style={styles.section}>
          <Text style={styles.label}>Languages Spoken</Text>
          {Object.keys(languages).map((lang) => (
            <View key={lang} style={styles.switchContainer}>
              <Text style={styles.chkLabel}>{lang}</Text>
              <Switch
                value={languages[lang]}
                onValueChange={() => toggleLanguage(lang)}
                trackColor={{ false: '#ccc', true: '#ff0000' }}
                thumbColor={languages[lang] ? '#fff' : '#f4f3f4'}
              />
            </View>
          ))}
        </View> */}

        <View style={styles.section}>
          <Text style={styles.label}>What type of cuisine do you specialize in?</Text>
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
          {Object.keys(cDietPrefs).map((cDietPref) => (
            <View key={cDietPref} style={styles.switchContainer}>
              <Text style={styles.chkLabel}>{cDietPref}</Text>
              <Switch
                value={cDietPrefs[cDietPref].checked}
                onValueChange={() => toggleDietaryPreference(cDietPref)}
                trackColor={{ false: '#ccc', true: '#ff0000' }}
                thumbColor={cDietPrefs[cDietPref].checked ? '#fff' : '#f4f3f4'}
              />
            </View>
          ))}
        </View>


        <View style={styles.section}>
          <Text style={styles.label}>What is your experience level?</Text>
          {Object.keys(cExperience).map((cExp) => (
            <View key={cExp} style={styles.switchContainer}>
              <Text style={styles.chkLabel}>{cExp}</Text>
              <Switch
                value={cExperience[cExp].checked}
                onValueChange={() => toggleExperience(cExp)}
                trackColor={{ false: '#ccc', true: '#ff0000' }}
                thumbColor={cExperience[cExp].checked ? '#fff' : '#f4f3f4'}
              />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>What types of events do you cater to?</Text>
          {Object.keys(eventTypes).map((event) => (
            <View key={event} style={styles.switchContainer}>
              <Text style={styles.chkLabel}>{event}</Text>
              <Switch
                value={eventTypes[event].checked}
                onValueChange={() => toggleEventType(event)}
                trackColor={{ false: '#ccc', true: '#ff0000' }}
                thumbColor={eventTypes[event].checked ? '#fff' : '#f4f3f4'}
              />
            </View>
          ))}
        </View>


        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={updateProfile} disabled={isUpdating}>
            {isUpdating ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Update</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()} disabled={isUpdating}>
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

  iconWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    gap: 15,
  },
  editIcon: {
    backgroundColor: '#5BC541',
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

export default ChefEditProfile;
