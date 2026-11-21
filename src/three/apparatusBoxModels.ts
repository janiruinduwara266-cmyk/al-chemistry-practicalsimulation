import * as THREE from 'three';
import type { EquipmentIconType, EquipmentItem } from '../types/lab';
import type { LabMaterialPalette } from './apparatusModels';

export interface BoxSlotHandle {
  id: string;
  slotGroup: THREE.Group;
  itemPivot: THREE.Group;
  hitMesh: THREE.Mesh;
  ringMesh: THREE.Mesh;
  baseY: number;
  targetLift: number;
  currentLift: number;
}

export interface ApparatusBoxStageHandle {
  root: THREE.Group;
  lidPivot: THREE.Group;
  slots: BoxSlotHandle[];
  hitTargets: THREE.Object3D[];
}

function createSlotMiniModel(
  type: EquipmentIconType,
  mats: LabMaterialPalette
): THREE.Group {
  const g = new THREE.Group();

  switch (type) {
    case 'coil': {
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.04, 0.18), mats.darkOak);
      base.position.y = 0.02;
      const bobbin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.065, 0.065, 0.18, 20),
        mats.copper
      );
      bobbin.rotation.z = Math.PI / 2;
      bobbin.position.y = 0.095;
      const termL = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.07, 12), mats.brass);
      termL.position.set(-0.08, 0.16, 0.04);
      const termR = termL.clone();
      termR.position.set(0.08, 0.16, 0.04);
      g.add(base, bobbin, termL, termR);
      break;
    }

    case 'tube': {
      const glassCyl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.048, 0.048, 0.28, 20),
        mats.glass
      );
      glassCyl.rotation.z = Math.PI / 2;
      glassCyl.position.y = 0.08;
      const capL = new THREE.Mesh(
        new THREE.CylinderGeometry(0.052, 0.052, 0.028, 18),
        mats.brass
      );
      capL.rotation.z = Math.PI / 2;
      capL.position.set(-0.14, 0.08, 0);
      const capR = capL.clone();
      capR.position.set(0.14, 0.08, 0);
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0x4ade80,
        transparent: true,
        opacity: 0.45,
      });
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.22, 12), glowMat);
      beam.rotation.z = Math.PI / 2;
      beam.position.y = 0.08;
      g.add(glassCyl, capL, capR, beam);
      break;
    }

    case 'pump': {
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.16, 20), mats.ebonite);
      body.rotation.x = Math.PI / 2;
      body.position.y = 0.09;
      const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.068, 0.012, 10, 24), mats.brass);
      wheel.position.set(0, 0.09, 0.095);
      const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.02, 18), mats.steel);
      dial.rotation.x = Math.PI / 2;
      dial.position.set(0.08, 0.16, 0.02);
      g.add(body, wheel, dial);
      break;
    }

    case 'cross': {
      const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.025, 16), mats.brass);
      stand.position.y = 0.015;
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.14, 10), mats.steel);
      stem.position.y = 0.09;
      const arm1 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.032, 0.012), mats.steel);
      arm1.position.y = 0.15;
      const arm2 = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.14, 0.012), mats.steel);
      arm2.position.y = 0.15;
      g.add(stand, stem, arm1, arm2);
      break;
    }

    case 'magnet': {
      const north = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.045, 0.065), mats.magnetNorth);
      north.position.set(-0.06, 0.04, 0);
      const south = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.045, 0.065), mats.magnetSouth);
      south.position.set(0.06, 0.04, 0);
      const ringTip = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.048, 0.068), mats.steel);
      ringTip.position.set(0, 0.04, 0);
      g.add(north, south, ringTip);
      break;
    }

    case 'plates': {
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.03, 0.18), mats.ebonite);
      base.position.y = 0.015;
      const pTop = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.016, 0.12), mats.brass);
      pTop.position.y = 0.14;
      const pBot = pTop.clone();
      pBot.position.y = 0.06;
      const post1 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.13, 10), mats.steel);
      post1.position.set(-0.09, 0.08, 0);
      const post2 = post1.clone();
      post2.position.set(0.09, 0.08, 0);
      g.add(base, pTop, pBot, post1, post2);
      break;
    }

    case 'coils': {
      const c1 = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.014, 12, 28), mats.copper);
      c1.position.set(0, 0.11, -0.045);
      const c2 = c1.clone();
      c2.position.set(0, 0.11, 0.045);
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.025, 0.16), mats.darkOak);
      foot.position.y = 0.012;
      g.add(foot, c1, c2);
      break;
    }

    case 'gas': {
      const cyl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.055, 0.21, 18),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.35, metalness: 0.65 })
      );
      cyl.position.y = 0.11;
      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 16, 12),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.35, metalness: 0.65 })
      );
      dome.position.y = 0.21;
      const valve = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.04, 12), mats.brass);
      valve.position.y = 0.27;
      g.add(cyl, dome, valve);
      break;
    }

    case 'chamber': {
      const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.14, 24), mats.brass);
      drum.position.y = 0.08;
      const win = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.15, 16), mats.glass);
      win.rotation.z = Math.PI / 2;
      win.position.y = 0.09;
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.118, 0.118, 0.025, 24), mats.ebonite);
      cap.position.y = 0.15;
      g.add(drum, win, cap);
      break;
    }

    case 'atomizer': {
      const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.062, 0.12, 16), mats.glass);
      bottle.position.set(-0.04, 0.065, 0);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 12), mats.rubberRed);
      bulb.scale.set(1.2, 0.9, 0.9);
      bulb.position.set(0.08, 0.14, 0);
      const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.11, 10), mats.brass);
      nozzle.rotation.z = Math.PI / 2;
      nozzle.position.set(0.01, 0.14, 0);
      g.add(bottle, bulb, nozzle);
      break;
    }

    case 'xray':
    case 'source': {
      const block = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.14), mats.lead);
      block.position.y = 0.075;
      const emitter = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.06, 16), mats.brass);
      emitter.rotation.z = Math.PI / 2;
      emitter.position.set(0.1, 0.08, 0);
      const hazardMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
      const glow = new THREE.Mesh(new THREE.SphereGeometry(0.016, 12, 10), hazardMat);
      glow.position.set(0.132, 0.08, 0);
      g.add(block, emitter, glow);
      break;
    }

    case 'microscope': {
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.03, 0.16), mats.ebonite);
      base.position.y = 0.015;
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.18, 0.035), mats.brass);
      arm.position.set(-0.04, 0.11, 0);
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.18, 16), mats.brass);
      barrel.rotation.z = -0.35;
      barrel.position.set(0.03, 0.16, 0);
      g.add(base, arm, barrel);
      break;
    }

    case 'foil': {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.2, 0.18), mats.darkOak);
      frame.position.y = 0.11;
      const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.14), mats.goldFoil);
      leaf.rotation.y = Math.PI / 2;
      leaf.position.set(0.014, 0.11, 0);
      g.add(frame, leaf);
      break;
    }

    case 'screen': {
      const ring = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.09, 24, 1, true, 0, Math.PI * 1.65),
        new THREE.MeshStandardMaterial({
          color: 0x34d399,
          emissive: 0x065f46,
          emissiveIntensity: 0.45,
          roughness: 0.4,
          side: THREE.DoubleSide,
        })
      );
      ring.position.y = 0.055;
      g.add(ring);
      break;
    }

    case 'burner': {
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.095, 0.025, 20), mats.steel);
      base.position.y = 0.015;
      const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, 0.2, 16), mats.brass);
      chimney.position.y = 0.12;
      const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.022, 0.065, 12),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.8 })
      );
      flame.position.y = 0.245;
      g.add(base, chimney, flame);
      break;
    }

    case 'burette': {
      const stand = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.02, 0.14), mats.ebonite);
      stand.position.y = 0.01;
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.28, 10), mats.steel);
      rod.position.set(-0.04, 0.15, 0);
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.26, 14), mats.glass);
      tube.position.set(0.03, 0.17, 0);
      const liq = new THREE.Mesh(
        new THREE.CylinderGeometry(0.01, 0.01, 0.16, 12),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7 })
      );
      liq.position.set(0.03, 0.14, 0);
      g.add(stand, rod, tube, liq);
      break;
    }

    case 'calorimeter': {
      const outer = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.17, 20), mats.copper);
      outer.position.y = 0.09;
      const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.022, 20), mats.darkOak);
      lid.position.y = 0.18;
      const stirrer = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.12, 8), mats.steel);
      stirrer.position.set(0.03, 0.22, 0);
      g.add(outer, lid, stirrer);
      break;
    }

    case 'thermometer': {
      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.024, 12, 10),
        new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2 })
      );
      bulb.position.set(-0.09, 0.04, 0);
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.24, 14), mats.glass);
      stem.rotation.z = Math.PI / 2.6;
      stem.position.set(0, 0.09, 0);
      g.add(bulb, stem);
      break;
    }

    case 'battery': {
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.13, 0.13), mats.ebonite);
      box.position.y = 0.07;
      const posTerm = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.035, 12), mats.magnetNorth);
      posTerm.position.set(-0.05, 0.15, 0);
      const negTerm = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.035, 12), mats.steel);
      negTerm.position.set(0.05, 0.15, 0);
      g.add(box, posTerm, negTerm);
      break;
    }

    case 'testtubes': {
      const rack = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.025, 0.1), mats.darkOak);
      rack.position.y = 0.015;
      const colors = [0x38bdf8, 0xa855f7, 0xf59e0b];
      colors.forEach((hex, idx) => {
        const x = (idx - 1) * 0.06;
        const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.18, 12), mats.glass);
        tube.position.set(x, 0.11, 0);
        const liq = new THREE.Mesh(
          new THREE.CylinderGeometry(0.016, 0.016, 0.09, 10),
          new THREE.MeshBasicMaterial({ color: hex, transparent: true, opacity: 0.78 })
        );
        liq.position.set(x, 0.07, 0);
        g.add(tube, liq);
      });
      g.add(rack);
      break;
    }

    case 'syringe': {
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.2, 16), mats.glass);
      barrel.rotation.z = Math.PI / 2;
      barrel.position.set(-0.02, 0.07, 0);
      const plunger = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.14, 12), mats.steel);
      plunger.rotation.z = Math.PI / 2;
      plunger.position.set(0.08, 0.07, 0);
      g.add(barrel, plunger);
      break;
    }

    case 'molecule': {
      const center = new THREE.Mesh(
        new THREE.SphereGeometry(0.048, 16, 14),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.25, metalness: 0.3 })
      );
      center.position.y = 0.11;
      const orbitAngles = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];
      orbitAngles.forEach((a) => {
        const bond = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.11, 8), mats.steel);
        bond.position.set(Math.cos(a) * 0.055, 0.11, Math.sin(a) * 0.055);
        bond.rotation.z = Math.PI / 2;
        bond.rotation.y = -a;
        const sat = new THREE.Mesh(
          new THREE.SphereGeometry(0.032, 12, 10),
          new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.3 })
        );
        sat.position.set(Math.cos(a) * 0.1, 0.11, Math.sin(a) * 0.1);
        g.add(bond, sat);
      });
      g.add(center);
      break;
    }

    case 'flask':
    default: {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.14, 18), mats.glass);
      cone.position.y = 0.075;
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.07, 14), mats.glass);
      neck.position.y = 0.165;
      const sol = new THREE.Mesh(
        new THREE.ConeGeometry(0.07, 0.075, 16),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.72 })
      );
      sol.position.y = 0.045;
      g.add(cone, neck, sol);
      break;
    }
  }

  return g;
}

export function buildApparatusBoxStage(
  equipment: EquipmentItem[],
  mats: LabMaterialPalette
): ApparatusBoxStageHandle {
  const root = new THREE.Group();

  // Outer Wooden Crate Tray (2 x 3 compartment grid)
  const boxW = 2.04;
  const boxD = 1.44;
  const wallH = 0.24;
  const wallT = 0.06;

  const baseFloor = new THREE.Mesh(new THREE.BoxGeometry(boxW, 0.05, boxD), mats.darkOak);
  baseFloor.position.y = 0.025;
  baseFloor.receiveShadow = true;

  // Velvet dark-teal foam inlay inside box
  const foamMat = new THREE.MeshStandardMaterial({
    color: 0x0c242d,
    roughness: 0.9,
    metalness: 0.04,
  });
  const foamBed = new THREE.Mesh(
    new THREE.BoxGeometry(boxW - wallT * 2, 0.04, boxD - wallT * 2),
    foamMat
  );
  foamBed.position.y = 0.06;
  foamBed.receiveShadow = true;

  // Box walls
  const frontWall = new THREE.Mesh(new THREE.BoxGeometry(boxW, wallH, wallT), mats.woodBench);
  frontWall.position.set(0, wallH / 2, boxD / 2 - wallT / 2);
  const backWall = frontWall.clone();
  backWall.position.z = -boxD / 2 + wallT / 2;

  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(wallT, wallH, boxD - wallT * 2), mats.woodBench);
  leftWall.position.set(-boxW / 2 + wallT / 2, wallH / 2, 0);
  const rightWall = leftWall.clone();
  rightWall.position.x = boxW / 2 - wallT / 2;

  // Brass corner latches & front clasp
  const frontClasp = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.025), mats.brass);
  frontClasp.position.set(0, 0.18, boxD / 2 + 0.01);

  // Wooden compartment dividers inside box
  const divMat = mats.darkOak;
  const vDiv1 = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.11, boxD - wallT * 2), divMat);
  vDiv1.position.set(-0.32, 0.1, 0);
  const vDiv2 = vDiv1.clone();
  vDiv2.position.set(0.32, 0.1, 0);
  const hDiv = new THREE.Mesh(new THREE.BoxGeometry(boxW - wallT * 2, 0.11, 0.025), divMat);
  hDiv.position.set(0, 0.1, 0);

  // Hinged Glass Display Lid (hinges open at back edge)
  const lidPivot = new THREE.Group();
  lidPivot.position.set(0, wallH, -boxD / 2 + wallT / 2);

  const lidFrameBack = new THREE.Mesh(new THREE.BoxGeometry(boxW, 0.035, 0.05), mats.woodBench);
  lidFrameBack.position.set(0, 0.015, 0.025);
  const lidFrameFront = lidFrameBack.clone();
  lidFrameFront.position.set(0, 0.015, boxD - 0.04);
  const lidFrameLeft = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.035, boxD), mats.woodBench);
  lidFrameLeft.position.set(-boxW / 2 + 0.025, 0.015, boxD / 2 - 0.01);
  const lidFrameRight = lidFrameLeft.clone();
  lidFrameRight.position.x = boxW / 2 - 0.025;
  const lidGlass = new THREE.Mesh(
    new THREE.BoxGeometry(boxW - 0.1, 0.012, boxD - 0.1),
    mats.glassRim
  );
  lidGlass.position.set(0, 0.015, boxD / 2 - 0.01);

  lidPivot.add(lidFrameBack, lidFrameFront, lidFrameLeft, lidFrameRight, lidGlass);
  lidPivot.rotation.x = -1.78; // Open lid leaning neatly back

  root.add(
    baseFloor,
    foamBed,
    frontWall,
    backWall,
    leftWall,
    rightWall,
    frontClasp,
    vDiv1,
    vDiv2,
    hDiv,
    lidPivot
  );

  // Arrange equipment inside the 6 padded compartments (3 cols x 2 rows)
  const cols = equipment.length <= 4 ? 2 : 3;
  const xCoords = cols === 2 ? [-0.48, 0.48] : [-0.63, 0, 0.63];
  const zCoords = equipment.length <= 3 ? [0] : [-0.33, 0.33];

  const slots: BoxSlotHandle[] = [];
  const hitTargets: THREE.Object3D[] = [];

  equipment.forEach((item, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols) % zCoords.length;
    const sx = xCoords[col];
    const sz = zCoords[row];

    const slotGroup = new THREE.Group();
    slotGroup.position.set(sx, 0.085, sz);

    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.72,
      side: THREE.DoubleSide,
    });
    const ringMesh = new THREE.Mesh(new THREE.RingGeometry(0.21, 0.25, 28), ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = 0.005;

    const itemPivot = new THREE.Group();
    const model = createSlotMiniModel(item.iconType, mats);
    model.scale.setScalar(1.22);
    itemPivot.add(model);

    // Generous invisible raycast proxy for reliable clicking on each compartment
    const hitMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.54, 0.38, 0.54),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    hitMesh.position.y = 0.16;
    hitMesh.userData = { equipmentId: item.id };

    slotGroup.add(ringMesh, itemPivot, hitMesh);
    root.add(slotGroup);

    slots.push({
      id: item.id,
      slotGroup,
      itemPivot,
      hitMesh,
      ringMesh,
      baseY: 0.085,
      targetLift: 0,
      currentLift: 0,
    });
    hitTargets.push(hitMesh);
  });

  return { root, lidPivot, slots, hitTargets };
}
