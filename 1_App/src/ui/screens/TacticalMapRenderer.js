// ============================================================================
// Gardens by the Bay & Botanic Gardens — Screen 11 Full-Screen Tactical Map
// (src/ui/TacticalMapRenderer.js)
// ============================================================================

import * as THREE from 'three';
import {
  BOOMERANG_ISLAND_POLYGON,
  LAKE_CHANNEL_POINTS,
  LAKE_ISLANDS,
  ROAD_MAIN_POINTS,
  WATER_PONDS,
  WORLD_BRIDGES,
  WORLD_BUILDINGS,
  SBG_TACTICAL_ZONES,
  SBG_TACTICAL_SUBLABELS
} from '../../data/WorldMapSpec.js';
import { getActiveMapId, getActiveMapProfile } from '../../data/MapRegistry.js';
import { RELIC_CATEGORY_COLORS } from '../../data/TreasuresCatalog.js';

export function createTacticalMapRenderer({
  appState,
  getTerrainSys,
  getExplorersSys,
  onSetClickMoveTarget,
  onSetCameraPreset,
  onSetScreenState,
  showToast
}) {
  const tacticalCanvas = document.getElementById('tacticalFullMapCanvas');
  const tacticalCtx = tacticalCanvas?.getContext('2d');
  const tacticalTooltipEl = document.getElementById('tacticalMapTooltip');

  const zones = [
    { name: 'ZONE 1: SUPERTREE GROVE (#6)', x: 0, z: 0, r: 18, color: 'rgba(236, 72, 153, 0.14)' },
    { name: 'ZONE 2: CONSERVATORIES (#3/#4)', x: 25, z: -30, r: 18, color: 'rgba(56, 189, 248, 0.14)' },
    { name: 'ZONE 3: HERITAGE (#20) & DRAGONFLY', x: -24, z: -15, r: 16, color: 'rgba(245, 158, 11, 0.14)' },
    { name: 'ZONE 4: THE MEADOW (#23) & SERENE (#21)', x: -35, z: 22, r: 18, color: 'rgba(167, 243, 208, 0.14)' },
    { name: 'ZONE 5: WETLANDS (#16) & CHILDREN (#28)', x: 52, z: 4, r: 18, color: 'rgba(52, 211, 153, 0.14)' }
  ];
  const subLabels = [
    { text: '#25 Silver Garden', x: -1.5, z: -27, color: '#E2E8F0' },
    { text: '#1 Golden Garden', x: 30.5, z: -4.5, color: '#FDE047' },
    { text: 'Main Entrance Drop Off', x: 28.5, z: 10.5, color: '#FCA5A5' },
    { text: '#12 Understorey & World of Plants', x: 14, z: 20, color: '#86EFAC' },
    { text: '#21 Serene Garden (SW)', x: -54, z: 36, color: '#6EE7B7' },
    { text: '#26 Floral Fantasy / Bayfront', x: -52, z: -14, color: '#F9A8D4' },
    { text: '#27 Active Garden & #37 IMBA', x: -40, z: -26, color: '#93C5FD' },
    { text: '#22 Sun Pavilion & #24 Canyon', x: 44, z: -11, color: '#FDBA74' },
    { text: 'Satay by the Bay', x: 74, z: 18, color: '#FDE047' },
    { text: '#36 Garden Pod', x: -42, z: 41, color: '#CBD5E1' }
  ];

  function getProjection(w, h, isSBG) {
    return {
      cx: isSBG ? w / 2 + 28 : w / 2 - 18,
      cy: isSBG ? h / 2 + 10 : h / 2 - 10,
      scaleX: isSBG ? (w * 0.36) / 68 : (w * 0.41) / 86,
      scaleZ: isSBG ? (h * 0.42) / 70 : (h * 0.40) / 58
    };
  }

  function drawTacticalFullMap() {
    const terrainSys = getTerrainSys();
    const explorersSys = getExplorersSys();
    if (!tacticalCtx || appState.screen !== 'fullmap' || !terrainSys || !explorersSys) return;
    const w = tacticalCanvas.width;
    const h = tacticalCanvas.height;
    const isSBG = getActiveMapId() === 'sbg';
    const { cx, cy, scaleX, scaleZ } = getProjection(w, h, isSBG);

    const mapTheme = getActiveMapProfile().tacticalMapTheme;
    const activeZones = isSBG ? SBG_TACTICAL_ZONES : zones;
    const activeSubLabels = isSBG ? SBG_TACTICAL_SUBLABELS : subLabels;

    tacticalCtx.fillStyle = mapTheme?.bgHex || '#062834';
    tacticalCtx.fillRect(0, 0, w, h);

    tacticalCtx.strokeStyle = 'rgba(52, 211, 153, 0.1)';
    tacticalCtx.lineWidth = 1;
    for (let x = 0; x < w; x += 60) {
      tacticalCtx.beginPath();
      tacticalCtx.moveTo(x, 0);
      tacticalCtx.lineTo(x, h);
      tacticalCtx.stroke();
    }
    for (let y = 0; y < h; y += 60) {
      tacticalCtx.beginPath();
      tacticalCtx.moveTo(0, y);
      tacticalCtx.lineTo(w, y);
      tacticalCtx.stroke();
    }
    const collectedCount = terrainSys.treasuresList.filter((t) => t.collected).length;
    tacticalCtx.fillStyle = 'rgba(6, 40, 52, 0.86)';
    tacticalCtx.fillRect(14, 14, 535, 44);
    tacticalCtx.strokeStyle = '#34D399';
    tacticalCtx.strokeRect(14, 14, 535, 44);
    tacticalCtx.fillStyle = '#FEF08A';
    tacticalCtx.font = '700 11.5px Poppins, sans-serif';
    tacticalCtx.textAlign = 'left';
    const mapBadge = isSBG
      ? `🦢 SBG MAP PROGRESS: 69/69 Blender GLBs • Relics ${collectedCount}/42 • 1:1 NParks (X,Y/Z) Verified`
      : `🌿 GBB MAP PROGRESS: 69/69 Blender GLBs • Relics ${collectedCount}/42 • 1:1 Calibrated`;
    tacticalCtx.fillText(mapBadge, 24, 32);
    tacticalCtx.fillStyle = '#A7F3D0';
    tacticalCtx.font = '500 10px Poppins, sans-serif';
    tacticalCtx.fillText('Axes: X = West (-X) ↔ East (+X)  |  Y/Z = North (-Z Top) ↔ South (+Z Bottom)', 24, 49);

    // Boomerang Peninsula / UNESCO 4-Core Park Landmass
    tacticalCtx.fillStyle = mapTheme?.landFillHex || '#0F4C3A';
    tacticalCtx.strokeStyle = mapTheme?.landStrokeHex || '#34D399';
    tacticalCtx.lineWidth = 3;
    tacticalCtx.beginPath();
    const nPoly = BOOMERANG_ISLAND_POLYGON.length;
    const startMidX = (BOOMERANG_ISLAND_POLYGON[nPoly - 1].x + BOOMERANG_ISLAND_POLYGON[0].x) * 0.5;
    const startMidZ = (BOOMERANG_ISLAND_POLYGON[nPoly - 1].z + BOOMERANG_ISLAND_POLYGON[0].z) * 0.5;
    tacticalCtx.moveTo(cx + startMidX * scaleX, cy + startMidZ * scaleZ);
    for (let i = 0; i < nPoly; i++) {
      const curr = BOOMERANG_ISLAND_POLYGON[i];
      const next = BOOMERANG_ISLAND_POLYGON[(i + 1) % nPoly];
      const midX = (curr.x + next.x) * 0.5;
      const midZ = (curr.z + next.z) * 0.5;
      tacticalCtx.quadraticCurveTo(cx + curr.x * scaleX, cy + curr.z * scaleZ, cx + midX * scaleX, cy + midZ * scaleZ);
    }
    tacticalCtx.closePath();
    tacticalCtx.fill();
    tacticalCtx.stroke();

    // Draw '/' Diagonal Dragonfly Lake channel (GBB)
    if (!isSBG && LAKE_CHANNEL_POINTS.length > 1) {
      tacticalCtx.strokeStyle = 'rgba(14, 165, 233, 0.55)';
      tacticalCtx.lineWidth = 7.4 * scaleX;
      tacticalCtx.lineCap = 'round';
      tacticalCtx.lineJoin = 'round';
      tacticalCtx.beginPath();
      LAKE_CHANNEL_POINTS.forEach((pt, idx) => {
        const rx = cx + pt.x * scaleX;
        const rz = cy + pt.z * scaleZ;
        if (idx === 0) tacticalCtx.moveTo(rx, rz);
        else tacticalCtx.lineTo(rx, rz);
      });
      tacticalCtx.stroke();
    }

    // Draw Water Ponds / 5 NParks Lakes
    tacticalCtx.fillStyle = 'rgba(14, 165, 233, 0.52)';
    for (const pond of WATER_PONDS) {
      const px = pond.x ?? pond.cx ?? 0;
      const pz = pond.z ?? pond.cz ?? 0;
      tacticalCtx.beginPath();
      tacticalCtx.ellipse(cx + px * scaleX, cy + pz * scaleZ, pond.rx * scaleX, pond.rz * scaleZ, pond.rot || 0, 0, Math.PI * 2);
      tacticalCtx.fill();
    }

    // Lake Islands inside Lakes
    tacticalCtx.fillStyle = '#15803D';
    for (const isl of LAKE_ISLANDS) {
      const ix = isl.x ?? isl.cx ?? 0;
      const iz = isl.z ?? isl.cz ?? 0;
      const rx = Number.isFinite(isl.rx) ? isl.rx : (Number.isFinite(isl.r) ? isl.r : 2.5);
      const rz = Number.isFinite(isl.rz) ? isl.rz : (Number.isFinite(isl.r) ? isl.r : 2.5);
      tacticalCtx.beginPath();
      tacticalCtx.ellipse(cx + ix * scaleX, cy + iz * scaleZ, rx * scaleX, rz * scaleZ, -(isl.rotY || 0), 0, Math.PI * 2);
      tacticalCtx.fill();
    }

    // Draw Marina Gardens Drive / Cluny Road & Drop-Off Loop
    tacticalCtx.strokeStyle = 'rgba(148, 163, 184, 0.42)';
    tacticalCtx.lineWidth = Math.max(2.5, 3.6 * scaleX);
    tacticalCtx.beginPath();
    ROAD_MAIN_POINTS.forEach((pt, idx) => {
      if (idx === 0) tacticalCtx.moveTo(cx + pt.x * scaleX, cy + pt.z * scaleZ);
      else tacticalCtx.lineTo(cx + pt.x * scaleX, cy + pt.z * scaleZ);
    });
    tacticalCtx.stroke();

    const dropX = isSBG ? 11.5 : 28.5;
    const dropZ = isSBG ? 58.0 : 5.5;
    tacticalCtx.strokeStyle = '#EF4444';
    tacticalCtx.lineWidth = 3;
    tacticalCtx.beginPath();
    tacticalCtx.arc(cx + dropX * scaleX, cy + dropZ * scaleZ, 3.6 * scaleX, 0, Math.PI * 2);
    tacticalCtx.stroke();

    // Draw Bridges
    tacticalCtx.strokeStyle = '#FB923C';
    tacticalCtx.lineWidth = 6;
    for (const br of WORLD_BRIDGES) {
      tacticalCtx.beginPath();
      tacticalCtx.moveTo(cx + br.ax * scaleX, cy + br.az * scaleZ);
      tacticalCtx.lineTo(cx + br.bx * scaleX, cy + br.bz * scaleZ);
      tacticalCtx.stroke();
    }

    // Draw Building Footprints
    for (const bld of WORLD_BUILDINGS) {
      tacticalCtx.save();
      tacticalCtx.translate(cx + bld.cx * scaleX, cy + bld.cz * scaleZ);
      if (bld.rotY) tacticalCtx.rotate(-bld.rotY);
      tacticalCtx.fillStyle = 'rgba(148, 163, 184, 0.18)';
      tacticalCtx.strokeStyle = 'rgba(186, 230, 253, 0.5)';
      tacticalCtx.lineWidth = 1.5;
      tacticalCtx.beginPath();
      if (bld.type === 'ellipse') {
        tacticalCtx.ellipse(0, 0, bld.rx * scaleX, bld.rz * scaleZ, 0, 0, Math.PI * 2);
      } else if (bld.type === 'circle') {
        tacticalCtx.arc(0, 0, bld.r * scaleX, 0, Math.PI * 2);
      } else if (bld.type === 'box') {
        tacticalCtx.rect(-bld.hx * scaleX, -bld.hz * scaleZ, bld.hx * 2 * scaleX, bld.hz * 2 * scaleZ);
      }
      tacticalCtx.fill();
      tacticalCtx.stroke();
      tacticalCtx.restore();
    }

    tacticalCtx.font = '700 11px Poppins, sans-serif';
    tacticalCtx.textAlign = 'center';
    for (const z of activeZones) {
      const zx = cx + z.x * scaleX;
      const zz = cy + z.z * scaleZ;
      tacticalCtx.fillStyle = z.color;
      tacticalCtx.beginPath();
      tacticalCtx.arc(zx, zz, z.r * scaleX * 0.85, 0, Math.PI * 2);
      tacticalCtx.fill();
      tacticalCtx.fillStyle = '#A7F3D0';
      tacticalCtx.fillText(z.name, zx, zz - z.r * scaleZ * 0.65);
    }

    tacticalCtx.font = '600 9.5px Poppins, sans-serif';
    for (const lbl of activeSubLabels) {
      tacticalCtx.fillStyle = lbl.color;
      tacticalCtx.fillText(lbl.text, cx + lbl.x * scaleX, cy + lbl.z * scaleZ);
    }

    const standings = explorersSys.getStandings();
    const you = standings.find((s) => s.id === 'you') || { position: { x: 0, z: 0 } };
    let nearestUncollected = null;
    let minYouDist = Infinity;
    for (const t of terrainSys.treasuresList) {
      if (t.collected) continue;
      const d = Math.hypot(t.position.x - you.position.x, t.position.z - you.position.z);
      if (d < minYouDist) {
        minYouDist = d;
        nearestUncollected = t;
      }
    }

    for (const t of terrainSys.treasuresList) {
      const tx = cx + t.position.x * scaleX;
      const tz = cy + t.position.z * scaleZ;
      const catColor = RELIC_CATEGORY_COLORS[t.category] || '#FACC15';

      if (nearestUncollected && t.id === nearestUncollected.id) {
        tacticalCtx.strokeStyle = '#FACC15';
        tacticalCtx.lineWidth = 2.5;
        tacticalCtx.beginPath();
        tacticalCtx.arc(tx, tz, 13, 0, Math.PI * 2);
        tacticalCtx.stroke();
      }

      tacticalCtx.fillStyle = t.collected ? 'rgba(100, 116, 139, 0.55)' : catColor;
      tacticalCtx.beginPath();
      tacticalCtx.arc(tx, tz, t.collected ? 5 : 8, 0, Math.PI * 2);
      tacticalCtx.fill();

      tacticalCtx.strokeStyle = t.collected ? 'rgba(148, 163, 184, 0.5)' : '#FFFFFF';
      tacticalCtx.lineWidth = t.collected ? 1 : 1.8;
      tacticalCtx.stroke();

      if (!t.collected) {
        tacticalCtx.fillStyle = '#081C24';
        tacticalCtx.font = '800 8.5px Poppins, sans-serif';
        tacticalCtx.fillText(String(t.id), tx, tz + 3);
      }
    }

    for (const comp of standings) {
      if (appState.mode === 'relaxed' && comp.id !== 'you') continue;
      const px = cx + comp.position.x * scaleX;
      const pz = cy + comp.position.z * scaleZ;

      if (comp.targetPosition) {
        const tx = cx + comp.targetPosition.x * scaleX;
        const tz = cy + comp.targetPosition.z * scaleZ;
        tacticalCtx.strokeStyle = comp.colorHex;
        tacticalCtx.setLineDash([5, 5]);
        tacticalCtx.lineWidth = 2;
        tacticalCtx.beginPath();
        tacticalCtx.moveTo(px, pz);
        tacticalCtx.lineTo(tx, tz);
        tacticalCtx.stroke();
        tacticalCtx.setLineDash([]);
      }

      tacticalCtx.fillStyle = comp.colorHex;
      tacticalCtx.strokeStyle = '#FFFFFF';
      tacticalCtx.lineWidth = 2.5;
      tacticalCtx.beginPath();
      tacticalCtx.arc(px, pz, 9, 0, Math.PI * 2);
      tacticalCtx.fill();
      tacticalCtx.stroke();

      tacticalCtx.fillStyle = '#FFFFFF';
      tacticalCtx.font = '800 11px Poppins, sans-serif';
      tacticalCtx.fillText(`${comp.name} (${comp.score}/42)`, px, pz - 14);
    }
  }

  tacticalCanvas?.addEventListener('mousemove', (e) => {
    const terrainSys = getTerrainSys();
    if (!terrainSys || !tacticalTooltipEl) return;
    const rect = tacticalCanvas.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * tacticalCanvas.width;
    const ny = ((e.clientY - rect.top) / rect.height) * tacticalCanvas.height;
    const { cx, cy, scaleX, scaleZ } = getProjection(tacticalCanvas.width, tacticalCanvas.height, getActiveMapId() === 'sbg');

    let hovered = null;
    let minPxDist = 16;
    for (const t of terrainSys.treasuresList) {
      const tx = cx + t.position.x * scaleX;
      const tz = cy + t.position.z * scaleZ;
      const d = Math.hypot(nx - tx, ny - tz);
      if (d < minPxDist) {
        minPxDist = d;
        hovered = t;
      }
    }

    if (hovered) {
      tacticalTooltipEl.classList.remove('hidden');
      tacticalTooltipEl.style.left = `${e.clientX - rect.left}px`;
      tacticalTooltipEl.style.top = `${e.clientY - rect.top}px`;
      const statusText = hovered.collected
        ? `Claimed by ${hovered.collectedBy.toUpperCase()}`
        : `Uncollected • Click to ${appState.mapClickMode === 'teleport' ? 'Teleport' : 'Walk'} Here`;
      const displayTitle = hovered.collected
        ? `#${String(hovered.id).padStart(2, '0')} ${hovered.icon || '🌸'} ${hovered.name}`
        : `Hidden Relic Signal #${String(hovered.id).padStart(2, '0')}`;
      tacticalTooltipEl.innerHTML = `
        <img src="${hovered.image || ''}" alt="${displayTitle}" class="tactical-tooltip-thumb" />
        <div class="tactical-tooltip-meta">
          <strong>${displayTitle}</strong>
          <span>${hovered.zoneName} • ${statusText}</span>
        </div>
      `;
    } else {
      tacticalTooltipEl.classList.add('hidden');
    }
  });

  tacticalCanvas?.addEventListener('mouseleave', () => {
    tacticalTooltipEl?.classList.add('hidden');
  });

  tacticalCanvas?.addEventListener('click', (e) => {
    const explorersSys = getExplorersSys();
    const terrainSys = getTerrainSys();
    if (!explorersSys || !terrainSys) return;
    const rect = tacticalCanvas.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * tacticalCanvas.width;
    const ny = ((e.clientY - rect.top) / rect.height) * tacticalCanvas.height;
    const isSBG = getActiveMapId() === 'sbg';
    const { cx, cy, scaleX, scaleZ } = getProjection(tacticalCanvas.width, tacticalCanvas.height, isSBG);

    let clickedRelic = null;
    let minPxDist = 16;
    for (const t of terrainSys.treasuresList) {
      const tx = cx + t.position.x * scaleX;
      const tz = cy + t.position.z * scaleZ;
      const d = Math.hypot(nx - tx, ny - tz);
      if (d < minPxDist) {
        minPxDist = d;
        clickedRelic = t;
      }
    }

    const worldX = clickedRelic ? clickedRelic.position.x : THREE.MathUtils.clamp((nx - cx) / scaleX, isSBG ? -62 : -76, isSBG ? 38 : 90);
    const worldZ = clickedRelic ? clickedRelic.position.z : THREE.MathUtils.clamp((ny - cy) / scaleZ, isSBG ? -65 : -46, isSBG ? 64 : 62);

    if (appState.mapClickMode === 'walk') {
      onSetClickMoveTarget?.(new THREE.Vector3(worldX, 0, worldZ));
      onSetCameraPreset?.('player_follow');
      onSetScreenState?.('gameplay');
      showToast?.(clickedRelic ? `🧭 Auto-Walking to Relic Signal #${String(clickedRelic.id).padStart(2, '0')}!` : `🧭 Auto-Walking to (${Math.round(worldX)}, ${Math.round(worldZ)})!`);
    } else {
      explorersSys.teleportPlayer(worldX + 1.4, worldZ + 1.4);
      onSetClickMoveTarget?.(clickedRelic ? new THREE.Vector3(worldX, 0, worldZ) : null);
      onSetCameraPreset?.('player_follow');
      onSetScreenState?.('gameplay');
      showToast?.(clickedRelic ? `📍 Teleported right next to Relic Signal #${String(clickedRelic.id).padStart(2, '0')}!` : `📍 Teleported Chibi Explorer to (${Math.round(worldX)}, ${Math.round(worldZ)})!`);
    }
  });

  return { drawTacticalFullMap };
}
