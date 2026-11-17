export type SoundEffectType = 'hit' | 'kill' | 'big' | 'wave';

export class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private lastHitTime = 0;
  private muted = false;

  constructor() {
    try {
      this.muted =
        typeof localStorage !== 'undefined' && localStorage.getItem('fighter-guns-mute') === '1';
    } catch {
      this.muted = false;
    }
  }

  setMuted(muted: boolean): void {
    this.muted = !!muted;
  }

  isMuted(): boolean {
    return !!this.muted;
  }

  play(effect: SoundEffectType): void {
    if (this.muted) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.webdriver) return;
      const AudioCtx =
        (typeof AudioContext !== 'undefined' && AudioContext) ||
        (typeof (window as any).webkitAudioContext !== 'undefined' &&
          (window as any).webkitAudioContext);
      if (!AudioCtx) return;

      this.ctx = this.ctx || new AudioCtx();
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      const now = this.ctx.currentTime;
      if (effect === 'hit') {
        if (now - this.lastHitTime < 0.045) return;
        this.lastHitTime = now;
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      if (effect === 'hit') {
        osc.type = 'square';
        osc.frequency.value = 520;
        gain.gain.setValueAtTime(0.025, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (effect === 'kill') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.16);
        gain.gain.setValueAtTime(0.045, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (effect === 'big') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(55, now + 0.32);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
        osc.start(now);
        osc.stop(now + 0.36);
      } else if (effect === 'wave') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.22);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
        osc.start(now);
        osc.stop(now + 0.26);
      }
    } catch {
      // Ignore Web Audio errors on restricted autoplay contexts
    }
  }
}
