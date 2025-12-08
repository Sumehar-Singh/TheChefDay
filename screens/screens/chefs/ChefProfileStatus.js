import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, SafeAreaView } from 'react-native';

import CustomStatusBar from '../../components/CustomStatusBar';
import ChefProfileCompletionSection from '../../components/ChefProfileCompletionSection';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChefSubscriptionList from '../../components/ChefSubscriptionList';

const ChefProfileStatus = ({ navigation }) => {



  return (
    <SafeAreaView style={styles.container}>
      <CustomStatusBar title="Profile Status" includeTopInset={false} />
      <ScrollView style={styles.scrollView}>
        <ChefProfileCompletionSection navigation={navigation} />
        <ChefSubscriptionList />
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

});

export default ChefProfileStatus;
