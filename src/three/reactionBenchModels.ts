import * as THREE from 'three';
import type { LabMaterialPalette } from './apparatusModels';
import type {
  ReactionCondition,
  SyllabusReactionSpec,
} from '../data/reactionsCatalog';

export interface ReactionBenchRuntime {
  reaction: SyllabusReactionSpec | null;
  reagentAColorHex: string;
  reagentBColorHex: string;
  reagentAFormula: string;
  reagentBFormula: string;
  condition: ReactionCondition;
  progress: number; // 0..1
  isReacting: boolean;
}

export interface ReactionStageHandles {
  root: THREE.Group;
  update: (rt: ReactionBenchRuntime, elapsed: number) => {
    lightColor: string;
    lightIntensity: number;
  };
}

const _m = new THREE.Matrix4();
const _p = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3(1, 1, 1);
const _colA = new THREE.Color();
const _colB = new THREE.Color();
const _colMix = new THREE.Color();

function createLabelTexture(title: string, subtitle: string, accent = '#38bdf8') {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  let lastSig = '';

  const redraw = (t: string, sub: string, acc: string) => {
    const sig = `${t}|${sub}|${acc}`;
    if (sig === lastSig) return;
    lastSig = sig;
    ctx.fillStyle = '#faf5ea';
    ctx.fillRect(0, 0, 256, 128);
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 6;
    ctx.strokeRect(4, 4, 248, 120);
    ctx.fillStyle = acc;
    ctx.fillRect(10, 10, 236, 20);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 26px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(t.slice(0, 15), 128, 72);
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(sub.slice(0, 22), 128, 104);
    tex.needsUpdate = true;
  };

  redraw(title, subtitle, accent);
  return { tex, redraw };
}

function createCrossTargetTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(128, 128, 122, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 6;
  ctx.stroke();

  // Classic kinetics black 'X' cross beneath conical flask
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 18;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(64, 64);
  ctx.lineTo(192, 192);
  ctx.moveTo(192, 64);
  ctx.lineTo(64, 192);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createFlaskScaleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 128, 256);
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = 'bold 16px monospace';
  const marks = ['250', '200', '150', '100', '50'];
  marks.forEach((m, i) => {
    const y = 38 + i * 44;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(22, y);
    ctx.lineTo(64, y);
    ctx.stroke();
    ctx.fillText(m, 70, y + 6);
  });
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function buildReactionBenchStage(
  mats: LabMaterialPalette,
  isSoftwareGl: boolean
): ReactionStageHandles {
  const root = new THREE.Group();

  const safeLiquid = (color: number | string, opacity: number) =>
    new THREE.MeshPhysicalMaterial({
      color,
      roughness: 0.14,
      metalness: 0.0,
      transmission: isSoftwareGl ? 0 : 0.22,
      transparent: true,
      opacity,
    });

  // 1. Central Tripod, Ceramic Gauze & Bunsen Burner Base (flask sits at y = 0.24)
  const standGroup = new THREE.Group();
  const basePlate = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.34, 0.025, 32),
    mats.lead
  );
  basePlate.position.y = 0.0125;
  standGroup.add(basePlate);

  // Bunsen burner underneath
  const burnerBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.08, 0.025, 20),
    mats.brass
  );
  burnerBase.position.y = 0.036;
  standGroup.add(burnerBase);

  const burnerTube = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.02, 0.13, 18),
    mats.steel
  );
  burnerTube.position.y = 0.11;
  standGroup.add(burnerTube);

  const flameMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.85,
  });
  const bunsenFlameOuter = new THREE.Mesh(
    new THREE.ConeGeometry(0.034, 0.095, 16),
    flameMat
  );
  bunsenFlameOuter.position.y = 0.22;
  bunsenFlameOuter.visible = false;
  standGroup.add(bunsenFlameOuter);

  const bunsenFlameInner = new THREE.Mesh(
    new THREE.ConeGeometry(0.018, 0.055, 14),
    new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.95 })
  );
  bunsenFlameInner.position.y = 0.205;
  bunsenFlameInner.visible = false;
  standGroup.add(bunsenFlameInner);

  // Tripod legs & ring
  for (let i = 0; i < 3; i++) {
    const ang = (i / 3) * Math.PI * 2 + 0.4;
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.009, 0.009, 0.24, 10),
      mats.lead
    );
    leg.position.set(Math.cos(ang) * 0.21, 0.125, Math.sin(ang) * 0.21);
    standGroup.add(leg);
  }
  const tripodRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.21, 0.011, 10, 32),
    mats.lead
  );
  tripodRing.rotation.x = Math.PI / 2;
  tripodRing.position.y = 0.24;
  standGroup.add(tripodRing);

  // White Ceramic Tile + Kinetics Black Cross Disc on Tripod
  const ceramicDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.195, 0.195, 0.014, 28),
    new THREE.MeshStandardMaterial({
      map: createCrossTargetTexture(),
      roughness: 0.35,
      metalness: 0.02,
    })
  );
  ceramicDisc.position.y = 0.245;
  standGroup.add(ceramicDisc);
  root.add(standGroup);

  // 2. Central 250 mL Pyrex Reaction Flask (seated on tripod pad at y = 0.252)
  const flaskGroup = new THREE.Group();
  flaskGroup.position.set(0, 0.252, 0);

  const flaskBodyGlass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.078, 0.168, 0.27, 32, 1, true),
    mats.glass
  );
  flaskBodyGlass.position.y = 0.135;
  flaskGroup.add(flaskBodyGlass);

  const flaskBottomGlass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.168, 0.168, 0.01, 32),
    mats.glass
  );
  flaskBottomGlass.position.y = 0.005;
  flaskGroup.add(flaskBottomGlass);

  const flaskNeck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.068, 0.078, 0.12, 28, 1, true),
    mats.glass
  );
  flaskNeck.position.y = 0.33;
  flaskGroup.add(flaskNeck);

  const flaskRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.07, 0.009, 10, 28),
    mats.glass
  );
  flaskRim.rotation.x = Math.PI / 2;
  flaskRim.position.y = 0.39;
  flaskGroup.add(flaskRim);

  // Graduated white scale band (slightly outside outer glass wall to prevent liquid intersection)
  const scaleMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.084, 0.172, 0.22, 24, 1, true, -0.5, 1.0),
    new THREE.MeshBasicMaterial({
      map: createFlaskScaleTexture(),
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  scaleMesh.position.y = 0.135;
  flaskGroup.add(scaleMesh);

  // Liquid volume inside flask
  const mainLiquidMat = safeLiquid('#38bdf8', 0.72);
  const mainLiquid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.118, 0.16, 0.15, 28),
    mainLiquidMat
  );
  mainLiquid.position.y = 0.082;
  flaskGroup.add(mainLiquid);

  // Brown ring layered chemistry: bottom dense H2SO4 sublayer + sharp brown interface ring
  const acidSubLayerMat = safeLiquid('#fde68a', 0.6);
  const acidSubLayer = new THREE.Mesh(
    new THREE.CylinderGeometry(0.148, 0.162, 0.068, 28),
    acidSubLayerMat
  );
  acidSubLayer.position.y = 0.04;
  acidSubLayer.visible = false;
  flaskGroup.add(acidSubLayer);

  const brownRingMat = new THREE.MeshStandardMaterial({
    color: 0x451a03,
    roughness: 0.3,
    transparent: true,
    opacity: 0.94,
  });
  const brownRingBand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.146, 0.149, 0.016, 28),
    brownRingMat
  );
  brownRingBand.position.y = 0.075;
  brownRingBand.visible = false;
  flaskGroup.add(brownRingBand);

  // Silver Mirror inner glass coating (Tollens test)
  const silverMirrorMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.96,
    roughness: 0.07,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
  });
  const silverMirrorShell = new THREE.Mesh(
    new THREE.CylinderGeometry(0.108, 0.158, 0.165, 28, 1, true),
    silverMirrorMat
  );
  silverMirrorShell.position.y = 0.09;
  silverMirrorShell.visible = false;
  flaskGroup.add(silverMirrorShell);

  // Settled precipitate mound on flask bottom
  const precipMoundMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    roughness: 0.65,
    metalness: 0.08,
    transparent: true,
    opacity: 0.92,
  });
  const precipMound = new THREE.Mesh(
    new THREE.CylinderGeometry(0.095, 0.154, 0.032, 24),
    precipMoundMat
  );
  precipMound.position.y = 0.022;
  precipMound.visible = false;
  flaskGroup.add(precipMound);

  // Metal pieces inside flask (for Na + water, Ca + water, Zn + CuSO4)
  const metalChunkMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    metalness: 0.88,
    roughness: 0.22,
  });
  const metalSphere = new THREE.Mesh(new THREE.SphereGeometry(0.024, 18, 18), metalChunkMat);
  metalSphere.position.set(0, 0.155, 0);
  metalSphere.visible = false;
  flaskGroup.add(metalSphere);

  // Sodium golden flame above darting sphere
  const sodiumFlameMat = new THREE.MeshBasicMaterial({
    color: 0xfbbf24,
    transparent: true,
    opacity: 0.9,
  });
  const sodiumFlame = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.075, 14), sodiumFlameMat);
  sodiumFlame.visible = false;
  flaskGroup.add(sodiumFlame);

  // Zn granules + Cu deposit group
  const znGranulesGroup = new THREE.Group();
  const znGranuleMeshes: THREE.Mesh[] = [];
  for (let i = 0; i < 6; i++) {
    const granMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.85,
      roughness: 0.35,
    });
    const gran = new THREE.Mesh(new THREE.DodecahedronGeometry(0.02, 0), granMat);
    const a = (i / 6) * Math.PI * 2;
    gran.position.set(Math.cos(a) * 0.055, 0.022, Math.sin(a) * 0.055);
    znGranulesGroup.add(gran);
    znGranuleMeshes.push(gran);
  }
  znGranulesGroup.visible = false;
  flaskGroup.add(znGranulesGroup);

  // Instanced precipitate crystal flakes (64)
  const precipFlakesMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.45,
    metalness: 0.12,
  });
  const precipFlakes = new THREE.InstancedMesh(
    new THREE.DodecahedronGeometry(0.011, 0),
    precipFlakesMat,
    64
  );
  precipFlakes.visible = false;
  flaskGroup.add(precipFlakes);

  // Instanced gas bubbles (38)
  const gasBubblesMat = new THREE.MeshBasicMaterial({
    color: 0xf8fafc,
    transparent: true,
    opacity: 0.82,
  });
  const gasBubbles = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.012, 8, 8),
    gasBubblesMat,
    38
  );
  gasBubbles.visible = false;
  flaskGroup.add(gasBubbles);

  // Thermometer probe dipped in from upper right
  const thermoProbe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.005, 0.005, 0.36, 10),
    mats.steel
  );
  thermoProbe.position.set(0.055, 0.24, 0);
  thermoProbe.rotation.z = -0.24;
  flaskGroup.add(thermoProbe);

  const thermoHead = new THREE.Mesh(
    new THREE.BoxGeometry(0.055, 0.032, 0.016),
    mats.ebonite
  );
  thermoHead.position.set(0.105, 0.41, 0);
  thermoHead.rotation.z = -0.24;
  flaskGroup.add(thermoHead);

  // Litmus paper strip held near neck mouth (NH4+ + NaOH)
  const litmusStripMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    roughness: 0.75,
    side: THREE.DoubleSide,
  });
  const litmusStrip = new THREE.Mesh(
    new THREE.BoxGeometry(0.022, 0.09, 0.004),
    litmusStripMat
  );
  litmusStrip.position.set(-0.028, 0.43, 0.01);
  litmusStrip.rotation.z = 0.14;
  litmusStrip.visible = false;
  flaskGroup.add(litmusStrip);

  root.add(flaskGroup);

  // 3. Secondary Limewater Delivery Tube + Side Test Tube (for CO3²⁻ + HCl)
  const limewaterRig = new THREE.Group();
  const sideTubeStand = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.025, 0.12),
    mats.darkOak
  );
  sideTubeStand.position.set(0.42, 0.0125, 0.06);
  limewaterRig.add(sideTubeStand);

  const limeTubeGlass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.036, 0.036, 0.26, 22, 1, true),
    mats.glass
  );
  limeTubeGlass.position.set(0.42, 0.155, 0.06);
  limewaterRig.add(limeTubeGlass);

  const limeLiquidMat = safeLiquid('#e2e8f0', 0.42);
  const limeLiquid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.032, 0.032, 0.13, 20),
    limeLiquidMat
  );
  limeLiquid.position.set(0.42, 0.095, 0.06);
  limewaterRig.add(limeLiquid);

  // Delivery tube from center flask neck into side limewater tube
  const deliveryCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.64, 0),
    new THREE.Vector3(0.08, 0.72, 0.02),
    new THREE.Vector3(0.32, 0.68, 0.05),
    new THREE.Vector3(0.42, 0.34, 0.06),
    new THREE.Vector3(0.42, 0.06, 0.06),
  ]);
  const deliveryTube = new THREE.Mesh(
    new THREE.TubeGeometry(deliveryCurve, 32, 0.008, 10, false),
    mats.glass
  );
  limewaterRig.add(deliveryTube);

  const limeBubbles = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.008, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 }),
    14
  );
  limewaterRig.add(limeBubbles);
  limewaterRig.visible = false;
  root.add(limewaterRig);

  // 4. Left Reagent A Stock Bottle (labeled dynamically)
  const bottleA = new THREE.Group();
  bottleA.position.set(-0.48, 0, 0.04);
  const bottleABody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.09, 0.24, 24),
    new THREE.MeshPhysicalMaterial({
      color: 0x78350f,
      roughness: 0.16,
      transmission: isSoftwareGl ? 0 : 0.25,
      transparent: true,
      opacity: 0.88,
    })
  );
  bottleABody.position.y = 0.12;
  bottleA.add(bottleABody);

  const bottleACap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.042, 0.045, 0.055, 20),
    mats.ebonite
  );
  bottleACap.position.y = 0.275;
  bottleA.add(bottleACap);

  const labelA = createLabelTexture('CuSO₄(aq)', 'Reagent A', '#0284c7');
  const labelAMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.092, 0.092, 0.11, 20, 1, true, -0.85, 1.7),
    new THREE.MeshStandardMaterial({ map: labelA.tex, roughness: 0.5 })
  );
  labelAMesh.position.y = 0.12;
  bottleA.add(labelAMesh);
  root.add(bottleA);

  // 5. Reagent B Pouring Beaker (Animates up & tilts to pour into center flask during early reaction)
  const pourRig = new THREE.Group();
  pourRig.position.set(0.46, 0.0, 0.04);

  const beakerBGlass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.072, 0.068, 0.18, 24, 1, true),
    mats.glass
  );
  beakerBGlass.position.y = 0.09;
  pourRig.add(beakerBGlass);

  const beakerBLiquidMat = safeLiquid('#e0f2fe', 0.72);
  const beakerBLiquid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.065, 0.063, 0.11, 22),
    beakerBLiquidMat
  );
  beakerBLiquid.position.y = 0.06;
  pourRig.add(beakerBLiquid);

  const labelB = createLabelTexture('NH₃(aq)', 'Reagent B', '#ea580c');
  const labelBMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.074, 0.07, 0.09, 20, 1, true, -0.85, 1.7),
    new THREE.MeshStandardMaterial({ map: labelB.tex, roughness: 0.5 })
  );
  labelBMesh.position.y = 0.085;
  pourRig.add(labelBMesh);
  root.add(pourRig);

  // Animated pouring liquid stream from Reagent B lip into center flask mouth
  const pourStreamMat = safeLiquid('#e0f2fe', 0.78);
  const pourStreamCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.14, 0.79, 0),
    new THREE.Vector3(0.06, 0.72, 0),
    new THREE.Vector3(0.015, 0.58, 0),
    new THREE.Vector3(0.0, 0.36, 0),
  ]);
  const pourStreamMesh = new THREE.Mesh(
    new THREE.TubeGeometry(pourStreamCurve, 20, 0.0085, 8, false),
    pourStreamMat
  );
  pourStreamMesh.visible = false;
  root.add(pourStreamMesh);

  return {
    root,
    update(rt, elapsed) {
      labelA.redraw(rt.reagentAFormula, 'Reagent A', rt.reagentAColorHex);
      labelB.redraw(rt.reagentBFormula, 'Reagent B', rt.reagentBColorHex);
      beakerBLiquidMat.color.set(rt.reagentBColorHex);

      // Bunsen burner heat visibility
      const isWarm = rt.condition === 'warm';
      bunsenFlameOuter.visible = isWarm;
      bunsenFlameInner.visible = isWarm;
      if (isWarm) {
        const flicker = 0.92 + Math.sin(elapsed * 22) * 0.1;
        bunsenFlameOuter.scale.set(1, flicker, 1);
        bunsenFlameInner.scale.set(1, 0.95 + Math.cos(elapsed * 26) * 0.08, 1);
      }

      // Pouring animation during progress 0.02..0.28
      const p = THREE.MathUtils.clamp(rt.progress, 0, 1);
      const liftPhase =
        p > 0.01 && p < 0.32
          ? p < 0.08
            ? (p - 0.01) / 0.07
            : p < 0.24
              ? 1
              : 1 - (p - 0.24) / 0.08
          : 0;
      const smoothLift = liftPhase * liftPhase * (3 - 2 * liftPhase);

      pourRig.position.set(
        THREE.MathUtils.lerp(0.46, 0.21, smoothLift),
        THREE.MathUtils.lerp(0.0, 0.72, smoothLift),
        THREE.MathUtils.lerp(-0.06, 0.0, smoothLift)
      );
      pourRig.rotation.z = THREE.MathUtils.lerp(0, 0.85, smoothLift);
      pourStreamMat.color.set(rt.reagentBColorHex);
      pourStreamMesh.visible = p >= 0.06 && p <= 0.25;

      // Liquid volume rises gently during pour
      const volScale = 0.85 + Math.min(1, p / 0.28) * 0.25;
      mainLiquid.scale.set(1, volScale, 1);
      mainLiquid.position.y = 0.075 * volScale;

      // Reset all special effect meshes before enabling the active reaction effect
      acidSubLayer.visible = false;
      brownRingBand.visible = false;
      silverMirrorShell.visible = false;
      precipMound.visible = false;
      metalSphere.visible = false;
      sodiumFlame.visible = false;
      znGranulesGroup.visible = false;
      precipFlakes.visible = false;
      gasBubbles.visible = false;
      litmusStrip.visible = false;
      limewaterRig.visible = false;

      if (!rt.reaction) {
        // No reaction or pre-mix state
        mainLiquidMat.color.set(rt.reagentAColorHex);
        mainLiquidMat.opacity = 0.68;
        return {
          lightColor: isWarm ? '#fb923c' : '#bae6fd',
          lightIntensity: isWarm ? 0.85 : 0.35,
        };
      }

      const rx = rt.reaction;
      // Reaction development ramp starts once pouring begins (0.14 -> 1.0)
      const rf = THREE.MathUtils.clamp((p - 0.14) / 0.86, 0, 1);
      _colA.set(rx.initialColorHex);
      _colB.set(rx.finalColorHex);
      _colMix.copy(_colA).lerp(_colB, rf);
      mainLiquidMat.color.copy(_colMix);
      mainLiquidMat.opacity = THREE.MathUtils.lerp(rx.initialOpacity, rx.finalOpacity, rf);

      let lightColor = '#38bdf8';
      let lightIntensity = isWarm ? 0.85 : 0.42;

      switch (rx.effect) {
        case 'precipitate':
        case 'colloid-turbidity': {
          const pCol = rx.precipitateColorHex || '#ffffff';
          precipFlakesMat.color.set(pCol);
          precipMoundMat.color.set(pCol);
          precipFlakes.visible = rf > 0.04;
          precipMound.visible = rf > 0.2;
          precipMound.scale.set(1, Math.max(0.15, rf), 1);

          if (precipFlakes.visible) {
            for (let i = 0; i < 64; i++) {
              const seed = i * 1.6180339;
              const angle = (seed * 13.7) % (Math.PI * 2);
              const rad = 0.025 + ((seed * 7.3) % 1) * 0.098;
              const fallCycle = ((seed * 3.1) % 1) + elapsed * 0.24 * (0.6 + rf);
              const localH =
                rx.effect === 'colloid-turbidity'
                  ? 0.025 + (((seed * 5.9) % 1) * 0.13)
                  : Math.max(0.02, 0.15 - (fallCycle % 1) * 0.135 * (0.4 + 0.6 * rf));
              const sc = Math.min(1, rf * 2.2) * (0.7 + ((seed * 2.3) % 0.6));
              _p.set(Math.cos(angle) * rad, localH, Math.sin(angle) * rad);
              _q.setFromEuler(new THREE.Euler(seed, elapsed * 0.8 + seed, 0));
              _s.set(sc, sc, sc);
              _m.compose(_p, _q, _s);
              precipFlakes.setMatrixAt(i, _m);
            }
            precipFlakes.instanceMatrix.needsUpdate = true;
          }
          lightColor = pCol;
          break;
        }

        case 'gas-bubbles': {
          gasBubbles.visible = rf > 0.05;
          gasBubblesMat.color.set(rx.gasColorHex || '#f8fafc');
          if (rx.precipitateColorHex && rf > 0.2) {
            precipMound.visible = true;
            precipMoundMat.color.set(rx.precipitateColorHex);
            precipMound.scale.set(1, rf * 0.9, 1);
          }
          if (rx.reagentAId === 'ca-metal') {
            metalSphere.visible = true;
            metalChunkMat.color.set('#94a3b8');
            const s = Math.max(0.25, 1 - rf * 0.65);
            metalSphere.scale.set(s, s, s);
            metalSphere.position.set(0, 0.025, 0);
          }
          if (gasBubbles.visible) {
            for (let i = 0; i < 38; i++) {
              const seed = i * 2.37;
              const phase = (elapsed * 0.85 + seed) % 1;
              const ang = seed * 9.1;
              const r = 0.02 + ((seed * 3.7) % 1) * 0.085;
              const y = 0.02 + phase * 0.15;
              const sc = rf * (0.65 + phase * 0.6);
              _p.set(Math.cos(ang) * r, y, Math.sin(ang) * r);
              _q.identity();
              _s.set(sc, sc, sc);
              _m.compose(_p, _q, _s);
              gasBubbles.setMatrixAt(i, _m);
            }
            gasBubbles.instanceMatrix.needsUpdate = true;
          }
          break;
        }

        case 'silver-mirror': {
          silverMirrorShell.visible = rf > 0.08;
          silverMirrorMat.opacity = rf * 0.94;
          lightColor = '#e2e8f0';
          lightIntensity = 0.65 + rf * 0.75;
          break;
        }

        case 'brown-ring': {
          acidSubLayer.visible = p > 0.18;
          brownRingBand.visible = rf > 0.15;
          brownRingMat.opacity = Math.min(0.95, rf * 1.15);
          brownRingBand.scale.set(1, 0.4 + rf * 0.85, 1);
          lightColor = '#d97706';
          break;
        }

        case 'limewater-milk': {
          limewaterRig.visible = true;
          limeLiquidMat.color.set('#e2e8f0');
          limeLiquidMat.opacity = THREE.MathUtils.lerp(0.4, 0.95, rf);
          gasBubbles.visible = rf > 0.05;
          if (gasBubbles.visible) {
            for (let i = 0; i < 38; i++) {
              const seed = i * 2.37;
              const phase = (elapsed * 1.15 + seed) % 1;
              const ang = seed * 7.4;
              const r = 0.02 + ((seed * 3.7) % 1) * 0.08;
              _p.set(Math.cos(ang) * r, 0.02 + phase * 0.15, Math.sin(ang) * r);
              _q.identity();
              _s.set(rf, rf, rf);
              _m.compose(_p, _q, _s);
              gasBubbles.setMatrixAt(i, _m);
            }
            gasBubbles.instanceMatrix.needsUpdate = true;

            for (let i = 0; i < 14; i++) {
              const ph = (elapsed * 1.2 + i * 0.17) % 1;
              _p.set(0.42 + Math.sin(i * 4) * 0.012, 0.04 + ph * 0.11, 0.06);
              _q.identity();
              _s.set(rf, rf, rf);
              _m.compose(_p, _q, _s);
              limeBubbles.setMatrixAt(i, _m);
            }
            limeBubbles.instanceMatrix.needsUpdate = true;
          }
          break;
        }

        case 'litmus-blue': {
          litmusStrip.visible = true;
          _colA.set('#ef4444');
          _colB.set('#2563eb');
          _colMix.copy(_colA).lerp(_colB, rf);
          litmusStripMat.color.copy(_colMix);
          gasBubbles.visible = rf > 0.08;
          if (gasBubbles.visible) {
            for (let i = 0; i < 38; i++) {
              const seed = i * 2.13;
              const ph = (elapsed * 0.9 + seed) % 1;
              _p.set(Math.cos(seed * 6) * 0.05, 0.04 + ph * 0.15, Math.sin(seed * 6) * 0.05);
              _q.identity();
              _s.set(rf * 0.8, rf * 0.8, rf * 0.8);
              _m.compose(_p, _q, _s);
              gasBubbles.setMatrixAt(i, _m);
            }
            gasBubbles.instanceMatrix.needsUpdate = true;
          }
          lightColor = '#60a5fa';
          break;
        }

        case 'sodium-flame': {
          metalSphere.visible = rf < 0.94;
          metalChunkMat.color.set('#e2e8f0');
          const dartX = Math.sin(elapsed * 5.2) * 0.058 * (1 - rf * 0.25);
          const dartZ = Math.cos(elapsed * 4.4) * 0.058 * (1 - rf * 0.25);
          const ms = Math.max(0.18, 1 - rf * 0.78);
          metalSphere.scale.set(ms, ms, ms);
          metalSphere.position.set(dartX, 0.145 * volScale, dartZ);

          sodiumFlame.visible = rf > 0.05 && rf < 0.9;
          if (sodiumFlame.visible) {
            const flk = 0.8 + Math.sin(elapsed * 28) * 0.22;
            sodiumFlame.position.set(dartX, 0.195 * volScale, dartZ);
            sodiumFlame.scale.set(1, flk, 1);
          }

          gasBubbles.visible = rf > 0.03;
          if (gasBubbles.visible) {
            for (let i = 0; i < 38; i++) {
              const ph = (elapsed * 1.5 + i * 0.19) % 1;
              _p.set(
                dartX + Math.cos(i * 4.2) * 0.035,
                0.14 * volScale + ph * 0.14,
                dartZ + Math.sin(i * 4.2) * 0.035
              );
              _q.identity();
              _s.set(0.9, 0.9, 0.9);
              _m.compose(_p, _q, _s);
              gasBubbles.setMatrixAt(i, _m);
            }
            gasBubbles.instanceMatrix.needsUpdate = true;
          }
          lightColor = '#fbbf24';
          lightIntensity = 1.0 + Math.sin(elapsed * 24) * 0.35;
          break;
        }

        case 'copper-deposit': {
          znGranulesGroup.visible = true;
          _colA.set('#94a3b8');
          _colB.set('#b45309');
          _colMix.copy(_colA).lerp(_colB, rf);
          for (const gran of znGranuleMeshes) {
            (gran.material as THREE.MeshStandardMaterial).color.copy(_colMix);
          }
          lightColor = '#fb923c';
          break;
        }

        case 'color-shift':
        default: {
          if (rx.precipitateColorHex && rf > 0.05 && rf < 0.55) {
            precipMound.visible = true;
            precipMoundMat.color.set(rx.precipitateColorHex);
            precipMound.scale.set(1, Math.sin((rf / 0.55) * Math.PI) * 0.7, 1);
          }
          lightColor = rx.finalColorHex;
          break;
        }
      }

      return { lightColor, lightIntensity };
    },
  };
}
