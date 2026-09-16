/* Shared geometry helpers for CG demos */
(function () {
  "use strict";

  function mulMat(a, b) {
    // column-major 4x4 as 16-array
    const o = new Float32Array(16);
    for (let c = 0; c < 4; c++) {
      for (let r = 0; r < 4; r++) {
        o[c * 4 + r] =
          a[0 * 4 + r] * b[c * 4 + 0] +
          a[1 * 4 + r] * b[c * 4 + 1] +
          a[2 * 4 + r] * b[c * 4 + 2] +
          a[3 * 4 + r] * b[c * 4 + 3];
      }
    }
    return o;
  }

  function identity() {
    return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
  }

  function translate(x, y, z) {
    return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, x,y,z,1]);
  }

  function scale(sx, sy, sz) {
    return new Float32Array([sx,0,0,0, 0,sy,0,0, 0,0,sz,0, 0,0,0,1]);
  }

  function rotateZ(rad) {
    const c = Math.cos(rad), s = Math.sin(rad);
    return new Float32Array([c,s,0,0, -s,c,0,0, 0,0,1,0, 0,0,0,1]);
  }

  function rotateX(rad) {
    const c = Math.cos(rad), s = Math.sin(rad);
    return new Float32Array([1,0,0,0, 0,c,s,0, 0,-s,c,0, 0,0,0,1]);
  }

  function rotateY(rad) {
    const c = Math.cos(rad), s = Math.sin(rad);
    return new Float32Array([c,0,-s,0, 0,1,0,0, s,0,c,0, 0,0,0,1]);
  }

  function perspective(fovy, aspect, near, far) {
    const f = 1 / Math.tan(fovy / 2);
    const nf = 1 / (near - far);
    return new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, 2 * far * near * nf, 0,
    ]);
  }

  function ortho(l, r, b, t, n, f) {
    return new Float32Array([
      2 / (r - l), 0, 0, 0,
      0, 2 / (t - b), 0, 0,
      0, 0, -2 / (f - n), 0,
      -(r + l) / (r - l), -(t + b) / (t - b), -(f + n) / (f - n), 1,
    ]);
  }

  function lookAt(eye, at, up) {
    const z = norm(sub(eye, at));
    const x = norm(cross(up, z));
    const y = cross(z, x);
    return new Float32Array([
      x[0], y[0], z[0], 0,
      x[1], y[1], z[1], 0,
      x[2], y[2], z[2], 0,
      -dot(x, eye), -dot(y, eye), -dot(z, eye), 1,
    ]);
  }

  function transformPoint(m, p) {
    const x = p[0], y = p[1], z = p[2], w = p[3] === undefined ? 1 : p[3];
    return [
      m[0] * x + m[4] * y + m[8] * z + m[12] * w,
      m[1] * x + m[5] * y + m[9] * z + m[13] * w,
      m[2] * x + m[6] * y + m[10] * z + m[14] * w,
      m[3] * x + m[7] * y + m[11] * z + m[15] * w,
    ];
  }

  function project(m, p, w, h) {
    const c = transformPoint(m, p);
    if (Math.abs(c[3]) < 1e-8) return null;
    const x = c[0] / c[3], y = c[1] / c[3], z = c[2] / c[3];
    return [(x * 0.5 + 0.5) * w, (1 - (y * 0.5 + 0.5)) * h, z];
  }

  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function scale3(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  }
  function norm(a) {
    const l = Math.hypot(a[0], a[1], a[2]) || 1;
    return [a[0] / l, a[1] / l, a[2] / l];
  }
  function reflect(I, N) {
    // I incident (to surface), N unit normal
    const d = 2 * dot(I, N);
    return [I[0] - d * N[0], I[1] - d * N[1], I[2] - d * N[2]];
  }

  function unitCube() {
    // 12 triangles, positions + normals, for lighting demos
    const faces = [
      { n: [0, 0, 1], v: [[-1,-1,1],[1,-1,1],[1,1,1],[-1,-1,1],[1,1,1],[-1,1,1]] },
      { n: [0, 0, -1], v: [[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,-1,-1],[-1,1,-1],[1,1,-1]] },
      { n: [1, 0, 0], v: [[1,-1,1],[1,-1,-1],[1,1,-1],[1,-1,1],[1,1,-1],[1,1,1]] },
      { n: [-1, 0, 0], v: [[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,-1,-1],[-1,1,1],[-1,1,-1]] },
      { n: [0, 1, 0], v: [[-1,1,1],[1,1,1],[1,1,-1],[-1,1,1],[1,1,-1],[-1,1,-1]] },
      { n: [0, -1, 0], v: [[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,-1],[1,-1,1],[-1,-1,1]] },
    ];
    const tris = [];
    for (const f of faces) {
      for (let i = 0; i < f.v.length; i += 3) {
        tris.push({ p: [f.v[i], f.v[i + 1], f.v[i + 2]], n: f.n });
      }
    }
    return tris;
  }

  function sphere(radius, stacks, slices) {
    const tris = [];
    for (let i = 0; i < stacks; i++) {
      const t0 = (i / stacks) * Math.PI;
      const t1 = ((i + 1) / stacks) * Math.PI;
      for (let j = 0; j < slices; j++) {
        const p0 = (j / slices) * Math.PI * 2;
        const p1 = ((j + 1) / slices) * Math.PI * 2;
        const n00 = [Math.sin(t0) * Math.cos(p0), Math.cos(t0), Math.sin(t0) * Math.sin(p0)];
        const n01 = [Math.sin(t0) * Math.cos(p1), Math.cos(t0), Math.sin(t0) * Math.sin(p1)];
        const n10 = [Math.sin(t1) * Math.cos(p0), Math.cos(t1), Math.sin(t1) * Math.sin(p0)];
        const n11 = [Math.sin(t1) * Math.cos(p1), Math.cos(t1), Math.sin(t1) * Math.sin(p1)];
        const v = (n) => [n[0] * radius, n[1] * radius, n[2] * radius];
        tris.push({ p: [v(n00), v(n10), v(n11)], n: [n00, n10, n11] });
        tris.push({ p: [v(n00), v(n11), v(n01)], n: [n00, n11, n01] });
      }
    }
    return tris;
  }

  window.CG = {
    mulMat, identity, translate, scale, rotateX, rotateY, rotateZ,
    perspective, ortho, lookAt, transformPoint, project,
    sub, add, scale3, dot, cross, norm, reflect,
    unitCube, sphere,
  };
})();
