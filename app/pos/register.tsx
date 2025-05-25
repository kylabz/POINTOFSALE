import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Keyboard,
  ScrollView,
  Platform,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  // Helper to get all users from AsyncStorage
  const getAllUsers = async () => {
    const usersJson = await AsyncStorage.getItem('users');
    return usersJson ? JSON.parse(usersJson) : [];
  };

  // Helper to save all users to AsyncStorage
  const saveAllUsers = async (users: any[]) => {
    await AsyncStorage.setItem('users', JSON.stringify(users));
  };

  const handleRegister = async () => {
    Keyboard.dismiss();

    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      // 1. Check for duplicate email in AsyncStorage
      const users = await getAllUsers();
      const emailExists = users.some((user: any) => user.email.toLowerCase() === email.toLowerCase());
      if (emailExists) {
        setLoading(false);
        Alert.alert('This account has been registered', 'Please use a different email or log in.');
        return;
      }

      // 2. Save user locally
      const newUser = { email, password };
      users.push(newUser);
      await saveAllUsers(users);

      setLoading(false);
      setShowSuccessModal(true); // Show the success modal
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Something went wrong while registering.');
    }
  };

  const handleSuccessOk = () => {
    setShowSuccessModal(false);
    router.replace('/'); // Go to login screen
  };

  return (
    <ImageBackground
      source={require('../../assets/background/fastfood.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={20}
      >
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.overlay}
            keyboardShouldPersistTaps="always"
          >
            <View style={styles.card}>
              <Text style={styles.title}>Create Account</Text>

              <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
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
              <TextInput
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                style={styles.input}
                placeholderTextColor="#aaa"
              />

              <Pressable
                style={[styles.button, loading && { opacity: 0.6 }]}
                onPress={handleRegister}
                disabled={loading}
              >
                <Text style={styles.buttonText}>{loading ? 'Registering...' : 'Register'}</Text>
              </Pressable>

              <Pressable onPress={() => router.replace('/')}>
                <Text style={styles.linkText}>Already have an account? Log In</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
        {/* Success Modal */}
        <Modal
          visible={showSuccessModal}
          transparent
          animationType="fade"
          onRequestClose={handleSuccessOk}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Success</Text>
              <Text style={styles.modalMessage}>You are now registered to the system successfully!</Text>
              <Pressable style={styles.modalButton} onPress={handleSuccessOk}>
                <Text style={styles.modalButtonText}>OK</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  overlay: {
    flexGrow: 1,
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
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  linkText: {
    marginTop: 16,
    color: '#007bff',
    textAlign: 'center',
    fontSize: 14,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    width: 300,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#008000',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#008000',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
