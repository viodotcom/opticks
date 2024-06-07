# Changelog

## 5.0.0

### Major Changes

- d73f8eb: Upgrade Opticks optimizely integration to support Optimizely's JS SDK v5.3.2

  Non-breaking changes:

  - `getOrSetCachedFeatureEnabled` is renamed to `getToggleDecisionStatus`

  Breaking changes:

  - `__checkIfUserIsInAudience`, an internal from Optimizely got updated to `checkIfUserIsInAudience`. Hence you need the version 5.3.2 of the JS SDK to run this version of opticks properly
  - Removed deprecated `booleanToggle` and `getEnabledFeatures` and all mentions of it

## 4.3.0

### Minor Changes

- 69c5295: - Codebase refactor into a monorepo structure to cater for the introduction of an Opticks CLI
  - Opticks no longer ships with scripts for automatic cleanup as this will be handled by the CLI

## 4.2.0

### Minor Changes

- 232d1bc: Upgrade @optimizely/optimizely-sdk to version 4.4.x

## 4.1.1

### Patch Changes

- 0846ab0: Improve toggle function return type, which now supports anonymous function return types and mixed arguments properly

## 4.1.0

### Minor Changes

- 8756fe2:
  - Codemods: Hardcode the TSX parser
  - Codemods: Fix null removal for the TSX parser
  - Codemods: Fix variable cleanup that was too aggressive and cleaned optimistically
  - Codemods: Clean up dangling JSX expressions such as `{<B/>}` -> `<B/>`

## 4.0.4

### Patch Changes

- 5610ad3: Fix library entry point

## 4.0.3

### Patch Changes

- 849fc6b: Fix GitHub publish action
- d037295: Automate versioning and releasing and export types from optimizely integration

## v4.0.2

- Run build before NPM publish

## v4.0.1

- Fix types for initialize and addActivateListener

## v4.0.0

- Migrate from Flow -> TypeScript
- Document and type the Optimizely integration
- Deprecate the Simple integration, still functions but won't be improved
- Deprecate `booleanToggle`, as the `toggle` supports both feature flags and MVT experiments

## v3.3.3

- Update JSCodeShift to 0.14.0

## v3.3.2

- Remove overridable parser flag in clean:toggle and clean:booleanToggle

## v3.3.1

- Make JSCodeShift parser configurable

## v3.3.0

- Add getEnabledFeatures method.

## v3.2.0

- Fix for Optimizely 4.2.1 `isUserInRolloutAudience`

## v3.1.0

- Pin Optimizely SDK version to 4.2.1
- Update unit tests

## v3.0.0

- Support for Optimizely Rollouts with feature toggles
- Update to Optimizely SDK 4.2.1
- `toggle` now detrmines whether to use booleanToggles or multiToggles based on the amount of arguments passed

## v2.0.0

### Optimizely Integration

- Rename multiToggle -> toggle and promote it as default toggle
- Add resetAudienceSegmentationAttributes
- Add setUserId (now separate from setAudienceSegmentationAttributes) and toggles throw error if userId is not set before using
- setAudienceSegmentationAttributes now merges attributes with existing ones (used to overwrite)
- Use `activate`, with a convention of using keys with value `a`, `b`, `c` etc - instead of using `getFeatureVariableString`. This is not a breaking change for the `toggle` API but simplifies the dataFile, check the supplied example on how to set up your experiments.
- The supported version of the Optimizely SDK is now 3.0.1

## v1.5.0

- Bundle as a CommonJS module instead of ES6 for Node JS support #16

## v1.4.0

- Optimizely Integration: Forced toggles are now retained after setting audience segmentation attributes #14

## v1.3.0

- Optimizely Integration: Allow setting / overriding individual audience segmentation attributes #11
- Optimizely Integration: Document DataFile specifics

## v1.2.1

- Codemod documentation
- Codemods now only remove imports for toggles being removed

## v1.2.0

- Optimizely Integration: Example datafile for audience segmentation
- Optimizely Integration: Rename setUserAttributes -> setAudienceSegmentationAttributes

## v1.1.0

- Optimizely Integration: Add capability to force toggles

## v1.0.1

- Missing Flow Type exports

## v1.0.0

- Initial release
