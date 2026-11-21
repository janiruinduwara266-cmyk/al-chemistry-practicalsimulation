import { ChevronDown, ChevronUp, Eye, Flame, FlaskConical, Moon, Power, Sparkles, Sun, Zap } from 'lucide-react';
import { EXPERIMENTS } from '../data/curriculum';
import type {
  CameraPreset,
  CatalystChoice,
  CathodeMetal,
  ElectrodePair,
  EquilibriumShift,
  FlameCation,
  FoilMaterial,
  GasType,
  HalideSample,
  LabSimulationParams,
  Language,
  LiquidSample,
  OrganicSample,
  TransitionMetalIon,
  VseprMolecule,
} from '../types/lab';

interface ControlDockProps {
  lang: Language;
  params: LabSimulationParams;
  isAssembled: boolean;
  cameraPreset: CameraPreset;
  dockCollapsed: boolean;
  onToggleDock: () => void;
  onUpdateParams: (patch: Partial<LabSimulationParams>) => void;
  onSelectCameraPreset: (preset: CameraPreset) => void;
}

const PRESSURE_STOPS = [760, 40, 10, 1.5, 0.2, 0.05, 0.008, 0.002];

function pressureToSlider(p: number): number {
  let bestIdx = 0;
  let bestDiff = Infinity;
  PRESSURE_STOPS.forEach((val, idx) => {
    const diff = Math.abs(Math.log10(Math.max(0.001, val)) - Math.log10(Math.max(0.001, p)));
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIdx = idx;
    }
  });
  return bestIdx;
}

export function ControlDock({
  lang,
  params,
  isAssembled,
  cameraPreset,
  dockCollapsed,
  onToggleDock,
  onUpdateParams,
  onSelectCameraPreset,
}: ControlDockProps) {
  return (
    <div className="relative z-20 flex flex-col items-center pointer-events-auto">
      {/* Collapse / Expand Tab */}
      <button
        type="button"
        onClick={onToggleDock}
        className="px-3.5 py-1 rounded-t-xl bg-[#2B1B10]/95 border border-b-0 border-[#A8733B] text-[11px] font-semibold text-[#F5C56B] hover:text-white flex items-center gap-1.5 cursor-pointer"
      >
        {dockCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        <span className="whitespace-nowrap">
          {dockCollapsed
            ? lang === 'si'
              ? 'පාලන පුවරුව පෙන්වන්න'
              : 'Show Lab Controls'
            : lang === 'si'
              ? 'පාලන පුවරුව සඟවන්න'
              : 'Hide Controls'}
        </span>
      </button>

      {!dockCollapsed && (
        <div className="w-full max-w-[940px] wood-panel rounded-2xl px-4 py-3 text-[#FBF5EA]">
          {!isAssembled ? (
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-[#F5C56B] font-medium">
                {lang === 'si'
                  ? 'උපකරණ පෙට්ටියෙන් සියලු කොටස් මේසයට ගත් පසු පරීක්ෂණ පාලක සක්‍රීය වේ.'
                  : 'Place all apparatus items onto the 3D bench to unlock live instrument controls.'}
              </span>
              <div className="flex items-center gap-1.5">
                {(['overview', 'front', 'closeup', 'top'] as CameraPreset[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onSelectCameraPreset(p)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize cursor-pointer ${
                      cameraPreset === p
                        ? 'bg-[#F38B21] text-[#1E1005]'
                        : 'bg-[#1D130B] text-[#D4BFA2] hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2.5">
              {/* STATION 01: CATHODE RAY TUBE CONTROLS */}
              {params.experimentId === 'cathode-tube' && (
                <>
                  <button
                    type="button"
                    onClick={() => onUpdateParams({ hvEnabled: !params.hvEnabled })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                      params.hvEnabled
                        ? 'bg-[#16A34A] text-white'
                        : 'bg-[#7F1D1D] text-[#FECACA]'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>HV: {params.hvEnabled ? 'ON' : 'OFF'}</span>
                  </button>

                  <label className="flex flex-col gap-1 min-w-[140px]">
                    <span className="text-[11px] text-[#F5C56B] font-mono-tabular">
                      {lang === 'si' ? 'පීඩනය' : 'Pressure'}:{' '}
                      {params.pressureMmHg < 0.1
                        ? params.pressureMmHg.toFixed(3)
                        : params.pressureMmHg}{' '}
                      mmHg
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={PRESSURE_STOPS.length - 1}
                      step={1}
                      value={pressureToSlider(params.pressureMmHg)}
                      onChange={(e) =>
                        onUpdateParams({ pressureMmHg: PRESSURE_STOPS[Number(e.target.value)] })
                      }
                      className="lab-slider w-36"
                    />
                  </label>

                  <label className="flex flex-col gap-1 min-w-[115px]">
                    <span className="text-[11px] text-[#F5C56B] font-mono-tabular">
                      {lang === 'si' ? 'වෝල්ටීයතාව' : 'Voltage'}: {params.voltageKv} kV
                    </span>
                    <input
                      type="range"
                      min={2}
                      max={20}
                      step={1}
                      value={params.voltageKv}
                      onChange={(e) => onUpdateParams({ voltageKv: Number(e.target.value) })}
                      className="lab-slider w-28"
                    />
                  </label>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateParams({
                          malteseCrossUp: !params.malteseCrossUp,
                          paddleWheelEngaged: false,
                        })
                      }
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer whitespace-nowrap ${
                        params.malteseCrossUp
                          ? 'bg-[#F38B21] text-[#1A0E06]'
                          : 'bg-[#1D130B] border border-[#8E6234] text-[#EADAC2]'
                      }`}
                    >
                      {lang === 'si' ? 'මෝල්ටීස් කුරුසය' : 'Maltese Cross'}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onUpdateParams({
                          paddleWheelEngaged: !params.paddleWheelEngaged,
                          malteseCrossUp: false,
                        })
                      }
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer whitespace-nowrap ${
                        params.paddleWheelEngaged
                          ? 'bg-[#F38B21] text-[#1A0E06]'
                          : 'bg-[#1D130B] border border-[#8E6234] text-[#EADAC2]'
                      }`}
                    >
                      {lang === 'si' ? 'පැඩල් රෝදය' : 'Paddle Wheel'}
                    </button>

                    <button
                      type="button"
                      onClick={() => onUpdateParams({ magnetActive: !params.magnetActive })}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer whitespace-nowrap ${
                        params.magnetActive
                          ? 'bg-[#2563EB] text-white'
                          : 'bg-[#1D130B] border border-[#8E6234] text-[#EADAC2]'
                      }`}
                    >
                      {lang === 'si' ? 'චුම්බකය' : 'Magnet'}
                    </button>

                    {params.magnetActive && (
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateParams({ magnetPolarity: params.magnetPolarity === 1 ? -1 : 1 })
                        }
                        className="px-2 py-1.5 rounded-lg text-[11px] font-bold bg-[#334155] text-white cursor-pointer whitespace-nowrap"
                      >
                        {params.magnetPolarity === 1 ? 'N↑/S↓' : 'S↑/N↓'}
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* STATION 02: THOMSON & CANAL RAYS CONTROLS */}
              {params.experimentId === 'thomson-canal' && (
                <>
                  <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#1C110A] border border-[#8E6234]">
                    <button
                      type="button"
                      onClick={() => onUpdateParams({ thomsonMode: 'cathode-rays' })}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer whitespace-nowrap ${
                        params.thomsonMode === 'cathode-rays'
                          ? 'bg-[#F38B21] text-[#1A0E06]'
                          : 'text-[#EADAC2]'
                      }`}
                    >
                      {lang === 'si' ? 'කැතෝඩ කිරණ' : 'Cathode Rays'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateParams({ thomsonMode: 'canal-rays' })}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer whitespace-nowrap ${
                        params.thomsonMode === 'canal-rays'
                          ? 'bg-[#EC4899] text-white'
                          : 'text-[#EADAC2]'
                      }`}
                    >
                      {lang === 'si' ? 'කැනල් කිරණ (+)' : 'Canal Rays (+)'}
                    </button>
                  </div>

                  <label className="flex flex-col gap-1">
                    <span className="text-[11px] text-[#F5C56B] font-mono-tabular">
                      E-Plates: {params.electricVoltageV} V
                    </span>
                    <input
                      type="range"
                      min={-260}
                      max={260}
                      step={10}
                      value={params.electricVoltageV}
                      onChange={(e) => onUpdateParams({ electricVoltageV: Number(e.target.value) })}
                      className="lab-slider w-32"
                    />
                  </label>

                  <label className="flex flex-col gap-1">
                    <span className="text-[11px] text-[#F5C56B] font-mono-tabular">
                      B-Field: {params.magneticFieldMt.toFixed(2)} mT
                    </span>
                    <input
                      type="range"
                      min={-2.2}
                      max={2.2}
                      step={0.04}
                      value={params.magneticFieldMt}
                      onChange={(e) => onUpdateParams({ magneticFieldMt: Number(e.target.value) })}
                      className="lab-slider w-32"
                    />
                  </label>

                  <div className="flex items-center gap-2">
                    <label className="text-[11px] flex items-center gap-1">
                      <span className="text-[#D4BFA2]">Gas:</span>
                      <select
                        value={params.gas}
                        onChange={(e) => onUpdateParams({ gas: e.target.value as GasType })}
                        className="bg-[#1D130B] border border-[#8E6234] rounded-md px-1.5 py-1 text-[11px] text-white"
                      >
                        <option value="air">Air</option>
                        <option value="hydrogen">Hydrogen (H₂)</option>
                        <option value="neon">Neon (Ne)</option>
                        <option value="argon">Argon (Ar)</option>
                      </select>
                    </label>

                    <label className="text-[11px] flex items-center gap-1">
                      <span className="text-[#D4BFA2]">Cathode:</span>
                      <select
                        value={params.cathodeMetal}
                        onChange={(e) =>
                          onUpdateParams({ cathodeMetal: e.target.value as CathodeMetal })
                        }
                        className="bg-[#1D130B] border border-[#8E6234] rounded-md px-1.5 py-1 text-[11px] text-white"
                      >
                        <option value="copper">Copper (Cu)</option>
                        <option value="aluminum">Aluminum (Al)</option>
                        <option value="platinum">Platinum (Pt)</option>
                      </select>
                    </label>
                  </div>
                </>
              )}

              {/* STATION 03: MILLIKAN OIL DROP CONTROLS */}
              {params.experimentId === 'millikan' && (
                <>
                  <button
                    type="button"
                    onClick={() => onUpdateParams({ sprayPulse: params.sprayPulse + 1 })}
                    className="px-3 py-1.5 rounded-lg bg-[#F38B21] hover:bg-[#FFA13B] text-[#1E1005] text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{lang === 'si' ? 'තෙල් බිංදු ඉසින්න' : 'Spray Oil Droplets'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateParams({ xrayActive: !params.xrayActive })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      params.xrayActive
                        ? 'bg-[#0284C7] text-white'
                        : 'bg-[#1D130B] border border-[#8E6234] text-[#EADAC2]'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>X-Ray: {params.xrayActive ? 'ON' : 'OFF'}</span>
                  </button>

                  <label className="flex flex-col gap-1">
                    <span className="text-[11px] text-[#F5C56B] font-mono-tabular">
                      Plate Voltage: {params.millikanVoltageV} V
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={1000}
                      step={2}
                      value={params.millikanVoltageV}
                      onChange={(e) => onUpdateParams({ millikanVoltageV: Number(e.target.value) })}
                      className="lab-slider w-44"
                    />
                  </label>

                  <label className="text-[11px] flex items-center gap-1.5">
                    <span className="text-[#D4BFA2]">
                      {lang === 'si' ? 'ආරෝපණය' : 'Charge'}:
                    </span>
                    <select
                      value={params.dropletChargeN}
                      onChange={(e) => onUpdateParams({ dropletChargeN: Number(e.target.value) })}
                      className="bg-[#1D130B] border border-[#8E6234] rounded-md px-2 py-1 text-[11px] text-white"
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          q = {n}e
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              )}

              {/* STATION 04: RUTHERFORD GOLD FOIL CONTROLS */}
              {params.experimentId === 'rutherford' && (
                <>
                  <button
                    type="button"
                    onClick={() => onUpdateParams({ alphaBeamEnabled: !params.alphaBeamEnabled })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      params.alphaBeamEnabled ? 'bg-[#16A34A] text-white' : 'bg-[#7F1D1D] text-white'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>α-Beam: {params.alphaBeamEnabled ? 'ON' : 'OFF'}</span>
                  </button>

                  <label className="flex flex-col gap-1">
                    <span className="text-[11px] text-[#F5C56B] font-mono-tabular">
                      {lang === 'si' ? 'අනාවරක කෝණය' : 'Detector Angle'} θ: {params.detectorAngleDeg}°
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={180}
                      step={5}
                      value={params.detectorAngleDeg}
                      onChange={(e) => onUpdateParams({ detectorAngleDeg: Number(e.target.value) })}
                      className="lab-slider w-44"
                    />
                  </label>

                  <label className="text-[11px] flex items-center gap-1.5">
                    <span className="text-[#D4BFA2]">{lang === 'si' ? 'පත්‍රය' : 'Foil'}:</span>
                    <select
                      value={params.foilMaterial}
                      onChange={(e) =>
                        onUpdateParams({ foilMaterial: e.target.value as FoilMaterial })
                      }
                      className="bg-[#1D130B] border border-[#8E6234] rounded-md px-2 py-1 text-[11px] text-white"
                    >
                      <option value="gold">Gold (Au, Z=79)</option>
                      <option value="aluminum">Aluminum (Al, Z=13)</option>
                    </select>
                  </label>
                </>
              )}

              {/* UNITS II-X CHEMISTRY BENCH CONTROLS */}
              {(() => {
                const benchMode = EXPERIMENTS[params.experimentId]?.benchMode;
                if (
                  !benchMode ||
                  benchMode === 'crookes' ||
                  benchMode === 'thomson' ||
                  benchMode === 'millikan' ||
                  benchMode === 'rutherford'
                ) {
                  return null;
                }

                const patchChem = (chemPatch: Partial<LabSimulationParams['chem']>) =>
                  onUpdateParams({ chem: { ...params.chem, ...chemPatch } });

                return (
                  <>
                    {/* Burner toggle for thermal/flame/organic/hydrated salt */}
                    {(benchMode === 'flame-burner' ||
                      benchMode === 'calorimeter-rig' ||
                      benchMode === 'conductivity-bath' ||
                      params.experimentId === 'hydrated-salt' ||
                      params.experimentId === 'esterification-reflux' ||
                      params.experimentId === 'no2-n2o4-temp' ||
                      params.experimentId === 'dblock-complexes') && (
                      <button
                        type="button"
                        onClick={() => patchChem({ burnerOn: !params.chem.burnerOn })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                          params.chem.burnerOn
                            ? 'bg-[#EA580C] text-white'
                            : 'bg-[#1D130B] border border-[#8E6234] text-[#EADAC2]'
                        }`}
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>
                          {lang === 'si'
                            ? `දාහකය: ${params.chem.burnerOn ? 'ON' : 'OFF'}`
                            : `Burner: ${params.chem.burnerOn ? 'ON' : 'OFF'}`}
                        </span>
                      </button>
                    )}

                    {/* Add reagent / mix button */}
                    {benchMode !== 'flame-burner' && benchMode !== 'vsepr-3d' && (
                      <button
                        type="button"
                        onClick={() => patchChem({ reagentAdded: !params.chem.reagentAdded })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                          params.chem.reagentAdded
                            ? 'bg-[#16A34A] text-white'
                            : 'bg-[#F38B21] text-[#1E1005]'
                        }`}
                      >
                        <FlaskConical className="w-3.5 h-3.5" />
                        <span>
                          {params.chem.reagentAdded
                            ? lang === 'si'
                              ? 'ප්‍රතිකාරක එක් කළා ✓'
                              : 'Reagent Mixed ✓'
                            : lang === 'si'
                              ? 'ප්‍රතිකාරක එක් කරන්න'
                              : 'Add Reagent / Mix'}
                        </span>
                      </button>
                    )}

                    {/* Flame Test Cation Selector */}
                    {benchMode === 'flame-burner' && (
                      <label className="text-[11px] flex items-center gap-1.5">
                        <span className="text-[#F5C56B]">
                          {lang === 'si' ? 'ලෝහ අයනය' : 'Salt Cation'}:
                        </span>
                        <select
                          value={params.chem.flameCation}
                          onChange={(e) =>
                            patchChem({ flameCation: e.target.value as FlameCation })
                          }
                          className="bg-[#1D130B] border border-[#8E6234] rounded-md px-2 py-1 text-[11px] text-white"
                        >
                          <option value="Li+">Li⁺ (Crimson)</option>
                          <option value="Na+">Na⁺ (Golden Yellow)</option>
                          <option value="K+">K⁺ (Lilac)</option>
                          <option value="Ca2+">Ca²⁺ (Brick Red)</option>
                          <option value="Ba2+">Ba²⁺ (Apple Green)</option>
                          <option value="Cu2+">Cu²⁺ (Blue-Green)</option>
                        </select>
                      </label>
                    )}

                    {/* Conductivity / BP Liquid Sample */}
                    {benchMode === 'conductivity-bath' && (
                      <label className="text-[11px] flex items-center gap-1.5">
                        <span className="text-[#F5C56B]">
                          {lang === 'si' ? 'ද්‍රාවණය' : 'Sample'}:
                        </span>
                        <select
                          value={params.chem.liquidSample}
                          onChange={(e) =>
                            patchChem({ liquidSample: e.target.value as LiquidSample })
                          }
                          className="bg-[#1D130B] border border-[#8E6234] rounded-md px-2 py-1 text-[11px] text-white"
                        >
                          <option value="nacl-aq">NaCl(aq) Ionic</option>
                          <option value="ethanol">Ethanol (H-Bond)</option>
                          <option value="hexane">Hexane (Non-polar)</option>
                          <option value="hc2h3o2">CH₃COOH (Weak Acid)</option>
                        </select>
                      </label>
                    )}

                    {/* VSEPR Molecule Selector */}
                    {benchMode === 'vsepr-3d' && (
                      <div className="flex items-center gap-1">
                        {(['CH4', 'NH3', 'H2O', 'BF3', 'SF6'] as VseprMolecule[]).map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => patchChem({ vseprMolecule: m })}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                              params.chem.vseprMolecule === m
                                ? 'bg-[#F38B21] text-[#1A0E06]'
                                : 'bg-[#1D130B] border border-[#8E6234] text-[#EADAC2]'
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Titration Burette Volume */}
                    {benchMode === 'titration-burette' && (
                      <>
                        <label className="flex flex-col gap-1">
                          <span className="text-[11px] text-[#F5C56B] font-mono-tabular">
                            {lang === 'si' ? 'බියුරෙට් පරිමාව' : 'Burette Added'}:{' '}
                            {params.chem.buretteVolumeMl.toFixed(1)} mL
                          </span>
                          <input
                            type="range"
                            min={0}
                            max={45}
                            step={0.5}
                            value={params.chem.buretteVolumeMl}
                            onChange={(e) =>
                              patchChem({ buretteVolumeMl: Number(e.target.value) })
                            }
                            className="lab-slider w-40"
                          />
                        </label>
                        {params.experimentId === 'acid-base-titration' && (
                          <select
                            value={params.chem.indicatorType}
                            onChange={(e) =>
                              patchChem({
                                indicatorType: e.target.value as
                                  | 'phenolphthalein'
                                  | 'methyl-orange',
                              })
                            }
                            className="bg-[#1D130B] border border-[#8E6234] rounded-md px-2 py-1 text-[11px] text-white"
                          >
                            <option value="phenolphthalein">Phenolphthalein</option>
                            <option value="methyl-orange">Methyl Orange</option>
                          </select>
                        )}
                      </>
                    )}

                    {/* Gas Law Rig */}
                    {benchMode === 'gas-law-rig' && (
                      <>
                        <label className="flex flex-col gap-1">
                          <span className="text-[11px] text-[#F5C56B] font-mono-tabular">
                            P: {params.chem.pressureKpa} kPa
                          </span>
                          <input
                            type="range"
                            min={50}
                            max={260}
                            step={10}
                            value={params.chem.pressureKpa}
                            onChange={(e) => patchChem({ pressureKpa: Number(e.target.value) })}
                            className="lab-slider w-28"
                          />
                        </label>
                        <label className="flex flex-col gap-1">
                          <span className="text-[11px] text-[#F5C56B] font-mono-tabular">
                            T: {params.chem.temperatureC} °C
                          </span>
                          <input
                            type="range"
                            min={15}
                            max={95}
                            step={5}
                            value={params.chem.temperatureC}
                            onChange={(e) => patchChem({ temperatureC: Number(e.target.value) })}
                            className="lab-slider w-28"
                          />
                        </label>
                      </>
                    )}

                    {/* Concentration & Temperature for Calorimetry / Kinetics */}
                    {(benchMode === 'calorimeter-rig' || benchMode === 'kinetics-flask') && (
                      <>
                        <label className="flex flex-col gap-1">
                          <span className="text-[11px] text-[#F5C56B] font-mono-tabular">
                            [C]: {params.chem.concentrationM.toFixed(1)} M
                          </span>
                          <input
                            type="range"
                            min={0.5}
                            max={2.0}
                            step={0.1}
                            value={params.chem.concentrationM}
                            onChange={(e) => patchChem({ concentrationM: Number(e.target.value) })}
                            className="lab-slider w-24"
                          />
                        </label>
                        <label className="flex flex-col gap-1">
                          <span className="text-[11px] text-[#F5C56B] font-mono-tabular">
                            T: {params.chem.temperatureC} °C
                          </span>
                          <input
                            type="range"
                            min={20}
                            max={80}
                            step={5}
                            value={params.chem.temperatureC}
                            onChange={(e) => patchChem({ temperatureC: Number(e.target.value) })}
                            className="lab-slider w-24"
                          />
                        </label>
                        {benchMode === 'kinetics-flask' && (
                          <select
                            value={params.chem.catalyst}
                            onChange={(e) =>
                              patchChem({ catalyst: e.target.value as CatalystChoice })
                            }
                            className="bg-[#1D130B] border border-[#8E6234] rounded-md px-2 py-1 text-[11px] text-white"
                          >
                            <option value="none">No Catalyst</option>
                            <option value="KI">KI Catalyst</option>
                            <option value="MnO2">MnO₂ Catalyst</option>
                          </select>
                        )}
                      </>
                    )}

                    {/* Qualitative & Equilibrium Selectors */}
                    {benchMode === 'test-tube-rack' && (
                      <>
                        {params.experimentId === 'halide-silver' && (
                          <select
                            value={params.chem.halideSample}
                            onChange={(e) =>
                              patchChem({ halideSample: e.target.value as HalideSample })
                            }
                            className="bg-[#1D130B] border border-[#8E6234] rounded-md px-2 py-1 text-[11px] text-white"
                          >
                            <option value="Cl-">Cl⁻ (White AgCl)</option>
                            <option value="Br-">Br⁻ (Cream AgBr)</option>
                            <option value="I-">I⁻ (Yellow AgI)</option>
                          </select>
                        )}
                        {params.experimentId === 'dblock-complexes' && (
                          <select
                            value={params.chem.transitionIon}
                            onChange={(e) =>
                              patchChem({ transitionIon: e.target.value as TransitionMetalIon })
                            }
                            className="bg-[#1D130B] border border-[#8E6234] rounded-md px-2 py-1 text-[11px] text-white"
                          >
                            <option value="Cu2+">Cu²⁺ Complex</option>
                            <option value="Fe2+">Fe²⁺ Complex</option>
                            <option value="Fe3+">Fe³⁺ Complex</option>
                            <option value="Cr3+">Cr³⁺ Complex</option>
                            <option value="Co2+">Co²⁺ Thermochromic</option>
                          </select>
                        )}
                        {(params.experimentId === 'unsaturation-baeyer' ||
                          params.experimentId === 'aldehyde-tollens' ||
                          params.experimentId === 'lucas-iodoform') && (
                          <select
                            value={params.chem.organicSample}
                            onChange={(e) =>
                              patchChem({ organicSample: e.target.value as OrganicSample })
                            }
                            className="bg-[#1D130B] border border-[#8E6234] rounded-md px-2 py-1 text-[11px] text-white"
                          >
                            <option value="alkene">Alkene (Ethene)</option>
                            <option value="alkane">Alkane (Hexane)</option>
                            <option value="aldehyde">Aldehyde (Ethanal)</option>
                            <option value="ketone">Ketone (Propanone)</option>
                          </select>
                        )}
                        {(params.experimentId === 'chromate-dichromate' ||
                          params.experimentId === 'fe-scn-equilibrium' ||
                          params.experimentId === 'no2-n2o4-temp' ||
                          params.experimentId === 'ester-equilibrium') && (
                          <select
                            value={params.chem.eqAction}
                            onChange={(e) =>
                              patchChem({ eqAction: e.target.value as EquilibriumShift })
                            }
                            className="bg-[#1D130B] border border-[#8E6234] rounded-md px-2 py-1 text-[11px] text-white"
                          >
                            <option value="neutral">Initial Equilibrium</option>
                            <option value="add-acid">Add H⁺ / Acid</option>
                            <option value="add-base">Add OH⁻ / Base</option>
                            <option value="heat">Heat Mixture</option>
                            <option value="cool">Ice Bath Cool</option>
                          </select>
                        )}
                      </>
                    )}

                    {/* Electrochemistry Rig */}
                    {benchMode === 'electrochem-cell' && (
                      <>
                        <label className="flex flex-col gap-1">
                          <span className="text-[11px] text-[#F5C56B] font-mono-tabular">
                            DC Voltage: {params.chem.appliedVoltageV.toFixed(1)} V
                          </span>
                          <input
                            type="range"
                            min={0}
                            max={12}
                            step={0.5}
                            value={params.chem.appliedVoltageV}
                            onChange={(e) =>
                              patchChem({ appliedVoltageV: Number(e.target.value) })
                            }
                            className="lab-slider w-32"
                          />
                        </label>
                        <select
                          value={params.chem.electrodePair}
                          onChange={(e) =>
                            patchChem({ electrodePair: e.target.value as ElectrodePair })
                          }
                          className="bg-[#1D130B] border border-[#8E6234] rounded-md px-2 py-1 text-[11px] text-white"
                        >
                          <option value="Zn-Cu">Zn / Cu Cell</option>
                          <option value="Pt-Pt">Inert Pt Electrodes</option>
                          <option value="Cu-Cu">Active Cu Electrodes</option>
                          <option value="Fe-Zn">Fe + Zn Sacrificial</option>
                        </select>
                      </>
                    )}
                  </>
                );
              })()}

              {/* Shared Darkroom & Camera View Presets */}
              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  type="button"
                  onClick={() => onUpdateParams({ darkRoom: !params.darkRoom })}
                  title={lang === 'si' ? 'අඳුරු කාමර ප්‍රකාරය' : 'Toggle Darkroom Lighting'}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                    params.darkRoom
                      ? 'bg-[#312E81] text-[#E0E7FF] border border-[#818CF8]'
                      : 'bg-[#1D130B] border border-[#8E6234] text-[#FDE68A]'
                  }`}
                >
                  {params.darkRoom ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                  <span>{params.darkRoom ? 'Darkroom' : 'Daylight'}</span>
                </button>

                <div className="hidden md:flex items-center gap-1 bg-[#1C110A] p-0.5 rounded-lg border border-[#8E6234]">
                  <Eye className="w-3.5 h-3.5 text-[#D4BFA2] ml-1.5" />
                  {(['overview', 'front', 'closeup', 'top'] as CameraPreset[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => onSelectCameraPreset(p)}
                      className={`px-2 py-1 rounded-md text-[10px] font-semibold capitalize cursor-pointer ${
                        cameraPreset === p
                          ? 'bg-[#F38B21] text-[#1E1005]'
                          : 'text-[#D4BFA2] hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
