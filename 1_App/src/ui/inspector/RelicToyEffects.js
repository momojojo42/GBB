// ============================================================================
// Gardens by the Bay — Relic 3D Inspector Toy Action & Particle Effects
// (src/ui/RelicToyEffects.js)
// ============================================================================

import { SoundFX } from '../../audio/SoundFX.js';
import {
  spawnToyParticlesIntoGroup,
  spawnToyReactionPill
} from './RelicToyAudioAndParticles.js';

export function getOneShortSentence(relic) {
  const wow = String(relic?.wowPunchline || relic?.ahaHook || '').trim();
  if (wow) return wow;
  const raw = String(relic?.description || relic?.fact || '').trim();
  if (!raw) {
    return `Iconic 3D keepsake from ${relic?.zoneName || 'the Gardens'}.`;
  }
  const match = raw.match(/^[^.!?]+[.!?]/);
  return (match ? match[0] : raw).trim();
}

export function formatRelicPointsBadge(relic) {
  const pts = Number(relic?.points) || (relic?.isLandmarkRelic ? 350 : 100);
  const rarity = String(relic?.rarity || '').toLowerCase();
  if (rarity === 'crown' || pts >= 300) {
    return `🟡 +${pts} PTS`;
  }
  if (rarity === 'heritage' || pts >= 180) {
    return `🟣 +${pts} PTS`;
  }
  return `🟢 +${pts} PTS`;
}

export function resolveToyActionType(relic) {
  if (relic?.toyAction) return relic.toyAction;
  const name = `${relic?.name || ''} ${relic?.shortName || ''}`.toLowerCase();
  if (name.includes('durian')) return 'durian_stink';
  if (name.includes('chope') || name.includes('tissue') || name.includes('towel')) return 'chope_slam';
  if (name.includes('erp') || name.includes('coin') || name.includes('passport')) return 'erp_deduct';
  if (name.includes('otter') || name.includes('bumboat') || name.includes('hornbill')) return 'otter_wiggle';
  if (name.includes('merlion') || name.includes('waterfall') || name.includes('fountain')) {
    return 'water_spit';
  }
  if (name.includes('kopi') || name.includes('teh') || name.includes('teapot') || name.includes('kaya')) {
    return 'kopi_pour';
  }
  if (name.includes('supertree') || name.includes('lantern') || name.includes('orchid')) {
    return 'music_box';
  }
  return 'happy_bounce';
}

export function resolveToyReactionText(relic, actionType, quipIndex = 0) {
  if (Array.isArray(relic?.comicQuips) && relic.comicQuips.length > 0) {
    return relic.comicQuips[quipIndex % relic.comicQuips.length];
  }
  if (relic?.toyReaction) return relic.toyReaction;
  switch (actionType) {
    case 'durian_stink':
      return '🦨 PUNGENT! NO DURIANS ON MRT!';
    case 'chope_slam':
      return '💥 CHOPE FIRST LAH!';
    case 'erp_deduct':
      return '💸 BEEP! -$2.00 DEDUCTED!';
    case 'otter_wiggle':
      return '🦦 SQUEAK! VIP OTTERS!';
    case 'water_spit':
      return '💦 MERLION RAINBOW SPLASH!';
    case 'kopi_pour':
      return '☕ TEH TARIK HIGH POUR!';
    case 'music_box':
      return '🎵 SUPERTREE MELODY!';
    case 'lantern_glow':
      return '🏮 FESTIVAL LANTERN GLOW!';
    default:
      return '✨ SHIOK LAH!';
  }
}

export function createRelicToyEffectsController({ stageState, getActiveRelic }) {
  const toyParticles = [];
  let lastTapTimeMs = 0;
  let quipCycleIdx = 0;

  function clearToyParticles(toyParticlesGroup) {
    if (!toyParticlesGroup) return;
    while (toyParticles.length > 0) {
      const p = toyParticles.pop();
      if (p?.mesh) {
        toyParticlesGroup.remove(p.mesh);
        p.mesh.geometry?.dispose?.();
        p.mesh.material?.dispose?.();
      }
    }
  }

  function spawnToyParticles3D(toyParticlesGroup, actionType, comboCount = 1) {
    if (!toyParticlesGroup) return;
    clearToyParticles(toyParticlesGroup);
    spawnToyParticlesIntoGroup(toyParticlesGroup, toyParticles, actionType, comboCount);
  }

  function syncPlayToyButtonLabel(relic) {
    const playBtn = document.getElementById('btnPlayRelicToy');
    if (!playBtn) return;
    const customLabel = relic?.gagButtonLabel || '✨ PLAY TOY GAG!';
    playBtn.innerHTML = `<span class="gag-btn-label">${customLabel}</span>`;
  }

  function triggerToyAction(toyParticlesGroup) {
    const relic = getActiveRelic();
    if (!relic) return;

    const nowMs = performance.now();
    if (nowMs - lastTapTimeMs <= 3200) {
      stageState.toyComboCount = Math.min(99, (stageState.toyComboCount || 1) + 1);
      quipCycleIdx += 1;
    } else {
      stageState.toyComboCount = 1;
      quipCycleIdx = 0;
    }
    lastTapTimeMs = nowMs;

    const comboCount = stageState.toyComboCount || 1;
    const actionType = resolveToyActionType(relic);
    const reactionText = resolveToyReactionText(relic, actionType, quipCycleIdx);

    if (typeof SoundFX?.playToyAction === 'function') {
      SoundFX.playToyAction(actionType);
    } else {
      SoundFX?.playPlayerCollect?.(3);
    }

    stageState.toyAnimTimer = 1.45;
    stageState.toyAnimType = actionType;

    const playBtn = document.getElementById('btnPlayRelicToy');
    if (playBtn) {
      playBtn.classList.remove('is-gag-firing');
      void playBtn.offsetWidth;
      playBtn.classList.add('is-gag-firing');
    }

    spawnToyReactionPill(reactionText, comboCount);
    spawnToyParticles3D(toyParticlesGroup, actionType, comboCount);
  }

  function ensurePlayToyButton() {
    let playBtn = document.getElementById('btnPlayRelicToy');
    if (playBtn) return playBtn;

    const resetBtn = document.getElementById('btnRelic3DReset');
    const wrap = document.getElementById('relic3DStageWrap');
    const container = resetBtn?.parentElement || wrap;
    if (!container) return null;

    playBtn = document.createElement('button');
    playBtn.type = 'button';
    playBtn.id = 'btnPlayRelicToy';
    playBtn.className = resetBtn
      ? `${resetBtn.className} is-play-toy is-hero-gag-btn`
      : 'pearl-stage-ctrl-btn is-play-toy is-hero-gag-btn';
    const relic = getActiveRelic();
    playBtn.innerHTML = `<span class="gag-btn-label">${relic?.gagButtonLabel || '✨ PLAY TOY GAG!'}</span>`;
    playBtn.title = 'Trigger 3D Toy Gag & Sound (Spam-tap for SHIOK Combo!)';

    if (resetBtn && resetBtn.parentElement) {
      resetBtn.parentElement.insertBefore(playBtn, resetBtn);
    } else {
      container.appendChild(playBtn);
    }
    return playBtn;
  }

  function computeToyPoseAndStepParticles(dt, toyParticlesGroup) {
    let posX = 0;
    let posY = 0.04 + Math.sin(performance.now() * 0.0022) * 0.018;
    let rotX = 0;
    let rotZ = 0;
    let scaleX = 1;
    let scaleY = 1;
    let scaleZ = 1;

    if (stageState.toyAnimTimer > 0) {
      stageState.toyAnimTimer = Math.max(0, stageState.toyAnimTimer - dt);
      const p = 1 - stageState.toyAnimTimer / 1.45;
      const env = Math.sin(p * Math.PI);
      const comboBoost = Math.min(1.45, 1 + ((stageState.toyComboCount || 1) - 1) * 0.08);
      const animType = stageState.toyAnimType || 'happy_bounce';

      if (animType === 'durian_stink') {
        const jiggle = Math.sin(p * Math.PI * 16) * 0.25 * env * comboBoost;
        scaleX = 1 + jiggle;
        scaleY = 1 - jiggle * 0.85;
        scaleZ = 1 + Math.cos(p * Math.PI * 16) * 0.25 * env * comboBoost;
        rotZ = Math.sin(p * Math.PI * 14) * 0.28 * env;
        posY += Math.abs(Math.sin(p * Math.PI * 6)) * 0.16 * env;
      } else if (animType === 'chope_slam') {
        // Lift high then slam down with comic squash-and-stretch!
        if (p < 0.34) {
          const liftP = Math.sin((p / 0.34) * (Math.PI / 2));
          posY += 0.56 * liftP * comboBoost;
          scaleX = 1 - 0.12 * liftP;
          scaleY = 1 + 0.24 * liftP;
          scaleZ = 1 - 0.12 * liftP;
          rotX = -0.25 * liftP;
        } else if (p < 0.55) {
          const slamP = (p - 0.34) / 0.21;
          posY += 0.56 * (1 - slamP);
          scaleX = 1 + 0.34 * slamP * comboBoost;
          scaleY = 1 - 0.32 * slamP * comboBoost;
          scaleZ = 1 + 0.34 * slamP * comboBoost;
        } else {
          const recP = (p - 0.55) / 0.45;
          const damp = Math.cos(recP * Math.PI * 3) * (1 - recP);
          scaleX = 1 + 0.18 * damp;
          scaleY = 1 - 0.18 * damp;
          scaleZ = 1 + 0.18 * damp;
        }
      } else if (animType === 'erp_deduct') {
        // Electronic scanner vibration + coin-pop hop!
        posX = Math.sin(p * Math.PI * 28) * 0.085 * env * comboBoost;
        posY += Math.abs(Math.sin(p * Math.PI * 3)) * 0.28 * env * comboBoost;
        rotZ = Math.sin(p * Math.PI * 20) * 0.16 * env;
        scaleX = 1 + Math.sin(p * Math.PI * 12) * 0.12 * env;
        scaleY = 1 + Math.cos(p * Math.PI * 12) * 0.12 * env;
      } else if (animType === 'otter_wiggle') {
        // Chaotic happy otter belly-dance wiggle!
        posX = Math.sin(p * Math.PI * 6) * 0.22 * env * comboBoost;
        posY += Math.abs(Math.sin(p * Math.PI * 8)) * 0.22 * env;
        rotZ = Math.sin(p * Math.PI * 8) * 0.36 * env * comboBoost;
        stageState.yaw += dt * 9.5 * env * comboBoost;
      } else if (animType === 'water_spit') {
        const tiltOffset = p < 0.24
          ? -0.28 * (p / 0.24)
          : 0.36 * Math.sin(((p - 0.24) / 0.76) * Math.PI);
        rotX = tiltOffset;
        posY += 0.18 * env * comboBoost;
        scaleY = 1 + 0.14 * env;
      } else if (animType === 'kopi_pour') {
        rotZ = 0.68 * env * comboBoost;
        posY += 0.32 * env * comboBoost;
        posX = -0.16 * env;
      } else {
        stageState.yaw += dt * 13 * env * comboBoost;
        posY += Math.abs(Math.sin(p * Math.PI * 2)) * 0.44 * env * comboBoost;
        rotX = Math.sin(p * Math.PI * 4) * 0.32 * env;
      }
    }

    for (let i = toyParticles.length - 1; i >= 0; i--) {
      const pt = toyParticles[i];
      pt.age += dt;
      if (pt.age < 0) continue;
      if (pt.age >= pt.life) {
        toyParticlesGroup?.remove(pt.mesh);
        pt.mesh.geometry?.dispose?.();
        pt.mesh.material?.dispose?.();
        toyParticles.splice(i, 1);
        continue;
      }
      const lifeRatio = pt.age / pt.life;
      if (pt.gravity) {
        pt.vy += pt.gravity * dt;
      }
      pt.mesh.position.x += pt.vx * dt;
      pt.mesh.position.y += pt.vy * dt;
      pt.mesh.position.z += pt.vz * dt;
      if (pt.wobble) {
        pt.mesh.position.x += Math.sin(pt.age * 10 + pt.wobble) * 0.008;
      }
      if (pt.spinX) pt.mesh.rotation.x += pt.spinX * dt;
      if (pt.spinY) pt.mesh.rotation.y += pt.spinY * dt;
      if (pt.scaleRate) {
        const s = Math.max(0.05, 1 + pt.scaleRate * lifeRatio);
        pt.mesh.scale.setScalar(s);
      }
      if (pt.mesh.material) {
        pt.mesh.material.opacity = Math.max(0, (1 - lifeRatio) * 0.92);
      }
    }

    return { posX, posY, rotX, rotZ, scaleX, scaleY, scaleZ };
  }

  return {
    clearToyParticles,
    triggerToyAction,
    ensurePlayToyButton,
    syncPlayToyButtonLabel,
    computeToyPoseAndStepParticles
  };
}
