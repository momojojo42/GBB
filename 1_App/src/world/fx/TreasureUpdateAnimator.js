// ============================================================================
// Gardens by the Bay — Relic Random Spawn Solver, Wind-Dash Rings & Animator
// (src/world/TreasureUpdateAnimator.js)
// ============================================================================

import { detectZoneFromPosition } from '../../data/TreasuresCatalog.js';
import {
  getTerrainElevationAt,
  isPointInsideBoomerang,
  getClosestBoomerangShorePoint,
  getWaterCollision,
  getBridgeStateAt,
  getBuildingDoorWaypoints,
  WORLD_BUILDINGS,
  SOLID_PILLARS,
  WORLD_TREES
} from '../WorldPhysicsEngine.js';

const RELIC_SPAWN_ZONES = [
  { name: 'Flower Dome Interior', type: 'building', buildingId: 'flower_dome', count: 3, maxU: 0.72 },
  { name: 'Cloud Forest Interior', type: 'building', buildingId: 'cloud_forest', count: 2, maxU: 0.68 },
  { name: 'Understorey Dome Interior', type: 'building', buildingId: 'understorey_dome', count: 1, maxU: 0.60 },
  { name: 'Floral Fantasy Interior', type: 'building', buildingId: 'sg50_lattice', count: 1, maxU: 0.60 },
  { name: 'Heritage Skylight Pavilion', type: 'building', buildingId: 'skylight_pavilion', count: 1, maxU: 0.60 },
  { name: 'Serene Garden Pavilion', type: 'building', buildingId: 'serene_pavilion', count: 1, maxU: 0.58 },
  { name: 'Supertree Grove & Central Lawn', type: 'box', minX: -15, maxX: 18, minZ: -18, maxZ: 18, count: 7 },
  { name: 'Conservatory Waterfront & Silver/Golden Gardens', type: 'box', minX: -10, maxX: 46, minZ: -41, maxZ: -6, count: 7 },
  { name: 'Dragonfly Lake Banks & Heritage Gardens', type: 'box', minX: -58, maxX: -14, minZ: -32, maxZ: -2, count: 6 },
  { name: 'The Meadow & Serene West', type: 'box', minX: -60, maxX: -14, minZ: 0, maxZ: 42, count: 7 },
  { name: 'Kingfisher Wetlands & Eastern Sanctuary', type: 'box', minX: 18, maxX: 64, minZ: -10, maxZ: 34, count: 6 }
];

export const WIND_DASH_RING_SPECS = [
  { id: 'wind_dragonfly', name: 'Dragonfly Bridge', x: -26, z: -12, rotY: 0.38 },
  { id: 'wind_conservatory', name: 'Conservatory Promenade', x: 14, z: -18, rotY: -0.45 },
  { id: 'wind_meadow', name: 'Meadow Crossing', x: -18, z: 20, rotY: 0.62 },
  { id: 'wind_wetlands', name: 'Wetlands Bridge', x: 32, z: 6, rotY: -0.35 }
];

export function isSafeRelicSpawnSpot(rx, rz, placedSpots, minSpacing = 3.4, allowInsideBuildingId = null) {
  if (rx < -66 || rx > 66 || rz < -43 || rz > 45) return false;
  if (!isPointInsideBoomerang(rx, rz)) return false;

  const shore = getClosestBoomerangShorePoint(rx, rz);
  if (!shore || shore.dist < 2.4) return false;

  // Keep clear of competitor start plaza around (0, 8)
  if (Math.hypot(rx - 0, rz - 8) < 4.5) return false;

  // Never spawn in water or on a bridge deck
  if (getBridgeStateAt(rx, rz).onBridge) return false;
  if (getWaterCollision(rx, rz, 1.05).inWater) return false;

  // Clear all solid pillars (Supertrees, Cloud Forest core, olive trees, sculptures)
  for (const pil of SOLID_PILLARS) {
    if (Math.hypot(rx - pil.x, rz - pil.z) < pil.r + 1.05) return false;
  }

  // Clear all tropical trees
  for (const tree of WORLD_TREES) {
    if (Math.hypot(rx - tree.x, rz - tree.z) < tree.r + 0.90) return false;
  }

  // Check building wall rings & doorway portals
  for (const b of WORLD_BUILDINGS) {
    const wp = getBuildingDoorWaypoints(b);
    if (
      Math.hypot(rx - wp.outsideX, rz - wp.outsideZ) < 1.9 ||
      Math.hypot(rx - wp.thresholdX, rz - wp.thresholdZ) < 1.9 ||
      Math.hypot(rx - wp.insideX, rz - wp.insideZ) < 1.9
    ) {
      return false;
    }

    const dx = rx - b.cx;
    const dz = rz - b.cz;
    const cosR = Math.cos(b.rotY);
    const sinR = Math.sin(b.rotY);
    const lx = dx * cosR - dz * sinR;
    const lz = dx * sinR + dz * cosR;
    const u = Math.hypot(lx / b.rx, lz / b.rz);

    if (allowInsideBuildingId === b.id) {
      if (u > b.innerScale - 0.16) return false;
    } else {
      // Outdoor spawns must stay outside enclosed buildings and clear of pavilion wall rings
      if (!b.openAirPavilion && u < b.outerScale + 0.22) return false;
      if (b.openAirPavilion && u >= b.innerScale - 0.16 && u <= b.outerScale + 0.20) return false;
    }
  }

  // Enforce minimum spacing between relics
  for (const pt of placedSpots) {
    if (Math.hypot(rx - pt.x, rz - pt.z) < minSpacing) return false;
  }

  return true;
}

export function generateRandomizedRelicCoordinates(totalCount) {
  const placed = [];

  for (const zone of RELIC_SPAWN_ZONES) {
    if (zone.type === 'building') {
      const b = WORLD_BUILDINGS.find((bld) => bld.id === zone.buildingId);
      if (!b) continue;
      for (let i = 0; i < zone.count && placed.length < totalCount; i++) {
        let found = null;
        for (let attempt = 0; attempt < 90; attempt++) {
          const ang = Math.random() * Math.PI * 2;
          const radU = Math.sqrt(Math.random()) * (zone.maxU || 0.65);
          const lx = Math.cos(ang) * b.rx * radU;
          const lz = Math.sin(ang) * b.rz * radU;
          const cosR = Math.cos(b.rotY);
          const sinR = Math.sin(b.rotY);
          const rx = Number((b.cx + (lx * cosR + lz * sinR)).toFixed(2));
          const rz = Number((b.cz + (-lx * sinR + lz * cosR)).toFixed(2));
          if (isSafeRelicSpawnSpot(rx, rz, placed, 2.5, b.id)) {
            found = { x: rx, z: rz, zoneLabel: b.name };
            break;
          }
        }
        if (found) placed.push(found);
      }
    } else {
      for (let i = 0; i < zone.count && placed.length < totalCount; i++) {
        let found = null;
        for (let attempt = 0; attempt < 110; attempt++) {
          const rx = Number((zone.minX + Math.random() * (zone.maxX - zone.minX)).toFixed(2));
          const rz = Number((zone.minZ + Math.random() * (zone.maxZ - zone.minZ)).toFixed(2));
          if (isSafeRelicSpawnSpot(rx, rz, placed, 3.5, null)) {
            const zMeta = detectZoneFromPosition(rx, rz);
            found = { x: rx, z: rz, zoneLabel: zMeta ? zMeta.title : zone.name };
            break;
          }
        }
        if (found) placed.push(found);
      }
    }
  }

  // Fallback fill across the entire island if any zone quota had tight constraints
  let fallbackAttempts = 0;
  while (placed.length < totalCount && fallbackAttempts < 800) {
    fallbackAttempts++;
    const rx = Number((-62 + Math.random() * 124).toFixed(2));
    const rz = Number((-40 + Math.random() * 80).toFixed(2));
    if (isSafeRelicSpawnSpot(rx, rz, placed, 3.0, null)) {
      const zMeta = detectZoneFromPosition(rx, rz);
      placed.push({ x: rx, z: rz, zoneLabel: zMeta ? zMeta.title : 'Supertree Grove & OCBC Skyway' });
    }
  }

  // Fisher-Yates shuffle so relic IDs map to different zones every match
  for (let i = placed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = placed[i];
    placed[i] = placed[j];
    placed[j] = tmp;
  }

  return placed;
}

export function buildWindDashRings(THREE, terrainGroup) {
  const windDashGroup = new THREE.Group();
  windDashGroup.name = 'ScenicWindDashRingsGroup';
  terrainGroup.add(windDashGroup);

  const windDashTorusGeo = new THREE.TorusGeometry(1.15, 0.08, 12, 28);
  const windDashInnerTorusGeo = new THREE.TorusGeometry(0.96, 0.035, 10, 24);
  const windDashGroundHaloGeo = new THREE.RingGeometry(0.65, 1.05, 28);
  windDashGroundHaloGeo.rotateX(-Math.PI / 2);

  return WIND_DASH_RING_SPECS.map((spec, idx) => {
    const baseY = getTerrainElevationAt(spec.x, spec.z);
    const holder = new THREE.Group();
    holder.position.set(spec.x, baseY + 1.1, spec.z);
    holder.rotation.y = spec.rotY || 0;

    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x34D399,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const ringMesh = new THREE.Mesh(windDashTorusGeo, ringMat);
    holder.add(ringMesh);

    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x22D3EE,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const innerMesh = new THREE.Mesh(windDashInnerTorusGeo, innerMat);
    holder.add(innerMesh);

    const groundHaloMat = new THREE.MeshBasicMaterial({
      color: 0x22D3EE,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const groundHalo = new THREE.Mesh(windDashGroundHaloGeo, groundHaloMat);
    groundHalo.position.set(spec.x, baseY + 0.07, spec.z);
    windDashGroup.add(groundHalo);
    windDashGroup.add(holder);

    return {
      id: spec.id,
      name: spec.name,
      index: idx,
      x: spec.x,
      y: baseY + 1.1,
      z: spec.z,
      baseY,
      holder,
      mesh: ringMesh,
      innerMesh,
      groundHalo,
      ringMat,
      innerMat,
      lastTriggeredAt: -999
    };
  });
}

export function animateTreasuresAndWindRings(
  treasuresList,
  windDashRings,
  particlesAndJackpot,
  dt,
  elapsedSeconds
) {
  for (const t of treasuresList) {
    if (t.collected) continue;
    t.relicHolder.rotation.y = elapsedSeconds * 1.6 + t.id * 0.5;
    t.relicHolder.position.y = (t.isJackpotRelic ? 0.62 : 0.54) + Math.sin(elapsedSeconds * 2.5 + t.id) * 0.07;
    const pulse = 1 + Math.sin(elapsedSeconds * 3.2 + t.id) * 0.12;
    t.haloMesh.scale.set(pulse, pulse, 1);
    if (t.beamMesh) {
      const beamScale = 1 + Math.sin(elapsedSeconds * 2.8 + t.id) * 0.14;
      t.beamMesh.scale.set(beamScale, 1, beamScale);
    }
    if (t.beaconDiamond) {
      const baseBY = t.baseBeaconY ?? 0.96;
      t.beaconDiamond.rotation.y = -elapsedSeconds * 2.2 + t.id;
      t.beaconDiamond.position.y = baseBY + Math.sin(elapsedSeconds * 3.0 + t.id) * 0.06;
    }
    if (t.floatingRings?.length) {
      t.floatingRings[0].rotation.z = elapsedSeconds * 1.4 + t.id;
      if (t.floatingRings[1]) {
        t.floatingRings[1].rotation.z = -elapsedSeconds * 1.9 + t.id;
      }
    }
  }

  for (const ring of windDashRings) {
    const phase = elapsedSeconds * 3.0 + ring.index * 1.3;
    ring.holder.position.y = ring.baseY + 1.1 + Math.sin(phase) * 0.10;
    ring.mesh.rotation.z = elapsedSeconds * 2.4 + ring.index;
    ring.innerMesh.rotation.z = -elapsedSeconds * 3.6 + ring.index;
    ring.innerMesh.rotation.x = Math.sin(phase * 0.8) * 0.28;
    const ringPulse = 1 + Math.sin(elapsedSeconds * 4.2 + ring.index) * 0.08;
    ring.holder.scale.setScalar(ringPulse);
    const onCooldown = elapsedSeconds - ring.lastTriggeredAt < 4.5 && ring.lastTriggeredAt > 0;
    ring.ringMat.opacity = onCooldown ? 0.32 : 0.86 + Math.sin(phase) * 0.10;
    ring.innerMat.opacity = onCooldown ? 0.24 : 0.72 + Math.cos(phase) * 0.12;
  }

  particlesAndJackpot.updateBursts(dt);
}
