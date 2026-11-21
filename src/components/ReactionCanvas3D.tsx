import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildWoodenLabBench, createLabMaterialPalette } from '../three/apparatusModels';
import {
  buildReactionBenchStage,
  type ReactionBenchRuntime,
} from '../three/reactionBenchModels';
import { disposeThreeScene } from '../three/disposeScene';
import type { CameraPreset } from '../types/lab';

interface ReactionCanvas3DProps {
  runtime: ReactionBenchRuntime;
  cameraPreset: CameraPreset;
  presetVersion: number;
}

const REACTION_PRESETS: Record<
  CameraPreset,
  { pos: [number, number, number]; target: [number, number, number] }
> = {
  overview: { pos: [0.18, 1.18, 2.08], target: [0.02, 0.36, 0] },
  front: { pos: [0, 0.62, 1.9], target: [0.02, 0.36, 0] },
  closeup: { pos: [0.24, 0.58, 1.16], target: [0.0, 0.36, 0] },
  top: { pos: [0, 2.05, 0.78], target: [0, 0.28, 0] },
};

const _camPosGoal = new THREE.Vector3();
const _camTargetGoal = new THREE.Vector3();

export function ReactionCanvas3D({
  runtime,
  cameraPreset,
  presetVersion,
}: ReactionCanvas3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef({ runtime, cameraPreset, presetVersion });
  stateRef.current = { runtime, cameraPreset, presetVersion };

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
    camera.position.set(...REACTION_PRESETS.overview.pos);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(...REACTION_PRESETS.overview.target);
    controls.enableDamping = true;
    controls.dampingFactor = 0.065;
    controls.rotateSpeed = 0.85;
    controls.zoomSpeed = 0.9;
    controls.minDistance = 0.8;
    controls.maxDistance = 3.8;
    controls.minPolarAngle = 0.25;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;

    let camAnimating = false;
    let lastPresetVer = stateRef.current.presetVersion;
    controls.addEventListener('start', () => {
      camAnimating = false;
    });

    const hemi = new THREE.HemisphereLight(0xfff5e4, 0x3b2618, 1.0);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xfff0d6, 2.2);
    key.position.set(-2.5, 3.6, 2.6);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xa5d8ff, 0.8);
    rim.position.set(2.4, 2.0, -2.2);
    scene.add(rim);
    const accentLight = new THREE.PointLight(0x38bdf8, 0.4, 3.0, 1.4);
    accentLight.position.set(0, 0.65, 0.35);
    scene.add(accentLight);

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const mats = createLabMaterialPalette(isSoftwareGl, maxAniso);
    const bench = buildWoodenLabBench(mats);
    scene.add(bench);

    const stage = buildReactionBenchStage(mats, isSoftwareGl);
    scene.add(stage.root);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

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
      const { runtime: rt, cameraPreset: preset, presetVersion: pVer } = stateRef.current;

      if (pVer !== lastPresetVer) {
        lastPresetVer = pVer;
        camAnimating = true;
      }

      if (camAnimating) {
        const spec = REACTION_PRESETS[preset];
        _camTargetGoal.set(...spec.target);
        _camPosGoal.set(...spec.pos);
        const alpha = 1 - Math.exp(-6.5 * dt);
        camera.position.lerp(_camPosGoal, alpha);
        controls.target.lerp(_camTargetGoal, alpha);
        if (camera.position.distanceTo(_camPosGoal) < 0.015) {
          camAnimating = false;
        }
      }

      controls.update();
      const lightState = stage.update(rt, elapsed);
      accentLight.color.set(lightState.lightColor);
      accentLight.intensity = lightState.lightIntensity;

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
      data-testid="reactions-3d-canvas"
      className="w-full h-full cursor-grab active:cursor-grabbing"
    />
  );
}
