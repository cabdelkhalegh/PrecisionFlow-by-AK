/**
 * Index/Welcome Screen - Initial screen that checks auth
 */

import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { isAuthenticated } from '../lib/auth';

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    checkAuthAndNavigate();
  }, []);

  async function checkAuthAndNavigate() {
    const authenticated = await isAuthenticated();
    
    // Navigate based on auth status
    if (authenticated) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/login');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PrecisionFlow</Text>
      <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
      <Text style={styles.subtitle}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
  loader: {
    marginVertical: 20,
  },
});
