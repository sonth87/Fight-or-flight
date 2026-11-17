import { ThrusterRenderer } from '../types/game';

const THRUSTER_VERTEX_SHADER = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;

const THRUSTER_FRAGMENT_SHADER = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uA;      // nozzle
uniform vec2 uB;      // a point straight behind it
uniform vec2 uC;      // tip
uniform float uR;     // radius at the nozzle, px
uniform float uTip;   // how much larger things are at the tip (it may be nearer the eye)
uniform float uLen;   // the flame's true length, in nozzle radii
uniform float uPower; // 0..1: how far the thrusters are open
uniform float uAlpha;
uniform vec3 uVis;    // how much of the nozzle, middle and tip the world leaves in view
uniform float uTime;
uniform float uSeed;
uniform float uH;     // canvas height, px

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.02 + vec2(13.1, 7.7);
    a *= 0.5;
  }
  return v;
}
vec2 bez(float t) {
  float u = 1.0 - t;
  return u * u * uA + 2.0 * u * t * uB + t * t * uC;
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, uH - gl_FragCoord.y);
  vec2 dir = uB - uA;
  dir /= max(length(dir), 1e-3);
  vec2 across = vec2(-dir.y, dir.x);
  // this pixel as the nozzle sees it: across and along, in nozzle radii
  vec2 q = vec2(dot(p - uA, across), dot(p - uA, dir)) / uR;
  float flow = uTime * (5.0 + 6.0 * uPower);

  // the exhaust shakes the plume about, more and more the further it gets from the nozzle
  vec2 wq = q * 0.6 + vec2(uSeed * 5.3, -flow * 0.6);
  vec2 warp = vec2(fbm(wq), fbm(wq + vec2(31.7, 11.3))) - 0.47;
  float loose = smoothstep(0.2, 4.0, q.y);
  vec2 pw = p + (across * warp.x + dir * warp.y * 0.6) * uR * loose * 1.1;

  // add up the fire the eye looks through: the plume is a string of soft puffs, narrowing and
  // burning out along its length. Seen end on, they pile up into a white-hot disc.
  float dens = 0.0;
  float halo = 0.0;
  float wsum = 0.0;
  float tsum = 0.0;
  for (int i = 0; i < 36; i++) {
    float ti = (float(i) + 0.5) / 36.0;
    float ri = uR * mix(1.0, uTip, ti) * mix(1.0, 0.5, smoothstep(0.1, 1.0, ti));
    vec2 d = pw - bez(ti);
    float dd = dot(d, d) / (ri * ri);
    // each puff ends at its own edge, so however many pile up the plume is never wider than the nozzle
    float g = max(0.0, 1.0 - dd);
    g *= g;
    float e = pow(1.0 - ti, 0.75);
    dens += g * e;
    wsum += g;
    tsum += g * ti;
    vec2 d0 = p - bez(ti);
    halo += exp(-dot(d0, d0) / (ri * ri) * 0.42) * e;
  }
  float per = uLen / 36.0;
  dens *= per;
  halo *= per;
  float t = wsum > 1e-6 ? tsum / wsum : 1.0;

  // where this pixel is on the plume: across it (in its own radii) and along it
  vec2 tan = mix(uB - uA, uC - uB, t);
  tan /= max(length(tan), 1e-3);
  vec2 off = pw - bez(t);
  float x = (tan.x * off.y - tan.y * off.x) / (uR * mix(1.0, uTip, t));
  float y = t * uLen;

  // streaks of hotter and cooler gas racing down it
  float streak = fbm(vec2(x * 2.4 + uSeed * 2.1, y * 0.8 - flow * 1.5));
  float fire = 1.0 - exp(-dens * 1.45);
  float heat = fire * (0.62 + 0.6 * streak);
  // shock diamonds: bright knots strung along the core, stronger as the thrusters open
  float cell = y / 2.2 - 0.25;
  float knot = abs(fract(cell) - 0.5) * 2.0;
  float dia = smoothstep(1.0, 0.1, knot + abs(x) * 2.2) * exp(-t * 2.2) * (0.3 + 0.7 * uPower) * step(0.0, cell);
  heat = clamp(heat + (dia * 0.5 + uPower * 0.06) * smoothstep(0.05, 0.5, fire), 0.0, 1.0);

  // colour by heat: ember, orange, yellow, white
  vec3 col = mix(vec3(0.6, 0.07, 0.02), vec3(1.0, 0.34, 0.05), smoothstep(0.0, 0.28, heat));
  col = mix(col, vec3(1.0, 0.7, 0.2), smoothstep(0.24, 0.52, heat));
  col = mix(col, vec3(1.0, 0.93, 0.66), smoothstep(0.48, 0.78, heat));
  col = mix(col, vec3(0.96, 0.98, 1.0), smoothstep(0.76, 1.0, heat));
  // a blue skin round the root, where the burn is cleanest
  float skin = (1.0 - smoothstep(0.0, 0.4, t)) * smoothstep(0.03, 0.14, heat) * (1.0 - smoothstep(0.2, 0.5, heat));
  col = mix(col, vec3(0.34, 0.54, 1.0), skin * 0.8);

  float alpha = smoothstep(0.02, 0.42, heat);
  // the light it throws around itself
  float glow = max(0.0, 1.0 - exp(-halo * 0.5) - 0.03) * (0.2 + 0.18 * uPower);

  // nothing in front of the nozzle (unless the flame is seen end on, when it is a disc of fire)
  float sideOn = smoothstep(0.3, 0.6, length(uC - uA) / (uLen * uR));
  float open = mix(1.0, smoothstep(-0.5, 0.3, q.y), sideOn);

  float seen = t < 0.5 ? mix(uVis.x, uVis.y, t * 2.0) : mix(uVis.y, uVis.z, t * 2.0 - 1.0);
  float k = open * seen * uAlpha;
  // colour is sent already multiplied by its strength; the glow adds light without hiding what is behind
  gl_FragColor = vec4(col * alpha + vec3(1.0, 0.46, 0.14) * glow, alpha * 0.88 + glow * 0.2) * k;
}
`;

export function createThrusterRenderer(canvas: HTMLCanvasElement): ThrusterRenderer | null {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
  });
  if (!gl) return null;

  const compileShader = (type: number, source: string): WebGLShader | null => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
    console.warn('flame shader:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  };

  const vs = compileShader(gl.VERTEX_SHADER, THRUSTER_VERTEX_SHADER);
  const fs = compileShader(gl.FRAGMENT_SHADER, THRUSTER_FRAGMENT_SHADER);
  const program = gl.createProgram();
  if (!vs || !fs || !program) return null;

  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.bindAttribLocation(program, 0, 'p');
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn('flame shader:', gl.getProgramInfoLog(program));
    return null;
  }

  const quadBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.useProgram(program);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  const loc = (name: string) => gl.getUniformLocation(program, name);
  const uA = loc('uA');
  const uB = loc('uB');
  const uC = loc('uC');
  const uR = loc('uR');
  const uTip = loc('uTip');
  const uLen = loc('uLen');
  const uPower = loc('uPower');
  const uAlpha = loc('uAlpha');
  const uVis = loc('uVis');
  const uTime = loc('uTime');
  const uSeed = loc('uSeed');
  const uH = loc('uH');

  let hadFlames = true;

  return {
    draw(count: number, data: Float32Array, scale: number, timeSec: number) {
      if (count === 0 && !hadFlames) return;
      const width = canvas.width;
      const height = canvas.height;
      gl.viewport(0, 0, width, height);
      gl.disable(gl.SCISSOR_TEST);
      gl.clear(gl.COLOR_BUFFER_BIT);
      hadFlames = count > 0;
      if (count === 0) return;

      gl.enable(gl.SCISSOR_TEST);
      gl.uniform1f(uH, height);
      gl.uniform1f(uTime, timeSec % 600);

      for (let i = 0; i < count; i++) {
        const base = i * 16;
        const ax = (data[base] + 0.5) * scale;
        const ay = (data[base + 1] + 0.5) * scale;
        const bx = (data[base + 2] + 0.5) * scale;
        const by = (data[base + 3] + 0.5) * scale;
        const cx = (data[base + 4] + 0.5) * scale;
        const cy = (data[base + 5] + 0.5) * scale;
        const radius = Math.max(1, data[base + 6] * scale);
        const tipScale = data[base + 7];
        const margin = radius * Math.max(1, tipScale) * 4.2 + 2;

        const minX = Math.max(0, Math.floor(Math.min(ax, bx, cx) - margin));
        const maxX = Math.min(width, Math.ceil(Math.max(ax, bx, cx) + margin));
        const minY = Math.max(0, Math.floor(Math.min(ay, by, cy) - margin));
        const maxY = Math.min(height, Math.ceil(Math.max(ay, by, cy) + margin));

        if (maxX <= minX || maxY <= minY) continue;

        gl.scissor(minX, height - maxY, maxX - minX, maxY - minY);
        gl.uniform2f(uA, ax, ay);
        gl.uniform2f(uB, bx, by);
        gl.uniform2f(uC, cx, cy);
        gl.uniform1f(uR, radius);
        gl.uniform1f(uTip, tipScale);
        gl.uniform1f(uLen, data[base + 15]);
        gl.uniform1f(uPower, data[base + 8]);
        gl.uniform1f(uAlpha, data[base + 9]);
        gl.uniform3f(uVis, data[base + 10], data[base + 11], data[base + 12]);
        gl.uniform1f(uSeed, data[base + 13]);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
    },
    dispose() {
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(quadBuffer);
    },
  };
}
