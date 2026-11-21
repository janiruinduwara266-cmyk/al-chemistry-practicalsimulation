import * as THREE from 'three';
import {
  computeElectrochemState,
  evaluateChemistryBench,
  getVseprSpec,
} from '../physics/chemistryEngine';
import type { LabMaterialPalette } from './apparatusModels';
import type { BenchApparatusKind, LabSimulationParams, VseprMolecule } from '../types/lab';

export interface ChemistryBenchHandles {
  root: THREE.Group;
  flameRig: {
    group: THREE.Group;
    outerFlame: THREE.Mesh;
    innerCone: THREE.Mesh;
    loopGroup: THREE.Group;
    glowLight: THREE.PointLight;
  };
  conductivityRig: {
    group: THREE.Group;
    liquidMesh: THREE.Mesh;
    bulbMesh: THREE.Mesh;
    bubbles: THREE.InstancedMesh;
  };
  vseprRig: {
    group: THREE.Group;
    moleculeSpinGroup: THREE.Group;
    atomMeshes: THREE.Mesh[];
    bondMeshes: THREE.Mesh[];
    loneMeshes: THREE.Mesh[];
    lastMolecule: VseprMolecule | null;
  };
  titrationRig: {
    group: THREE.Group;
    buretteLiquid: THREE.Mesh;
    flaskLiquid: THREE.Mesh;
    dropMesh: THREE.Mesh;
    flaskGroup: THREE.Group;
  };
  gasLawRig: {
    group: THREE.Group;
    pistonMesh: THREE.Mesh;
    gasVolumeMesh: THREE.Mesh;
    diffusionRing: THREE.Mesh;
  };
  calorimeterRig: {
    group: THREE.Group;
    liquidMesh: THREE.Mesh;
    thermometerFill: THREE.Mesh;
    stirrerWire: THREE.Mesh;
    spiritFlame: THREE.Mesh;
  };
  testTubeRig: {
    group: THREE.Group;
    tubeLiquids: THREE.Mesh[];
    precipitateMesh: THREE.Mesh;
    brownRingMesh: THREE.Mesh;
    bubbles: THREE.InstancedMesh;
  };
  kineticsRig: {
    group: THREE.Group;
    flaskLiquid: THREE.Mesh;
    crossUnderlay: THREE.Mesh;
    syringePiston: THREE.Mesh;
    bubbles: THREE.InstancedMesh;
  };
  electrochemRig: {
    group: THREE.Group;
    leftLiquid: THREE.Mesh;
    rightLiquid: THREE.Mesh;
    cathodeDeposit: THREE.Mesh;
    bubbles: THREE.InstancedMesh;
  };
}

const _tmpMat = new THREE.Matrix4();
const _tmpPos = new THREE.Vector3();
const _tmpQuat = new THREE.Quaternion();
const _tmpScale = new THREE.Vector3(1, 1, 1);
const _upVec = new THREE.Vector3(0, 1, 0);
const _dirVec = new THREE.Vector3();

function makeLiquidMaterial(colorHex: string, opacity = 0.82, isSoftwareGl = false) {
  return new THREE.MeshPhysicalMaterial({
    color: colorHex,
    roughness: 0.14,
    metalness: 0.0,
    transmission: isSoftwareGl ? 0 : 0.25,
    transparent: true,
    opacity,
  });
}

function makeBubbleInstances(count: number): THREE.InstancedMesh {
  const geo = new THREE.SphereGeometry(0.014, 8, 8);
  const mat = new THREE.MeshBasicMaterial({
    color: 0xe0f2fe,
    transparent: true,
    opacity: 0.78,
  });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.visible = false;
  return mesh;
}

export function buildChemistryBenchRig(
  mats: LabMaterialPalette,
  isSoftwareGl = false
): ChemistryBenchHandles {
  const root = new THREE.Group();

  // 1. FLAME BURNER RIG (Unit II Flame Test)
  const flameGroup = new THREE.Group();
  const basePlate = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.04, 24), mats.ebonite);
  basePlate.position.y = 0.02;
  flameGroup.add(basePlate);

  const burnerCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.08, 16), mats.brass);
  burnerCollar.position.y = 0.08;
  flameGroup.add(burnerCollar);

  const burnerBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.036, 0.42, 16), mats.steel);
  burnerBarrel.position.y = 0.31;
  flameGroup.add(burnerBarrel);

  const innerCone = new THREE.Mesh(
    new THREE.ConeGeometry(0.03, 0.14, 16),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.88 })
  );
  innerCone.position.y = 0.59;
  innerCone.visible = false;
  flameGroup.add(innerCone);

  const outerFlame = new THREE.Mesh(
    new THREE.ConeGeometry(0.065, 0.28, 20),
    new THREE.MeshBasicMaterial({ color: 0xffb703, transparent: true, opacity: 0.78 })
  );
  outerFlame.position.y = 0.66;
  outerFlame.visible = false;
  flameGroup.add(outerFlame);

  const loopGroup = new THREE.Group();
  loopGroup.position.set(0.36, 0.54, 0);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.36, 12), mats.darkOak);
  handle.rotation.z = Math.PI / 2;
  handle.position.x = 0.18;
  loopGroup.add(handle);
  const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.28, 8), mats.steel);
  wire.rotation.z = Math.PI / 2;
  wire.position.x = -0.14;
  loopGroup.add(wire);
  const wireLoop = new THREE.Mesh(new THREE.TorusGeometry(0.028, 0.004, 8, 18), mats.steel);
  wireLoop.position.x = -0.29;
  loopGroup.add(wireLoop);
  flameGroup.add(loopGroup);

  const glowLight = new THREE.PointLight(0xffb703, 0, 2.2);
  glowLight.position.set(0, 0.72, 0);
  flameGroup.add(glowLight);

  // Reagent watch glass on stand beside burner
  const watchGlass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.11, 0.03, 24),
    mats.glass
  );
  watchGlass.position.set(-0.48, 0.03, 0.15);
  flameGroup.add(watchGlass);
  const saltPile = new THREE.Mesh(
    new THREE.ConeGeometry(0.07, 0.04, 16),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.8 })
  );
  saltPile.position.set(-0.48, 0.055, 0.15);
  flameGroup.add(saltPile);

  root.add(flameGroup);

  // 2. CONDUCTIVITY & BOILING BATH RIG (Unit II)
  const condGroup = new THREE.Group();
  const condStand = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.05, 0.45), mats.ebonite);
  condStand.position.y = 0.025;
  condGroup.add(condStand);
  const beakerWall = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.44, 24, 1, true), mats.glass);
  beakerWall.position.set(0, 0.27, 0);
  condGroup.add(beakerWall);
  const condLiquid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.205, 0.205, 0.28, 24),
    makeLiquidMaterial('#BAE6FD', 0.82, isSoftwareGl)
  );
  condLiquid.position.set(0, 0.19, 0);
  condGroup.add(condLiquid);
  const elecL = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.42, 10), mats.ebonite);
  elecL.position.set(-0.08, 0.34, 0);
  const elecR = elecL.clone();
  elecR.position.x = 0.08;
  condGroup.add(elecL, elecR);
  const condMast = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.72, 12), mats.brass);
  condMast.position.set(0.32, 0.38, 0);
  condGroup.add(condMast);
  const bulbMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 18, 18),
    new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfacc15, emissiveIntensity: 0.1, roughness: 0.2 })
  );
  bulbMesh.position.set(0.32, 0.78, 0);
  condGroup.add(bulbMesh);
  const condBubbles = makeBubbleInstances(22);
  condBubbles.position.set(0, 0.08, 0);
  condGroup.add(condBubbles);
  root.add(condGroup);

  // 3. VSEPR 3D MOLECULAR MODEL RIG (Unit II)
  const vseprGroup = new THREE.Group();
  const vseprBase = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.32, 0.06, 24), mats.ebonite);
  vseprBase.position.y = 0.03;
  const vseprStem = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.45, 12), mats.brass);
  vseprStem.position.y = 0.26;
  vseprGroup.add(vseprBase, vseprStem);

  const moleculeSpinGroup = new THREE.Group();
  moleculeSpinGroup.position.set(0, 0.66, 0);
  const centralAtom = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 24, 24),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.2 })
  );
  moleculeSpinGroup.add(centralAtom);

  const atomMeshes: THREE.Mesh[] = [];
  const bondMeshes: THREE.Mesh[] = [];
  const loneMeshes: THREE.Mesh[] = [];
  for (let i = 0; i < 6; i++) {
    const atom = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 20, 20),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25 })
    );
    const bond = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.022, 0.32, 12),
      mats.steel
    );
    moleculeSpinGroup.add(atom, bond);
    atomMeshes.push(atom);
    bondMeshes.push(bond);
  }
  for (let i = 0; i < 2; i++) {
    const lobe = new THREE.Mesh(
      new THREE.SphereGeometry(0.085, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.48 })
    );
    lobe.scale.set(0.85, 1.35, 0.85);
    moleculeSpinGroup.add(lobe);
    loneMeshes.push(lobe);
  }
  vseprGroup.add(moleculeSpinGroup);
  root.add(vseprGroup);

  // 4. TITRATION BURETTE & CONICAL FLASK RIG (Unit III)
  const titrGroup = new THREE.Group();
  const titrTile = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.035, 0.46), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.45 }));
  titrTile.position.set(0, 0.018, 0);
  titrGroup.add(titrTile);
  const retortRod = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.28, 12), mats.steel);
  retortRod.position.set(-0.22, 0.65, -0.14);
  titrGroup.add(retortRod);
  const clampArm = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.025, 0.03), mats.ebonite);
  clampArm.position.set(-0.1, 0.94, -0.06);
  titrGroup.add(clampArm);

  const buretteGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.72, 18, 1, true), mats.glass);
  buretteGlass.position.set(0, 0.86, 0);
  titrGroup.add(buretteGlass);
  const buretteLiquid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.021, 0.021, 0.64, 14),
    makeLiquidMaterial('#E0F2FE', 0.85, isSoftwareGl)
  );
  buretteLiquid.position.set(0, 0.85, 0);
  titrGroup.add(buretteLiquid);
  const stopcock = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.09, 10), mats.copper);
  stopcock.rotation.z = Math.PI / 2;
  stopcock.position.set(0, 0.48, 0);
  titrGroup.add(stopcock);

  const flaskGroup = new THREE.Group();
  const flaskBody = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.18, 0.28, 24, 1, true), mats.glass);
  flaskBody.position.y = 0.17;
  const flaskLiquid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.165, 0.12, 24),
    makeLiquidMaterial('#E0F2FE', 0.86, isSoftwareGl)
  );
  flaskLiquid.position.y = 0.1;
  flaskGroup.add(flaskBody, flaskLiquid);
  titrGroup.add(flaskGroup);

  const dropMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.014, 10, 10),
    new THREE.MeshBasicMaterial({ color: 0xf472b6 })
  );
  dropMesh.position.set(0, 0.38, 0);
  dropMesh.visible = false;
  titrGroup.add(dropMesh);
  root.add(titrGroup);

  // 5. GAS LAW RIG (Unit IV Boyle / Charles / Graham / Molar Volume)
  const gasGroup = new THREE.Group();
  const gasStand = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.05, 0.44), mats.ebonite);
  gasStand.position.y = 0.025;
  gasGroup.add(gasStand);
  const gasTube = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.92, 24, 1, true), mats.glass);
  gasTube.rotation.z = Math.PI / 2;
  gasTube.position.set(0, 0.36, 0);
  gasGroup.add(gasTube);
  const gasVolumeMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.095, 0.095, 0.45, 20),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.34 })
  );
  gasVolumeMesh.rotation.z = Math.PI / 2;
  gasVolumeMesh.position.set(-0.2, 0.36, 0);
  gasGroup.add(gasVolumeMesh);
  const pistonMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.102, 0.102, 0.07, 20), mats.brass);
  pistonMesh.rotation.z = Math.PI / 2;
  pistonMesh.position.set(0.06, 0.36, 0);
  gasGroup.add(pistonMesh);
  const diffusionRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.09, 0.018, 10, 24),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.92 })
  );
  diffusionRing.rotation.y = Math.PI / 2;
  diffusionRing.position.set(0.09, 0.36, 0);
  diffusionRing.visible = false;
  gasGroup.add(diffusionRing);
  root.add(gasGroup);

  // 6. CALORIMETER RIG (Unit V Energetics)
  const calGroup = new THREE.Group();
  const cupOuter = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.18, 0.44, 24),
    new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.7 })
  );
  cupOuter.position.set(0, 0.22, 0);
  calGroup.add(cupOuter);
  const cupLid = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.03, 24), mats.darkOak);
  cupLid.position.set(0, 0.45, 0);
  calGroup.add(cupLid);
  const calLiquid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.16, 0.25, 22),
    makeLiquidMaterial('#38BDF8', 0.85, isSoftwareGl)
  );
  calLiquid.position.set(0, 0.18, 0);
  calGroup.add(calLiquid);
  const thermStem = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.65, 12), mats.glass);
  thermStem.position.set(0.05, 0.62, 0);
  calGroup.add(thermStem);
  const thermFill = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, 0.52, 10),
    new THREE.MeshBasicMaterial({ color: 0xef4444 })
  );
  thermFill.position.set(0.05, 0.56, 0);
  calGroup.add(thermFill);
  const stirrerWire = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.5, 10), mats.steel);
  stirrerWire.position.set(-0.07, 0.52, 0);
  calGroup.add(stirrerWire);
  const spiritFlame = new THREE.Mesh(
    new THREE.ConeGeometry(0.05, 0.14, 14),
    new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.85 })
  );
  spiritFlame.position.set(0.45, 0.26, 0);
  spiritFlame.visible = false;
  calGroup.add(spiritFlame);
  root.add(calGroup);

  // 7. TEST TUBE RACK RIG (Units VI, VII, IX)
  const rackGroup = new THREE.Group();
  const rackBase = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.04, 0.3), mats.darkOak);
  rackBase.position.y = 0.02;
  const rackTop = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.03, 0.26), mats.darkOak);
  rackTop.position.y = 0.38;
  const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.36, 10), mats.darkOak);
  postL.position.set(-0.52, 0.2, 0);
  const postR = postL.clone();
  postR.position.x = 0.52;
  rackGroup.add(rackBase, rackTop, postL, postR);

  const tubeLiquids: THREE.Mesh[] = [];
  [-0.3, 0, 0.3].forEach((x) => {
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.48, 18, 1, true), mats.glass);
    tube.position.set(x, 0.3, 0);
    rackGroup.add(tube);
    const liq = new THREE.Mesh(
      new THREE.CylinderGeometry(0.048, 0.048, 0.26, 16),
      makeLiquidMaterial('#38BDF8', 0.85, isSoftwareGl)
    );
    liq.position.set(x, 0.2, 0);
    rackGroup.add(liq);
    tubeLiquids.push(liq);
  });

  const precipitateMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.046, 0.046, 0.06, 16),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 })
  );
  precipitateMesh.position.set(0, 0.1, 0);
  precipitateMesh.visible = false;
  rackGroup.add(precipitateMesh);

  const brownRingMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.049, 0.049, 0.03, 16),
    new THREE.MeshBasicMaterial({ color: 0x78350f })
  );
  brownRingMesh.position.set(0, 0.22, 0);
  brownRingMesh.visible = false;
  rackGroup.add(brownRingMesh);

  const rackBubbles = makeBubbleInstances(18);
  rackBubbles.position.set(0, 0.16, 0);
  rackGroup.add(rackBubbles);
  root.add(rackGroup);

  // 8. KINETICS FLASK & SYRINGE RIG (Unit VIII)
  const kinGroup = new THREE.Group();
  const crossCard = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.02, 0.42),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 })
  );
  crossCard.position.set(-0.18, 0.01, 0);
  kinGroup.add(crossCard);
  const crossUnderlay = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.022, 0.04),
    new THREE.MeshBasicMaterial({ color: 0x0f172a, transparent: true, opacity: 0.9 })
  );
  crossUnderlay.position.set(-0.18, 0.012, 0);
  kinGroup.add(crossUnderlay);
  const kinFlask = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.2, 0.34, 24, 1, true), mats.glass);
  kinFlask.position.set(-0.18, 0.19, 0);
  kinGroup.add(kinFlask);
  const kinLiquid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.18, 0.14, 24),
    makeLiquidMaterial('#E0F2FE', 0.85, isSoftwareGl)
  );
  kinLiquid.position.set(-0.18, 0.1, 0);
  kinGroup.add(kinLiquid);

  const syringeBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.55, 18, 1, true), mats.glass);
  syringeBarrel.rotation.z = Math.PI / 2;
  syringeBarrel.position.set(0.38, 0.34, 0);
  kinGroup.add(syringeBarrel);
  const syringePiston = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.12, 16), mats.brass);
  syringePiston.rotation.z = Math.PI / 2;
  syringePiston.position.set(0.25, 0.34, 0);
  kinGroup.add(syringePiston);
  const kinBubbles = makeBubbleInstances(22);
  kinBubbles.position.set(-0.18, 0.08, 0);
  kinGroup.add(kinBubbles);
  root.add(kinGroup);

  // 9. ELECTROCHEMICAL CELL RIG (Unit X)
  const ecGroup = new THREE.Group();
  const ecLeftBeaker = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.36, 22, 1, true), mats.glass);
  ecLeftBeaker.position.set(-0.34, 0.18, 0);
  const ecRightBeaker = ecLeftBeaker.clone();
  ecRightBeaker.position.x = 0.34;
  ecGroup.add(ecLeftBeaker, ecRightBeaker);

  const ecLeftLiq = new THREE.Mesh(
    new THREE.CylinderGeometry(0.165, 0.165, 0.22, 22),
    makeLiquidMaterial('#E0F2FE', 0.84, isSoftwareGl)
  );
  ecLeftLiq.position.set(-0.34, 0.12, 0);
  const ecRightLiq = new THREE.Mesh(
    new THREE.CylinderGeometry(0.165, 0.165, 0.22, 22),
    makeLiquidMaterial('#0284C7', 0.86, isSoftwareGl)
  );
  ecRightLiq.position.set(0.34, 0.12, 0);
  ecGroup.add(ecLeftLiq, ecRightLiq);

  const zincPlate = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.34, 0.14), mats.steel);
  zincPlate.position.set(-0.39, 0.22, 0);
  const copperPlate = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.34, 0.14), mats.copper);
  copperPlate.position.set(0.39, 0.22, 0);
  const cathodeDeposit = new THREE.Mesh(
    new THREE.BoxGeometry(0.055, 0.2, 0.15),
    new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.45, metalness: 0.7 })
  );
  cathodeDeposit.position.set(0.39, 0.15, 0);
  cathodeDeposit.visible = false;
  ecGroup.add(zincPlate, copperPlate, cathodeDeposit);

  // U-shaped salt bridge tube connecting both beakers
  const bridgeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.26, 0.14, 0),
    new THREE.Vector3(-0.22, 0.45, 0),
    new THREE.Vector3(0.22, 0.45, 0),
    new THREE.Vector3(0.26, 0.14, 0),
  ]);
  const saltBridge = new THREE.Mesh(new THREE.TubeGeometry(bridgeCurve, 20, 0.032, 10, false), mats.glass);
  ecGroup.add(saltBridge);

  const voltmeterBox = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.18, 0.14), mats.ebonite);
  voltmeterBox.position.set(0, 0.65, -0.15);
  ecGroup.add(voltmeterBox);

  const ecBubbles = makeBubbleInstances(18);
  ecBubbles.position.set(-0.34, 0.1, 0);
  ecGroup.add(ecBubbles);
  root.add(ecGroup);

  return {
    root,
    flameRig: {
      group: flameGroup,
      outerFlame,
      innerCone,
      loopGroup,
      glowLight,
    },
    conductivityRig: {
      group: condGroup,
      liquidMesh: condLiquid,
      bulbMesh,
      bubbles: condBubbles,
    },
    vseprRig: {
      group: vseprGroup,
      moleculeSpinGroup,
      atomMeshes,
      bondMeshes,
      loneMeshes,
      lastMolecule: null,
    },
    titrationRig: {
      group: titrGroup,
      buretteLiquid,
      flaskLiquid,
      dropMesh,
      flaskGroup,
    },
    gasLawRig: {
      group: gasGroup,
      pistonMesh,
      gasVolumeMesh,
      diffusionRing,
    },
    calorimeterRig: {
      group: calGroup,
      liquidMesh: calLiquid,
      thermometerFill: thermFill,
      stirrerWire,
      spiritFlame,
    },
    testTubeRig: {
      group: rackGroup,
      tubeLiquids,
      precipitateMesh,
      brownRingMesh,
      bubbles: rackBubbles,
    },
    kineticsRig: {
      group: kinGroup,
      flaskLiquid: kinLiquid,
      crossUnderlay,
      syringePiston,
      bubbles: kinBubbles,
    },
    electrochemRig: {
      group: ecGroup,
      leftLiquid: ecLeftLiq,
      rightLiquid: ecRightLiq,
      cathodeDeposit,
      bubbles: ecBubbles,
    },
  };
}

function animateBubbles(
  instanced: THREE.InstancedMesh,
  rate: number,
  elapsed: number,
  radiusSpread: number,
  heightSpan: number
) {
  instanced.visible = rate > 0.05;
  if (!instanced.visible) return;
  const count = instanced.count;
  for (let i = 0; i < count; i++) {
    const t = (elapsed * (0.45 + rate * 1.1) + i / count) % 1;
    const angle = i * 2.1;
    const r = ((i % 4) / 4) * radiusSpread;
    _tmpPos.set(Math.cos(angle) * r, t * heightSpan, Math.sin(angle) * r);
    const s = 0.65 + (1 - t) * 0.6;
    _tmpScale.setScalar(s);
    _tmpMat.compose(_tmpPos, _tmpQuat, _tmpScale);
    instanced.setMatrixAt(i, _tmpMat);
  }
  instanced.instanceMatrix.needsUpdate = true;
}

export function updateChemistryBenchRig(
  handles: ChemistryBenchHandles,
  mode: BenchApparatusKind,
  params: LabSimulationParams,
  isVisible: boolean,
  elapsed: number,
  dt: number
) {
  handles.root.visible = isVisible;
  handles.flameRig.group.visible = isVisible && mode === 'flame-burner';
  handles.conductivityRig.group.visible = isVisible && mode === 'conductivity-bath';
  handles.vseprRig.group.visible = isVisible && mode === 'vsepr-3d';
  handles.titrationRig.group.visible = isVisible && mode === 'titration-burette';
  handles.gasLawRig.group.visible = isVisible && mode === 'gas-law-rig';
  handles.calorimeterRig.group.visible = isVisible && mode === 'calorimeter-rig';
  handles.testTubeRig.group.visible = isVisible && mode === 'test-tube-rack';
  handles.kineticsRig.group.visible = isVisible && mode === 'kinetics-flask';
  handles.electrochemRig.group.visible = isVisible && mode === 'electrochem-cell';

  if (!isVisible) return;

  const tel = evaluateChemistryBench(params);

  if (mode === 'flame-burner') {
    const on = params.chem.burnerOn;
    handles.flameRig.innerCone.visible = on;
    handles.flameRig.outerFlame.visible = on;
    handles.flameRig.glowLight.intensity = on ? 2.2 : 0;
    handles.flameRig.glowLight.color.set(tel.flameColorHex);
    (handles.flameRig.outerFlame.material as THREE.MeshBasicMaterial).color.set(tel.flameColorHex);
    const flicker = 1 + Math.sin(elapsed * 22) * 0.07;
    handles.flameRig.outerFlame.scale.set(1, flicker, 1);
    handles.flameRig.loopGroup.position.x = on ? 0.31 : 0.44;
  }

  if (mode === 'conductivity-bath') {
    (handles.conductivityRig.liquidMesh.material as THREE.MeshPhysicalMaterial).color.set(tel.liquidColorHex);
    const bright = params.chem.liquidSample === 'nacl-aq' ? 2.2 : params.chem.liquidSample === 'hc2h3o2' ? 0.65 : 0.05;
    (handles.conductivityRig.bulbMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = bright;
    animateBubbles(handles.conductivityRig.bubbles, tel.gasBubbles, elapsed, 0.14, 0.24);
  }

  if (mode === 'vsepr-3d') {
    handles.vseprRig.moleculeSpinGroup.rotation.y += dt * 0.75;
    if (handles.vseprRig.lastMolecule !== params.chem.vseprMolecule) {
      handles.vseprRig.lastMolecule = params.chem.vseprMolecule;
      const spec = getVseprSpec(params.chem.vseprMolecule);
      handles.vseprRig.atomMeshes.forEach((atom, i) => {
        const vec = spec.bondVectors[i];
        const bond = handles.vseprRig.bondMeshes[i];
        if (!vec) {
          atom.visible = false;
          bond.visible = false;
          return;
        }
        atom.visible = true;
        bond.visible = true;
        _dirVec.set(vec[0], vec[1], vec[2]).normalize();
        atom.position.copy(_dirVec).multiplyScalar(0.32);
        bond.position.copy(_dirVec).multiplyScalar(0.16);
        bond.quaternion.setFromUnitVectors(_upVec, _dirVec);
      });
      handles.vseprRig.loneMeshes.forEach((lobe, i) => {
        const lVec = spec.loneVectors[i];
        if (!lVec) {
          lobe.visible = false;
          return;
        }
        lobe.visible = true;
        _dirVec.set(lVec[0], lVec[1], lVec[2]).normalize();
        lobe.position.copy(_dirVec).multiplyScalar(0.2);
        lobe.quaternion.setFromUnitVectors(_upVec, _dirVec);
      });
    }
  }

  if (mode === 'titration-burette') {
    const remainingFrac = Math.max(0.08, 1 - params.chem.buretteVolumeMl / 52);
    handles.titrationRig.buretteLiquid.scale.y = remainingFrac;
    handles.titrationRig.buretteLiquid.position.y = 0.53 + remainingFrac * 0.32;
    (handles.titrationRig.buretteLiquid.material as THREE.MeshPhysicalMaterial).color.set(tel.secondaryLiquidHex);
    (handles.titrationRig.flaskLiquid.material as THREE.MeshPhysicalMaterial).color.set(tel.liquidColorHex);
    handles.titrationRig.dropMesh.visible = params.chem.buretteVolumeMl > 0.2;
    handles.titrationRig.dropMesh.position.y = 0.44 - ((elapsed * 1.8) % 1) * 0.24;
    if (params.chem.stirringOn) {
      handles.titrationRig.flaskGroup.position.x = Math.sin(elapsed * 9) * 0.025;
    } else {
      handles.titrationRig.flaskGroup.position.x = 0;
    }
  }

  if (mode === 'gas-law-rig') {
    const frac = tel.syringeFraction;
    const pistonX = -0.35 + frac * 0.7;
    handles.gasLawRig.pistonMesh.position.x = pistonX;
    handles.gasLawRig.gasVolumeMesh.scale.y = Math.max(0.2, frac * 1.45);
    handles.gasLawRig.gasVolumeMesh.position.x = (-0.42 + pistonX) / 2;
    handles.gasLawRig.diffusionRing.visible =
      params.experimentId === 'graham-diffusion' && (params.chem.reagentAdded || params.chem.burnerOn);
  }

  if (mode === 'calorimeter-rig') {
    (handles.calorimeterRig.liquidMesh.material as THREE.MeshPhysicalMaterial).color.set(tel.liquidColorHex);
    handles.calorimeterRig.thermometerFill.scale.y = Math.max(0.25, tel.thermometerNorm);
    handles.calorimeterRig.spiritFlame.visible =
      params.experimentId === 'alcohol-combustion' && params.chem.burnerOn;
    handles.calorimeterRig.stirrerWire.position.y =
      params.chem.stirringOn ? 0.52 + Math.sin(elapsed * 8) * 0.06 : 0.52;
  }

  if (mode === 'test-tube-rack') {
    handles.testTubeRig.tubeLiquids.forEach((liq) => {
      (liq.material as THREE.MeshPhysicalMaterial).color.set(tel.liquidColorHex);
    });
    handles.testTubeRig.precipitateMesh.visible = Boolean(tel.precipitateColorHex);
    if (tel.precipitateColorHex) {
      (handles.testTubeRig.precipitateMesh.material as THREE.MeshStandardMaterial).color.set(tel.precipitateColorHex);
    }
    handles.testTubeRig.brownRingMesh.visible =
      params.experimentId === 'brown-ring-nitrate' && params.chem.reagentAdded;
    animateBubbles(handles.testTubeRig.bubbles, tel.gasBubbles, elapsed, 0.035, 0.22);
  }

  if (mode === 'kinetics-flask') {
    (handles.kineticsRig.flaskLiquid.material as THREE.MeshPhysicalMaterial).color.set(tel.liquidColorHex);
    (handles.kineticsRig.crossUnderlay.material as THREE.MeshBasicMaterial).opacity =
      params.experimentId === 'thiosulphate-cross' && params.chem.reagentAdded ? 0.16 : 0.92;
    handles.kineticsRig.syringePiston.position.x = 0.16 + tel.syringeFraction * 0.42;
    animateBubbles(handles.kineticsRig.bubbles, tel.gasBubbles, elapsed, 0.1, 0.18);
  }

  if (mode === 'electrochem-cell') {
    const ec = computeElectrochemState(params);
    (handles.electrochemRig.leftLiquid.material as THREE.MeshPhysicalMaterial).color.set(ec.leftSolutionColorHex);
    (handles.electrochemRig.rightLiquid.material as THREE.MeshPhysicalMaterial).color.set(ec.rightSolutionColorHex);
    handles.electrochemRig.cathodeDeposit.visible = ec.platedMassMg > 10;
    animateBubbles(handles.electrochemRig.bubbles, ec.gasBubbleRate, elapsed, 0.09, 0.18);
  }
}
