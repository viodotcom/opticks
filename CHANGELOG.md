# Changelog

> **Tags:**
>
> - :boom: [Breaking Change]
> - :eyeglasses: [Spec Compliancy]
> - :rocket: [New Feature]
> - :bug: [Bug Fix]
> - :memo: [Documentation]
> - :house: [Internal]
> - :nail_care: [Polish]

# v4.0.1

- :nail_care: Fix types for initialize and addActivateListener

# v4.0.0

- :boom: Migrate from Flow -> TypeScript
- :memo: Document and type the Optimizely integration
- :boom: Deprecate the Simple integration, still functions but won't be improved
- :boom: Deprecate `booleanToggle`, as the `toggle` supports both feature flags and MVT experiments

# v3.3.3

- :nail_care: Update JSCodeShift to 0.14.0

# v3.3.2

- :nail_care: Remove overridable parser flag in clean:toggle and clean:booleanToggle

# v3.3.1

- :house: Make JSCodeShift parser configurable

# v3.3.0

- :rocket: Add getEnabledFeatures method.

# v3.2.0

- :bug: Fix for Optimizely 4.2.1 `isUserInRolloutAudience`

# v3.1.0

- :house: Pin Optimizely SDK version to 4.2.1
- :house: Update unit tests

# v3.0.0

- :boom: Support for Optimizely Rollouts with feature toggles
- :boom: Update to Optimizely SDK 4.2.1
- :boom: `toggle` now detrmines whether to use booleanToggles or multiToggles based on the amount of arguments passed

# v2.0.0

## Optimizely Integration

- :boom: Rename multiToggle -> toggle and promote it as default toggle
- :rocket: Add resetAudienceSegmentationAttributes
- :boom: Add setUserId (now separate from setAudienceSegmentationAttributes) and toggles throw error if userId is not set before using
- :boom: setAudienceSegmentationAttributes now merges attributes with existing ones (used to overwrite)
- :boom: Remove setAudienceSegmentationAttribute, since setAudienceSegmentationAttributes doesn't overwrite existing segmentation attributes anymore
- :boom: Use `activate`, with a convention of using keys with value `a`, `b`, `c` etc - instead of using `getFeatureVariableString`. This is not a breaking change for the `toggle` API but simplifies the dataFile, check the supplied example on how to set up your experiments.
- :eyeglasses: The supported version of the Optimizely SDK is now 3.0.1

# v1.5.0

- :boom: Bundle as a CommonJS module instead of ES6 for Node JS support #16

# v1.4.0

- :boom: (:bug: ?) Optimizely Integration: Forced toggles are now retained after setting audience segmentation attributes #14

# v1.3.0

- :rocket: Optimizely Integration: Allow setting / overriding individual audience segmentation attributes #11
- :memo: Optimizely Integration: Document DataFile specifics

# v1.2.1

- :memo: Codemod documentation
- :bug: Codemods now only remove imports for toggles being removed

# v1.2.0

- :memo: Optimizely Integration: Example datafile for audience segmentation
- :boom: Optimizely Integration: Rename setUserAttributes -> setAudienceSegmentationAttributes

# v1.1.0

- :rocket: Optimizely Integration: Add capability to force toggles

# v1.0.1

- :bug: Missing Flow Type exports

# v1.0.0

- Initial release
