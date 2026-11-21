import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildWoodenLabBench, createLabMaterialPalette } from '../three/apparatusModels';
import {
  buildApparatusBoxStage,
  type ApparatusBoxStageHandle,
} from '../three/apparatusBoxModels';
import { disposeThreeScene } from '../three/disposeScene';
import type { CameraPreset, EquipmentItem } from '../types/lab';

interface ApparatusBox3DCanvasProps {
  equipment: EquipmentItem[];
  selectedIds: Set<string>;
  focusedId: string;
  allPacked: boolean;
  cameraPreset: CameraPreset;
  presetVersion: number;
  onToggleItem: (item: EquipmentItem) => void;
  onHoverItem?: (item: EquipmentItem | null) => void;
}

const BOX_PRESETS: Record<
  CameraPreset,
  { pos: [number, number, number]; target: [number, number, number] }
> = {
  overview: { pos: [0.16, 1.86, 2.08], target: [0, 0.14, 0.05] },
  front: { pos: [0, 1.05, 2.25], target: [0, 0.16, 0.05] },
  closeup: { pos: [0.45, 1.15, 1.38], target: [0, 0.16, 0.05] },
  top: { pos: [0, 2.45, 0.42], target: [0, 0.1, 0.02] },
};

const _camPosGoal = new THREE.Vector3();
const _camTargetGoal = new THREE.Vector3();

export function ApparatusBox3DCanvas({
  equipment,
  selectedIds,
  focusedId,
  allPacked,
  cameraPreset,
  presetVersion,
  onToggleItem,
  onHoverItem,
}: ApparatusBox3DCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef({
    equipment,
    selectedIds,
    focusedId,
    allPacked,
    cameraPreset,
    presetVersion,
    onToggleItem,
    onHoverItem,
  });
  stateRef.current = {
    equipment,
    selectedIds,
    focusedId,
    allPacked,
    cameraPreset,
    presetVersion,
    onToggleItem,
    onHoverItem,
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      const probe = document.createElement('canvas').getContext('webgl2');
      if (!probe) return true;
      const ext = probe.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
      const gpu = String(probe.getParameter(param));
      probe.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = Math.max(320, container.clientWidth);
    const height = Math.max(240, container.clientHeight);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.14;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 30);
    camera.position.set(...BOX_PRESETS.overview.pos);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(...BOX_PRESETS.overview.target);
    controls.enableDamping = true;
    controls.dampingFactor = 0.065;
    controls.rotateSpeed = 0.85;
    controls.minDistance = 1.05;
    controls.maxDistance = 3.6;
    controls.minPolarAngle = 0.18;
    controls.maxPolarAngle = Math.PI / 2 - 0.08;

    let camAnimating = false;
    let lastPresetVer = stateRef.current.presetVersion;
    controls.addEventListener('start', () => {
      camAnimating = false;
    });

    const hemi = new THREE.HemisphereLight(0xfff6e5, 0x3b2618, 1.05);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xfff1d8, 2.25);
    key.position.set(-2.2, 3.8, 2.6);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x93c5fd, 0.85);
    rim.position.set(2.4, 2.2, -2.1);
    scene.add(rim);

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const mats = createLabMaterialPalette(isSoftwareGl, maxAniso);
    const bench = buildWoodenLabBench(mats);
    scene.add(bench);

    let boxStage: ApparatusBoxStageHandle | null = null;
    let lastEqSig = '';

    const rebuildStageIfNeeded = () => {
      const eq = stateRef.current.equipment;
      const sig = eq.map((e) => e.id).join(',');
      if (sig === lastEqSig && boxStage) return;
      lastEqSig = sig;
      if (boxStage) {
        scene.remove(boxStage.root);
      }
      boxStage = buildApparatusBoxStage(eq, mats);
      scene.add(boxStage.root);
    };
    rebuildStageIfNeeded();

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };
    let hoveredId = '';

    const pickItemAtEvent = (e: PointerEvent): EquipmentItem | null => {
      if (!boxStage) return null;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(boxStage.hitTargets, false);
      if (hits.length === 0) return null;
      const eqId = hits[0].object.userData?.equipmentId as string | undefined;
      if (!eqId) return null;
      return stateRef.current.equipment.find((it) => it.id === eqId) || null;
    };

    const handlePointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: PointerEvent) => {
      const item = pickItemAtEvent(e);
      const nextHover = item?.id || '';
      renderer.domElement.style.cursor = item ? 'pointer' : 'grab';
      if (nextHover !== hoveredId) {
        hoveredId = nextHover;
        stateRef.current.onHoverItem?.(item);
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (dist > 6) return;
      const item = pickItemAtEvent(e);
      if (item) {
        stateRef.current.onToggleItem(item);
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);

    const handleResize = () => {
      if (!container) return;
      const w = Math.max(320, container.clientWidth);
      const h = Math.max(240, container.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const startTimeMs = performance.now();
    let prevTimeMs = startTimeMs;
    let frameId = 0;
    let disposed = false;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      let polls = 0;
      const poll = () => {
        if (disposed) return;
        const status = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (status === gl.UNSIGNALED && polls < 50) {
          polls += 1;
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 35);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed) return;
      const nowMs = performance.now();
      const dt = Math.min(0.08, (nowMs - prevTimeMs) / 1000);
      prevTimeMs = nowMs;
      const elapsed = (nowMs - startTimeMs) / 1000;

      rebuildStageIfNeeded();

      const {
        selectedIds: sel,
        focusedId: foc,
        allPacked: packed,
        cameraPreset: preset,
        presetVersion: pVer,
      } = stateRef.current;

      if (pVer !== lastPresetVer) {
        lastPresetVer = pVer;
        camAnimating = true;
      }

      if (camAnimating) {
        const spec = BOX_PRESETS[preset];
        _camTargetGoal.set(...spec.target);
        _camPosGoal.set(...spec.pos);
        const alpha = 1 - Math.exp(-7.5 * dt);
        camera.position.lerp(_camPosGoal, alpha);
        controls.target.lerp(_camTargetGoal, alpha);
        if (camera.position.distanceTo(_camPosGoal) < 0.01) {
          camAnimating = false;
        }
      }

      if (boxStage) {
        // Gently close lid slightly as packing completes, otherwise stay wide open
        const targetLidRot = packed ? -0.45 : -1.78;
        boxStage.lidPivot.rotation.x = THREE.MathUtils.lerp(
          boxStage.lidPivot.rotation.x,
          targetLidRot,
          1 - Math.exp(-4.5 * dt)
        );

        boxStage.slots.forEach((slot, idx) => {
          const isSel = sel.has(slot.id);
          const isHovered = hoveredId === slot.id;
          const isFoc = foc === slot.id;

          slot.targetLift = isSel ? 0.14 : isHovered ? 0.05 : 0;
          slot.currentLift = THREE.MathUtils.lerp(
            slot.currentLift,
            slot.targetLift,
            1 - Math.exp(-9 * dt)
          );
          const bob = isSel ? Math.sin(elapsed * 3.2 + idx) * 0.014 : 0;
          slot.itemPivot.position.y = slot.currentLift + bob;
          slot.itemPivot.rotation.y = isSel
            ? Math.sin(elapsed * 1.4 + idx) * 0.25
            : isHovered || isFoc
              ? Math.sin(elapsed * 2.2) * 0.12
              : 0;

          const rMat = slot.ringMesh.material as THREE.MeshBasicMaterial;
          if (isSel) {
            rMat.color.setHex(0x4ade80);
            rMat.opacity = 0.92;
            const s = 1.06 + Math.sin(elapsed * 4 + idx) * 0.04;
            slot.ringMesh.scale.set(s, s, 1);
          } else if (isHovered || isFoc) {
            rMat.color.setHex(0x38bdf8);
            rMat.opacity = 0.88;
            slot.ringMesh.scale.set(1.04, 1.04, 1);
          } else {
            rMat.color.setHex(0xf59e0b);
            rMat.opacity = 0.45;
            slot.ringMesh.scale.set(1, 1, 1);
          }
        });
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      controls.dispose();
      disposeThreeScene(scene);
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      data-testid="apparatus-box-3d-canvas"
      className="w-full h-full cursor-grab active:cursor-grabbing"
    />
  );
}
