import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ImageBackground,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [gmail, setGmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      // Admin login check
      if (gmail === 'admin' && password === 'password123') {
        router.push('/pos/welcome-pos'); // Navigate to admin screen if needed
        return;
      }

      // Registered user login (multi-user support)
      const usersJson = await AsyncStorage.getItem('users');
      const users = usersJson ? JSON.parse(usersJson) : [];

      if (!users.length) {
        Alert.alert('Login Failed', 'No registered account found. Please create one.');
        return;
      }

      const foundUser = users.find(
        (user: any) =>
          user.email?.toLowerCase() === gmail.toLowerCase() &&
          user.password === password
      );

      if (foundUser) {
        router.push('/pos/welcome-pos');
      } else {
        Alert.alert('Login Failed', 'Invalid Gmail or password');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong during login.');
    }
  };

  const handleCreateAccount = () => {
    router.push('../pos/register');
  };

  return (
    <ImageBackground
      source={require('../../assets/background/fastfood.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Welcome</Text>

          <TextInput
            placeholder="Gmail"
            value={gmail}
            onChangeText={setGmail}
            style={styles.input}
            placeholderTextColor="#aaa"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            placeholderTextColor="#aaa"
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Log In</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton} onPress={handleCreateAccount}>
            <Text style={styles.linkText}>Don't have an account? Create one</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f1f1f1',
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#222',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: '#007bff',
    fontSize: 14,
  },
});
