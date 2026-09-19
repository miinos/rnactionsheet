import {
  NativeModules,
  Platform,
  ActionSheetIOS,
  type ActionSheetIOSOptions,
} from 'react-native';
import NativeRNActionSheetSpec from './NativeRNActionSheet';

const LINKING_ERROR =
  `The package '@miinos/rnactionsheet' doesn't seem to be linked. Make sure: \n\n` +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

export interface ActionSheetOptions {
  options: string[];
  title?: string;
  message?: string;
  cancelButtonIndex?: number;
  destructiveButtonIndex?: number | number[];
  tintColor?: string;
  cancelButtonTintColor?: string;
  userInterfaceStyle?: 'light' | 'dark';
  disabledButtonIndices?: number[];
  anchor?: number;
}

/**
 * Shape of the Android native module, matching both the legacy NativeModules
 * bridge and the Turbo Module spec (Spec.showActionSheetWithOptions).
 *
 * Using `Object` on the options parameter aligns with the Codegen spec type
 * and avoids type-unsafe double casts at the call site.
 */
type NativeActionSheetModule = {
  showActionSheetWithOptions(
    options: Object,
    callback: (buttonIndex: number) => void
  ): void;
};

/**
 * Lazily resolves the Android native module at call time, not at module load.
 *
 * Resolution order:
 *   1. TurboModuleRegistry (New Architecture)
 *   2. NativeModules bridge (Old Architecture / interop layer)
 *   3. Proxy that throws a descriptive error (module not linked)
 *
 * Lazy resolution is intentional: it allows Jest to set up NativeModules
 * mocks in beforeEach without being bypassed by a stale top-level reference.
 */
function getNativeModule(): NativeActionSheetModule {
  if (NativeRNActionSheetSpec != null) {
    return NativeRNActionSheetSpec;
  }
  if (NativeModules.RNActionSheet) {
    return NativeModules.RNActionSheet as NativeActionSheetModule;
  }
  return new Proxy({} as NativeActionSheetModule, {
    get() {
      throw new Error(LINKING_ERROR);
    },
  });
}

/**
 * Validates ActionSheetOptions at runtime and throws descriptive errors for
 * mistakes that TypeScript alone cannot catch (e.g., empty arrays, out-of-bounds
 * indices). Validation happens before any platform branch so it covers all paths.
 */
function validateOptions(options: ActionSheetOptions): void {
  if (!Array.isArray(options.options) || options.options.length === 0) {
    throw new Error(
      '[RNActionSheet] `options` must be a non-empty array of strings.'
    );
  }

  const len = options.options.length;

  if (
    options.cancelButtonIndex !== undefined &&
    (options.cancelButtonIndex < 0 || options.cancelButtonIndex >= len)
  ) {
    throw new Error(
      `[RNActionSheet] \`cancelButtonIndex\` (${options.cancelButtonIndex}) is out of bounds for options array of length ${len}.`
    );
  }

  const destructive = options.destructiveButtonIndex;
  if (destructive !== undefined) {
    const indices = Array.isArray(destructive) ? destructive : [destructive];
    for (const idx of indices) {
      if (idx < 0 || idx >= len) {
        throw new Error(
          `[RNActionSheet] \`destructiveButtonIndex\` value ${idx} is out of bounds for options array of length ${len}.`
        );
      }
    }
  }

  if (options.disabledButtonIndices !== undefined) {
    for (const idx of options.disabledButtonIndices) {
      if (idx < 0 || idx >= len) {
        throw new Error(
          `[RNActionSheet] \`disabledButtonIndices\` value ${idx} is out of bounds for options array of length ${len}.`
        );
      }
    }
  }
}

export const showActionSheetWithOptions = (
  options: ActionSheetOptions,
  callback: (buttonIndex: number) => void
): void => {
  validateOptions(options);

  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      options as ActionSheetIOSOptions,
      callback
    );
  } else if (Platform.OS === 'android') {
    // ActionSheetOptions is structurally compatible with Object (a plain JS
    // object map). No unsafe cast needed — Object is a supertype of all objects.
    getNativeModule().showActionSheetWithOptions(options, callback);
  } else {
    const cancelIndex = options.cancelButtonIndex ?? -1;
    callback(cancelIndex);
  }
};

export const showActionSheetWithOptionsAsync = (
  options: ActionSheetOptions
): Promise<number> => {
  return new Promise<number>((resolve) => {
    showActionSheetWithOptions(options, (buttonIndex) => {
      resolve(buttonIndex);
    });
  });
};

const RNActionSheet = {
  showActionSheetWithOptions,
  showActionSheetWithOptionsAsync,
};

export default RNActionSheet;
