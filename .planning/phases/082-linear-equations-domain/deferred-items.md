# Deferred Items — Phase 082 Plan 02

## Pre-existing Issues (Out of Scope)

### videoMap.ts coordinate_geometry key
- **File:** src/services/video/videoMap.ts line 36
- **Issue:** `coordinate_geometry` key in `Partial<Record<MathDomain, string>>` is invalid — coordinate_geometry is not a MathDomain value
- **History:** Was masked by `linear_equations` also being invalid (before plan 02 added it to MathDomain union). Now surfaces as the only remaining error.
- **Resolution:** Will be resolved automatically when Phase 83 (Coordinate Geometry) adds `coordinate_geometry` to the MathDomain union, or can be removed from videoMap.ts if not needed yet.
- **Impact:** TypeScript strict typecheck fails with 1 error. Runtime behavior unaffected (Partial<> so undefined keys are ignored).
