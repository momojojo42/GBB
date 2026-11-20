// ============================================================================
// Multi-Map Architecture Entry Point (Map 01: GBB, Map 02: SBG, Future Maps)
// (src/maps/index.js)
// ============================================================================

import * as GBBMapPackage from './gbb/index.js';
import * as SBGMapPackage from './sbg/index.js';
export {
  MAP_WORLD_PROFILES,
  getActiveMapId,
  getActiveMapProfile,
  setActiveMapIdState
} from '../data/MapRegistry.js';

export const MAP_PACKAGES = {
  gbb: GBBMapPackage,
  sbg: SBGMapPackage
};

export { GBBMapPackage, SBGMapPackage };
