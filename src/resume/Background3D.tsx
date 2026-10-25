import { useEffect, useRef } from "react";
import * as THREE from "three";
import { orbitSkills } from "./data";

const ACCENT = new THREE.Color("#6b6ff5");
const CYAN = new THREE.Color("#56d4f5");

// A text label drawn to a canvas so it can live in the scene as a sprite.
// `highlight` draws the pill brighter for the hovered/tapped state.
function makeWordTexture(word: string, highlight: boolean) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const font = "600 44px Inter, 'Segoe UI', system-ui, sans-serif";
  ctx.font = font;
  const width = Math.ceil(ctx.measureText(word).width) + 48;
  canvas.width = width;
  canvas.height = 84;
  ctx.font = font;
  ctx.fillStyle = highlight ? "rgba(46, 50, 120, 0.92)" : "rgba(20, 22, 48, 0.72)";
  ctx.strokeStyle = highlight ? "rgba(120, 220, 255, 0.95)" : "rgba(140, 146, 255, 0.55)";
  ctx.lineWidth = highlight ? 3 : 2;
  ctx.beginPath();
  ctx.roundRect(1, 1, width - 2, 82, 41);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = highlight ? "#ffffff" : "#e8e9ff";
  ctx.textBaseline = "middle";
  ctx.fillText(word, 24, 44);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return { texture, width };
}

/**
 * Full-screen Three.js backdrop: a drifting star field, a wireframe "core" and
 * skill names orbiting it. The core is interactive — drag (mouse or touch) to
 * spin it, let go and it eases back to auto-rotate; hover or tap a skill to
 * highlight it and read a one-line detail. Scroll still pulls the camera
 * through the scene so the globe moves with the content.
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
    // Invisible sphere that gives the whole globe a generous grab target.
    const grab = new THREE.Mesh(
      new THREE.SphereGeometry(2.6, 16, 12),
      new THREE.MeshBasicMaterial({ visible: false }),
    );
    core.add(inner, shell, ring, grab);
    scene.add(core);

    // Orbiting skill labels, spread over a few tilted orbits. On narrow screens
    // the orbits pull in so labels don't run off the edge of the phone.
    const narrow = window.innerWidth < 700;
    const orbit = new THREE.Group();
    const words = orbitSkills.map((skill, i) => {
      const base = makeWordTexture(skill.name, false);
      const hot = makeWordTexture(skill.name, true);
      const material = new THREE.SpriteMaterial({ map: base.texture, transparent: true, depthWrite: false });
      const sprite = new THREE.Sprite(material);
      const scale = 0.0042;
      const baseScale = new THREE.Vector2(base.width * scale, 84 * scale);
      sprite.scale.set(baseScale.x, baseScale.y, 1);
      sprite.userData.index = i;
      orbit.add(sprite);
      const lane = i % 3;
      return {
        sprite,
        material,
        baseTex: base.texture,
        hotTex: hot.texture,
        baseScale,
        radius: (narrow ? 2.2 : 3) + lane * (narrow ? 0.4 : 0.55),
        tilt: (lane - 1) * 0.45,
        speed: 0.12 + lane * 0.03,
        offset: (i / orbitSkills.length) * Math.PI * 2,
        hover: 0, // eased 0..1 highlight factor
        hot: false,
      };
    });
    core.add(orbit);

    // Tooltip shown next to the highlighted skill (lives above the canvas).
    const tip = document.createElement("div");
    tip.className = "skill-tip";
    tip.setAttribute("role", "status");
    tip.setAttribute("aria-live", "polite");
    host.appendChild(tip);
    let tipName = "";
    let tipDetail = "";
    const setTip = (name: string, detail: string) => {
      if (name === tipName) return;
      tipName = name;
      tipDetail = detail;
      if (name) {
        tip.innerHTML = `<strong>${name}</strong><span>${detail}</span>`;
        tip.classList.add("on");
      } else {
        tip.classList.remove("on");
      }
    };

    // Input state.
    const parallax = { x: 0, y: 0, tx: 0, ty: 0 }; // gentle star drift only
    const ndc = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    let yaw = 0; // accumulated spin (auto + drag)
    let pitch = 0; // vertical lean from drag, eases back to level
    let dragging = false;
    let moved = 0;
    let lastX = 0;
    let lastY = 0;
    let idleUntil = 0; // auto-rotate pauses until this time after a drag
    let activeType = ""; // pointerType that owns the current gesture
    let locked = -1; // skill locked on by a tap (mobile)

    const setNdc = (clientX: number, clientY: number) => {
      ndc.x = (clientX / window.innerWidth) * 2 - 1;
      ndc.y = -((clientY / window.innerHeight) * 2 - 1);
    };

    // Returns the skill sprite index under the pointer, or -1.
    const pick = () => {
      core.updateMatrixWorld(true);
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObjects(words.map((w) => w.sprite), false);
      return hits.length ? (hits[0].object.userData.index as number) : -1;
    };

    // True if the pointer is over the globe at all (sprites or grab sphere).
    const overGlobe = () => {
      core.updateMatrixWorld(true);
      raycaster.setFromCamera(ndc, camera);
      return raycaster.intersectObjects([grab, ...words.map((w) => w.sprite)], false).length > 0;
    };

    // The globe sits behind the content as you scroll, so only presses on empty
    // background may grab it; text, panels and links keep scroll and selection.
    const onBackground = (e: PointerEvent) => {
      const el = e.target as Element;
      return el === document.body || el.matches(".page, .hero");
    };

    const onPointerDown = (e: PointerEvent) => {
      setNdc(e.clientX, e.clientY);
      if (!onBackground(e) || !overGlobe()) return; // leave page scroll / clicks untouched
      e.preventDefault(); // don't start a text selection when grabbing the globe
      dragging = true;
      moved = 0;
      lastX = e.clientX;
      lastY = e.clientY;
      activeType = e.pointerType;
      // Non-passive only for the length of the drag, so normal scrolling never waits on JS.
      window.addEventListener("touchmove", onTouchMove, { passive: false });
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
    };

    const onPointerMove = (e: PointerEvent) => {
      parallax.tx = (e.clientX / window.innerWidth) * 2 - 1;
      parallax.ty = (e.clientY / window.innerHeight) * 2 - 1;
      setNdc(e.clientX, e.clientY);

      if (dragging) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        moved += Math.abs(dx) + Math.abs(dy);
        yaw += dx * 0.006;
        pitch = THREE.MathUtils.clamp(pitch + dy * 0.006, -0.7, 0.7);
        idleUntil = performance.now() + 1200;
        invalidate();
        return;
      }

      if (e.pointerType === "mouse") {
        // Hover highlight (mouse only — touch uses tap); none over content.
        if (!onBackground(e)) {
          document.body.style.cursor = "";
          setHot(-1);
          return;
        }
        const idx = pick();
        document.body.style.cursor = idx >= 0 || overGlobe() ? "grab" : "";
        setHot(idx);
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      window.removeEventListener("touchmove", onTouchMove);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      // A tap that barely moved toggles the skill under it (handy on touch).
      if (moved < 6) {
        setNdc(e.clientX, e.clientY);
        const idx = pick();
        if (idx >= 0) {
          locked = locked === idx ? -1 : idx;
          setHot(locked);
        } else {
          locked = -1;
          setHot(-1);
        }
      }
      invalidate();
    };

    // Stop the page from scrolling only while a touch drag owns the globe.
    const onTouchMove = (e: TouchEvent) => {
      if (dragging && activeType === "touch") e.preventDefault();
    };

    // Marks `idx` as the highlighted skill (or -1 for none).
    let hotIndex = -1;
    const setHot = (idx: number) => {
      const target = idx >= 0 ? idx : locked;
      if (target === hotIndex) return;
      hotIndex = target;
      words.forEach((w, i) => {
        w.hot = i === target;
      });
      if (target >= 0) setTip(orbitSkills[target].name, orbitSkills[target].detail);
      else setTip("", "");
      invalidate();
    };

    // Keyboard: arrows spin/lean the globe, Enter cycles the highlighted skill.
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") yaw -= 0.2;
      else if (e.key === "ArrowRight") yaw += 0.2;
      else if (e.key === "ArrowUp") pitch = THREE.MathUtils.clamp(pitch - 0.15, -0.7, 0.7);
      else if (e.key === "ArrowDown") pitch = THREE.MathUtils.clamp(pitch + 0.15, -0.7, 0.7);
      else if (e.key === "Enter" || e.key === " ") {
        locked = (locked + 1) % orbitSkills.length;
        setHot(locked);
      } else return;
      e.preventDefault();
      idleUntil = performance.now() + 1200;
      invalidate();
    };

    let scrollTarget = 0;
    let scroll = 0;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollTarget = max > 0 ? window.scrollY / max : 0;
      invalidate();
    };
    const onResize = () => {
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(host.clientWidth, host.clientHeight);
      invalidate();
    };

    window.addEventListener("pointerdown", onPointerDown, { passive: false });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    host.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    const project = new THREE.Vector3();

    const renderFrame = () => {
      const dt = clock.getDelta();
      const t = reduceMotion ? 0 : clock.getElapsedTime();
      const ease = reduceMotion ? 1 : 0.08;
      parallax.x += (parallax.tx - parallax.x) * (reduceMotion ? 1 : 0.06);
      parallax.y += (parallax.ty - parallax.y) * (reduceMotion ? 1 : 0.06);
      scroll += (scrollTarget - scroll) * ease;

      // Spin: auto-rotate unless reduced-motion, dragging, or just released.
      const autoRotate = !reduceMotion && !dragging && performance.now() > idleUntil;
      if (autoRotate) yaw += dt * 0.18;
      if (!dragging) pitch *= reduceMotion ? 1 : 0.96; // relax the lean back to level

      const wide = camera.aspect > 1.1;
      // Core sits right of the hero on wide screens, then drifts as you read.
      // On phones it shrinks and floats above the photo instead.
      core.scale.setScalar(wide ? 1 : 0.55);
      core.position.x = wide ? 2.6 - scroll * 5.2 : 0;
      core.position.y = wide ? 0.2 + Math.sin(scroll * Math.PI) * 0.6 : 2.7 - scroll * 3.5;
      core.rotation.y = yaw + scroll * Math.PI * 1.5;
      core.rotation.x = pitch + Math.sin(t * 0.3) * 0.08 + scroll * 0.5;
      inner.rotation.y = -t * 0.4;
      shell.rotation.z = t * 0.05;
      ring.rotation.z = t * 0.3;

      const halfH = window.innerHeight / 2;
      const halfW = window.innerWidth / 2;
      let tipSprite: (typeof words)[number] | null = null;
      for (const w of words) {
        const a = w.offset + t * w.speed;
        w.sprite.position.set(
          Math.cos(a) * w.radius,
          Math.sin(a) * w.radius * Math.sin(w.tilt) + w.tilt,
          Math.sin(a) * w.radius * Math.cos(w.tilt),
        );
        // Ease the highlight and swap texture / scale for the hot label.
        const prevHover = w.hover;
        w.hover += ((w.hot ? 1 : 0) - w.hover) * (reduceMotion ? 1 : 0.2);
        const wantHot = w.hover > 0.5;
        if ((w.material.map === w.baseTex) === wantHot) {
          w.material.map = wantHot ? w.hotTex : w.baseTex;
          w.material.needsUpdate = true;
        }
        const bump = 1 + w.hover * 0.45;
        w.sprite.scale.set(w.baseScale.x * bump, w.baseScale.y * bump, 1);
        if (Math.abs(w.hover - prevHover) > 0.001) invalidate();

        // Depth fade as a word passes behind the core.
        let opacity = 0.35 + 0.65 * ((Math.sin(a) + 1) / 2);
        // Fade any label drifting past the screen edge so nothing is clipped.
        project.copy(w.sprite.position).applyMatrix4(core.matrixWorld).project(camera);
        const margin = 0.82;
        if (Math.abs(project.x) > margin) {
          opacity *= Math.max(0, 1 - (Math.abs(project.x) - margin) / 0.18);
        }
        w.material.opacity = w.hot ? Math.max(opacity, 0.95) : opacity;
        if (w.hot) tipSprite = w;
      }

      // Position the tooltip beside the highlighted label.
      if (tipSprite && tipName) {
        project.copy(tipSprite.sprite.position).applyMatrix4(core.matrixWorld).project(camera);
        const sx = project.x * halfW + halfW;
        const sy = -project.y * halfH + halfH;
        tip.style.transform = `translate(-50%, -100%) translate(${sx}px, ${sy - 44}px)`;
      }

      stars.rotation.y = t * 0.01 + parallax.x * 0.05;
      stars.rotation.x = parallax.y * 0.03;
      camera.position.z = 9 - scroll * 2.5;
      camera.position.y = -scroll * 1.2;
      camera.lookAt(0, camera.position.y * 0.5, 0);

      renderer.render(scene, camera);
    };

    // Continuous loop when motion is allowed; otherwise render on demand.
    let rafId = 0;
    let scheduled = false;
    const loop = () => {
      renderFrame();
      rafId = requestAnimationFrame(loop);
    };
    const invalidate = () => {
      if (!reduceMotion || scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        renderFrame();
      });
    };

    const start = () => {
      if (reduceMotion) {
        renderFrame();
      } else if (!rafId) {
        clock.start();
        loop();
      }
    };
    const stop = () => {
      cancelAnimationFrame(rafId);
      rafId = 0;
    };

    // Only animate while the tab is visible.
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener("visibilitychange", onVisibility);
    onScroll(); // safe now: invalidate is initialized
    start();

    return () => {
      stop();
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      document.body.style.cursor = "";
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("touchmove", onTouchMove);
      host.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      document.body.style.userSelect = "";
      tip.remove();
      for (const w of words) {
        w.baseTex.dispose();
        w.hotTex.dispose();
      }
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

  return (
    <div
      ref={hostRef}
      className="bg3d"
      role="application"
      tabIndex={0}
      aria-label="Interactive skill globe. Drag to spin, hover or tap a skill for detail, use arrow keys to rotate."
    />
  );
}
