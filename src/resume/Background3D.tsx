import { useEffect, useRef } from "react";
import * as THREE from "three";
import { orbitWords } from "./data";

const ACCENT = new THREE.Color("#6b6ff5");
const CYAN = new THREE.Color("#56d4f5");

// A text label drawn to a canvas so it can live in the scene as a sprite.
function makeWordSprite(word: string) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const font = "600 44px Inter, 'Segoe UI', system-ui, sans-serif";
  ctx.font = font;
  const width = Math.ceil(ctx.measureText(word).width) + 48;
  canvas.width = width;
  canvas.height = 84;
  ctx.font = font;
  ctx.fillStyle = "rgba(20, 22, 48, 0.72)";
  ctx.strokeStyle = "rgba(140, 146, 255, 0.55)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(1, 1, width - 2, 82, 41);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#e8e9ff";
  ctx.textBaseline = "middle";
  ctx.fillText(word, 24, 44);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
  const scale = 0.0042;
  sprite.scale.set(width * scale, 84 * scale, 1);
  return sprite;
}

/**
 * Full-screen Three.js backdrop: a drifting star field, a wireframe "core" that
 * leans toward the pointer, and skill names orbiting it. Scroll progress pulls the
 * camera through the scene and slides the core aside so the content stays readable.
 */
export function Background3D() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070814, 0.045);
    const camera = new THREE.PerspectiveCamera(50, host.clientWidth / host.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 9);

    scene.add(new THREE.AmbientLight(0x8088ff, 0.5));
    const key = new THREE.PointLight(0x9aa0ff, 60, 30);
    key.position.set(4, 5, 6);
    scene.add(key);
    const rim = new THREE.PointLight(0x56d4f5, 40, 30);
    rim.position.set(-5, -3, 2);
    scene.add(rim);

    // Star field.
    const starCount = window.innerWidth < 700 ? 1400 : 2600;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const tmp = new THREE.Color();
    for (let i = 0; i < starCount; i += 1) {
      const r = 6 + Math.random() * 30;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi) - 10;
      tmp.copy(ACCENT).lerp(CYAN, Math.random()).multiplyScalar(0.6 + Math.random() * 0.6);
      colors.set([tmp.r, tmp.g, tmp.b], i * 3);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ size: 0.06, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false }),
    );
    scene.add(stars);

    // Core: solid inner shape + wireframe shell + a thin ring.
    const core = new THREE.Group();
    const inner = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.15, 1),
      new THREE.MeshStandardMaterial({ color: 0x23266b, emissive: 0x2b2f9a, emissiveIntensity: 0.6, metalness: 0.6, roughness: 0.25, flatShading: true }),
    );
    const shell = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.7, 2)),
      new THREE.LineBasicMaterial({ color: 0x8c92ff, transparent: true, opacity: 0.45 }),
    );
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.35, 0.012, 8, 180),
      new THREE.MeshBasicMaterial({ color: 0x56d4f5, transparent: true, opacity: 0.6 }),
    );
    ring.rotation.x = Math.PI / 2.4;
    core.add(inner, shell, ring);
    scene.add(core);

    // Orbiting skill words, spread over a few tilted orbits.
    const orbit = new THREE.Group();
    const words = orbitWords.map((word, i) => {
      const sprite = makeWordSprite(word);
      const lane = i % 3;
      orbit.add(sprite);
      return {
        sprite,
        radius: 3 + lane * 0.55,
        tilt: (lane - 1) * 0.45,
        speed: 0.12 + lane * 0.03,
        offset: (i / orbitWords.length) * Math.PI * 2,
      };
    });
    core.add(orbit);

    // Input.
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointer = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    let scrollTarget = 0;
    let scroll = 0;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollTarget = max > 0 ? window.scrollY / max : 0;
    };
    const onResize = () => {
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(host.clientWidth, host.clientHeight);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    onScroll();

    const clock = new THREE.Clock();
    let frame = 0;
    const render = () => {
      const t = reduceMotion ? 0 : clock.getElapsedTime();
      const ease = reduceMotion ? 1 : 0.06;
      pointer.x += (pointer.tx - pointer.x) * ease;
      pointer.y += (pointer.ty - pointer.y) * ease;
      scroll += (scrollTarget - scroll) * ease;

      const wide = camera.aspect > 1.1;
      // Core sits right of the hero on wide screens, then drifts as you read.
      // On phones it shrinks and floats above the photo instead.
      core.scale.setScalar(wide ? 1 : 0.55);
      core.position.x = wide ? 2.6 - scroll * 5.2 : 0;
      core.position.y = wide ? 0.2 + Math.sin(scroll * Math.PI) * 0.6 : 2.7 - scroll * 3.5;
      core.rotation.y = t * 0.18 + pointer.x * 0.5 + scroll * Math.PI * 1.5;
      core.rotation.x = pointer.y * 0.35 + Math.sin(t * 0.3) * 0.1;
      inner.rotation.y = -t * 0.4;
      shell.rotation.z = t * 0.05;
      ring.rotation.z = t * 0.3;

      for (const w of words) {
        const a = w.offset + t * w.speed;
        w.sprite.position.set(Math.cos(a) * w.radius, Math.sin(a) * w.radius * Math.sin(w.tilt) + w.tilt, Math.sin(a) * w.radius * Math.cos(w.tilt));
        // Fade words that pass behind the core.
        (w.sprite.material as THREE.SpriteMaterial).opacity = 0.35 + 0.65 * ((Math.sin(a) + 1) / 2);
      }

      stars.rotation.y = t * 0.01 + pointer.x * 0.05;
      stars.rotation.x = pointer.y * 0.03;
      camera.position.z = 9 - scroll * 2.5;
      camera.position.y = -scroll * 1.2;
      camera.lookAt(0, camera.position.y * 0.5, 0);

      renderer.render(scene, camera);
      if (!reduceMotion) frame = requestAnimationFrame(render);
    };

    // Only animate while the tab is visible.
    const onVisibility = () => {
      cancelAnimationFrame(frame);
      if (!document.hidden) {
        clock.start();
        render();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    render();
    if (reduceMotion) window.addEventListener("scroll", render, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", render);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        for (const m of Array.isArray(mat) ? mat : mat ? [mat] : []) {
          (m as THREE.SpriteMaterial).map?.dispose();
          m.dispose();
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={hostRef} className="bg3d" aria-hidden="true" />;
}
