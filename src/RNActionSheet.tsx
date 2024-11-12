import {
  NativeModules,
  Platform,
  ActionSheetIOS,
  type ActionSheetIOSOptions,
} from 'react-native';

const { RNActionSheet } = NativeModules;

const showActionSheetWithOptions = (
  options: ActionSheetIOSOptions,
  callback: (buttonIndex: number) => void
) => {
  const ActionSheet = Platform.OS === 'ios' ? ActionSheetIOS : RNActionSheet;
  ActionSheet.showActionSheetWithOptions(options, callback);
};

export default {
  showActionSheetWithOptions,
};
