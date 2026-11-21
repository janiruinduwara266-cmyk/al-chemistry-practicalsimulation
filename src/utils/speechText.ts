import type { Language, VoiceName } from '../types/lab';

export const FIXED_MALE_VOICE: VoiceName = 'Puck';

export const FIXED_VOICE_LABEL: { si: string; en: string } = {
  si: 'Puck — පිරිමි හඬ',
  en: 'Puck (Male Voice)',
};

const SUBSCRIPT_MAP: Record<string, string> = {
  '₀': '0',
  '₁': '1',
  '₂': '2',
  '₃': '3',
  '₄': '4',
  '₅': '5',
  '₆': '6',
  '₇': '7',
  '₈': '8',
  '₉': '9',
};

const SUPERSCRIPT_MAP: Record<string, string> = {
  '⁰': '0',
  '¹': '1',
  '²': '2',
  '³': '3',
  '⁴': '4',
  '⁵': '5',
  '⁶': '6',
  '⁷': '7',
  '⁸': '8',
  '⁹': '9',
  '⁺': ' plus ',
  '⁻': ' minus ',
};

/**
 * Normalizes mixed Sinhala/English chemistry notation, chemical formulas,
 * reaction arrows, and UI abbreviations into clean spoken phrasing so both
 * Gemini TTS and browser SpeechSynthesis pronounce Sinhala and science terms clearly.
 */
export function prepareTextForSpeech(rawText: string, lang: Language): string {
  if (!rawText) return '';

  let text = rawText
    .replace(/[*_`#]/g, '')
    .replace(/\u200D/g, '\u200D'); // preserve Sinhala ZWJ joiners explicitly

  // Normalize chemical symbols & reaction arrows into natural spoken words
  if (lang === 'si') {
    text = text
      .replace(/ChemLab\s*LK/gi, 'කෙම් ලැබ් එල් කේ')
      .replace(/\bA\/L\b/g, 'උසස් පෙළ')
      .replace(/\b3D\b/g, 'ත්‍රිමාණ')
      .replace(/\bpH\b/g, 'පී එච්')
      .replace(/ΔH/g, ' එන්තැල්පි වෙනස ')
      .replace(/°C/g, ' සෙල්සියස් අංශක')
      .replace(/kJ\s*mol⁻¹|kJ\/mol/gi, ' කිලෝජූල් මවුලයට')
      .replace(/mol\s*dm⁻³|mol\/dm3/gi, ' මවුල ඝන ඩෙසිමීටරයට')
      .replace(/\bmmHg\b/g, ' මිලිමීටර් රසදිය')
      .replace(/→/g, ' බවට පත්වේ ')
      .replace(/⇌/g, ' ප්‍රතිවර්ත්‍යව ')
      .replace(/↑/g, ' වායුව පිටවේ ')
      .replace(/↓/g, ' අවක්ෂේපය සෑදේ ');
  } else {
    text = text
      .replace(/ΔH/g, ' enthalpy change ')
      .replace(/°C/g, ' degrees Celsius')
      .replace(/kJ\s*mol⁻¹|kJ\/mol/gi, ' kilojoules per mole')
      .replace(/mol\s*dm⁻³|mol\/dm3/gi, ' moles per cubic decimeter')
      .replace(/\bmmHg\b/g, ' millimeters of mercury')
      .replace(/→/g, ' yields ')
      .replace(/⇌/g, ' is in equilibrium with ')
      .replace(/↑/g, ' gas evolved ')
      .replace(/↓/g, ' precipitate formed ');
  }

  // Convert Unicode subscript/superscript digits & charge signs so TTS reads formulas cleanly
  text = text.replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (ch) => ` ${SUBSCRIPT_MAP[ch] ?? ch} `);
  text = text.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]/g, (ch) => SUPERSCRIPT_MAP[ch] ?? ch);

  // Smooth dashes & bullets into natural pauses
  text = text
    .replace(/[·•]/g, ', ')
    .replace(/[—–]/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();

  return text;
}
