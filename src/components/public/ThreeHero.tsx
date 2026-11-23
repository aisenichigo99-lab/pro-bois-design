"use client";

import { useEffect, useRef } from "react";

/**
 * Scène Three.js reprise de la démo validée :
 * - Table en bois qui s'éclate au scroll (étapes)
 * - Pile de planches + copeaux animés
 * - Caméra travelling pilotée par scroll
 * - Lenis + GSAP ScrollTrigger
 *
 * Chargement dynamique des libs via CDN pour ne pas alourdir le bundle.
 */
export function ThreeHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    let cleanup: (() => void) | undefined;

    (async () => {
      // Charge les libs via CDN (une seule fois)
      await Promise.all([
        loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
        ),
        loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js",
        ),
        loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js",
        ),
        loadScript(
          "https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js",
        ),
      ]);

      const THREE = (window as any).THREE;
      const gsap = (window as any).gsap;
      const ScrollTrigger = (window as any).ScrollTrigger;
      const Lenis = (window as any).Lenis;

      if (!THREE || !gsap || !ScrollTrigger || !Lenis || !canvasRef.current) {
        console.warn("ThreeHero: libs manquantes");
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      // Lenis smooth scroll
      const lenis = new Lenis({ lerp: 0.08 });
      lenis.on("scroll", ScrollTrigger.update);
      const tickerFn = (t: number) => lenis.raf(t * 1000);
      gsap.ticker.add(tickerFn);
      gsap.ticker.lagSmoothing(0);

      // ---------- Scène Three.js ----------
      const cv = canvasRef.current;
      const mob0 = window.innerWidth < 820;
      const R = new THREE.WebGLRenderer({
        canvas: cv,
        antialias: true,
        alpha: true,
      });
      R.setPixelRatio(Math.min(window.devicePixelRatio, mob0 ? 1.5 : 2));
      R.shadowMap.enabled = true;
      R.shadowMap.type = THREE.PCFSoftShadowMap;
      R.toneMapping = THREE.ACESFilmicToneMapping;
      R.toneMappingExposure = 1.05;
      R.outputEncoding = THREE.sRGBEncoding;

      const S = new THREE.Scene();
      const C = new THREE.PerspectiveCamera(36, 1, 0.1, 80);

      // Studio env map
      const envS = new THREE.Scene();
      envS.add(
        new THREE.Mesh(
          new THREE.BoxGeometry(30, 20, 30),
          new THREE.MeshBasicMaterial({
            color: 0x1d130c,
            side: THREE.BackSide,
          }),
        ),
      );
      function box(
        w: number,
        h: number,
        x: number,
        y: number,
        z: number,
        i: number,
        c: number,
      ) {
        const m = new THREE.Mesh(
          new THREE.PlaneGeometry(w, h),
          new THREE.MeshBasicMaterial({
            color: new THREE.Color(c).multiplyScalar(i),
            side: THREE.DoubleSide,
          }),
        );
        m.position.set(x, y, z);
        m.lookAt(0, 0, 0);
        envS.add(m);
      }
      box(12, 5, 0, 9, 0, 9, 0xfff0dc);
      box(5, 9, -10, 3, 4, 6, 0xffd9a8);
      box(4, 8, 10, 3, -3, 4, 0xe8f0ff);
      box(14, 2, 0, 2, -12, 2.5, 0xffb870);
      const pm = new THREE.PMREMGenerator(R);
      S.environment = pm.fromScene(envS, 0.03).texture;

      // Bois procédural
      function wood(l: number[], d: number[], seed: number) {
        const N = 512;
        const c = document.createElement("canvas");
        c.width = c.height = N;
        const x = c.getContext("2d")!;
        const im = x.createImageData(N, N);
        const rn: number[] = [];
        for (let i = 0; i < N; i++) rn.push(Math.random());
        for (let y = 0; y < N; y++)
          for (let px = 0; px < N; px++) {
            const v = Math.sin(
              y * 0.085 +
                Math.sin(px * 0.011 + seed) * 3.2 +
                Math.sin(px * 0.047 + y * 0.02) * 0.7 +
                seed,
            );
            const ring = Math.pow(Math.abs(v), 0.55);
            const f =
              rn[(y * 7 + ((px * 0.15) | 0)) % N] * 0.14 + Math.random() * 0.05;
            const k = Math.min(1, ring * 0.62 + f);
            const o = (y * N + px) * 4;
            for (let q = 0; q < 3; q++)
              im.data[o + q] = l[q] + (d[q] - l[q]) * k;
            im.data[o + 3] = 255;
          }
        x.putImageData(im, 0, 0);
        const t = new THREE.CanvasTexture(c);
        t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping;
        t.encoding = THREE.sRGBEncoding;
        t.anisotropy = 8;
        t.repeat.set(0.45, 0.45);
        return t;
      }
      function mat(l: number[], d: number[], s: number, cc: number) {
        const t = wood(l, d, s);
        return new THREE.MeshPhysicalMaterial({
          map: t,
          bumpMap: t,
          bumpScale: 0.6,
          roughness: 0.46,
          metalness: 0,
          clearcoat: cc,
          clearcoatRoughness: 0.32,
          envMapIntensity: 1.1,
        });
      }
      const oak = mat([214, 160, 98], [132, 82, 40], 1.3, 0.55);
      const walnut = mat([128, 80, 48], [60, 32, 16], 4.1, 0.5);
      const raw = mat([226, 184, 128], [165, 116, 66], 7.7, 0.05);

      // Géométries chanfreinées
      function rr(w: number, h: number, r: number) {
        const s = new THREE.Shape();
        const x = -w / 2;
        const y = -h / 2;
        s.moveTo(x + r, y);
        s.lineTo(x + w - r, y);
        s.quadraticCurveTo(x + w, y, x + w, y + r);
        s.lineTo(x + w, y + h - r);
        s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        s.lineTo(x + r, y + h);
        s.quadraticCurveTo(x, y + h, x, y + h - r);
        s.lineTo(x, y + r);
        s.quadraticCurveTo(x, y, x + r, y);
        return s;
      }
      function slab(w: number, h: number, d: number, r: number, b: number) {
        const g = new THREE.ExtrudeGeometry(rr(w, h, r), {
          depth: d,
          bevelEnabled: true,
          bevelThickness: b,
          bevelSize: b,
          bevelSegments: 5,
          curveSegments: 10,
        });
        g.center();
        g.rotateX(-Math.PI / 2);
        return g;
      }
      function mesh(g: any, m: any) {
        const o = new THREE.Mesh(g, m);
        o.castShadow = o.receiveShadow = true;
        return o;
      }

      // Table
      const T = new THREE.Group();
      S.add(T);
      const tabTop = mesh(slab(3.4, 1.8, 0.14, 0.16, 0.035), oak);
      T.add(tabTop);
      const legs: any[] = [];
      const ap: any[] = [];
      [
        [-1.4, -0.7],
        [1.4, -0.7],
        [-1.4, 0.7],
        [1.4, 0.7],
      ].forEach((p) => {
        const l = mesh(
          new THREE.CylinderGeometry(0.095, 0.055, 1.5, 40),
          walnut,
        );
        (l as any).userData.b = [p[0], 0.75, p[1]];
        T.add(l);
        legs.push(l);
      });
      [
        [0, -0.7, 2.8, 0.1, 0.08],
        [0, 0.7, 2.8, 0.1, 0.08],
      ].forEach((a) => {
        const b = mesh(new THREE.BoxGeometry(a[2], 0.16, 0.07), walnut);
        (b as any).userData.b = [a[0], 1.32, a[1]];
        T.add(b);
        ap.push(b);
      });
      [
        [-1.4, 0],
        [1.4, 0],
      ].forEach((a) => {
        const b = mesh(new THREE.BoxGeometry(0.07, 0.16, 1.4), walnut);
        (b as any).userData.b = [a[0], 1.32, a[1]];
        T.add(b);
        ap.push(b);
      });

      // Pile de planches
      const P = new THREE.Group();
      S.add(P);
      P.position.set(4.3, 0, -0.4);
      for (let i = 0; i < 6; i++) {
        const pl = mesh(slab(2.6, 0.7, 0.11, 0.03, 0.012), i % 2 ? raw : oak);
        pl.position.set(0, 0.07 + i * 0.145, 0);
        pl.rotation.y = (Math.random() - 0.5) * 0.25;
        P.add(pl);
      }

      // Copeaux
      const curls: any[] = [];
      function curl() {
        const n = 70;
        const v: number[] = [];
        const uv: number[] = [];
        const id: number[] = [];
        const r = 0.1 + Math.random() * 0.05;
        const w = 0.09 + Math.random() * 0.03;
        for (let i = 0; i <= n; i++) {
          const t = i / n;
          const a = t * Math.PI * 2 * (2 + Math.random() * 0);
          const cx = Math.cos(a) * r * (1 - t * 0.35);
          const cz = Math.sin(a) * r * (1 - t * 0.35);
          const cy = t * 0.42;
          v.push(cx, cy + w, cz, cx, cy - w, cz);
          uv.push(t, 0, t, 1);
          if (i < n) {
            const k = i * 2;
            id.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
          }
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
        g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
        g.setIndex(id);
        g.computeVertexNormals();
        const m = new THREE.Mesh(
          g,
          new THREE.MeshStandardMaterial({
            color: 0xe6bf88,
            roughness: 0.7,
            side: THREE.DoubleSide,
          }),
        );
        m.castShadow = true;
        return m;
      }
      for (let c = 0; c < 14; c++) {
        const cu = curl();
        const a = Math.random() * 6.28;
        const d = 2.4 + Math.random() * 2.6;
        cu.position.set(Math.cos(a) * d, 0.09, Math.sin(a) * d * 0.8);
        cu.rotation.set(
          (Math.random() - 0.5) * 1.2,
          Math.random() * 6,
          (Math.random() - 0.5) * 1.2,
        );
        cu.scale.setScalar(0.8 + Math.random() * 0.8);
        (cu as any).userData.s = Math.random() * 6;
        S.add(cu);
        curls.push(cu);
      }

      // Sol + éclairage
      const fl = new THREE.Mesh(
        new THREE.PlaneGeometry(60, 60),
        new THREE.ShadowMaterial({ opacity: 0.5 }),
      );
      fl.rotation.x = -Math.PI / 2;
      fl.receiveShadow = true;
      S.add(fl);

      const key = new THREE.DirectionalLight(0xffd9a8, 2.6);
      key.position.set(5, 9, 6);
      key.castShadow = true;
      key.shadow.mapSize.set(2048, 2048);
      const sc = key.shadow.camera;
      sc.left = sc.bottom = -8;
      sc.right = sc.top = 8;
      sc.near = 1;
      sc.far = 30;
      key.shadow.bias = -0.0004;
      key.shadow.normalBias = 0.02;
      key.shadow.radius = 5;
      S.add(key);

      const rim = new THREE.DirectionalLight(0xd9893b, 1.2);
      rim.position.set(-6, 3, -5);
      S.add(rim);

      // Poussière
      const dustGeo = (() => {
        const p = new Float32Array(300 * 3);
        for (let i = 0; i < p.length; i += 3) {
          p[i] = (Math.random() - 0.5) * 18;
          p[i + 1] = Math.random() * 7;
          p[i + 2] = (Math.random() - 0.5) * 14;
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.BufferAttribute(p, 3));
        return g;
      })();
      const dust = new THREE.Points(
        dustGeo,
        new THREE.PointsMaterial({
          color: 0xffd9a8,
          size: 0.03,
          transparent: true,
          opacity: 0.55,
          depthWrite: false,
        }),
      );
      S.add(dust);

      // Caméra
      type Vec3 = [number, number, number];

      type CameraKeyframe = [number, Vec3, Vec3];

      const KF: CameraKeyframe[] = [
        [0, [5.2, 2.8, 7.4], [0, 1.0, 0]],
        [0.25, [-3.6, 3.6, 5.6], [0, 1.7, 0]],
        [0.5, [0.6, 2.5, 2.6], [0, 1.45, 0]],
        [0.75, [6.4, 1.9, 4.2], [3, 0.5, -0.2]],
        [1, [4.2, 2.4, 8], [0, 1.0, 0]],
      ];
      function cam(p: number, mob: boolean): [Vec3, Vec3] {
        for (let i = 0; i < KF.length - 1; i++) {
          const a = KF[i];
          const b = KF[i + 1];

          if (p <= b[0]) {
            let t = (p - a[0]) / (b[0] - a[0]);
            t = t * t * (3 - 2 * t);

            const o: Vec3 = [
              a[1][0] + (b[1][0] - a[1][0]) * t,
              a[1][1] + (b[1][1] - a[1][1]) * t,
              a[1][2] + (b[1][2] - a[1][2]) * t,
            ];

            const l: Vec3 = [
              a[2][0] + (b[2][0] - a[2][0]) * t,
              a[2][1] + (b[2][1] - a[2][1]) * t,
              a[2][2] + (b[2][2] - a[2][2]) * t,
            ];

            if (mob) {
              o[0] *= 1.1;
              o[1] += 0.8;
              o[2] *= 1.5;
            }

            return [o, l];
          }
        }

        return [KF[4][1], KF[4][2]];
      }
      // Progress scroll
      let prog = 0;
      let sm = 0;
      let mx = 0;
      let my = 0;
      let smx = 0;
      let smy = 0;

      const st = ScrollTrigger.create({
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (s: any) => {
          prog = s.progress;
        },
      });

      const onPointer = (e: PointerEvent) => {
        mx = e.clientX / window.innerWidth - 0.5;
        my = e.clientY / window.innerHeight - 0.5;
      };
      window.addEventListener("pointermove", onPointer);

      const resize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        R.setSize(w, h, false);
        C.aspect = w / h;
        C.fov = w < 820 ? 48 : 36;
        C.updateProjectionMatrix();
      };
      window.addEventListener("resize", resize);
      resize();

      const clk = new THREE.Clock();
      let rafId = 0;

      const loop = () => {
        const t = clk.getElapsedTime();
        const mob = window.innerWidth < 820;
        sm += (prog - sm) * 0.055;
        smx += (mx - smx) * 0.04;
        smy += (my - smy) * 0.04;

        let e = Math.sin(
          Math.min(1, Math.max(0, (sm - 0.08) / 0.34)) * Math.PI,
        );
        e = e * e * (3 - 2 * e);

        tabTop.position.y = 1.5 + e * 1.5;
        tabTop.rotation.y = e * 0.5;
        legs.forEach((l) => {
          const b = l.userData.b;
          l.position.set(
            b[0] * (1 + e * 0.55),
            b[1] - e * 0.15,
            b[2] * (1 + e * 0.55),
          );
          l.rotation.z = -b[0] * e * 0.06;
        });
        ap.forEach((a) => {
          const b = a.userData.b;
          a.position.set(
            b[0] * (1 + e * 0.7),
            b[1] + e * 0.55,
            b[2] * (1 + e * 0.7),
          );
        });
        T.rotation.y = Math.sin(sm * Math.PI * 2) * 0.25 + t * 0.04;
        curls.forEach((c) => {
          c.position.y =
            0.09 + Math.max(0, Math.sin(t * 0.5 + c.userData.s)) * 0.08 * e;
          c.rotation.y += 0.0015;
        });

        const k = cam(sm, mob);
        C.position.set(k[0][0] + smx * 0.7, k[0][1] - smy * 0.4, k[0][2]);
        C.lookAt(k[1][0], k[1][1], k[1][2]);
        key.position.x = 5 + Math.sin(t * 0.2) * 0.8;
        dust.rotation.y = t * 0.01;
        dust.position.y = Math.sin(t * 0.3) * 0.15;

        R.render(S, C);
        rafId = requestAnimationFrame(loop);
      };
      loop();

      // Cleanup
      cleanup = () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener("pointermove", onPointer);
        window.removeEventListener("resize", resize);
        gsap.ticker.remove(tickerFn);
        st.kill();
        lenis.destroy();
        R.dispose();
      };
    })();

    return () => {
      cleanup?.();
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="pbd-gl" />
      <div className="pbd-fx pbd-vig" />
      <div className="pbd-fx pbd-grain" />
    </>
  );
}

/**
 * Injecte un script à la demande (une seule fois par URL).
 */
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Échec chargement: ${src}`));
    document.head.appendChild(s);
  });
}
