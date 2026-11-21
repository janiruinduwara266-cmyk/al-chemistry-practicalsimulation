import * as THREE from 'three';
import {
  buildCrookesTubeRig,
  buildInductionCoil,
  buildVacuumPump,
  type CrookesRigHandles,
  type LabMaterialPalette,
} from './apparatusModels';
import type { InstrumentRuntimeState } from '../data/equipmentCatalog';

export interface EquipmentStageHandles {
  root: THREE.Group;
  groups: Record<string, THREE.Group>;
  update: (
    activeId: string,
    state: InstrumentRuntimeState,
    elapsed: number,
    dt: number
  ) => { lightColor: string; lightIntensity: number };
}

function makeSafeLiquidMat(colorHex: number | string, opacity: number, isSoftwareGl: boolean) {
  return new THREE.MeshPhysicalMaterial({
    color: colorHex,
    roughness: 0.14,
    metalness: 0.0,
    transmission: isSoftwareGl ? 0 : 0.25,
    transparent: true,
    opacity,
  });
}

function makeBubbles(count: number, colorHex = 0xe0f2fe): THREE.InstancedMesh {
  const geo = new THREE.SphereGeometry(0.015, 8, 8);
  const mat = new THREE.MeshBasicMaterial({
    color: colorHex,
    transparent: true,
    opacity: 0.82,
  });
  return new THREE.InstancedMesh(geo, mat, count);
}

const _m = new THREE.Matrix4();
const _p = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3(1, 1, 1);

function createDynamicLcdTexture(width = 256, height = 128) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  let lastSig = '';

  const redraw = (
    bg: string,
    fg: string,
    header: string,
    mainText: string,
    subText: string
  ) => {
    const sig = `${bg}|${fg}|${header}|${mainText}|${subText}`;
    if (sig === lastSig) return;
    lastSig = sig;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = fg;
    ctx.lineWidth = 3;
    ctx.strokeRect(4, 4, width - 8, height - 8);
    ctx.fillStyle = fg;
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(header, 14, 26);
    ctx.font = 'bold 40px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(mainText, width / 2, 78);
    ctx.font = '15px monospace';
    ctx.fillText(subText, width / 2, 108);
    tex.needsUpdate = true;
  };

  redraw('#064e3b', '#6ee7b7', 'CHEMLAB', 'READY', 'CALIBRATED');
  return { tex, redraw };
}

function createAnalogDialTexture(title: string, ticks: string[]) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#fefce8';
  ctx.beginPath();
  ctx.arc(128, 128, 124, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 6;
  ctx.stroke();

  // Graduated arc ticks
  const n = ticks.length - 1;
  ticks.forEach((lbl, i) => {
    const ang = Math.PI * 0.8 + (i / Math.max(1, n)) * Math.PI * 1.4;
    const x1 = 128 + Math.cos(ang) * 86;
    const y1 = 128 + Math.sin(ang) * 86;
    const x2 = 128 + Math.cos(ang) * 106;
    const y2 = 128 + Math.sin(ang) * 106;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(lbl, 128 + Math.cos(ang) * 68, 128 + Math.sin(ang) * 68);
  });

  ctx.fillStyle = '#b91c1c';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, 128, 182);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createGlassGraduationsTexture(labels: string[]) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 128, 512);
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.font = 'bold 18px monospace';

  const count = 24;
  for (let i = 0; i <= count; i++) {
    const y = 32 + (i / count) * 448;
    const isMajor = i % 4 === 0;
    ctx.lineWidth = isMajor ? 3 : 1.5;
    ctx.beginPath();
    ctx.moveTo(22, y);
    ctx.lineTo(isMajor ? 62 : 42, y);
    ctx.stroke();
    if (isMajor && labels[i / 4]) {
      ctx.fillText(labels[i / 4], 68, y + 6);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeWire(pts: [number, number, number][], colorHex: number, radius = 0.011) {
  const curve = new THREE.CatmullRomCurve3(pts.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
  return new THREE.Mesh(
    new THREE.TubeGeometry(curve, 22, radius, 8, false),
    new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.55, metalness: 0.1 })
  );
}

export function buildEquipmentStage(
  mats: LabMaterialPalette,
  isSoftwareGl: boolean
): EquipmentStageHandles {
  const root = new THREE.Group();
  const groups: Record<string, THREE.Group> = {};

  const reg = (id: string) => {
    const g = new THREE.Group();
    g.visible = false;
    root.add(g);
    groups[id] = g;
    return g;
  };

  // 1. HV INDUCTION COIL
  const hvGroup = reg('hv-induction-coil');
  const hvCoil = buildInductionCoil(mats);
  hvCoil.group.position.set(0, 0, 0);
  hvCoil.group.scale.setScalar(1.35);
  hvGroup.add(hvCoil.group);

  // 2. VACUUM PUMP & PRESSURE GAUGE
  const vacGroup = reg('vacuum-pump-gauge');
  const vacPump = buildVacuumPump(mats);
  vacPump.group.position.set(-0.38, 0, 0);
  vacPump.group.scale.setScalar(1.2);
  vacGroup.add(vacPump.group);
  // Mini connected discharge bell
  const vacDomeBase = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.27, 0.06, 24), mats.brass);
  vacDomeBase.position.set(0.5, 0.03, 0);
  vacGroup.add(vacDomeBase);
  const vacDomeGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.48, 24), mats.glass);
  vacDomeGlass.position.set(0.5, 0.3, 0);
  vacGroup.add(vacDomeGlass);
  const vacGlowMat = new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.3 });
  const vacGlowCore = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.42, 18), vacGlowMat);
  vacGlowCore.position.set(0.5, 0.3, 0);
  vacGroup.add(vacGlowCore);
  // Vacuum dial gauge + braided rubber hose to discharge bell
  const vacDialTex = createAnalogDialTexture('mmHg', ['760', '100', '10', '1', '0.01']);
  const vacDialFace = new THREE.Mesh(
    new THREE.CircleGeometry(0.11, 24),
    new THREE.MeshBasicMaterial({ map: vacDialTex })
  );
  vacDialFace.position.set(-0.38, 0.62, 0.21);
  vacGroup.add(vacDialFace);
  const vacGaugeNeedle = new THREE.Mesh(
    new THREE.BoxGeometry(0.012, 0.09, 0.01),
    new THREE.MeshBasicMaterial({ color: 0xef4444 })
  );
  vacGaugeNeedle.position.set(-0.38, 0.62, 0.22);
  vacGroup.add(vacGaugeNeedle);
  vacGroup.add(makeWire([[-0.18, 0.28, 0], [0.08, 0.12, 0.12], [0.34, 0.06, 0]], 0x334155, 0.022));

  // 3. DC AMMETER / VOLTMETER + ELECTROLYSIS BATH
  const dcGroup = reg('dc-ammeter-voltmeter');
  const dcMat = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.018, 0.56), mats.ebonite);
  dcMat.position.set(-0.48, 0.009, 0);
  dcGroup.add(dcMat);
  const dcBox = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.44, 0.42), mats.ebonite);
  dcBox.position.set(-0.48, 0.22, 0);
  dcGroup.add(dcBox);
  const dcPanel = new THREE.Mesh(
    new THREE.BoxGeometry(0.68, 0.36, 0.02),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 })
  );
  dcPanel.position.set(-0.48, 0.23, 0.21);
  dcGroup.add(dcPanel);
  const dcDialTex = createAnalogDialTexture('VOLTS / A', ['0', '3', '6', '9', '12']);
  const dcDial = new THREE.Mesh(
    new THREE.CircleGeometry(0.12, 24),
    new THREE.MeshBasicMaterial({ map: dcDialTex })
  );
  dcDial.position.set(-0.62, 0.27, 0.225);
  dcGroup.add(dcDial);
  const dcNeedle = new THREE.Mesh(
    new THREE.BoxGeometry(0.012, 0.09, 0.01),
    new THREE.MeshBasicMaterial({ color: 0xdc2626 })
  );
  dcNeedle.position.set(-0.62, 0.27, 0.23);
  dcGroup.add(dcNeedle);
  const dcLcd = createDynamicLcdTexture(256, 128);
  const dcDigitalFace = new THREE.Mesh(
    new THREE.PlaneGeometry(0.24, 0.12),
    new THREE.MeshBasicMaterial({ map: dcLcd.tex })
  );
  dcDigitalFace.position.set(-0.31, 0.26, 0.225);
  dcGroup.add(dcDigitalFace);
  const dcLedMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
  const dcLed = new THREE.Mesh(new THREE.SphereGeometry(0.02, 12, 12), dcLedMat);
  dcLed.position.set(-0.22, 0.37, 0.225);
  dcGroup.add(dcLed);
  // Top-right banana terminals + insulated leads routed clear of the LCD
  const dcTermRed = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.04, 12), mats.rubberRed);
  dcTermRed.position.set(-0.2, 0.45, 0.08);
  const dcTermBlk = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.04, 12), mats.ebonite);
  dcTermBlk.position.set(-0.2, 0.45, -0.06);
  dcGroup.add(dcTermRed, dcTermBlk);
  dcGroup.add(makeWire([[-0.2, 0.47, 0.08], [0.06, 0.62, 0.1], [0.54, 0.45, 0]], 0xdc2626, 0.011));
  dcGroup.add(makeWire([[-0.2, 0.47, -0.06], [0.02, 0.58, -0.06], [0.3, 0.45, 0]], 0x1e293b, 0.011));
  // Electrolysis beaker
  const dcBeaker = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.26, 0.44, 24, 1, true), mats.glass);
  dcBeaker.position.set(0.42, 0.22, 0);
  dcGroup.add(dcBeaker);
  const dcLiqMat = makeSafeLiquidMat(0x0ea5e9, 0.72, isSoftwareGl);
  const dcLiq = new THREE.Mesh(new THREE.CylinderGeometry(0.255, 0.245, 0.3, 24), dcLiqMat);
  dcLiq.position.set(0.42, 0.15, 0);
  dcGroup.add(dcLiq);
  const dcElecL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.38, 0.08), mats.ebonite);
  dcElecL.position.set(0.3, 0.26, 0);
  dcGroup.add(dcElecL);
  const dcElecR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.38, 0.08), mats.copper);
  dcElecR.position.set(0.54, 0.26, 0);
  dcGroup.add(dcElecR);
  const dcBubbles = makeBubbles(24);
  dcGroup.add(dcBubbles);

  // 4. DIGITAL pH METER
  const phGroup = reg('digital-ph-meter');
  const phPad = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.016, 0.54), mats.ebonite);
  phPad.position.set(-0.4, 0.008, 0);
  phGroup.add(phPad);
  const phMeterBody = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.36, 0.4), mats.steel);
  phMeterBody.position.set(-0.4, 0.18, 0);
  phMeterBody.rotation.x = -0.18;
  phGroup.add(phMeterBody);
  const phLcd = createDynamicLcdTexture(256, 128);
  const phScreenMat = new THREE.MeshBasicMaterial({ map: phLcd.tex });
  const phScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.19), phScreenMat);
  phScreen.position.set(-0.4, 0.26, 0.203);
  phScreen.rotation.x = -0.18;
  phGroup.add(phScreen);
  const phArmStand = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.85, 12), mats.steel);
  phArmStand.position.set(0.05, 0.425, -0.1);
  phGroup.add(phArmStand);
  const phProbeGroup = new THREE.Group();
  const phHolder = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.03, 0.04), mats.ebonite);
  phHolder.position.set(0.24, 0.72, -0.05);
  phProbeGroup.add(phHolder);
  const phProbeShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.45, 14), mats.glassRim);
  phProbeShaft.position.set(0.42, 0.5, 0);
  phProbeGroup.add(phProbeShaft);
  const phBulbTip = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 12), mats.glass);
  phBulbTip.position.set(0.42, 0.27, 0);
  phProbeGroup.add(phBulbTip);
  phGroup.add(phProbeGroup);
  // Coaxial BNC cable connecting pH meter to glass electrode
  phGroup.add(makeWire([[-0.22, 0.26, -0.14], [0.05, 0.84, -0.12], [0.42, 0.74, 0]], 0x0f172a, 0.01));
  const phBeaker = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.23, 0.38, 24, 1, true), mats.glass);
  phBeaker.position.set(0.42, 0.19, 0);
  phGroup.add(phBeaker);
  const phLiqMat = makeSafeLiquidMat(0xf87171, 0.75, isSoftwareGl);
  const phLiq = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.21, 0.25, 24), phLiqMat);
  phLiq.position.set(0.42, 0.13, 0);
  phGroup.add(phLiq);

  // 5. CONDUCTIVITY TESTER
  const condGroup = reg('conductivity-tester');
  const condBattery = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.34, 0.34), mats.ebonite);
  condBattery.position.set(-0.5, 0.17, 0);
  condGroup.add(condBattery);
  const condBulbMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfacc15,
    emissiveIntensity: 0,
    roughness: 0.2,
  });
  const condBulb = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 20), condBulbMat);
  condBulb.position.set(-0.5, 0.46, 0);
  condGroup.add(condBulb);
  condGroup.add(makeWire([[-0.3, 0.28, 0.06], [0, 0.5, 0.06], [0.22, 0.44, 0]], 0xdc2626, 0.01));
  condGroup.add(makeWire([[-0.3, 0.24, -0.06], [0.06, 0.48, -0.06], [0.42, 0.44, 0]], 0x1e293b, 0.01));
  const condBeaker = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.25, 0.42, 24, 1, true), mats.glass);
  condBeaker.position.set(0.32, 0.21, 0);
  condGroup.add(condBeaker);
  const condLiqMat = makeSafeLiquidMat(0x38bdf8, 0.72, isSoftwareGl);
  const condLiq = new THREE.Mesh(new THREE.CylinderGeometry(0.245, 0.235, 0.28, 24), condLiqMat);
  condLiq.position.set(0.32, 0.14, 0);
  condGroup.add(condLiq);
  const condElec1 = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.36, 12), mats.ebonite);
  condElec1.position.set(0.22, 0.26, 0);
  const condElec2 = condElec1.clone();
  condElec2.position.set(0.42, 0.26, 0);
  condGroup.add(condElec1, condElec2);
  const condBubbles = makeBubbles(20);
  condGroup.add(condBubbles);

  // 6. ANALYTICAL BALANCE (0.0001 g)
  const balGroup = reg('analytical-balance');
  const balBase = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.18, 0.84), mats.steel);
  balBase.position.set(0, 0.1, 0);
  balGroup.add(balBase);
  for (const [fx, fz] of [[-0.33, -0.36], [0.33, -0.36], [-0.33, 0.36], [0.33, 0.36]]) {
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.02, 14), mats.brass);
    foot.position.set(fx, 0.01, fz);
    balGroup.add(foot);
  }
  const balLcdCtrl = createDynamicLcdTexture(256, 96);
  const balLcd = new THREE.Mesh(
    new THREE.PlaneGeometry(0.48, 0.11),
    new THREE.MeshBasicMaterial({ map: balLcdCtrl.tex })
  );
  balLcd.position.set(0, 0.11, 0.425);
  balGroup.add(balLcd);
  const balShield = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.46, 0.56), mats.glass);
  balShield.position.set(0, 0.42, -0.05);
  balGroup.add(balShield);
  const balFrame = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.03, 0.58), mats.ebonite);
  balFrame.position.set(0, 0.66, -0.05);
  balGroup.add(balFrame);
  const balPan = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.025, 24), mats.steel);
  balPan.position.set(0, 0.23, -0.05);
  balGroup.add(balPan);
  const balSampleMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
  const balSampleBoat = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.07, 0.05, 18), mats.brass);
  balSampleBoat.position.set(0, 0.265, -0.05);
  balGroup.add(balSampleBoat);
  const balPowder = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.05, 16), balSampleMat);
  balPowder.position.set(0, 0.295, -0.05);
  balGroup.add(balPowder);

  // 7. MAGNETIC STIRRER & ELECTRIC HOTPLATE
  const stirGroup = reg('magnetic-stirrer-hotplate');
  const stirBase = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.18, 0.66), mats.ebonite);
  stirBase.position.set(0, 0.09, 0);
  stirGroup.add(stirBase);
  const stirLcdCtrl = createDynamicLcdTexture(256, 96);
  const stirLcd = new THREE.Mesh(
    new THREE.PlaneGeometry(0.28, 0.09),
    new THREE.MeshBasicMaterial({ map: stirLcdCtrl.tex })
  );
  stirLcd.position.set(0, 0.11, 0.332);
  stirGroup.add(stirLcd);
  const stirKnobL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.043, 0.04, 16), mats.brass);
  stirKnobL.rotation.x = Math.PI / 2;
  stirKnobL.position.set(-0.22, 0.09, 0.34);
  const stirKnobR = stirKnobL.clone();
  stirKnobR.position.set(0.22, 0.09, 0.34);
  const stirLedMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
  const stirLed = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 10), stirLedMat);
  stirLed.position.set(0, 0.035, 0.334);
  stirGroup.add(stirKnobL, stirKnobR, stirLed);
  const stirPlateMat = new THREE.MeshStandardMaterial({
    color: 0xdbeafe,
    emissive: 0xea580c,
    emissiveIntensity: 0,
    roughness: 0.35,
  });
  const stirPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.03, 28), stirPlateMat);
  stirPlate.position.set(0, 0.195, -0.02);
  stirGroup.add(stirPlate);
  const stirGlowRingMat = new THREE.MeshBasicMaterial({
    color: 0xf97316,
    transparent: true,
    opacity: 0.85,
  });
  const stirGlowRing = new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.012, 8, 28), stirGlowRingMat);
  stirGlowRing.rotation.x = Math.PI / 2;
  stirGlowRing.position.set(0, 0.212, -0.02);
  stirGroup.add(stirGlowRing);
  const stirBeaker = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.42, 24, 1, true), mats.glass);
  stirBeaker.position.set(0, 0.42, -0.02);
  stirGroup.add(stirBeaker);
  const stirScaleTex = createGlassGraduationsTexture(['250', '200', '150', '100', '50']);
  const stirBeakerLabel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.221, 0.221, 0.34, 18, 1, true, -0.45, 0.9),
    new THREE.MeshBasicMaterial({ map: stirScaleTex, transparent: true, side: THREE.DoubleSide })
  );
  stirBeakerLabel.position.set(0, 0.42, -0.02);
  stirGroup.add(stirBeakerLabel);
  const stirBeakerRim = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.01, 8, 24), mats.glassRim);
  stirBeakerRim.rotation.x = Math.PI / 2;
  stirBeakerRim.position.set(0, 0.63, -0.02);
  stirGroup.add(stirBeakerRim);
  const stirLiq = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 0.28, 24),
    makeSafeLiquidMat(0x7c3aed, 0.72, isSoftwareGl)
  );
  stirLiq.position.set(0, 0.35, -0.02);
  stirGroup.add(stirLiq);
  const stirBar = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.02, 0.09, 6, 12),
    new THREE.MeshBasicMaterial({ color: 0xfef08a })
  );
  stirBar.rotation.z = Math.PI / 2;
  stirBar.position.set(0, 0.25, -0.02);
  stirGroup.add(stirBar);

  // 8. 50 mL BURETTE & RETORT STAND
  const burGroup = reg('burette-stand');
  const burBase = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.04, 0.32), mats.ebonite);
  burBase.position.set(-0.22, 0.02, 0);
  burGroup.add(burBase);
  const burTile = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.015, 0.42),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25 })
  );
  burTile.position.set(0, 0.008, 0);
  burGroup.add(burTile);
  const burRod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.32, 14), mats.steel);
  burRod.position.set(-0.22, 0.68, 0);
  burGroup.add(burRod);
  const burClamp = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.03, 0.04), mats.brass);
  burClamp.position.set(-0.11, 0.88, 0);
  burGroup.add(burClamp);
  const burGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.82, 18, 1, true), mats.glass);
  burGlass.position.set(0, 0.82, 0);
  burGroup.add(burGlass);
  const burScaleTex = createGlassGraduationsTexture(['0', '10', '20', '30', '40', '50 mL']);
  const burScaleOverlay = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0375, 0.0375, 0.72, 16, 1, true, -0.6, 1.2),
    new THREE.MeshBasicMaterial({ map: burScaleTex, transparent: true, side: THREE.DoubleSide })
  );
  burScaleOverlay.position.set(0, 0.82, 0);
  burGroup.add(burScaleOverlay);
  const burStopcock = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 0.11, 12),
    new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.35 })
  );
  burStopcock.rotation.z = Math.PI / 2;
  burStopcock.position.set(0, 0.43, 0);
  burGroup.add(burStopcock);
  const burLiqMat = makeSafeLiquidMat(0xd946ef, 0.82, isSoftwareGl);
  const burLiq = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.65, 16), burLiqMat);
  burLiq.position.set(0, 0.78, 0);
  burGroup.add(burLiq);
  const burFlask = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.28, 22, 1, true), mats.glass);
  burFlask.position.set(0, 0.15, 0);
  burGroup.add(burFlask);
  const burFlaskLiqMat = makeSafeLiquidMat(0xe2e8f0, 0.76, isSoftwareGl);
  const burFlaskLiq = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.11, 20), burFlaskLiqMat);
  burFlaskLiq.position.set(0, 0.07, 0);
  burGroup.add(burFlaskLiq);
  const burDrop = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 10), burLiqMat);
  burDrop.position.set(0, 0.34, 0);
  burGroup.add(burDrop);

  // 9. 25 mL PIPETTE & SAFETY FILLER
  const pipGroup = reg('pipette-filler');
  const pipBeaker = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.34, 22, 1, true), mats.glass);
  pipBeaker.position.set(0, 0.17, 0);
  pipGroup.add(pipBeaker);
  const pipLiqMat = makeSafeLiquidMat(0x0ea5e9, 0.78, isSoftwareGl);
  const pipBeakerLiq = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.2, 0.18, 22), pipLiqMat);
  pipBeakerLiq.position.set(0, 0.09, 0);
  pipGroup.add(pipBeakerLiq);
  const pipGlass = new THREE.Group();
  const pipStem = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.012, 0.68, 14), mats.glass);
  pipStem.position.set(0, 0.64, 0);
  pipGlass.add(pipStem);
  const pipBulb = new THREE.Mesh(new THREE.SphereGeometry(0.068, 16, 16), mats.glass);
  pipBulb.scale.set(1, 1.5, 1);
  pipBulb.position.set(0, 0.66, 0);
  pipGlass.add(pipBulb);
  const pipFiller = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 16), mats.rubberRed);
  pipFiller.position.set(0, 1.03, 0);
  pipGlass.add(pipFiller);
  const pipFillCore = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.012, 0.28, 14), pipLiqMat);
  pipFillCore.position.set(0, 0.62, 0);
  pipGlass.add(pipFillCore);
  pipGroup.add(pipGlass);

  // 10. 250 mL VOLUMETRIC FLASK
  const volGroup = reg('volumetric-flask');
  const volPivot = new THREE.Group();
  const volBody = new THREE.Mesh(new THREE.SphereGeometry(0.24, 22, 22), mats.glass);
  volBody.position.y = 0.23;
  volPivot.add(volBody);
  const volNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.44, 18, 1, true), mats.glass);
  volNeck.position.y = 0.62;
  volPivot.add(volNeck);
  const volMark = new THREE.Mesh(
    new THREE.TorusGeometry(0.048, 0.005, 8, 20),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  volMark.rotation.x = Math.PI / 2;
  volMark.position.y = 0.66;
  volPivot.add(volMark);
  const volStopper = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.04, 0.1, 16), mats.ebonite);
  volStopper.position.y = 0.86;
  volPivot.add(volStopper);
  const volLiqMat = makeSafeLiquidMat(0xf97316, 0.8, isSoftwareGl);
  const volLiq = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 20), volLiqMat);
  volLiq.position.y = 0.22;
  volPivot.add(volLiq);
  volGroup.add(volPivot);

  // 11. CONICAL FLASK & INDICATOR DROPPER
  const conGroup = reg('conical-flask-dropper');
  const conBody = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.44, 24, 1, true), mats.glass);
  conBody.position.y = 0.22;
  conGroup.add(conBody);
  const conNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.18, 18, 1, true), mats.glass);
  conNeck.position.y = 0.48;
  conGroup.add(conNeck);
  const conLiqMat = makeSafeLiquidMat(0xf472b6, 0.78, isSoftwareGl);
  const conLiq = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.23, 0.18, 22), conLiqMat);
  conLiq.position.y = 0.1;
  conGroup.add(conLiq);
  const conDropper = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.008, 0.24, 12), mats.glassRim);
  conDropper.position.set(0, 0.76, 0);
  conGroup.add(conDropper);

  // 12. BUNSEN BURNER & FLAME LOOP
  const bunGroup = reg('bunsen-burner');
  const bunBase = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.05, 24), mats.ebonite);
  bunBase.position.y = 0.025;
  bunGroup.add(bunBase);
  const bunCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 16), mats.brass);
  bunCollar.position.y = 0.1;
  bunGroup.add(bunCollar);
  const bunTube = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.34, 18), mats.steel);
  bunTube.position.y = 0.32;
  bunGroup.add(bunTube);
  const bunFlameMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.84 });
  const bunFlame = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.36, 16), bunFlameMat);
  bunFlame.position.y = 0.67;
  bunGroup.add(bunFlame);
  const bunInner = new THREE.Mesh(
    new THREE.ConeGeometry(0.04, 0.18, 14),
    new THREE.MeshBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.9 })
  );
  bunInner.position.y = 0.58;
  bunGroup.add(bunInner);
  const bunLoopWire = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.44, 10), mats.steel);
  bunLoopWire.rotation.z = Math.PI / 2.2;
  bunLoopWire.position.set(0.2, 0.67, 0);
  bunGroup.add(bunLoopWire);

  // 13. CALORIMETER & THERMOMETER
  const calGroup = reg('coffee-cup-calorimeter');
  const calCup = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.21, 0.42, 24),
    new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.82 })
  );
  calCup.position.y = 0.21;
  calGroup.add(calCup);
  const calLid = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.04, 24), mats.darkOak);
  calLid.position.y = 0.43;
  calGroup.add(calLid);
  const calTherm = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.64, 12), mats.glassRim);
  calTherm.position.set(0.07, 0.56, 0);
  calGroup.add(calTherm);
  const calMercMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const calMerc = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.32, 10), calMercMat);
  calMerc.position.set(0.07, 0.52, 0.015);
  calGroup.add(calMerc);
  const calStir = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.32, 10), mats.steel);
  calStir.position.set(-0.08, 0.52, 0);
  calGroup.add(calStir);

  // 14. 100 mL GAS SYRINGE
  const syrGroup = reg('gas-syringe');
  const syrCradle = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.06, 0.22), mats.darkOak);
  syrCradle.position.set(0, 0.03, 0);
  syrGroup.add(syrCradle);
  const syrBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.72, 20, 1, true), mats.glass);
  syrBarrel.rotation.z = Math.PI / 2;
  syrBarrel.position.set(-0.06, 0.22, 0);
  syrGroup.add(syrBarrel);
  const syrPlunger = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.46, 18), mats.steel);
  syrPlunger.rotation.z = Math.PI / 2;
  syrPlunger.position.set(0.24, 0.22, 0);
  syrGroup.add(syrPlunger);
  const syrGasGlow = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.4, 18),
    makeSafeLiquidMat(0x38bdf8, 0.35, isSoftwareGl)
  );
  syrGasGlow.rotation.z = Math.PI / 2;
  syrGasGlow.position.set(-0.2, 0.22, 0);
  syrGroup.add(syrGasGlow);

  // 15. LIEBIG CONDENSER
  const liebGroup = reg('liebig-condenser');
  const liebBoilingFlask = new THREE.Mesh(new THREE.SphereGeometry(0.19, 20, 20), mats.glass);
  liebBoilingFlask.position.set(-0.5, 0.24, 0);
  liebGroup.add(liebBoilingFlask);
  const liebLiq = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 18, 18),
    makeSafeLiquidMat(0xf59e0b, 0.75, isSoftwareGl)
  );
  liebLiq.position.set(-0.5, 0.22, 0);
  liebGroup.add(liebLiq);
  const liebJacket = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.74, 18), mats.glass);
  liebJacket.rotation.z = Math.PI / 2.3;
  liebJacket.position.set(0.05, 0.48, 0);
  liebGroup.add(liebJacket);
  const liebWaterMat = makeSafeLiquidMat(0x0ea5e9, 0.42, isSoftwareGl);
  const liebWater = new THREE.Mesh(new THREE.CylinderGeometry(0.074, 0.074, 0.7, 16), liebWaterMat);
  liebWater.rotation.z = Math.PI / 2.3;
  liebWater.position.set(0.05, 0.48, 0);
  liebGroup.add(liebWater);
  const liebReceiver = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.14, 0.24, 18, 1, true), mats.glass);
  liebReceiver.position.set(0.55, 0.12, 0);
  liebGroup.add(liebReceiver);
  const liebDrop = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 10), liebWaterMat);
  liebDrop.position.set(0.55, 0.28, 0);
  liebGroup.add(liebDrop);

  // 16. KIPP'S APPARATUS
  const kippGroup = reg('kipps-apparatus');
  const kippBot = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 20), mats.glass);
  kippBot.position.y = 0.22;
  const kippMid = new THREE.Mesh(new THREE.SphereGeometry(0.21, 20, 20), mats.glass);
  kippMid.position.y = 0.56;
  const kippTop = new THREE.Mesh(new THREE.SphereGeometry(0.18, 20, 20), mats.glass);
  kippTop.position.y = 0.92;
  kippGroup.add(kippBot, kippMid, kippTop);
  const kippAcidMat = makeSafeLiquidMat(0x38bdf8, 0.68, isSoftwareGl);
  const kippAcid = new THREE.Mesh(new THREE.SphereGeometry(0.19, 18, 18), kippAcidMat);
  kippAcid.position.y = 0.24;
  kippGroup.add(kippAcid);
  const kippBubbles = makeBubbles(16, 0x86efac);
  kippGroup.add(kippBubbles);

  // 17. CROOKES TUBE
  const crkGroup = reg('crookes-tube');
  const crkRig: CrookesRigHandles = buildCrookesTubeRig(mats);
  crkRig.group.scale.setScalar(1.0);
  crkRig.group.position.set(0, 0, 0);
  crkGroup.add(crkRig.group);

  // 18. DANIELL GALVANIC CELL
  const danGroup = reg('daniell-galvanic-cell');
  const danBeakerL = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.2, 0.36, 22, 1, true), mats.glass);
  danBeakerL.position.set(-0.36, 0.18, 0);
  const danBeakerR = danBeakerL.clone();
  danBeakerR.position.set(0.36, 0.18, 0);
  danGroup.add(danBeakerL, danBeakerR);
  const danLiqL = new THREE.Mesh(
    new THREE.CylinderGeometry(0.19, 0.18, 0.24, 20),
    makeSafeLiquidMat(0xe2e8f0, 0.55, isSoftwareGl)
  );
  danLiqL.position.set(-0.36, 0.12, 0);
  const danLiqR = new THREE.Mesh(
    new THREE.CylinderGeometry(0.19, 0.18, 0.24, 20),
    makeSafeLiquidMat(0x0284c7, 0.78, isSoftwareGl)
  );
  danLiqR.position.set(0.36, 0.12, 0);
  danGroup.add(danLiqL, danLiqR);
  const danZn = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.4, 0.025), mats.steel);
  danZn.position.set(-0.44, 0.24, 0);
  const danCu = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.4, 0.025), mats.copper);
  danCu.position.set(0.44, 0.24, 0);
  danGroup.add(danZn, danCu);
  const bridgeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.24, 0.22, 0),
    new THREE.Vector3(-0.22, 0.5, 0),
    new THREE.Vector3(0.22, 0.5, 0),
    new THREE.Vector3(0.24, 0.22, 0),
  ]);
  const danBridge = new THREE.Mesh(new THREE.TubeGeometry(bridgeCurve, 20, 0.032, 12, false), mats.glassRim);
  danGroup.add(danBridge);

  // 19. SEPARATING FUNNEL
  const sepGroup = reg('separating-funnel');
  const sepStand = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.15, 12), mats.steel);
  sepStand.position.set(-0.25, 0.575, 0);
  sepGroup.add(sepStand);
  const sepRing = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.015, 10, 24), mats.ebonite);
  sepRing.rotation.x = Math.PI / 2;
  sepRing.position.set(0, 0.55, 0);
  sepGroup.add(sepRing);
  const sepBulb = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.52, 22, 1, true), mats.glass);
  sepBulb.rotation.x = Math.PI;
  sepBulb.position.set(0, 0.58, 0);
  sepGroup.add(sepBulb);
  const sepLowerMat = makeSafeLiquidMat(0xf59e0b, 0.8, isSoftwareGl);
  const sepLower = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.28, 18), sepLowerMat);
  sepLower.rotation.x = Math.PI;
  sepLower.position.set(0, 0.47, 0);
  const sepUpper = new THREE.Mesh(
    new THREE.CylinderGeometry(0.17, 0.14, 0.16, 18),
    makeSafeLiquidMat(0x38bdf8, 0.72, isSoftwareGl)
  );
  sepUpper.position.set(0, 0.67, 0);
  sepGroup.add(sepLower, sepUpper);
  const sepBeaker = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.15, 0.24, 20, 1, true), mats.glass);
  sepBeaker.position.set(0, 0.12, 0);
  sepGroup.add(sepBeaker);

  // 20. HORSESHOE DEFLECTION MAGNET + BEAM
  const magGroup = reg('horseshoe-magnet');
  const magPivot = new THREE.Group();
  const magArc = new THREE.Mesh(
    new THREE.TorusGeometry(0.24, 0.055, 14, 24, Math.PI),
    mats.steel
  );
  magArc.position.y = 0.25;
  const magArmN = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.28, 14), mats.magnetNorth);
  magArmN.position.set(-0.24, 0.12, 0);
  const magArmS = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.28, 14), mats.magnetSouth);
  magArmS.position.set(0.24, 0.12, 0);
  magPivot.add(magArc, magArmN, magArmS);
  magPivot.position.set(0, 0.24, 0);
  magGroup.add(magPivot);
  const magBeamMat = new THREE.MeshBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.85 });
  const magBeam = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.9, 0.4, 0),
        new THREE.Vector3(0, 0.4, 0),
        new THREE.Vector3(0.9, 0.4, 0),
      ]),
      24,
      0.025,
      10,
      false
    ),
    magBeamMat
  );
  magGroup.add(magBeam);
  let lastMagBend = '';

  return {
    root,
    groups,
    update(activeId, state, elapsed, dt) {
      for (const [key, g] of Object.entries(groups)) {
        g.visible = key === activeId;
      }

      let lightColor = '#38bdf8';
      let lightIntensity = 0.35;

      if (activeId === 'hv-induction-coil') {
        hvCoil.sparkMesh.visible = state.active && Math.sin(elapsed * 40) > -0.3;
        lightColor = '#38bdf8';
        lightIntensity = state.active ? 1.4 : 0.2;
      } else if (activeId === 'vacuum-pump-gauge') {
        if (state.active) {
          vacPump.flywheel.rotation.x += dt * 5.8;
        }
        const frac = state.active ? state.sliderValue / 7 : 0;
        vacGaugeNeedle.rotation.z = THREE.MathUtils.lerp(0.8, -0.95, frac);
        vacGlowMat.color.set(state.sliderValue >= 6 ? '#4ade80' : '#a855f7');
        vacGlowMat.opacity = state.active ? 0.55 : 0.06;
        lightColor = state.sliderValue >= 6 ? '#4ade80' : '#a855f7';
        lightIntensity = state.active ? 1.1 : 0.2;
      } else if (activeId === 'dc-ammeter-voltmeter') {
        const needleRot = state.active ? -0.9 + (state.sliderValue / 12) * 1.8 : -0.9;
        dcNeedle.rotation.z = -needleRot;
        dcLedMat.color.set(state.active ? 0x22c55e : 0x475569);
        const amps = state.active ? (state.sliderValue * 0.42).toFixed(2) : '0.00';
        dcLcd.redraw(
          state.active ? '#052e16' : '#0f172a',
          state.active ? '#4ade80' : '#64748b',
          'DC SUPPLY',
          state.active ? `${state.sliderValue.toFixed(1)}V` : 'OFF',
          `I = ${amps} A`
        );
        dcBubbles.visible = state.active;
        if (state.active) {
          for (let i = 0; i < 24; i++) {
            const t = (elapsed * (0.4 + state.sliderValue * 0.08) + i / 24) % 1;
            const side = i % 2 === 0 ? 0.3 : 0.54;
            _p.set(side + Math.sin(elapsed * 4 + i) * 0.025, 0.06 + t * 0.23, (i % 3 - 1) * 0.03);
            _m.compose(_p, _q, _s);
            dcBubbles.setMatrixAt(i, _m);
          }
          dcBubbles.instanceMatrix.needsUpdate = true;
        }
        lightIntensity = state.active ? 0.9 : 0.25;
      } else if (activeId === 'digital-ph-meter') {
        const targetY = state.active ? 0 : 0.22;
        phProbeGroup.position.y = THREE.MathUtils.lerp(phProbeGroup.position.y, targetY, 1 - Math.exp(-8 * dt));
        const col =
          state.sampleId === 'hcl'
            ? 0xf87171
            : state.sampleId === 'ethanoic'
              ? 0xfb923c
              : state.sampleId === 'water'
                ? 0x4ade80
                : 0xa78bfa;
        phLiqMat.color.setHex(col);
        const phVal =
          state.sampleId === 'hcl'
            ? '1.00'
            : state.sampleId === 'ethanoic'
              ? '2.87'
              : state.sampleId === 'water'
                ? '7.00'
                : state.sampleId === 'nh3'
                  ? '11.13'
                  : '13.00';
        phLcd.redraw(
          state.active ? '#064e3b' : '#1e293b',
          state.active ? '#6ee7b7' : '#94a3b8',
          'pH METER · ATC',
          state.active ? `pH ${phVal}` : 'HOLD',
          `${state.sliderValue}°C`
        );
      } else if (activeId === 'conductivity-tester') {
        const strength =
          state.sampleId === 'nacl-aq'
            ? 2.8
            : state.sampleId === 'hc2h3o2'
              ? 0.95
              : state.sampleId === 'ethanol'
                ? 0.15
                : 0;
        const glow = state.active ? strength * (0.4 + state.sliderValue * 0.3) : 0;
        condBulbMat.emissiveIntensity = glow;
        condBubbles.visible = state.active && strength > 0.5;
        if (condBubbles.visible) {
          for (let i = 0; i < 20; i++) {
            const t = (elapsed * 0.8 + i / 20) % 1;
            _p.set(i % 2 === 0 ? 0.22 : 0.42, 0.05 + t * 0.22, ((i % 3) - 1) * 0.025);
            _m.compose(_p, _q, _s);
            condBubbles.setMatrixAt(i, _m);
          }
          condBubbles.instanceMatrix.needsUpdate = true;
        }
        lightColor = '#facc15';
        lightIntensity = Math.min(2, 0.25 + glow * 0.6);
      } else if (activeId === 'analytical-balance') {
        balPowder.visible = state.active;
        const sc = 0.65 + state.sliderValue * 0.14;
        balPowder.scale.set(sc, sc, sc);
        balSampleMat.color.setHex(
          state.sampleId === 'cuso4-5h2o' ? 0x0ea5e9 : state.sampleId === 'k2cr2o7' ? 0xf97316 : 0xf8fafc
        );
        const massVal = state.active ? `${state.sliderValue.toFixed(4)} g` : '0.0000 g';
        balLcdCtrl.redraw('#052e16', '#86efac', '0.1mg TARE', massVal, state.sampleId.toUpperCase());
      } else if (activeId === 'magnetic-stirrer-hotplate') {
        stirPlateMat.emissiveIntensity = state.active ? (state.sliderValue - 20) / 55 : 0;
        stirGlowRing.visible = state.active && state.sliderValue > 28;
        stirGlowRingMat.opacity = THREE.MathUtils.clamp((state.sliderValue - 25) / 70, 0.2, 0.95);
        stirLedMat.color.setHex(state.active ? 0x22c55e : 0x475569);
        const rpm = state.active ? Math.round(state.sliderValue * 9) : 0;
        stirLcdCtrl.redraw(
          '#0f172a',
          state.active ? '#fb923c' : '#64748b',
          'HOTPLATE',
          state.active ? `${state.sliderValue}°C` : 'OFF',
          `${rpm} RPM`
        );
        if (state.active) {
          stirBar.rotation.y += dt * (4 + state.sliderValue * 0.12);
        }
        lightColor = '#fb923c';
        lightIntensity = state.active ? 1.1 : 0.25;
      } else if (activeId === 'burette-stand') {
        const remainFrac = Math.max(0.08, 1 - state.sliderValue / 55);
        burLiq.scale.y = remainFrac;
        burLiq.position.y = 0.46 + remainFrac * 0.32;
        burDrop.visible = state.active;
        if (state.active) {
          burDrop.position.y = 0.39 - ((elapsed * 1.4) % 0.28);
        }
        burLiqMat.color.setHex(state.sampleId === 'kmno4' ? 0xc026d3 : 0xe0f2fe);
        burFlaskLiqMat.color.setHex(state.sliderValue >= 25 ? 0xf472b6 : 0xe2e8f0);
      } else if (activeId === 'pipette-filler') {
        const fillFrac = Math.max(0.1, state.sliderValue / 25);
        pipFillCore.scale.y = fillFrac;
        pipLiqMat.color.setHex(state.sampleId === 'cuso4' ? 0x0ea5e9 : 0xe2e8f0);
      } else if (activeId === 'volumetric-flask') {
        volLiqMat.color.setHex(state.sampleId === 'kmno4' ? 0xa855f7 : 0xf97316);
        const fillFrac = Math.max(0.35, state.sliderValue / 250);
        volLiq.scale.setScalar(fillFrac);
        volPivot.rotation.z = state.active ? Math.sin(elapsed * 5) * 0.22 : 0;
      } else if (activeId === 'conical-flask-dropper') {
        const ph = state.sliderValue;
        const hex =
          state.sampleId === 'phenol'
            ? ph >= 8.3
              ? 0xf472b6
              : 0xe2e8f0
            : ph >= 4.4
              ? 0xfacc15
              : ph >= 3.1
                ? 0xfb923c
                : 0xf43f5e;
        conLiqMat.color.setHex(hex);
      } else if (activeId === 'bunsen-burner') {
        bunFlame.visible = state.active;
        bunInner.visible = state.active && state.sliderValue >= 50;
        const fColor =
          state.sampleId === 'Cu2+'
            ? 0x10b981
            : state.sampleId === 'K+'
              ? 0xc084fc
              : state.sampleId === 'Li+'
                ? 0xf43f5e
                : state.sliderValue >= 50
                  ? 0xf59e0b
                  : 0xfacc15;
        bunFlameMat.color.setHex(state.active ? fColor : 0x38bdf8);
        if (state.active) {
          bunFlame.scale.set(1 + Math.sin(elapsed * 20) * 0.06, 1 + Math.cos(elapsed * 24) * 0.08, 1);
        }
        lightColor = state.sampleId === 'Cu2+' ? '#34d399' : '#fb923c';
        lightIntensity = state.active ? 1.5 : 0.2;
      } else if (activeId === 'coffee-cup-calorimeter') {
        const mult = (state.sampleId === 'exo' ? 1 : -0.6) * (state.active ? state.sliderValue : 0);
        const mercH = THREE.MathUtils.clamp(0.55 + mult * 0.28, 0.25, 1.35);
        calMerc.scale.y = mercH;
        calMercMat.color.setHex(state.sampleId === 'exo' ? 0xef4444 : 0x38bdf8);
        calStir.position.y = state.active ? 0.52 + Math.sin(elapsed * 8) * 0.06 : 0.52;
      } else if (activeId === 'gas-syringe') {
        const volFrac =
          state.sampleId === 'boyle'
            ? THREE.MathUtils.clamp(100 / Math.max(40, state.sliderValue), 0.3, 1.2)
            : THREE.MathUtils.clamp(state.sliderValue / 200, 0.2, 1.1);
        const pulse = state.active ? Math.sin(elapsed * 3) * 0.05 : 0;
        syrPlunger.position.x = 0.05 + volFrac * 0.28 + pulse;
      } else if (activeId === 'liebig-condenser') {
        liebWaterMat.opacity = state.active ? 0.65 : 0.22;
        liebDrop.visible = state.active;
        if (state.active) {
          liebDrop.position.y = 0.34 - ((elapsed * 1.3) % 0.2);
        }
      } else if (activeId === 'kipps-apparatus') {
        kippAcid.position.y = state.active ? 0.44 : 0.22;
        kippBubbles.visible = state.active;
        if (state.active) {
          for (let i = 0; i < 16; i++) {
            const t = (elapsed * 0.9 + i / 16) % 1;
            _p.set(Math.sin(i * 2) * 0.06, 0.46 + t * 0.25, Math.cos(i) * 0.06);
            _m.compose(_p, _q, _s);
            kippBubbles.setMatrixAt(i, _m);
          }
          kippBubbles.instanceMatrix.needsUpdate = true;
        }
      } else if (activeId === 'crookes-tube') {
        const on = state.active && state.sliderValue >= 60;
        (crkRig.beamTube.material as THREE.MeshBasicMaterial).opacity = on ? 0.85 : 0.1;
        crkRig.malteseCrossArm.rotation.x = state.sampleId === 'cross' ? 0 : Math.PI / 2.25;
        crkRig.znsRedraw(on ? 0.9 : 0.1, state.sampleId === 'cross', 0);
        crkRig.electronParticles.visible = on;
        if (on) {
          for (let i = 0; i < 24; i++) {
            const t = (elapsed * 1.4 + i / 24) % 1;
            _p.set(-0.75 + t * (state.sampleId === 'cross' ? 1.2 : 1.7), 0, 0);
            _m.compose(_p, _q, _s);
            crkRig.electronParticles.setMatrixAt(i, _m);
          }
          crkRig.electronParticles.instanceMatrix.needsUpdate = true;
        }
        lightColor = '#4ade80';
        lightIntensity = on ? 1.4 : 0.2;
      } else if (activeId === 'daniell-galvanic-cell') {
        danBridge.visible = state.active;
        lightColor = '#4ade80';
        lightIntensity = state.active ? 1.0 : 0.2;
      } else if (activeId === 'separating-funnel') {
        const drain = 1 - (state.sliderValue / 100) * 0.7;
        sepLower.scale.y = drain;
        sepLowerMat.color.setHex(state.sampleId === 'chcl3' ? 0xf59e0b : 0x38bdf8);
      } else if (activeId === 'horseshoe-magnet') {
        const pol = state.sampleId === 'n-up' ? 1 : -1;
        magPivot.rotation.x = pol === 1 ? 0 : Math.PI;
        magPivot.position.z = THREE.MathUtils.lerp(magPivot.position.z, state.active ? 0.08 : 0.55, 1 - Math.exp(-8 * dt));
        const bend = state.active ? pol * (state.sliderValue / 18) : 0;
        const bSig = `${bend.toFixed(3)}`;
        if (bSig !== lastMagBend) {
          lastMagBend = bSig;
          magBeam.geometry.dispose();
          magBeam.geometry = new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3([
              new THREE.Vector3(-0.9, 0.4, 0),
              new THREE.Vector3(0, 0.4 + bend * 0.45, 0),
              new THREE.Vector3(0.9, 0.4 + bend, 0),
            ]),
            24,
            0.025,
            10,
            false
          );
        }
        lightColor = '#4ade80';
        lightIntensity = 1.0;
      }

      return { lightColor, lightIntensity };
    },
  };
}
