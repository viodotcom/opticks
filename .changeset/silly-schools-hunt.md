---
'opticks': major
---

Upgrade Opticks optimizely integration to support Optimizely's JS SDK v5.3.2

Non-breaking changes:

- `getOrSetCachedFeatureEnabled` is renamed to `getToggleDecisionStatus`

Breaking changes:

- `__checkIfUserIsInAudience`, an internal from Optimizely got updated to `checkIfUserIsInAudience`. Hence you need the version 5.3.2 of the JS SDK to run this version of opticks properly
- Removed deprecated `booleanToggle` and `getEnabledFeatures` and all mentions of it
