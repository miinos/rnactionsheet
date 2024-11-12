import { StyleSheet, View, Text, Pressable } from 'react-native';
import RNActionSheet from 'rnactionsheet';
export default function App() {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => {
          RNActionSheet.showActionSheetWithOptions(
            {
              options: ['Delete', 'Save', 'Cancel'],
              destructiveButtonIndex: 0,
              cancelButtonIndex: 2,
            },
            (index) => {
              console.log(index);
            }
          );
        }}
      >
        <Text>Open ActionSheet</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
