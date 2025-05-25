import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, ImageBackground, ActivityIndicator } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const BASE_URL = 'http://<YOUR_LOCAL_IP>:5000/api/receipts/export'; // Replace with your actual IP and port

export default function DownloadSales() {
  const [loading, setLoading] = useState(false);

  const handleDownload = async (period: string) => {
    try {
      setLoading(true);

      const response = await fetch(`${BASE_URL}/${period}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const blob = await response.blob();

      if (blob) {
        const fileUri = FileSystem.documentDirectory + `sales_${period}.xlsx`;

        // Convert blob to base64 string
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64data = reader.result?.toString().split(',')[1] || '';
          await FileSystem.writeAsStringAsync(fileUri, base64data, {
            encoding: FileSystem.EncodingType.Base64,
          });

          Alert.alert('Success', `Sales data downloaded as Excel for ${period}.`);

          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri);
          } else {
            Alert.alert('Sharing not available', 'Unable to share the file.');
          }
          setLoading(false);
        };
        reader.readAsDataURL(blob);
      } else {
        Alert.alert('Download failed', 'Could not download the sales file.');
        setLoading(false);
      }
    } catch (error: unknown) {
      setLoading(false);
      if (error instanceof Error) {
        Alert.alert('Download failed', error.message);
      } else {
        Alert.alert('Download failed', 'An unknown error occurred.');
      }
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/background/fastfood.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Download Sales</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#1E90FF" />
        ) : (
          <>
            <Button title="Today" onPress={() => handleDownload('today')} color="#1E90FF" />
            <View style={styles.space} />
            <Button title="Month" onPress={() => handleDownload('month')} color="#1E90FF" />
            <View style={styles.space} />
            <Button title="Week" onPress={() => handleDownload('week')} color="#1E90FF" />
          </>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: 'white',
  },
  space: {
    height: 20,
  },
});
