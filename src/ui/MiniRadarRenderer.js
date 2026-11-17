// ============================================================================
// Gardens by the Bay — Bottom-Left Circular Mini-Radar Canvas & Waypoint Click
// (src/ui/MiniRadarRenderer.js)
// ============================================================================

import * as THREE from 'three';
import {
  BOOMERANG_ISLAND_POLYGON,
  LAKE_CHANNEL_POINTS,
  WATER_PONDS,
  WORLD_BRIDGES
} from '../data/WorldMapSpec.js';
import { RELIC_CATEGORY_COLORS } from '../data/TreasuresCatalog.js';

export function createMiniRadarRenderer({
  appState,
  cameraControl,
  getTerrainSys,
  getExplorersSys,
  onSetWaypoint,
  showToast
}) {
  const miniRadarCanvas = document.getElementById('miniRadarCanvas');
  const miniRadarCtx = miniRadarCanvas?.getContext('2d');

  function drawMiniRadar() {
    const terrainSys = getTerrainSys();
    const explorersSys = getExplorersSys();
    if (!miniRadarCtx || !terrainSys || !explorersSys) return;
    const w = miniRadarCanvas.width;
    const h = miniRadarCanvas.height;
    const cx = w / 2;
    const cy = h / 2;

    miniRadarCtx.clearRect(0, 0, w, h);

    const standings = explorersSys.getStandings();
    const you = standings.find((s) => s.id === 'you') || { position: { x: 0, z: 0 }, facingYaw: 0 };
    const isLocal = appState.radarZoomMode === 'local';
    const originX = isLocal ? you.position.x : 0;
    const originZ = isLocal ? you.position.z : 0;
    const scaleX = isLocal ? 82 / 46 : 64 / 86;
    const scaleZ = isLocal ? 82 / 46 : 48 / 58;

    // Radar range rings
    miniRadarCtx.strokeStyle = 'rgba(52, 211, 153, 0.2)';
    miniRadarCtx.lineWidth = 1;
    [28, 56, 80].forEach((r) => {
      miniRadarCtx.beginPath();
      miniRadarCtx.arc(cx, cy, r, 0, Math.PI * 2);
      miniRadarCtx.stroke();
    });

    // Boomerang Peninsula land silhouette (Official Visitor Map Geometry)
    miniRadarCtx.fillStyle = 'rgba(16, 185, 129, 0.24)';
    miniRadarCtx.strokeStyle = 'rgba(52, 211, 153, 0.45)';
    miniRadarCtx.lineWidth = 1.2;
    miniRadarCtx.beginPath();
    BOOMERANG_ISLAND_POLYGON.forEach((pt, idx) => {
      const px = cx + (pt.x - originX) * scaleX;
      const pz = cy + (pt.z - originZ) * scaleZ;
      if (idx === 0) miniRadarCtx.moveTo(px, pz);
      else miniRadarCtx.lineTo(px, pz);
    });
    miniRadarCtx.closePath();
    miniRadarCtx.fill();
    miniRadarCtx.stroke();

    // Draw '/' Diagonal Dragonfly Lake channel & 5 Ponds
    miniRadarCtx.strokeStyle = 'rgba(14, 165, 233, 0.62)';
    miniRadarCtx.lineWidth = Math.max(3, 6 * scaleX);
    miniRadarCtx.lineCap = 'round';
    miniRadarCtx.beginPath();
    LAKE_CHANNEL_POINTS.forEach((pt, idx) => {
      const rx = cx + (pt.x - originX) * scaleX;
      const rz = cy + (pt.z - originZ) * scaleZ;
      if (idx === 0) miniRadarCtx.moveTo(rx, rz);
      else miniRadarCtx.lineTo(rx, rz);
    });
    miniRadarCtx.stroke();

    miniRadarCtx.fillStyle = 'rgba(14, 165, 233, 0.5)';
    for (const pond of WATER_PONDS) {
      miniRadarCtx.beginPath();
      miniRadarCtx.ellipse(
        cx + (pond.x - originX) * scaleX,
        cy + (pond.z - originZ) * scaleZ,
        Math.max(1.5, pond.rx * scaleX),
        Math.max(1.2, pond.rz * scaleZ),
        0,
        0,
        Math.PI * 2
      );
      miniRadarCtx.fill();
    }

    // Main Entrance Red 'Drop Off' Loop at (28.5, 5.5)
    miniRadarCtx.strokeStyle = 'rgba(239, 68, 68, 0.78)';
    miniRadarCtx.lineWidth = Math.max(1.5, 2.2 * scaleX);
    miniRadarCtx.beginPath();
    miniRadarCtx.arc(
      cx + (28.5 - originX) * scaleX,
      cy + (5.5 - originZ) * scaleZ,
      Math.max(2.2, 4.2 * scaleX),
      0,
      Math.PI * 2
    );
    miniRadarCtx.stroke();

    // Bridges
    miniRadarCtx.strokeStyle = '#FB923C';
    miniRadarCtx.lineWidth = Math.max(2.5, 3.5 * scaleX);
    for (const br of WORLD_BRIDGES) {
      miniRadarCtx.beginPath();
      miniRadarCtx.moveTo(cx + (br.ax - originX) * scaleX, cy + (br.az - originZ) * scaleZ);
      miniRadarCtx.lineTo(cx + (br.bx - originX) * scaleX, cy + (br.bz - originZ) * scaleZ);
      miniRadarCtx.stroke();
    }

    // Camera viewing FOV cone from YOU
    const pxYou = cx + (you.position.x - originX) * scaleX;
    const pzYou = cy + (you.position.z - originZ) * scaleZ;
    const viewYaw = cameraControl.mode === 'follow' ? cameraControl.followYaw + Math.PI : (you.facingYaw || 0);
    miniRadarCtx.fillStyle = 'rgba(45, 127, 249, 0.18)';
    miniRadarCtx.beginPath();
    miniRadarCtx.moveTo(pxYou, pzYou);
    miniRadarCtx.arc(pxYou, pzYou, 34, viewYaw - Math.PI * 0.5 - 0.45, viewYaw - Math.PI * 0.5 + 0.45);
    miniRadarCtx.closePath();
    miniRadarCtx.fill();

    // Find nearest uncollected treasure to highlight
    let nearestRelic = null;
    let nearestDist = Infinity;
    for (const t of terrainSys.treasuresList) {
      if (t.collected) continue;
      const d = Math.hypot(t.position.x - you.position.x, t.position.z - you.position.z);
      if (d < nearestDist) {
        nearestDist = d;
        nearestRelic = t;
      }
    }

    // Dashed guide line to nearest relic
    if (nearestRelic) {
      const ntx = cx + (nearestRelic.position.x - originX) * scaleX;
      const ntz = cy + (nearestRelic.position.z - originZ) * scaleZ;
      miniRadarCtx.strokeStyle = 'rgba(250, 204, 21, 0.75)';
      miniRadarCtx.lineWidth = 1.5;
      miniRadarCtx.setLineDash([3, 3]);
      miniRadarCtx.beginPath();
      miniRadarCtx.moveTo(pxYou, pzYou);
      miniRadarCtx.lineTo(ntx, ntz);
      miniRadarCtx.stroke();
      miniRadarCtx.setLineDash([]);
    }

    // All 42 Treasures (category colored + pulsing nearest ring)
    const pulseRadius = 5.5 + Math.sin(appState.elapsedSeconds * 6) * 2.2;
    for (const t of terrainSys.treasuresList) {
      let tx = cx + (t.position.x - originX) * scaleX;
      let tz = cy + (t.position.z - originZ) * scaleZ;

      // Clamp off-radar uncollected relics to the rim in local zoom so you know which direction they are
      const distFromCenter = Math.hypot(tx - cx, tz - cy);
      if (distFromCenter > 82) {
        if (t.collected) continue;
        const ang = Math.atan2(tz - cy, tx - cx);
        tx = cx + Math.cos(ang) * 82;
        tz = cy + Math.sin(ang) * 82;
      }

      const catColor = RELIC_CATEGORY_COLORS[t.category] || '#FACC15';
      miniRadarCtx.fillStyle = t.collected ? 'rgba(148, 163, 184, 0.28)' : catColor;
      miniRadarCtx.beginPath();
      miniRadarCtx.arc(tx, tz, t.collected ? 1.8 : 3.4, 0, Math.PI * 2);
      miniRadarCtx.fill();

      if (!t.collected) {
        miniRadarCtx.strokeStyle = '#FEF9C3';
        miniRadarCtx.lineWidth = 0.9;
        miniRadarCtx.stroke();
      }

      if (nearestRelic && t.id === nearestRelic.id) {
        miniRadarCtx.strokeStyle = '#FACC15';
        miniRadarCtx.lineWidth = 2;
        miniRadarCtx.beginPath();
        miniRadarCtx.arc(tx, tz, pulseRadius, 0, Math.PI * 2);
        miniRadarCtx.stroke();
      }
    }

    // Competitors
    for (const comp of standings) {
      if (appState.mode === 'relaxed' && comp.id !== 'you') continue;
      const px = cx + (comp.position.x - originX) * scaleX;
      const pz = cy + (comp.position.z - originZ) * scaleZ;
      if (Math.hypot(px - cx, pz - cy) > 85) continue;
      miniRadarCtx.fillStyle = comp.colorHex;
      miniRadarCtx.strokeStyle = '#FFFFFF';
      miniRadarCtx.lineWidth = 1.5;
      miniRadarCtx.beginPath();
      miniRadarCtx.arc(px, pz, comp.id === 'you' ? 5.2 : 4.2, 0, Math.PI * 2);
      miniRadarCtx.fill();
      miniRadarCtx.stroke();
    }
  }

  miniRadarCanvas?.addEventListener('click', (e) => {
    const explorersSys = getExplorersSys();
    if (!explorersSys) return;
    const rect = miniRadarCanvas.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * miniRadarCanvas.width;
    const ny = ((e.clientY - rect.top) / rect.height) * miniRadarCanvas.height;
    const cx = miniRadarCanvas.width / 2;
    const cy = miniRadarCanvas.height / 2;

    const you = explorersSys.getStandings().find((s) => s.id === 'you') || { position: { x: 0, z: 0 } };
    const isLocal = appState.radarZoomMode === 'local';
    const originX = isLocal ? you.position.x : 0;
    const originZ = isLocal ? you.position.z : 0;
    const scaleX = isLocal ? 82 / 46 : 64 / 86;
    const scaleZ = isLocal ? 82 / 46 : 48 / 58;

    const worldX = THREE.MathUtils.clamp(originX + (nx - cx) / scaleX, -76, 90);
    const worldZ = THREE.MathUtils.clamp(originZ + (ny - cy) / scaleZ, -46, 62);
    onSetWaypoint?.(new THREE.Vector3(worldX, 0, worldZ));
    showToast?.(`🧭 Radar Waypoint set to (${Math.round(worldX)}, ${Math.round(worldZ)})!`);
  });

  return {
    drawMiniRadar
  };
}
