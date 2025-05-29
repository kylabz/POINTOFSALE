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
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '../../firebase/FirebaseConfig'; // Make sure this path is correct
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInLoading, setSignInLoading] = useState(false);
  const router = useRouter();

  // Email validation helper
  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  // Registration handler
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
      // Register user with Firebase Auth
      await createUserWithEmailAndPassword(auth, email, password);

      setLoading(false);
      setShowSuccessModal(true); // Show the success modal
    } catch (error: any) {
      setLoading(false);
      let message = 'Something went wrong while registering.';
      if (error.code === 'auth/email-already-in-use') {
        message = 'This account has been registered. Please use a different email or log in.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      }
      Alert.alert('Error', message);
    }
  };

  // Success modal handler
  const handleSuccessOk = () => {
    setShowSuccessModal(false);
    router.replace('/'); // Go to login screen
  };

const handleSignIn = async () => {
  console.log('Trying to sign in:', signInEmail, signInPassword);

  if (!signInEmail || !signInPassword) {
    Alert.alert('Error', 'Please enter both email and password.');
    return;
  }
  setSignInLoading(true);
  try {
    await signInWithEmailAndPassword(auth, signInEmail, signInPassword);
    setSignInLoading(false);
    setShowSignInModal(false);
    router.replace('/pos/pos');
  } catch (error: any) {
    setSignInLoading(false);
    console.error('Sign in error:', error);
    let message = 'Failed to sign in.';
    if (error.code === 'auth/user-not-found') {
      message = 'No user found with this email.';
    } else if (error.code === 'auth/wrong-password') {
      message = 'Incorrect password.';
    }
    Alert.alert('Error', message);
  }
};

  return (
    <SafeAreaView style={{ flex: 1 }}>
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

                <Pressable onPress={() => setShowSignInModal(true)}>
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
          {/* Sign-In Modal */}
          <Modal
            visible={showSignInModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowSignInModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Sign In</Text>
                <TextInput
                  placeholder="Email"
                  value={signInEmail}
                  onChangeText={setSignInEmail}
                  style={styles.input}
                  placeholderTextColor="#aaa"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TextInput
                  placeholder="Password"
                  value={signInPassword}
                  onChangeText={setSignInPassword}
                  secureTextEntry
                  style={styles.input}
                  placeholderTextColor="#aaa"
                />
                <Pressable
                  style={[styles.button, signInLoading && { opacity: 0.6 }]}
                  onPress={handleSignIn}
                  disabled={signInLoading}
                >
                  <Text style={styles.buttonText}>{signInLoading ? 'Signing In...' : 'Sign In'}</Text>
                </Pressable>
                <Pressable onPress={() => setShowSignInModal(false)}>
                  <Text style={styles.linkText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
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