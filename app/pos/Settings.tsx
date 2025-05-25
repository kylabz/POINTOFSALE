import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';

export default function Settings() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require('../../assets/background/fastfood.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <Text style={styles.title}>Settings</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/pos/AddCategory')}
      >
        <Text style={styles.buttonText}>Add Category</Text>
      </TouchableOpacity>

      <TouchableOpacity
    
      >
      </TouchableOpacity>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height:'100%',
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 32,
    color: '#fff',
  },
  button: {
    backgroundColor: '#1e1e1e',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
