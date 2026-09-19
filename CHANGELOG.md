# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-09-19

### Added
- Turbo Module spec (`NativeRNActionSheet.ts`) for New Architecture / Codegen support
- Runtime validation of `ActionSheetOptions` (non-empty options array, bounds-checked indices)
- `disabledButtonIndices` support on Android (items rendered as disabled / non-clickable)
- `react-native.config.json` for reliable autolinking

### Changed
- Android destructive button color now uses `?attr/colorError` from the Material theme instead of hardcoded `#E53935`
- Android divider height corrected from `1px` to `1dp`
- AGP updated from `7.2.1` to `8.3.2`
- Replaced deprecated `lintOptions` block with `lint` in `android/build.gradle`
- GitHub Actions updated from `v3` to `v4`

## [0.1.2] - 2025-01-01

### Added
- Promise-based API (`showActionSheetWithOptionsAsync`)
- Native dark mode support on Android via theme attribute resolution
- Material ripple feedback on Android options

### Fixed
- Double-callback protection via `AtomicBoolean`

## [0.1.1] - 2024-12-01

### Fixed
- Minor packaging fixes

## [0.1.0] - 2024-11-01

### Added
- Initial release
- Native `BottomSheetDialog` on Android with Material Design
- `ActionSheetIOS` delegation on iOS
- TypeScript types with strict mode
- Callback and async/await API
