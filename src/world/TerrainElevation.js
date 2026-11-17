// ============================================================================
// Gardens by the Bay — Terrain Heightmap, Bridge Elevation & Polygon Math
// (src/world/TerrainElevation.js)
// ============================================================================

import { SUPERTREE_PLANTER_SPECS } from '../data/WorldMapSpec.js';
import {
  shortestAngleDiff,
  closestPointOnSegment2D,
  isPointInsideBoomerang,
  getClosestBoomerangShorePoint,
  getBridgeStateAt,
  getBuildingDoorWaypoints,
  isPointInsideBuilding
} from './BridgeAndPortalSolver.js';

export {
  shortestAngleDiff,
  closestPointOnSegment2D,
  isPointInsideBoomerang,
  getClosestBoomerangShorePoint,
  getBridgeStateAt,
  getBuildingDoorWaypoints,
  isPointInsideBuilding
};

// ----------------------------------------------------------------------------
// Helper: Compute exact surface elevation y at any (x, z) across all elevated
// areas: bridges, sculpture mounds, tiered beds, pavilion decks, stepped bases,
// Supertree planter curbs, and indoor conservatory garden mounds.
// ----------------------------------------------------------------------------
export function getTerrainElevationAt(x, z) {
  let y = 0;

  // 1. Walkable Bridges & Boardwalks
  const brState = getBridgeStateAt(x, z);
  if (brState.onBridge && brState.elevation > y) {
    y = brState.elevation;
  }

  // 2. Marc Quinn's "Planet" Floating Baby Raised Grass Mound & Granite Curb at (-36, 10)
  {
    const dx = x - -36.0;
    const dz = z - 10.0;
    if (dx * dx + dz * dz < 81.0) {
      const cosR = Math.cos(0.18);
      const sinR = Math.sin(0.18);
      const xb = (dx * cosR - dz * sinR) / 1.18;
      const yb = -(dx * sinR + dz * cosR) / 1.18;

      let zCurb = 0;
      const uCurb = Math.hypot(xb / 6.44, yb / 4.368);
      if (uCurb <= 1.0) {
        zCurb = 0.36;
      } else if (uCurb <= 1.08) {
        zCurb = 0.36 * (1.0 - (uCurb - 1.0) / 0.08);
      }

      let zMound = 0;
      const uMound = Math.hypot(xb / 6.042, yb / 4.028);
      if (uMound < 1.0) {
        zMound = 0.15 + 0.477 * Math.sqrt(1.0 - uMound * uMound);
      }

      const planetY = 1.18 * Math.max(zCurb, zMound);
      if (planetY > y) y = planetY;
    }
  }

  // 3. Floral Clock Tiered Botanical Bed & Sandstone Rim at (22, -16), scale = 0.9
  {
    const dx = x - 22.0;
    const dz = z - -16.0;
    if (dx * dx + dz * dz < 25.0) {
      const r = Math.hypot(dx, dz) / 0.9;
      if (r <= 5.25) {
        let zb = 0;
        if (r <= 1.45) zb = 0.71;
        else if (r <= 2.45) zb = 0.65;
        else if (r <= 3.45) zb = 0.59;
        else if (r <= 4.35) zb = 0.53;
        else if (r <= 4.85) zb = 0.38;
        else zb = 0.38 * (1.0 - (r - 4.85) / 0.40);
        const clockY = 0.9 * zb;
        if (clockY > y) y = clockY;
      }
    }
  }

  // 4. Heritage Moon Gate Sandstone Platform at (-22, -16), scale = 1.1
  {
    const dx = x - -22.0;
    const dz = z - -16.0;
    if (dx * dx + dz * dz < 26.0) {
      const r = Math.hypot(dx, dz) / 1.1;
      if (r <= 4.6) {
        const zb = r <= 4.2 ? 0.28 : 0.28 * (1.0 - (r - 4.2) / 0.4);
        const gateY = 1.1 * zb;
        if (gateY > y) y = gateY;
      }
    }
  }

  // 5. SG50 Celebration Lattice Sandstone Plaza Base at (-54, -4), scale = 1.15
  {
    const dx = x - -54.0;
    const dz = z - -4.0;
    if (dx * dx + dz * dz < 34.0) {
      const r = Math.hypot(dx, dz) / 1.15;
      if (r <= 4.85) {
        const zb = r <= 4.15 ? 0.26 : 0.26 * (1.0 - (r - 4.15) / 0.70);
        const sgY = 1.15 * zb;
        if (sgY > y) y = sgY;
      }
    }
  }

  // 6. FEO Children's Garden Splash Pad Concentric Rings at (54, -8), scale = 1.05
  {
    const dx = x - 54.0;
    const dz = z - -8.0;
    if (dx * dx + dz * dz < 46.0) {
      const r = Math.hypot(dx, dz) / 1.05;
      if (r <= 6.4) {
        let zb = 0;
        if (r <= 1.7) zb = 0.30;
        else if (r <= 3.1) zb = 0.26;
        else if (r <= 4.6) zb = 0.22;
        else if (r <= 6.0) zb = 0.18;
        else zb = 0.18 * (1.0 - (r - 6.0) / 0.4);
        const padY = 1.05 * zb;
        if (padY > y) y = padY;
      }
    }
  }

  // 7. Serene Japanese Pavilion Zen Gravel Base & Hinoki Timber Deck at (-54, 32), rotY = 0.45, scale = 1.15
  {
    const dx = x - -54.0;
    const dz = z - 32.0;
    if (dx * dx + dz * dz < 42.0) {
      const cosR = Math.cos(0.45);
      const sinR = Math.sin(0.45);
      const xb = (dx * cosR - dz * sinR) / 1.15;
      const yb = -(dx * sinR + dz * cosR) / 1.15;

      let zZen = 0;
      const uZen = Math.hypot(xb / 4.956, yb / 3.99);
      if (uZen <= 1.0) {
        zZen = 0.28;
      } else if (uZen <= 1.08) {
        zZen = 0.28 * (1.0 - (uZen - 1.0) / 0.08);
      }

      let zDeck = 0;
      const overX = Math.max(0, Math.abs(xb) - 1.95);
      const overY = Math.max(0, Math.abs(yb) - 1.65);
      const deckEdgeDist = Math.hypot(overX, overY);
      if (deckEdgeDist === 0) {
        zDeck = 0.55;
      } else if (deckEdgeDist <= 0.35) {
        zDeck = 0.28 + (0.55 - 0.28) * (1.0 - deckEdgeDist / 0.35);
      }

      const pavY = 1.15 * Math.max(zZen, zDeck);
      if (pavY > y) y = pavY;
    }
  }

  // 8. Understorey Timber Lattice Dome Sandstone Base at (16.5, 14.5), scale = 1.0
  {
    const dx = x - 16.5;
    const dz = z - 14.5;
    if (dx * dx + dz * dz < 21.0) {
      const r = Math.hypot(dx, dz) / 1.0;
      if (r <= 4.55) {
        const zb = r <= 4.15 ? 0.28 : 0.28 * (1.0 - (r - 4.15) / 0.4);
        const domeY = 1.0 * zb;
        if (domeY > y) y = domeY;
      }
    }
  }

  // 9. Bay East Skylight Pavilion Stepped Sandstone Base at (-18, -26), scale = 0.85
  {
    const dx = x - -18.0;
    const dz = z - -26.0;
    if (dx * dx + dz * dz < 35.0) {
      const r = Math.hypot(dx, dz) / 0.85;
      if (r <= 6.9) {
        let zb = 0;
        if (r <= 5.9) zb = 0.42;
        else if (r <= 6.5) zb = 0.22;
        else zb = 0.22 * (1.0 - (r - 6.5) / 0.4);
        const skyY = 0.85 * zb;
        if (skyY > y) y = skyY;
      }
    }
  }

  // 10. Flower Dome Conservatory Interior Terraced Earth Mounds & Blossom Beds at (14, -36), rotY = -0.35, scale = 1.05
  {
    const dx = x - 14.0;
    const dz = z - -36.0;
    if (dx * dx + dz * dz < 240.0) {
      const cosR = Math.cos(-0.35);
      const sinR = Math.sin(-0.35);
      const xb = (dx * cosR - dz * sinR) / 1.05;
      const yb = -(dx * sinR + dz * cosR) / 1.05;

      let zFd = 0;
      const mounds = [
        [-3.5, 0.0, 0.4, 5.5, 4.2, 0.9],
        [4.0, -1.8, 0.35, 4.8, 3.6, 0.75],
        [3.2, 2.5, 0.35, 4.2, 3.0, 0.7]
      ];
      for (const [mx, my, mz, sx, sy, sz] of mounds) {
        const u = Math.hypot((xb - mx) / sx, (yb - my) / sy);
        if (u < 1.0) {
          const zm = mz + sz * Math.sqrt(1.0 - u * u);
          if (zm > zFd) zFd = zm;
        }
      }

      const beds = [
        [-3.2, -0.5, 1.15],
        [-1.0, -2.2, 0.95],
        [1.8, 0.4, 1.05],
        [4.5, -1.2, 1.0],
        [4.0, 2.2, 0.95],
        [-4.5, 2.0, 1.0]
      ];
      for (const [bx, by, bz] of beds) {
        const u = Math.hypot((xb - bx) / 1.33, (yb - by) / 1.14);
        if (u < 1.0) {
          const zb = bz + 0.40 * Math.sqrt(1.0 - u * u);
          if (zb > zFd) zFd = zb;
        }
      }

      const fdY = 1.05 * zFd;
      if (fdY > y) y = fdY;
    }
  }

  // 11. Cloud Forest Conservatory Interior Mountain Base Terrace & Mist Pool at (36, -26), rotY = 0.25, scale = 1.05
  {
    const dx = x - 36.0;
    const dz = z - -26.0;
    if (dx * dx + dz * dz < 140.0) {
      const cosR = Math.cos(0.25);
      const sinR = Math.sin(0.25);
      const xb = (dx * cosR - dz * sinR) / 1.05;
      const yb = -(dx * sinR + dz * cosR) / 1.05;

      let zCf = 0;
      const uPool = Math.hypot((xb - -3.6) / 3.1, yb / 3.8);
      if (uPool <= 1.0) {
        zCf = Math.max(zCf, 0.24);
      }

      const rMtn = Math.hypot(xb - 0.8, yb);
      if (rMtn <= 5.5) {
        const zMtn = 0.85 * Math.max(0, Math.min(1, 1.0 - (rMtn - 2.3) / 3.2));
        if (zMtn > zCf) zCf = zMtn;
      }

      const cfY = 1.05 * zCf;
      if (cfY > y) y = cfY;
    }
  }

  // 12. All 18 Supertrees Root Apron Ramp (0.0m -> 0.18m inside rCage, matching flat ground visuals)
  for (const st of SUPERTREE_PLANTER_SPECS) {
    const dx = x - st.x;
    const dz = z - st.z;
    if (dx * dx + dz * dz > 14.0) continue;
    const refH = st.hero ? 16.0 : 12.0;
    const scale = st.h / refH;
    const rCage = (st.hero ? 3.2 : 2.4) * scale;
    const rWorld = Math.hypot(dx, dz);
    if (rWorld <= rCage) {
      const stY = 0.18 * (1.0 - rWorld / rCage);
      if (stY > y) y = stY;
    }
  }

  // 13. Nibong Island (-31.5, -18.0) & Dragonfly Islands (-39.0, 0.0) / (-44.0, 10.0) turf mounds (0.22m-0.35m elevation)
  {
    const lakeIslands = [
      { cx: -31.5, cz: -18.0, rx: 3.1, rz: 1.9, rotY: 0.25 },
      { cx: -39.0, cz: 0.0, rx: 3.3, rz: 2.2, rotY: 0.0 },
      { cx: -44.0, cz: 10.0, rx: 3.5, rz: 2.2, rotY: -0.35 }
    ];
    for (const isl of lakeIslands) {
      const dx = x - isl.cx;
      const dz = z - isl.cz;
      if (dx * dx + dz * dz > 16.0) continue;
      const cosR = Math.cos(isl.rotY);
      const sinR = Math.sin(isl.rotY);
      const lx = dx * cosR - dz * sinR;
      const lz = dx * sinR + dz * cosR;
      const u = Math.hypot(lx / isl.rx, lz / isl.rz);
      if (u <= 1.0) {
        const islY = 0.22;
        if (islY > y) y = islY;
      }
    }
  }

  return y;
}

export const getTerrainElevation = getTerrainElevationAt;
export const getLandmarkElevation = getTerrainElevationAt;
