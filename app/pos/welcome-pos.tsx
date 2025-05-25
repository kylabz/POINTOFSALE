import { View, Text, Button, StyleSheet, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';

export default function WelcomePOS() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require('../../assets/background/fastfood.png')} // Ensure correct path
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Welcome to POS</Text>
          <Text style={styles.subtitle}>Point of Sale System</Text>
          <Button title="Enter POS" onPress={() => router.push('/pos/pos')} />
        </View>
      </View>
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
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)', // Adds a dark overlay to improve contrast
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white background
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
});
