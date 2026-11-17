// ============================================================================
// Gardens by the Bay — Synthesized Web Audio API Chimes & Sound Effects
// (src/audio/SoundFX.js) — Zero External Audio Files Required
// ============================================================================

import { RelicAndHazardSFX } from './RelicAndHazardSFX.js';

export const SoundFX = {
  ctx: null,
  muted: false,

  ensureCtx() {
    if (this.muted) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  },

  playPlayerCollect(combo = 1, rarity = 'classic') {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const pentatonicSemis = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
    const comboStep = Math.min(Math.max(0, combo - 1), pentatonicSemis.length - 4);
    const baseFreq = 523.25 * Math.pow(2, pentatonicSemis[comboStep] / 12);
    const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2.0];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.055);
      gain.gain.setValueAtTime(0.001, now + idx * 0.055);
      gain.gain.exponentialRampToValueAtTime(0.15, now + idx * 0.055 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.055 + 0.34);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.055);
      osc.stop(now + idx * 0.055 + 0.36);
    });

    if (rarity === 'crown') {
      const crownChord = [1046.5, 1318.51, 1567.98, 1975.53, 2093.0];
      crownChord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        const startT = now + 0.14 + idx * 0.035;
        osc.frequency.setValueAtTime(freq, startT);
        gain.gain.setValueAtTime(0.001, startT);
        gain.gain.exponentialRampToValueAtTime(0.12, startT + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.65);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startT);
        osc.stop(startT + 0.68);
      });
    }
  },

  playToyAction(actionType = 'happy_bounce') {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (actionType === 'durian_stink') {
      const osc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(95, now + 0.22);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.48);

      lfo.type = 'triangle';
      lfo.frequency.setValueAtTime(16, now);
      lfoGain.gain.setValueAtTime(18, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.14, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.52);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      lfo.start(now);
      osc.stop(now + 0.54);
      lfo.stop(now + 0.54);
      return;
    }

    if (actionType === 'water_spit') {
      const droplets = [400, 510, 630, 760, 880, 980];
      droplets.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + idx * 0.042;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.18, t + 0.07);
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.exponentialRampToValueAtTime(0.12, t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.12);
      });
      return;
    }

    if (actionType === 'kopi_pour') {
      const whistle = ctx.createOscillator();
      const wGain = ctx.createGain();
      whistle.type = 'sine';
      whistle.frequency.setValueAtTime(920, now);
      whistle.frequency.exponentialRampToValueAtTime(480, now + 0.22);
      wGain.gain.setValueAtTime(0.001, now);
      wGain.gain.exponentialRampToValueAtTime(0.09, now + 0.03);
      wGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      whistle.connect(wGain);
      wGain.connect(ctx.destination);
      whistle.start(now);
      whistle.stop(now + 0.25);

      [1318.51, 1760].forEach((freq, idx) => {
        const bell = ctx.createOscillator();
        const bGain = ctx.createGain();
        const t = now + 0.18 + idx * 0.07;
        bell.type = 'triangle';
        bell.frequency.setValueAtTime(freq, t);
        bGain.gain.setValueAtTime(0.001, t);
        bGain.gain.exponentialRampToValueAtTime(0.14, t + 0.015);
        bGain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
        bell.connect(bGain);
        bGain.connect(ctx.destination);
        bell.start(t);
        bell.stop(t + 0.34);
      });
      return;
    }

    if (actionType === 'erp_deduct') {
      // Iconic Singapore ERP CashCard IU double-beep + coin clink!
      [2150, 1720, 2580].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + idx * 0.085;
        osc.type = idx < 2 ? 'square' : 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.exponentialRampToValueAtTime(0.11, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.075);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.08);
      });
      return;
    }

    if (actionType === 'chope_slam') {
      // Comic table-slam thud + triumphant hawker bell!
      const slam = ctx.createOscillator();
      const sGain = ctx.createGain();
      slam.type = 'triangle';
      slam.frequency.setValueAtTime(220, now);
      slam.frequency.exponentialRampToValueAtTime(55, now + 0.15);
      sGain.gain.setValueAtTime(0.001, now);
      sGain.gain.exponentialRampToValueAtTime(0.22, now + 0.015);
      sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
      slam.connect(sGain);
      sGain.connect(ctx.destination);
      slam.start(now);
      slam.stop(now + 0.18);

      [880, 1318.51, 1760].forEach((freq, idx) => {
        const ding = ctx.createOscillator();
        const dGain = ctx.createGain();
        const t = now + 0.12 + idx * 0.045;
        ding.type = 'sine';
        ding.frequency.setValueAtTime(freq, t);
        dGain.gain.setValueAtTime(0.001, t);
        dGain.gain.exponentialRampToValueAtTime(0.13, t + 0.012);
        dGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        ding.connect(dGain);
        dGain.connect(ctx.destination);
        ding.start(t);
        ding.stop(t + 0.26);
      });
      return;
    }

    if (actionType === 'otter_wiggle') {
      // Playful Marina Bay otter squeak-chirps!
      [980, 1340, 1120, 1560].forEach((freq, idx) => {
        const sq = ctx.createOscillator();
        const qGain = ctx.createGain();
        const t = now + idx * 0.065;
        sq.type = 'sine';
        sq.frequency.setValueAtTime(freq, t);
        sq.frequency.exponentialRampToValueAtTime(freq * 1.28, t + 0.05);
        qGain.gain.setValueAtTime(0.001, t);
        qGain.gain.exponentialRampToValueAtTime(0.13, t + 0.012);
        qGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        sq.connect(qGain);
        qGain.connect(ctx.destination);
        sq.start(t);
        sq.stop(t + 0.065);
      });
      return;
    }

    const celesta = [1046.5, 1318.51, 1567.98, 1975.53, 2093.0];
    celesta.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + idx * 0.055;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(0.12, t + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  },

  playChopeSnatch() {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const boing = ctx.createOscillator();
    const bGain = ctx.createGain();
    boing.type = 'triangle';
    boing.frequency.setValueAtTime(340, now);
    boing.frequency.exponentialRampToValueAtTime(720, now + 0.14);
    bGain.gain.setValueAtTime(0.001, now);
    bGain.gain.exponentialRampToValueAtTime(0.16, now + 0.02);
    bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    boing.connect(bGain);
    bGain.connect(ctx.destination);
    boing.start(now);
    boing.stop(now + 0.17);

    const ting = ctx.createOscillator();
    const tGain = ctx.createGain();
    const tStart = now + 0.13;
    ting.type = 'sine';
    ting.frequency.setValueAtTime(1174.66, tStart);
    ting.frequency.exponentialRampToValueAtTime(1567.98, tStart + 0.08);
    tGain.gain.setValueAtTime(0.001, tStart);
    tGain.gain.exponentialRampToValueAtTime(0.16, tStart + 0.015);
    tGain.gain.exponentialRampToValueAtTime(0.001, tStart + 0.35);
    ting.connect(tGain);
    tGain.connect(ctx.destination);
    ting.start(tStart);
    ting.stop(tStart + 0.37);
  },

  ...RelicAndHazardSFX
};
