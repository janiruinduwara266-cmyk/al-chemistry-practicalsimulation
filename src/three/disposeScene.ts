import * as THREE from 'three';

export function disposeThreeScene(scene: THREE.Scene): void {
  scene.environment?.dispose();
  scene.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry && typeof mesh.geometry.dispose === 'function') {
      mesh.geometry.dispose();
    }
    const rawMat = mesh.material;
    if (!rawMat) return;
    const matList = Array.isArray(rawMat) ? rawMat : [rawMat];
    for (const mat of matList) {
      if (!mat) continue;
      const matAny = mat as unknown as Record<string, unknown>;
      for (const key of Object.keys(matAny)) {
        const val = matAny[key];
        if (val && typeof val === 'object' && 'isTexture' in val) {
          (val as THREE.Texture).dispose();
        }
      }
      if (typeof mat.dispose === 'function') {
        mat.dispose();
      }
    }
  });
}
