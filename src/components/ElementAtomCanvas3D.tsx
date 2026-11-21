import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { disposeThreeScene } from '../three/disposeScene';

interface ElementAtomCanvas3DProps {
  atomicNumber: number;
  shells: number[];
  accentHex: string;
}

export function ElementAtomCanvas3D({
  atomicNumber,
  shells,
  accentHex,
}: ElementAtomCanvas3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

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

    const width = Math.max(240, container.clientWidth);
    const height = Math.max(200, container.clientHeight);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 40);
    camera.position.set(0, 1.35, 3.35);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.08;
    controls.minDistance = 1.6;
    controls.maxDistance = 6.5;

    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const keyLight = new THREE.DirectionalLight(0xfff5e4, 2.0);
    keyLight.position.set(2.5, 3.2, 3.0);
    scene.add(keyLight);
    const accentLight = new THREE.PointLight(accentHex, 2.2, 6.0);
    scene.add(accentLight);

    const atomRoot = new THREE.Group();
    scene.add(atomRoot);

    // Nucleus core cluster
    const nucGroup = new THREE.Group();
    const protonMat = new THREE.MeshStandardMaterial({
      color: accentHex,
      emissive: accentHex,
      emissiveIntensity: 0.45,
      roughness: 0.25,
      metalness: 0.3,
    });
    const neutronMat = new THREE.MeshStandardMaterial({
      color: '#cbd5e1',
      roughness: 0.35,
      metalness: 0.4,
    });
    const nucGeo = new THREE.SphereGeometry(0.085, 14, 14);
    const nucleonCount = Math.min(18, Math.max(1, Math.round(Math.sqrt(atomicNumber) * 2)));
    for (let i = 0; i < nucleonCount; i++) {
      const m = new THREE.Mesh(nucGeo, i % 2 === 0 ? protonMat : neutronMat);
      if (i > 0) {
        const phi = Math.acos(1 - (2 * i) / nucleonCount);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const r = 0.075 + (i % 3) * 0.02;
        m.position.set(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        );
      }
      nucGroup.add(m);
    }
    atomRoot.add(nucGroup);

    // Concentric 3D Bohr orbital shells + orbiting electrons
    interface OrbitElectron {
      mesh: THREE.Mesh;
      radius: number;
      baseAngle: number;
      speed: number;
      shellGroup: THREE.Group;
    }

    const orbitElectrons: OrbitElectron[] = [];
    const ringMat = new THREE.MeshBasicMaterial({
      color: '#7dd3fc',
      transparent: true,
      opacity: 0.42,
    });
    const electronGeo = new THREE.SphereGeometry(0.042, 12, 12);
    const electronMat = new THREE.MeshStandardMaterial({
      color: '#38bdf8',
      emissive: '#38bdf8',
      emissiveIntensity: 0.9,
      roughness: 0.15,
    });

    const ringSpacing = shells.length > 5 ? 0.18 : 0.23;
    const baseRadius = 0.38;

    shells.forEach((count, sIdx) => {
      const radius = baseRadius + sIdx * ringSpacing;
      const shellGroup = new THREE.Group();
      shellGroup.rotation.x = 0.45 + (sIdx % 3) * 0.38;
      shellGroup.rotation.y = (sIdx * 0.62) % Math.PI;

      const torusGeo = new THREE.TorusGeometry(radius, 0.008, 8, 64);
      const torus = new THREE.Mesh(torusGeo, ringMat);
      shellGroup.add(torus);

      const speed = (sIdx % 2 === 0 ? 1 : -1) * (1.25 / (1 + sIdx * 0.32));
      for (let eIdx = 0; eIdx < count; eIdx++) {
        const eMesh = new THREE.Mesh(electronGeo, electronMat);
        const baseAngle = (eIdx / Math.max(1, count)) * Math.PI * 2;
        eMesh.position.set(Math.cos(baseAngle) * radius, Math.sin(baseAngle) * radius, 0);
        shellGroup.add(eMesh);
        orbitElectrons.push({ mesh: eMesh, radius, baseAngle, speed, shellGroup });
      }
      atomRoot.add(shellGroup);
    });

    const startMs = performance.now();
    let frameId = 0;
    let disposed = false;

    const handleResize = () => {
      if (!container) return;
      const w = Math.max(240, container.clientWidth);
      const h = Math.max(200, container.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

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
          frameId = window.setTimeout(cb, 85);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed) return;
      const elapsed = (performance.now() - startMs) / 1000;
      nucGroup.rotation.y = elapsed * 0.55;
      nucGroup.rotation.x = elapsed * 0.35;

      for (const orb of orbitElectrons) {
        const ang = orb.baseAngle + elapsed * orb.speed;
        orb.mesh.position.set(Math.cos(ang) * orb.radius, Math.sin(ang) * orb.radius, 0);
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
      controls.dispose();
      disposeThreeScene(scene);
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [atomicNumber, shells, accentHex]);

  return (
    <div
      ref={mountRef}
      data-testid="element-atom-3d-canvas"
      className="w-full h-full cursor-grab active:cursor-grabbing"
    />
  );
}
