/**
 * NativeRNActionSheet is mocked at module-level so that TurboModuleRegistry.get()
 * returns null by default. This forces the fallback path (NativeModules bridge)
 * in Android tests, and lets us separately test the TurboModuleRegistry path
 * with a manual factory override.
 */
jest.mock('../NativeRNActionSheet', () => ({
  __esModule: true,
  default: null,
}));

import { ActionSheetIOS, NativeModules, Platform } from 'react-native';
import RNActionSheet, {
  showActionSheetWithOptions,
  showActionSheetWithOptionsAsync,
  type ActionSheetOptions,
} from '../index';

describe('RNActionSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('iOS platform', () => {
    beforeEach(() => {
      Platform.OS = 'ios';
      jest
        .spyOn(ActionSheetIOS, 'showActionSheetWithOptions')
        .mockImplementation((_options, callback) => {
          callback(1);
        });
    });

    it('delegates showActionSheetWithOptions to ActionSheetIOS on iOS', () => {
      const callback = jest.fn();
      const options: ActionSheetOptions = {
        options: ['Delete', 'Save', 'Cancel'],
        cancelButtonIndex: 2,
        destructiveButtonIndex: 0,
      };

      showActionSheetWithOptions(options, callback);

      expect(ActionSheetIOS.showActionSheetWithOptions).toHaveBeenCalledWith(
        options,
        callback
      );
      expect(callback).toHaveBeenCalledWith(1);
    });

    it('resolves showActionSheetWithOptionsAsync with selected index on iOS', async () => {
      const options: ActionSheetOptions = {
        options: ['Take Photo', 'Cancel'],
        cancelButtonIndex: 1,
      };

      const result = await showActionSheetWithOptionsAsync(options);

      expect(ActionSheetIOS.showActionSheetWithOptions).toHaveBeenCalled();
      expect(result).toBe(1);
    });
  });

  describe('Android platform — legacy bridge (Old Architecture)', () => {
    beforeEach(() => {
      Platform.OS = 'android';
      // NativeRNActionSheet is mocked as null at the top of this file,
      // so the NativeModules fallback branch is exercised here.
      NativeModules.RNActionSheet = {
        showActionSheetWithOptions: jest.fn((_options, callback) => {
          callback(0);
        }),
      };
    });

    it('delegates showActionSheetWithOptions to NativeModules.RNActionSheet', () => {
      const callback = jest.fn();
      const options: ActionSheetOptions = {
        options: ['Action 1', 'Action 2'],
        cancelButtonIndex: 1,
      };

      showActionSheetWithOptions(options, callback);

      expect(
        NativeModules.RNActionSheet.showActionSheetWithOptions
      ).toHaveBeenCalledWith(options, callback);
      expect(callback).toHaveBeenCalledWith(0);
    });

    it('resolves showActionSheetWithOptionsAsync with selected index', async () => {
      const options: ActionSheetOptions = {
        options: ['Action 1', 'Action 2'],
        cancelButtonIndex: 1,
      };

      const result = await showActionSheetWithOptionsAsync(options);

      expect(
        NativeModules.RNActionSheet.showActionSheetWithOptions
      ).toHaveBeenCalled();
      expect(result).toBe(0);
    });
  });

  describe('Android platform — TurboModuleRegistry (New Architecture)', () => {
    const turboMock = {
      showActionSheetWithOptions: jest.fn(
        (_options: Object, callback: (n: number) => void) => {
          callback(2);
        }
      ),
    };

    it('delegates to TurboModuleRegistry when New Architecture is active', async () => {
      // Override the module-level null mock to simulate a registered Turbo Module.
      jest.resetModules();
      jest.doMock('../NativeRNActionSheet', () => ({
        __esModule: true,
        default: turboMock,
      }));

      // Re-import after mock override so the fresh module picks up the Turbo Module.
      const { showActionSheetWithOptions: show } = await import('../index');

      Platform.OS = 'android';
      turboMock.showActionSheetWithOptions.mockClear();

      const callback = jest.fn();
      const options: ActionSheetOptions = {
        options: ['A', 'B', 'Cancel'],
        cancelButtonIndex: 2,
      };

      show(options, callback);

      expect(turboMock.showActionSheetWithOptions).toHaveBeenCalledWith(
        options,
        callback
      );
      expect(callback).toHaveBeenCalledWith(2);

      // Restore the module-level null mock for sibling test suites.
      jest.resetModules();
      jest.doMock('../NativeRNActionSheet', () => ({
        __esModule: true,
        default: null,
      }));
    });
  });

  describe('Fallback platform', () => {
    beforeEach(() => {
      Platform.OS = 'web';
    });

    it('invokes callback with cancelButtonIndex on unsupported platforms', () => {
      const callback = jest.fn();
      showActionSheetWithOptions(
        { options: ['Option 1', 'Cancel'], cancelButtonIndex: 1 },
        callback
      );
      expect(callback).toHaveBeenCalledWith(1);
    });

    it('invokes callback with -1 when cancelButtonIndex is omitted on unsupported platforms', () => {
      const callback = jest.fn();
      showActionSheetWithOptions({ options: ['Option 1'] }, callback);
      expect(callback).toHaveBeenCalledWith(-1);
    });
  });

  describe('Default export', () => {
    it('exports showActionSheetWithOptions and showActionSheetWithOptionsAsync on default export', () => {
      expect(typeof RNActionSheet.showActionSheetWithOptions).toBe('function');
      expect(typeof RNActionSheet.showActionSheetWithOptionsAsync).toBe(
        'function'
      );
    });
  });

  // ─── Runtime validation ───────────────────────────────────────────────────────

  describe('Runtime validation', () => {
    beforeEach(() => {
      Platform.OS = 'web'; // use fallback to avoid native module dependency
    });

    it('throws when options array is empty', () => {
      expect(() =>
        showActionSheetWithOptions({ options: [] }, jest.fn())
      ).toThrow(
        '[RNActionSheet] `options` must be a non-empty array of strings.'
      );
    });

    it('throws when cancelButtonIndex is out of bounds (too high)', () => {
      expect(() =>
        showActionSheetWithOptions(
          { options: ['A', 'B'], cancelButtonIndex: 5 },
          jest.fn()
        )
      ).toThrow('`cancelButtonIndex` (5) is out of bounds');
    });

    it('throws when cancelButtonIndex is negative', () => {
      expect(() =>
        showActionSheetWithOptions(
          { options: ['A', 'B'], cancelButtonIndex: -1 },
          jest.fn()
        )
      ).toThrow('`cancelButtonIndex` (-1) is out of bounds');
    });

    it('throws when destructiveButtonIndex scalar is out of bounds', () => {
      expect(() =>
        showActionSheetWithOptions(
          { options: ['A', 'B'], destructiveButtonIndex: 10 },
          jest.fn()
        )
      ).toThrow('`destructiveButtonIndex` value 10 is out of bounds');
    });

    it('throws when destructiveButtonIndex array contains an out-of-bounds index', () => {
      expect(() =>
        showActionSheetWithOptions(
          { options: ['A', 'B'], destructiveButtonIndex: [0, 99] },
          jest.fn()
        )
      ).toThrow('`destructiveButtonIndex` value 99 is out of bounds');
    });

    it('throws when disabledButtonIndices contains an out-of-bounds index', () => {
      expect(() =>
        showActionSheetWithOptions(
          { options: ['A', 'B'], disabledButtonIndices: [0, 5] },
          jest.fn()
        )
      ).toThrow('`disabledButtonIndices` value 5 is out of bounds');
    });

    it('does not throw for valid options', () => {
      const callback = jest.fn();
      expect(() =>
        showActionSheetWithOptions(
          {
            options: ['Delete', 'Save', 'Cancel'],
            cancelButtonIndex: 2,
            destructiveButtonIndex: [0],
            disabledButtonIndices: [1],
          },
          callback
        )
      ).not.toThrow();
      expect(callback).toHaveBeenCalledWith(2);
    });
  });
});
