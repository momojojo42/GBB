// ============================================================================
// Gardens by the Bay — Hazard, Penalty, Pickpocket & Victory Synth SFX
// (src/audio/RelicAndHazardSFX.js)
// ============================================================================

export const RelicAndHazardSFX = {
  playWindDash() {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    [330, 660, 990].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + idx * 0.045;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq * 0.85, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.35, t + 0.32);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(0.11, t + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  },

  playRhapsodyDrop() {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const chord = [261.63, 392.0, 493.88, 659.25, 783.99, 1046.5];
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + idx * 0.075;
      osc.type = idx < 2 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq * 0.995, t);
      osc.frequency.exponentialRampToValueAtTime(freq, t + 0.18);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(idx < 2 ? 0.08 : 0.13, t + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 1.5);
    });
  },

  playBotCollect() {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(360, now);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.14);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  },

  playGadgetActivate() {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    [440, 554.37, 659.25].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);
      gain.gain.setValueAtTime(0.08, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.26);
    });
  },

  playJump(isSuper = false) {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isSuper ? 330 : 280, now);
    osc.frequency.exponentialRampToValueAtTime(isSuper ? 880 : 620, now + (isSuper ? 0.28 : 0.19));
    gain.gain.setValueAtTime(0.11, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isSuper ? 0.32 : 0.22));
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + (isSuper ? 0.34 : 0.24));
  },

  playCountdownTick(isFinalThree = false) {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(isFinalThree ? 880 : 660, now);
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  },

  playVictoryFanfare() {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const melody = [
      { freq: 523.25, delay: 0.0, dur: 0.16 },
      { freq: 659.25, delay: 0.12, dur: 0.16 },
      { freq: 783.99, delay: 0.24, dur: 0.16 },
      { freq: 1046.5, delay: 0.36, dur: 0.32 },
      { freq: 783.99, delay: 0.62, dur: 0.15 },
      { freq: 1046.5, delay: 0.76, dur: 0.58 }
    ];
    melody.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.freq, now + n.delay);
      gain.gain.setValueAtTime(0.001, now + n.delay);
      gain.gain.exponentialRampToValueAtTime(0.16, now + n.delay + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.delay + n.dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + n.delay);
      osc.stop(now + n.delay + n.dur + 0.02);
    });
  },

  playPenaltyHit(type = 'car') {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (type === 'car') {
      [392, 493.88].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.19);
      });

      const boingOsc = ctx.createOscillator();
      const boingGain = ctx.createGain();
      boingOsc.type = 'triangle';
      boingOsc.frequency.setValueAtTime(320, now + 0.08);
      boingOsc.frequency.exponentialRampToValueAtTime(95, now + 0.40);
      boingGain.gain.setValueAtTime(0.001, now);
      boingGain.gain.setValueAtTime(0.12, now + 0.08);
      boingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.40);
      boingOsc.connect(boingGain);
      boingGain.connect(ctx.destination);
      boingOsc.start(now + 0.08);
      boingOsc.stop(now + 0.41);
    } else if (type === 'durian') {
      const whistleOsc = ctx.createOscillator();
      const whistleGain = ctx.createGain();
      whistleOsc.type = 'sine';
      whistleOsc.frequency.setValueAtTime(680, now);
      whistleOsc.frequency.exponentialRampToValueAtTime(180, now + 0.16);
      whistleOsc.frequency.exponentialRampToValueAtTime(420, now + 0.28);
      whistleGain.gain.setValueAtTime(0.1, now);
      whistleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      whistleOsc.connect(whistleGain);
      whistleGain.connect(ctx.destination);
      whistleOsc.start(now);
      whistleOsc.stop(now + 0.29);

      const splatOsc = ctx.createOscillator();
      const splatGain = ctx.createGain();
      splatOsc.type = 'triangle';
      splatOsc.frequency.setValueAtTime(110, now + 0.14);
      splatOsc.frequency.exponentialRampToValueAtTime(55, now + 0.32);
      splatGain.gain.setValueAtTime(0.001, now);
      splatGain.gain.setValueAtTime(0.14, now + 0.14);
      splatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      splatOsc.connect(splatGain);
      splatGain.connect(ctx.destination);
      splatOsc.start(now + 0.14);
      splatOsc.stop(now + 0.33);
    } else if (type === 'water') {
      const splashOsc = ctx.createOscillator();
      const splashGain = ctx.createGain();
      splashOsc.type = 'sine';
      splashOsc.frequency.setValueAtTime(240, now);
      splashOsc.frequency.exponentialRampToValueAtTime(520, now + 0.12);
      splashOsc.frequency.exponentialRampToValueAtTime(160, now + 0.26);
      splashGain.gain.setValueAtTime(0.12, now);
      splashGain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
      splashOsc.connect(splashGain);
      splashGain.connect(ctx.destination);
      splashOsc.start(now);
      splashOsc.stop(now + 0.27);
    }
  },

  playPickpocketSteal(isPlayer = true) {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (isPlayer) {
      const notes = [587.33, 783.99, 987.77, 1174.66];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const start = now + idx * 0.055;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.exponentialRampToValueAtTime(0.12, start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.09);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.1);
      });
    } else {
      const notes = [523.25, 392.0, 293.66];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        const start = now + idx * 0.08;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.exponentialRampToValueAtTime(0.1, start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.13);
      });
    }
  }
};
