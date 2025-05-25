import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function Coffee() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Coffee</Text>
      <Text style={styles.text}>This is the Coffee category page.</Text>
      <Button title="Back to Menu" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16
  },
  text: {
    fontSize: 16,
    marginBottom: 24
  }
});
