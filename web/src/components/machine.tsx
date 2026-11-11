"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { Mesh, MeshStandardMaterial, PointLight } from "three";

export type Well = {
  id: string;
  label: string;
  insurance: number;
  paid: number;
  cut: number;
  win: number;
};

type Props = {
  attempt: number;
  applied: number;
  anchor: number;
  blocked: boolean;
  assetId: string;
  wells: Well[];
  onAttempt: (mark: number) => void;
  onSelect: (id: string) => void;
};

const MARK_MIN = 70;
const MARK_MAX = 130;
const TUBE_H = 1.9;
const BASE_Y = 0.46;
const SLOT_X0 = -1.45;
const SLOT_W = 2.9;
const SLOT_Z = 1.28;

const SPOTS = [
  { x: -1.62, z: 0.22 },
  { x: -0.54, z: -0.02 },
  { x: 0.54, z: -0.02 },
  { x: 1.62, z: 0.22 },
] as const;

function markToX(mark: number) {
  return SLOT_X0 + ((mark - MARK_MIN) / (MARK_MAX - MARK_MIN)) * SLOT_W;
}

function atoms(n: number) {
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}

export function Machine({ attempt, applied, anchor, blocked, assetId, wells, onAttempt, onSelect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const live = useRef({ attempt, applied, anchor, blocked, assetId, wells, onAttempt, onSelect });
  live.current = { attempt, applied, anchor, blocked, assetId, wells, onAttempt, onSelect };
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let dead = false;
    const handle = { dispose: () => {} };

    void (async () => {
      const THREE = await import("three");
      const { OrbitControls } = await import("three/addons/controls/OrbitControls.js");
      if (dead) return;
      handle.dispose = mount(THREE, OrbitControls, canvas, labelRefs, live, pausedRef);
    })();

    return () => {
      dead = true;
      handle.dispose();
    };
  }, []);

  return (
    <div className="relative mx-auto w-full">
      <canvas
        ref={canvasRef}
        className="block h-[min(52vh,520px)] min-h-[380px] w-full touch-none lg:h-[min(64vh,600px)] lg:min-h-[480px]"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0" role="listbox" aria-label="Assets in the account">
        {wells.map((well, index) => {
          const on = well.id === assetId;
          const note = well.win === 0 ? atoms(well.insurance) : well.cut === 0 ? "pays" : `cut ${atoms(well.cut)}`;
          const noteClass = well.win === 0 ? "text-muted-foreground" : well.cut === 0 ? "text-[#14F195]" : "text-[#9945FF]";
          return (
            <button
              key={well.id}
              ref={(node) => {
                labelRefs.current[index] = node;
                if (node && node.style.visibility === "") node.style.visibility = "hidden";
              }}
              type="button"
              role="option"
              aria-selected={on}
              onClick={() => onSelect(well.id)}
              className={`pointer-events-auto absolute top-0 left-0 text-center focus-visible:ring-2 focus-visible:ring-[#14F195] focus-visible:outline-none ${
                on ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="block text-[13px] tracking-[0.04em]">{well.label}</span>
              <span className={`block text-[12px] tabular-nums ${noteClass}`}>{note}</span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        aria-pressed={paused}
        aria-label={paused ? "Play the glass" : "Pause the glass"}
        onClick={() => {
          pausedRef.current = !pausedRef.current;
          setPaused(pausedRef.current);
        }}
        className="absolute right-2 bottom-2 grid size-9 place-items-center rounded-full border border-white/15 bg-black/30 text-white/55 backdrop-blur-md hover:text-white focus-visible:ring-2 focus-visible:ring-[#14F195] focus-visible:outline-none"
      >
        {paused ? (
          <span className="ml-0.5 border-y-[5px] border-l-8 border-y-transparent border-l-current" />
        ) : (
          <span className="flex gap-[3px]" aria-hidden>
            <i className="block h-3 w-[2px] bg-current" />
            <i className="block h-3 w-[2px] bg-current" />
          </span>
        )}
      </button>
    </div>
  );
}

function mount(
  THREE: typeof import("three"),
  OrbitControlsCtor: typeof OrbitControls,
  canvas: HTMLCanvasElement,
  labelRefs: RefObject<(HTMLButtonElement | null)[]>,
  live: RefObject<Props>,
  pausedRef: RefObject<boolean>,
) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 40);
  camera.position.set(0.1, 2.85, 8.8);

  const controls = new OrbitControlsCtor(camera, canvas);
  controls.target.set(0, 1.02, 0.02);
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.enableDamping = !reduce;
  controls.dampingFactor = 0.08;
  controls.rotateSpeed = 0.55;
  controls.autoRotate = false;
  controls.autoRotateSpeed = 0.35;
  controls.minPolarAngle = 0.95;
  controls.maxPolarAngle = 1.34;
  controls.minAzimuthAngle = -0.7;
  controls.maxAzimuthAngle = 0.7;

  scene.add(new THREE.AmbientLight(0xc8c2d8, 0.55));
  const key = new THREE.DirectionalLight(0xfff4ea, 2.4);
  key.position.set(3.5, 7.5, 4.5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 20;
  key.shadow.camera.left = -5;
  key.shadow.camera.right = 5;
  key.shadow.camera.top = 5;
  key.shadow.camera.bottom = -5;
  scene.add(key);
  const violet = new THREE.DirectionalLight(0x9945ff, 1.6);
  violet.position.set(-2.5, 5.5, -3);
  scene.add(violet);
  const mint = new THREE.DirectionalLight(0x14f195, 0.7);
  mint.position.set(4, 2, 2);
  scene.add(mint);

  const env = makeEnv(THREE, renderer);
  scene.environment = env;

  const disposables: { dispose: () => void }[] = [env];

  const shadow = disc(THREE, 4.6, "rgba(0,0,0,0.45)", "rgba(0,0,0,0)");
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.01;
  scene.add(shadow);
  disposables.push(shadow.geometry, shadow.material);

  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(2.45, 2.52, 0.28, 80),
    new THREE.MeshStandardMaterial({ color: 0x121018, metalness: 0.9, roughness: 0.18 }),
  );
  plinth.position.y = 0.16;
  plinth.receiveShadow = true;
  plinth.castShadow = true;
  scene.add(plinth);
  disposables.push(plinth.geometry, plinth.material);

  const slot = new THREE.Mesh(
    new THREE.BoxGeometry(SLOT_W, 0.045, 0.14),
    new THREE.MeshStandardMaterial({ color: 0x221c2c, metalness: 0.5, roughness: 0.4 }),
  );
  slot.position.set(0, 0.34, SLOT_Z);
  scene.add(slot);
  disposables.push(slot.geometry, slot.material);

  const cap = new THREE.Mesh(
    new THREE.BoxGeometry(1, 0.05, 0.16),
    new THREE.MeshBasicMaterial({ color: 0x9945ff, transparent: true, opacity: 0.55 }),
  );
  cap.position.set(0, 0.345, SLOT_Z);
  scene.add(cap);
  disposables.push(cap.geometry, cap.material);

  const entry = new THREE.Mesh(
    new THREE.BoxGeometry(0.018, 0.02, 0.14),
    new THREE.MeshBasicMaterial({ color: 0x14f195 }),
  );
  entry.position.set(markToX(100), 0.355, SLOT_Z);
  scene.add(entry);
  disposables.push(entry.geometry, entry.material);

  const bead = new THREE.Mesh(
    new THREE.SphereGeometry(0.085, 24, 16),
    new THREE.MeshStandardMaterial({ color: 0x14f195, emissive: 0x14f195, emissiveIntensity: 0.8, roughness: 0.25 }),
  );
  bead.castShadow = true;
  scene.add(bead);
  disposables.push(bead.geometry, bead.material);

  const hold = new THREE.Mesh(
    new THREE.SphereGeometry(0.035, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0x14f195 }),
  );
  scene.add(hold);
  disposables.push(hold.geometry, hold.material);

  const heatHit = new THREE.Mesh(
    new THREE.BoxGeometry(SLOT_W + 0.4, 0.7, 0.8),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  heatHit.position.set(0, 0.45, SLOT_Z);
  heatHit.userData.kind = "heat";
  scene.add(heatHit);

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xe7eef4,
    transparent: true,
    opacity: 0.3,
    roughness: 0.05,
    metalness: 0,
    transmission: 0.62,
    thickness: 0.45,
    ior: 1.45,
    envMapIntensity: 1.8,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  disposables.push(glassMat);

  const brass = new THREE.MeshStandardMaterial({ color: 0xa07a45, metalness: 1, roughness: 0.28 });
  disposables.push(brass);

  type Column = {
    glass: Mesh;
    green: Mesh;
    purple: Mesh;
    greenMat: MeshStandardMaterial;
    purpleMat: MeshStandardMaterial;
    meniscus: Mesh;
    meniscusMat: MeshStandardMaterial;
    rimMat: MeshStandardMaterial;
    lamp: PointLight;
    g: number;
    p: number;
    bubbles: { mesh: Mesh; y: number; speed: number; phase: number }[];
  };

  const columns: Column[] = SPOTS.map((spot, index) => {
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, TUBE_H, 40, 1, true), glassMat);
    glass.position.set(spot.x, BASE_Y + TUBE_H / 2, spot.z);
    glass.userData.kind = "well";
    glass.userData.index = index;
    scene.add(glass);

    const sheen = new THREE.Mesh(
      new THREE.BoxGeometry(0.016, TUBE_H * 0.78, 0.016),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 }),
    );
    sheen.position.set(spot.x - 0.2, BASE_Y + TUBE_H * 0.52, spot.z + 0.16);
    scene.add(sheen);
    disposables.push(sheen.geometry, sheen.material);

    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.36, 0.09, 28), brass);
    collar.position.set(spot.x, BASE_Y + 0.02, spot.z);
    collar.castShadow = true;
    scene.add(collar);

    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.15,
      metalness: 0.4,
      roughness: 0.3,
    });
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.012, 10, 36), rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.set(spot.x, BASE_Y + TUBE_H, spot.z);
    scene.add(rim);
    disposables.push(rim.geometry, rimMat);

    const greenMat = new THREE.MeshStandardMaterial({
      color: 0x083226,
      emissive: 0x14f195,
      emissiveIntensity: 0.7,
      roughness: 0.28,
      metalness: 0.04,
    });
    const purpleMat = new THREE.MeshStandardMaterial({
      color: 0x241038,
      emissive: 0x9945ff,
      emissiveIntensity: 0.75,
      roughness: 0.3,
      metalness: 0.04,
    });
    const green = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 1, 32), greenMat);
    const purple = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 1, 32), purpleMat);
    green.userData.index = index;
    purple.userData.index = index;
    green.castShadow = true;
    purple.castShadow = true;
    scene.add(green, purple);
    disposables.push(green.geometry, purple.geometry, greenMat, purpleMat);

    const meniscusMat = new THREE.MeshStandardMaterial({
      color: 0xd8fff0,
      emissive: 0x14f195,
      emissiveIntensity: 0.4,
      roughness: 0.15,
    });
    const meniscus = new THREE.Mesh(new THREE.CircleGeometry(0.23, 28), meniscusMat);
    meniscus.rotation.x = -Math.PI / 2;
    scene.add(meniscus);
    disposables.push(meniscus.geometry, meniscusMat);

    const lamp = new THREE.PointLight(0x14f195, 0.4, 1.8);
    lamp.position.set(spot.x, BASE_Y + 0.7, spot.z);
    scene.add(lamp);

    const bubbles = Array.from({ length: 5 }, (_, n) => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.028 + (n % 3) * 0.008, 10, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.38 }),
      );
      scene.add(mesh);
      return { mesh, y: BASE_Y + 0.1 + n * 0.28, speed: 0.18 + (n % 4) * 0.07, phase: n * 1.3 + spot.x };
    });
    disposables.push(bubbles[0].mesh.geometry, bubbles[0].mesh.material);

    return { glass, green, purple, greenMat, purpleMat, meniscus, meniscusMat, rimMat, lamp, g: 0.2, p: 0, bubbles };
  });

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const heatPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.36);
  const hitPoint = new THREE.Vector3();
  const pickables = [heatHit, ...columns.flatMap((column) => [column.glass, column.green, column.purple])];

  let heatDrag = false;
  let arm: { id: string; x: number; y: number } | null = null;
  let clock = performance.now();

  function setPointer(event: PointerEvent) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  function pick(event: PointerEvent) {
    setPointer(event);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(pickables, false);
    return hits[0]?.object ?? null;
  }

  function markFromEvent(event: PointerEvent) {
    setPointer(event);
    raycaster.setFromCamera(pointer, camera);
    if (!raycaster.ray.intersectPlane(heatPlane, hitPoint)) return;
    const u = (hitPoint.x - SLOT_X0) / SLOT_W;
    const mark = Math.round(MARK_MIN + Math.min(1, Math.max(0, u)) * (MARK_MAX - MARK_MIN));
    live.current.onAttempt(mark);
  }

  function onDown(event: PointerEvent) {
    const obj = pick(event);
    if (obj?.userData.kind === "heat") {
      event.stopPropagation();
      heatDrag = true;
      canvas.setPointerCapture(event.pointerId);
      markFromEvent(event);
      return;
    }
    const index = obj?.userData.index;
    if (typeof index === "number") {
      const id = live.current.wells[index]?.id;
      if (id) arm = { id, x: event.clientX, y: event.clientY };
    } else {
      arm = null;
    }
  }

  function onMove(event: PointerEvent) {
    if (heatDrag) {
      markFromEvent(event);
      return;
    }
    const obj = pick(event);
    canvas.style.cursor = obj?.userData.kind === "heat" ? "ew-resize" : "grab";
  }

  function onUp(event: PointerEvent) {
    if (arm && Math.hypot(event.clientX - arm.x, event.clientY - arm.y) < 7) {
      live.current.onSelect(arm.id);
    }
    arm = null;
    heatDrag = false;
  }

  canvas.addEventListener("pointerdown", onDown, true);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);

  function resize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (width < 2 || height < 2) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);

  const top = new THREE.Vector3();

  function frame(now: number) {
    const dt = Math.min(0.05, (now - clock) / 1000);
    clock = now;
    const props = live.current;
    const still = reduce || pausedRef.current;
    controls.autoRotate = false;
    controls.update();

    const lo = Math.max(MARK_MIN, props.anchor - 6);
    const hi = Math.min(MARK_MAX, props.anchor + 6);
    cap.position.x = markToX((lo + hi) / 2);
    cap.scale.x = ((hi - lo) / (MARK_MAX - MARK_MIN)) * SLOT_W;

    const beadMat = bead.material as MeshStandardMaterial;
    bead.position.set(markToX(props.attempt), 0.5, SLOT_Z);
    beadMat.color.set(props.blocked ? 0x9945ff : 0x14f195);
    beadMat.emissive.set(props.blocked ? 0x9945ff : 0x14f195);
    const pulse = still || props.blocked ? 1 : 1 + Math.sin(now / 420) * 0.08;
    bead.scale.setScalar(pulse);

    hold.visible = props.blocked;
    hold.position.set(markToX(props.applied), 0.42, SLOT_Z);

    props.wells.forEach((well, index) => {
      const column = columns[index];
      const spot = SPOTS[index];
      const quiet = well.win === 0;
      const targetG = quiet ? (well.insurance / 100_000) * (TUBE_H - 0.18) : (well.paid / well.win) * (TUBE_H - 0.18);
      const targetP = quiet ? 0 : ((well.win - well.paid) / well.win) * (TUBE_H - 0.18);
      const k = still ? 1 : 1 - Math.exp(-dt * 5.5);
      column.g += (targetG - column.g) * k;
      column.p += (targetP - column.p) * k;

      placeLiquid(column.green, spot.x, spot.z, BASE_Y + 0.08, column.g);
      placeLiquid(column.purple, spot.x, spot.z, BASE_Y + 0.08 + column.g, column.p);

      const selected = well.id === props.assetId;
      column.greenMat.emissiveIntensity = quiet ? 0.22 : 0.85;
      column.greenMat.emissive.set(quiet ? 0x8ee0c4 : 0x14f195);
      column.rimMat.emissive.set(selected ? 0x14f195 : 0xffffff);
      column.rimMat.emissiveIntensity = selected ? 0.9 : 0.12;

      const topH = column.g + column.p;
      column.meniscus.visible = topH > 0.04;
      column.meniscus.position.set(spot.x, BASE_Y + 0.08 + topH, spot.z);
      column.meniscusMat.emissive.set(!quiet && column.p > 0.02 ? 0x9945ff : 0x14f195);
      column.meniscusMat.color.set(!quiet && column.p > 0.02 ? 0xe6d4ff : 0xe7fff6);

      const hot = quiet ? 0.15 : 0.35 + Math.min(1, topH / TUBE_H) * 1.3;
      column.lamp.color.set(!quiet && column.p > column.g ? 0x9945ff : 0x14f195);
      column.lamp.intensity = hot;
      column.lamp.position.y = BASE_Y + 0.2 + topH * 0.45;

      const ceiling = BASE_Y + 0.08 + Math.max(0.05, topH);
      column.bubbles.forEach((bubble) => {
        if (!still && topH > 0.08) {
          bubble.y += bubble.speed * dt * (quiet ? 1 : 2.4);
          if (bubble.y > ceiling) bubble.y = BASE_Y + 0.1;
        }
        const sway = Math.sin(now / 700 + bubble.phase) * 0.03;
        bubble.mesh.position.set(spot.x + sway, bubble.y, spot.z);
        bubble.mesh.visible = topH > 0.08 && bubble.y < ceiling - 0.02;
      });

      const label = labelRefs.current[index];
      if (!label) return;
      top.set(spot.x, BASE_Y + TUBE_H + 0.16, spot.z);
      top.project(camera);
      if (top.z > 1) {
        label.style.visibility = "hidden";
        return;
      }
      const x = (top.x * 0.5 + 0.5) * canvas.clientWidth;
      const y = (-top.y * 0.5 + 0.5) * canvas.clientHeight;
      label.style.visibility = "visible";
      label.style.transform = `translate(-50%, -115%) translate(${x}px, ${y}px)`;
    });

    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(frame);

  return () => {
    renderer.setAnimationLoop(null);
    canvas.removeEventListener("pointerdown", onDown, true);
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerup", onUp);
    canvas.removeEventListener("pointercancel", onUp);
    observer.disconnect();
    controls.dispose();
    disposables.forEach((item) => item.dispose());
    columns.forEach((column) => {
      column.bubbles.forEach((bubble) => bubble.mesh.geometry.dispose());
    });
    renderer.dispose();
    scene.clear();
  };
}

function placeLiquid(mesh: Mesh, x: number, z: number, y0: number, height: number) {
  mesh.visible = height > 0.025;
  mesh.scale.y = Math.max(height, 0.001);
  mesh.position.set(x, y0 + height / 2, z);
}

function disc(
  THREE: typeof import("three"),
  radius: number,
  inner: string,
  outer: string,
) {
  const paint = document.createElement("canvas");
  paint.width = 256;
  paint.height = 256;
  const ctx = paint.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  const grad = ctx.createRadialGradient(128, 128, 30, 128, 128, 128);
  grad.addColorStop(0, inner);
  grad.addColorStop(1, outer);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  const texture = new THREE.CanvasTexture(paint);
  const mesh = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 48),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false }),
  );
  return mesh;
}

function makeEnv(THREE: typeof import("three"), renderer: import("three").WebGLRenderer) {
  const room = new THREE.Scene();
  const geo = new THREE.PlaneGeometry(10, 10);
  const panel = (color: number, x: number, y: number, z: number) => {
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color }));
    mesh.position.set(x, y, z);
    mesh.lookAt(0, 1.2, 0);
    room.add(mesh);
  };
  panel(0x6a3cb0, 0, 8, -2);
  panel(0xf7f4ee, 0, 2.2, 8);
  panel(0x1a8f68, -8, 2.4, 2);
  panel(0x5a2d86, 8, 3.2, 0);
  panel(0x0c0b10, 0, -2, 0);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const target = pmrem.fromScene(room, 0.04);
  pmrem.dispose();
  geo.dispose();
  return target.texture;
}
