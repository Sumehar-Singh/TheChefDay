

import React, { useState } from 'react';
import { View, Text, Button, Modal, TouchableOpacity, StyleSheet, TextInput,Dimensions } from 'react-native';
import {   Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomButton from '../../components/Controls/CustomButton';
import TopSVG from '../../components/TopSVG';
import BottomSVG from '../../components/Controls/BottomSVG';
const { width, height } = Dimensions.get('window');
const isTablet = width > 600;

const Specialities = ({navigation}) => {
  // General state for Chef/User selection and modal visibility
  const [isChef, setIsChef] = useState(null); 
  const [showFirstModal, setShowFirstModal] = useState(true);
  const [showChefModal, setShowChefModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
 const [username, setUsername] = useState('');
 const [password, setPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [loading, setLoading] = useState(false);
  // For storing chef data
  const [chefData, setChefData] = useState({
    cuisine: [],
    dietaryPreferences: [],
    experienceLevel: '',
    eventTypes: [],
    location: '',
  });

  // For storing user data
  const [userData, setUserData] = useState({
    dietaryPreferences: [],
    cuisinePreferences: [],
    mealType: '',
  });

  // For tracking button selection
  const [selectedCuisine, setSelectedCuisine] = useState([]);
  const [selectedDietaryPreferences, setSelectedDietaryPreferences] = useState([]);
  const [selectedExperienceLevel, setSelectedExperienceLevel] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('');

  // State to track the modal step
  const [step, setStep] = useState(1);
  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Handle login logic here
    }, 2000);
  };
  const handleCancel = () => {
    // Handle cancel logic here
    console.log('Cancel clicked');
  };
  // Helper function to toggle selection for multiple options
  const toggleSelection = (selectedArray, setter) => (value) => {
    const updatedArray = selectedArray.includes(value)
      ? selectedArray.filter(item => item !== value)
      : [...selectedArray, value];
    setter(updatedArray);
  };

  // Modal handlers
  const handleChefSelection = () => {
    setIsChef(true);
    setShowFirstModal(false);
    setShowChefModal(true);
    setStep(1);
  };

  const handleUserSelection = () => {
    setIsChef(false);
    setShowFirstModal(false);
    setShowUserModal(true);
    setStep(1);
  };

  // Modal: Chef - Cuisine Selection
  const renderChefCuisineModal = () => (
    <Modal visible={showChefModal && step === 1} animationType="slide" onRequestClose={() => setShowChefModal(false)}>
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>What type of cuisine do you specialize in?</Text>
        <View style={styles.buttonGroup}>
          {['Italian', 'Indian', 'Mexican', 'Chinese', 'Mediterranean','All'].map(cuisine => (
            <TouchableOpacity
              key={cuisine}
              style={[styles.button, selectedCuisine.includes(cuisine) && styles.activeButton]}
              onPress={() => toggleSelection(selectedCuisine, setSelectedCuisine)(cuisine)}>
               <Text style={[styles.buttonText, selectedCuisine.includes(cuisine) && styles.activeButtonText]}>{cuisine}</Text>
            </TouchableOpacity>
          ))}

<CustomButton
        title="NEXT"
        onPress={() => {
          setChefData({ ...chefData, cuisine: selectedCuisine });
          setStep(2);
        }} 
      style={styles.nextButton}
        type="primary"
      />
        </View>
      
    
      </View>
    </Modal>
  );

  // Modal: Chef - Dietary Preferences
  const renderChefDietaryPreferencesModal = () => (
    <Modal visible={showChefModal && step === 2} animationType="slide" onRequestClose={() => setShowChefModal(false)}>
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>What dietary preferences can you cater to?</Text>
        <View style={styles.buttonGroup}>
          {['Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Low-Carb','All'].map(diet => (
            <TouchableOpacity
              key={diet}
              style={[styles.button, selectedDietaryPreferences.includes(diet) && styles.activeButton]}
              onPress={() => toggleSelection(selectedDietaryPreferences, setSelectedDietaryPreferences)(diet)}>
               <Text style={[styles.buttonText, selectedDietaryPreferences.includes(diet) && styles.activeButtonText]}>{diet}</Text>
            </TouchableOpacity>
          ))}
        </View>
       

<CustomButton
        title="NEXT"
        onPress={() => {
          setChefData({ ...chefData, dietaryPreferences: selectedDietaryPreferences });
          setStep(3);
        }} 
      style={styles.nextButton}
        type="primary"
      />
      </View>
    </Modal>
  );

  // Modal: Chef - Experience Level
  const renderChefExperienceLevelModal = () => (
    <Modal visible={showChefModal && step === 3} animationType="slide" onRequestClose={() => setShowChefModal(false)}>
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>What is your experience level?</Text>
        <View style={styles.buttonGroup}>
          {['Beginner', 'Intermediate', 'Advanced'].map(level => (
            <TouchableOpacity
              key={level}
              style={[styles.button, selectedExperienceLevel === level && styles.activeButton]}
              onPress={() => setSelectedExperienceLevel(level)}>
               <Text style={[styles.buttonText, selectedExperienceLevel === level && styles.activeButtonText]}>{level}</Text>
            </TouchableOpacity>
          ))}
        </View>
       


<CustomButton
        title="NEXT"
        onPress={() => {
          setChefData({ ...chefData, experienceLevel: selectedExperienceLevel });
          setStep(4);
        }} 
      style={styles.nextButton}
        type="primary"
      />
      </View>
    </Modal>
  );

  // Modal: Chef - Event Types
  const renderChefEventTypesModal = () => (
    <Modal visible={showChefModal && step === 4} animationType="slide" onRequestClose={() => setShowChefModal(false)}>
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>What types of events do you cater to?</Text>
        <View style={styles.buttonGroup}>
          {['Dinner Parties', 'Weddings', 'Corporate Events', 'Private Dinners','All'].map(event => (
            <TouchableOpacity
              key={event}
              style={[styles.button, chefData.eventTypes.includes(event) && styles.activeButton]}
              onPress={() => toggleSelection(chefData.eventTypes, (value) => setChefData({ ...chefData, eventTypes: value }))(event)}>
           <Text style={[styles.buttonText, chefData.eventTypes.includes(event) && styles.activeButtonText]}>{event}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
<CustomButton
        title="NEXT"
        onPress={() => {
          setStep(5);
        }} 
      style={styles.nextButton}
        type="primary"
      />
      
      </View>
    </Modal>
  );

  // Modal: Chef - Location
  const renderChefLocationModal = () => (
    <Modal visible={showChefModal && step === 5} animationType="slide" onRequestClose={() => setShowChefModal(false)}>
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Where are you located?</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your location"
          onChangeText={(text) => setChefData({ ...chefData, location: text })}
        />

<CustomButton
        title="NEXT"
        onPress={() => {
          setShowChefModal(false);
          setStep(6);
        }} 
      style={styles.nextButton}
        type="primary"
      />
      
      </View>
    </Modal>
  );

  // Modal: User - Dietary Preferences
  const renderUserDietaryPreferencesModal = () => (
    <Modal visible={showUserModal && step === 1} animationType="slide" onRequestClose={() => setShowUserModal(false)}>
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>What dietary preferences do you have?</Text>
        <View style={styles.buttonGroup}>
          {['Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto','All'].map(diet => (
            <TouchableOpacity
              key={diet}
              style={[styles.button, selectedDietaryPreferences.includes(diet) && styles.activeButton]}
              onPress={() => toggleSelection(selectedDietaryPreferences, setSelectedDietaryPreferences)(diet)}>
              <Text style={[styles.buttonText, selectedDietaryPreferences.includes(diet) && styles.activeButtonText]}>{diet}</Text>
            </TouchableOpacity>
          ))}
        </View>

        
<CustomButton
        title="NEXT"
        onPress={() => {
          setUserData({ ...userData, dietaryPreferences: selectedDietaryPreferences });
          setStep(2);
        }} 
      style={styles.nextButton}
        type="primary"
      />
       
      </View>
    </Modal>
  );

  // Modal: User - Preferred Cuisines
  const renderUserPreferredCuisinesModal = () => (
    <Modal visible={showUserModal && step === 2} animationType="slide" onRequestClose={() => setShowUserModal(false)}>
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>What cuisines do you prefer?</Text>
        <View style={styles.buttonGroup}>
          {['Italian', 'Indian', 'Mexican', 'Chinese','All'].map(cuisine => (
            <TouchableOpacity
              key={cuisine}
              style={[styles.button, selectedCuisine.includes(cuisine) && styles.activeButton]}
              onPress={() => toggleSelection(selectedCuisine, setSelectedCuisine)(cuisine)}>
              <Text style={[styles.buttonText, selectedCuisine.includes(cuisine) && styles.activeButtonText]}>{cuisine}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <CustomButton
        title="NEXT"
        onPress={() => {
          setUserData({ ...userData, cuisinePreferences: selectedCuisine });
          setStep(3);
        }} 
      style={styles.nextButton}
        type="primary"
      />
       
       
      </View>
    </Modal>
  );

  // Modal: User - Meal Type
  const renderUserMealTypeModal = () => (
    <Modal visible={showUserModal && step === 3} animationType="slide" onRequestClose={() => setShowUserModal(false)}>
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>What type of meals do you prefer?</Text>
        <View style={styles.buttonGroup}>
          {['Breakfast', 'Lunch', 'Dinner', 'Snacks','All'].map(meal => (
            <TouchableOpacity
              key={meal}
              style={[styles.button, selectedMealType === meal && styles.activeButton]}
              onPress={() => setSelectedMealType(meal)}>
              <Text style={[styles.buttonText, selectedMealType === meal && styles.activeButtonText]}>{meal}</Text>
            </TouchableOpacity>
          ))}
        </View>


        <CustomButton
        title="Finish User Registration"
        onPress={() => {
          setShowUserModal(false);
          setStep(6);
        }} 
      style={styles.nextButton}
        type="primary"
      />
       
      </View>
    </Modal>
  );

  // Initial Modal for Chef/User selection
  const renderFirstModal = () => (
    <Modal visible={showFirstModal} animationType="fade" onRequestClose={() => setShowFirstModal(false)}>
      <TopSVG/>
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Are you a Chef or a User?</Text>
        <View style={styles.buttonGroup}>
         
          <CustomButton
        title="Chef"
        onPress={handleChefSelection}
       
        type="primary"
      />
       <CustomButton
        title="User"
        onPress={handleUserSelection}
       
        type="primary"
      />
         
        </View>
      </View>
    </Modal>
  );
  const renderRegistrationForm = () => (
  
    <LinearGradient  colors={['white', '#f2f2f2', '#e6e6e6']} style={styles.formContainer}>
      
    

       {/* Welcome Text */}
       <Text style={styles.signupText}>Sign Up</Text>
       <Text style={styles.subText}>Create an account to find your perfect chef!</Text>

       {/* Form */}
       <View style={styles.form}>
         <TextInput
           style={styles.input}
           placeholder="Full Name"
           placeholderTextColor="#8c8c8c"
           value={fullName}
           onChangeText={setFullName}
         />
         <TextInput
           style={styles.input}
           placeholder="Email"
           placeholderTextColor="#8c8c8c"
           keyboardType="email-address"
           value={email}
           onChangeText={setEmail}
         />
         <TextInput
           style={styles.input}
           placeholder="Username"
           placeholderTextColor="#8c8c8c"
           value={username}
           onChangeText={setUsername}
         />
         <TextInput
           style={styles.input}
           placeholder="Password"
           placeholderTextColor="#8c8c8c"
           secureTextEntry
           value={password}
           onChangeText={setPassword}
         />
         <TextInput
           style={styles.input}
           placeholder="Confirm Password"
           placeholderTextColor="#8c8c8c"
           secureTextEntry
           value={confirmPassword}
           onChangeText={setConfirmPassword}
         />

 <CustomButton
         title="SIGN UP"
         onPress={handleLogin}
         isLoading={loading}
         type="primary"
       />
   {/* <CustomButton
         title="CANCEL"
         onPress={handleCancel}
         type="cancel"
       /> */}
         <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('LoginScreen')}>
           <Text style={styles.loginText}>Already have an account? <Text style={styles.loginTextHighlight}>LOG IN</Text></Text>
         </TouchableOpacity>
       </View>
     
    </LinearGradient>
  
   
  );
  
  const handleSubmit = () => {
    // Handle form submission logic (e.g., send data to API or save in local storage)
    console.log('Registration data submitted', isChef ? chefData : userData);
  };
  
  return (
    <LinearGradient colors={['white', '#f2f2f2', '#e6e6e6']} >

      {renderFirstModal()}
      {renderChefCuisineModal()}
      {renderChefDietaryPreferencesModal()}
      {renderChefExperienceLevelModal()}
      {renderChefEventTypesModal()}
      {renderChefLocationModal()}

      {renderUserDietaryPreferencesModal()}
      {renderUserPreferredCuisinesModal()}
      {renderUserMealTypeModal()}

       {/* Show the registration form after the last step */}
    {step > 5 && renderRegistrationForm()}

    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  superContainer:{
    
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,

  },

  buttonGroup: {
    marginBottom: 20,
    width: '90%',
  },
  button: {
    backgroundColor: 'transparent',
    borderColor: '#805500',
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  activeButton: {
    backgroundColor: '#805500',
    
  },
  activeButtonText: {
    color: "white",
    
  },
  buttonText: {
    color: '#4d3300',
    fontSize: isTablet?24:18,
    fontWeight: '600',
  },

  
  input: {
    width: '100%',
    height: 50,
    fontSize: isTablet?23:17,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: isTablet?25:15,
    paddingHorizontal: 0,  // No padding on the sides for a cleaner look
  },

  formContainer: {

  height:"100%",
    backgroundColor: '#FFF',
    paddingHorizontal: isTablet?60:30,
    justifyContent: 'center',
    alignContent:"center",
    alignItems:"center",
  paddingBottom:isTablet?"20%":0,
 
   
  },
  form: {
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: isTablet?30:0,
  },
  logo: {
    width: isTablet?120:100,
    height: isTablet?100:80,
    marginBottom: isTablet?30:0,
  },
  modalTitle: {
    fontSize: isTablet?25:18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color:"#4d3300"
  },
  formText: {
    fontSize: 23,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
    loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    color: '#666',
    fontSize: isTablet ? 21 : 14,
  },
  loginTextHighlight: {
    color: '#805500',
    fontWeight: '600',
  },
    signupText: {
    fontSize: isTablet ? 27 : 20,
    fontWeight: '600',
    color: 'black',
    marginBottom: 10,
    textShadowColor: '#585858',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
  },
  subText: {
    fontSize: isTablet ? 22 : 15,
    color: '#222',
    marginBottom: 30,
  },

  nextButton:{
    marginTop:30,
    backgroundColor:"#4d3300",
    width:"60%",
    alignSelf:"center"
  }
});

export default Specialities;
