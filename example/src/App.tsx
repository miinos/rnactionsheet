import { useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import RNActionSheet, {
  showActionSheetWithOptionsAsync,
} from '@miinos/rnactionsheet';

export default function App() {
  const [result, setResult] = useState<string>('No option selected');

  const handleOpenCallback = () => {
    RNActionSheet.showActionSheetWithOptions(
      {
        title: 'Callback ActionSheet',
        message: 'Select an action using traditional callback',
        options: ['Delete', 'Save', 'Cancel'],
        destructiveButtonIndex: 0,
        cancelButtonIndex: 2,
      },
      (index) => {
        setResult(`Callback selected index: ${index}`);
      }
    );
  };

  const handleOpenAsync = async () => {
    const selectedIndex = await showActionSheetWithOptionsAsync({
      title: 'Async ActionSheet',
      message: 'Select an action using modern async/await',
      options: ['Take Photo', 'Choose from Library', 'Cancel'],
      cancelButtonIndex: 2,
      tintColor: '#2563EB',
    });
    setResult(`Async selected index: ${selectedIndex}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.resultText}>{result}</Text>

      <Pressable style={styles.button} onPress={handleOpenCallback}>
        <Text style={styles.buttonText}>Open (Callback)</Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.asyncButton]}
        onPress={handleOpenAsync}
      >
        <Text style={styles.buttonText}>Open (Async / Await)</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 16,
  },
  resultText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#0284C7',
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  asyncButton: {
    backgroundColor: '#16A34A',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
