/**
 * Turbo Module spec for @miinos/rnactionsheet.
 *
 * Used by the React Native Codegen to generate type-safe native bindings
 * for the New Architecture (Turbo Modules).
 *
 * Spec constraints:
 * - Only Codegen-supported types may be used as method signatures.
 * - Callbacks must be typed as `(result: T) => void`.
 * - `Object` is the Codegen escape-hatch for an arbitrary JS object map.
 *
 * Ref: https://reactnative.dev/docs/the-new-architecture/pillars-turbomodules
 */
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  showActionSheetWithOptions(
    options: Object,
    callback: (buttonIndex: number) => void
  ): void;
}

export default TurboModuleRegistry.get<Spec>('RNActionSheet');
