import 'dotenv/config';
import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import {
  APP_MIN_ANDROID_API,
  APP_MIN_ANDROID_VERSION,
  APP_VERSION,
} from './src/utils/appRelease.ts';
import { FIXED_MALE_VOICE, prepareTextForSpeech } from './src/utils/speechText.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';
const TTS_CACHE_DIR = path.join(__dirname, '.tts-cache');

// In-memory + disk TTS audio cache & cooldown guard so Puck voice plays reliably across all screens
const ttsAudioCache = new Map<string, string>();
const ttsInFlight = new Map<string, Promise<{ audioBase64?: string; errorStatus?: number; errorMessage?: string }>>();
let ttsCooldownUntil = 0;

function getTtsDiskPath(cacheKey: string): string {
  const hash = crypto.createHash('sha256').update(cacheKey).digest('hex');
  return path.join(TTS_CACHE_DIR, `${hash}.b64`);
}

async function readTtsDiskCache(cacheKey: string): Promise<string | null> {
  try {
    const filePath = getTtsDiskPath(cacheKey);
    const data = await fs.readFile(filePath, 'utf8');
    return data || null;
  } catch {
    return null;
  }
}

async function writeTtsDiskCache(cacheKey: string, audioBase64: string): Promise<void> {
  try {
    await fs.mkdir(TTS_CACHE_DIR, { recursive: true });
    await fs.writeFile(getTtsDiskPath(cacheKey), audioBase64, 'utf8');
  } catch {
    // Ignore disk cache write failure
  }
}

function createGeminiClient(apiVersion?: string): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    ...(apiVersion ? { apiVersion } : {}),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function isTransientHighDemand(err: unknown): boolean {
  const raw = err instanceof Error ? err.message : String(err);
  return /503|UNAVAILABLE|high demand|overloaded|try again later/i.test(raw);
}

function isUnsupportedFieldError(err: unknown): boolean {
  const raw = err instanceof Error ? err.message : String(err);
  return /Unknown name|Cannot find field|INVALID_ARGUMENT/i.test(raw);
}

function mapGeminiError(err: unknown): { status: number; message: string } {
  const raw = err instanceof Error ? err.message : String(err);
  if (/API_KEY_INVALID|PERMISSION_DENIED|403|401/i.test(raw)) {
    return {
      status: 403,
      message:
        'Gemini API key is missing or invalid. Check your GEMINI_API_KEY in Settings > Secrets.',
    };
  }
  if (/RESOURCE_EXHAUSTED|429/i.test(raw)) {
    return {
      status: 429,
      message:
        'AI request quota temporarily reached. Please wait a moment and try again.',
    };
  }
  return {
    status: 500,
    message: raw || 'Failed to reach Gemini AI service.',
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  const serverStartedAt = new Date().toISOString();
  const buildId = `${APP_VERSION}-${serverStartedAt.slice(0, 19).replace(/[:T-]/g, '')}`;

  app.get('/api/health', (_req, res) => {
    const hasKey = Boolean(
      process.env.GEMINI_API_KEY?.trim() &&
        process.env.GEMINI_API_KEY?.trim() !== 'MY_GEMINI_API_KEY'
    );
    res.json({ ok: true, aiConfigured: hasKey, version: APP_VERSION, buildId });
  });

  app.get('/api/app/version', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.json({
      version: APP_VERSION,
      buildId,
      minAndroidVersion: APP_MIN_ANDROID_VERSION,
      minAndroidApi: APP_MIN_ANDROID_API,
      updatedAt: serverStartedAt,
      releaseNotes: {
        si: 'Android 10+ සෘජු ස්ථාපනය (Offline 3D Labs, 118 Elements, 100+ Reactions, Puck Voice) සහ සජීවී යාවත්කාලීන පද්ධතිය.',
        en: 'Android 10+ installable app (Offline 3D Labs, 118 Elements, 100+ Reactions, Puck Voice) with instant OTA updates.',
      },
    });
  });

  // 1. Bilingual AI Chemistry Lab Assistant (Sinhala & English)
  app.post('/api/ai/assistant', async (req, res) => {
    const ai = createGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error:
          'GEMINI_API_KEY is not configured. Add GEMINI_API_KEY in Settings > Secrets to use the AI Chemistry Assistant.',
      });
    }

    const {
      question,
      lang = 'si',
      unitRoman = 'I',
      experimentTitle = '',
      stepTitle = '',
      stepTask = '',
      liveTelemetry = '',
      studentName = '',
      studentAge,
      history = [],
    } = req.body ?? {};

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ error: 'Question text is required.' });
    }

    const cleanStudentName = typeof studentName === 'string' ? studentName.trim().slice(0, 60) : '';
    const targetLangLabel =
      lang === 'si'
        ? 'Sinhala (සිංහල, using clear natural Sri Lankan A/L Chemistry terminology with key English chemical symbols/formulas like H₂SO₄, KMnO₄, ΔH, e/m preserved cleanly)'
        : 'English (using Sri Lankan G.C.E. A/L Chemistry syllabus terminology)';

    const systemInstruction = [
      'You are an encouraging, expert Sri Lankan G.C.E. A/L Chemistry Virtual Lab Instructor inside "ChemLab LK" (designed by Janiru Induwara).',
      `Always respond in ${targetLangLabel}.`,
      cleanStudentName
        ? `Address the student warmly by their name "${cleanStudentName}"${studentAge ? ` (age ${studentAge})` : ''} when greeting or encouraging them.`
        : '',
      'Keep answers accurate to the Sri Lankan NIE G.C.E. A/L Chemistry syllabus, practical, concise (under 140 words for reply), and easy for school students without physical lab equipment to follow.',
      'In addition to "reply" (which can use simple chemical formulas), produce a natural "spokenScript" (2-4 short sentences, no markdown bullets or symbols like ** or #, spell out arrows/equations naturally so the voice narrator reads it smoothly).',
      'Also return 2 short "suggestedFollowups" questions in the same language.',
    ]
      .filter(Boolean)
      .join('\n');

    const historyBlock = Array.isArray(history)
      ? history
          .slice(-4)
          .map((m: { role?: string; text?: string }) => `${m.role === 'user' ? 'Student' : 'Instructor'}: ${m.text ?? ''}`)
          .join('\n')
      : '';

    const prompt = [
      cleanStudentName ? `Student: ${cleanStudentName}` : '',
      `Active Unit: Unit ${unitRoman}`,
      `Practical: ${experimentTitle}`,
      `Current Step: ${stepTitle} — Task: ${stepTask}`,
      `Live Bench Readings: ${liveTelemetry}`,
      historyBlock ? `Recent Conversation:\n${historyBlock}` : '',
      `Student Question / Request: ${question.trim()}`,
    ]
      .filter(Boolean)
      .join('\n\n');

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        reply: {
          type: Type.STRING,
          description: 'Helpful chemistry lab explanation for the student.',
        },
        spokenScript: {
          type: Type.STRING,
          description: 'Natural voice-friendly narration script with no markdown symbols.',
        },
        suggestedFollowups: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Two short follow-up questions in the active language.',
        },
      },
      required: ['reply', 'spokenScript', 'suggestedFollowups'],
    };

    try {
      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: prompt,
          config: {
            systemInstruction,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: 'application/json',
            responseSchema,
            abortSignal: AbortSignal.timeout(8000),
          },
        });
      } catch (primaryErr) {
        const errMsg = primaryErr instanceof Error ? primaryErr.message : String(primaryErr);
        const isTimeout = /abort|timeout/i.test(errMsg);
        if (!isTransientHighDemand(primaryErr) && !isTimeout) {
          throw primaryErr;
        }
        response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema,
            abortSignal: AbortSignal.timeout(15000),
          },
        });
      }

      const rawText = (response.text ?? '').trim();
      const parsed = JSON.parse(rawText);
      return res.json(parsed);
    } catch (err) {
      const mapped = mapGeminiError(err);
      return res.status(mapped.status).json({ error: mapped.message });
    }
  });

  // 2. AI Voice Instructing Assistant (Gemini TTS -> WAV audio)
  app.post('/api/ai/voice', async (req, res) => {
    const ai = createGeminiClient();
    const aiAlpha = createGeminiClient('v1alpha');
    const { text, lang = 'si', auto = false } = req.body ?? {};
    if (!ai) {
      if (auto) {
        return res.json({ audioBase64: null, unavailable: true, error: 'AI Voice not configured.' });
      }
      return res.status(503).json({
        error:
          'GEMINI_API_KEY is not configured. Add GEMINI_API_KEY in Settings > Secrets to enable AI Voice narration.',
      });
    }

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text to speak is required.' });
    }

    const selectedVoice = FIXED_MALE_VOICE;
    const targetLang = lang === 'en' ? 'en' : 'si';

    const cleanText = prepareTextForSpeech(text, targetLang).slice(0, 950);
    const cacheKey = `${selectedVoice}|${targetLang}|${cleanText}`;

    // 1) Serve instantaneously from memory or disk cache (100% genuine Puck audio)
    const cached = ttsAudioCache.get(cacheKey);
    if (cached) {
      return res.json({ audioBase64: cached, mimeType: 'audio/wav', cached: true });
    }
    const diskCached = await readTtsDiskCache(cacheKey);
    if (diskCached) {
      ttsAudioCache.set(cacheKey, diskCached);
      return res.json({ audioBase64: diskCached, mimeType: 'audio/wav', cached: true });
    }

    // 2) Respect short cooldown after upstream 429 rate-limit
    if (Date.now() < ttsCooldownUntil) {
      if (auto) {
        return res.json({ audioBase64: null, rateLimited: true });
      }
      return res.status(429).json({
        error: 'AI request quota temporarily reached. Please wait a moment and try again.',
      });
    }

    const stylePrompt =
      targetLang === 'si'
        ? 'Native Sri Lankan adult male chemistry teacher speaking standard Sri Lankan Sinhala (si-LK). Pronounce every Sinhala word, vowel length, and syllable clearly and naturally at a calm, steady teaching pace, while articulating chemical terms cleanly.'
        : 'Clear, calm, articulate Sri Lankan male chemistry laboratory instructor speaking crisp English step by step.';

    try {
      let pending = ttsInFlight.get(cacheKey);
      if (!pending) {
        pending = (async () => {
          try {
            let response;
            const styledContents = [
              {
                role: 'user',
                parts: [
                  {
                    text: cleanText,
                    speechMetadata: { style: stylePrompt },
                  },
                ],
              },
            ];
            const speechCfg = {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: selectedVoice },
                },
              },
            };

            const callTtsModel = async (modelName: string) => {
              try {
                return await ai.models.generateContent({
                  model: modelName,
                  contents: styledContents as never,
                  config: speechCfg as never,
                });
              } catch (e1) {
                if (!isUnsupportedFieldError(e1) && !isTransientHighDemand(e1)) {
                  throw e1;
                }
                try {
                  const client = aiAlpha ?? ai;
                  return await client.models.generateContent({
                    model: modelName,
                    contents: styledContents as never,
                    config: speechCfg as never,
                  });
                } catch (e2) {
                  if (!isUnsupportedFieldError(e2)) {
                    throw e2;
                  }
                  return await ai.models.generateContent({
                    model: modelName,
                    contents: [{ role: 'user', parts: [{ text: `${stylePrompt}: ${cleanText}` }] }],
                    config: speechCfg as never,
                  });
                }
              }
            };

            try {
              response = await callTtsModel('gemini-3.8-flash-lite-tts');
            } catch (liteErr) {
              const rawLite = liteErr instanceof Error ? liteErr.message : String(liteErr);
              console.error('[TTS lite error]', rawLite.slice(0, 300));
              response = await callTtsModel('gemini-3.8-flash-tts');
            }

            const base64Audio =
              response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (!base64Audio) {
              return { errorStatus: 502, errorMessage: 'Voice synthesizer returned no audio data.' };
            }

            if (ttsAudioCache.size >= 250) {
              const firstKey = ttsAudioCache.keys().next().value;
              if (firstKey) ttsAudioCache.delete(firstKey);
            }
            ttsAudioCache.set(cacheKey, base64Audio);
            void writeTtsDiskCache(cacheKey, base64Audio);
            return { audioBase64: base64Audio };
          } catch (err) {
            const rawErr = err instanceof Error ? err.message : String(err);
            console.error('[TTS final error]', rawErr.slice(0, 300));
            const mapped = mapGeminiError(err);
            if (mapped.status === 429) {
              ttsCooldownUntil = Date.now() + 4_000;
            }
            return { errorStatus: mapped.status, errorMessage: mapped.message };
          } finally {
            ttsInFlight.delete(cacheKey);
          }
        })();
        ttsInFlight.set(cacheKey, pending);
      }

      const result = await pending;
      if (result.audioBase64) {
        return res.json({
          audioBase64: result.audioBase64,
          mimeType: 'audio/wav',
        });
      }

      if (auto && (result.errorStatus === 429 || result.errorStatus === 403 || result.errorStatus === 503)) {
        return res.json({
          audioBase64: null,
          rateLimited: result.errorStatus === 429,
          unavailable: true,
        });
      }

      return res.status(result.errorStatus || 500).json({
        error: result.errorMessage || 'Voice narration unavailable.',
      });
    } catch (err) {
      const mapped = mapGeminiError(err);
      return res.status(mapped.status).json({ error: mapped.message });
    }
  });

  // 3. Student Voice Question Transcription (Sinhala / English)
  app.post('/api/ai/transcribe', async (req, res) => {
    const ai = createGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error:
          'GEMINI_API_KEY is not configured. Add GEMINI_API_KEY in Settings > Secrets to enable Voice Input.',
      });
    }

    const { audioBase64, mimeType = 'audio/webm', lang = 'si' } = req.body ?? {};
    if (!audioBase64 || typeof audioBase64 !== 'string') {
      return res.status(400).json({ error: 'Audio recording data is required.' });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: audioBase64,
              },
            },
            {
              text:
                lang === 'si'
                  ? 'Transcribe this student chemistry question accurately. Output in Sinhala script or English as spoken.'
                  : 'Transcribe this student chemistry question accurately in English or Sinhala as spoken.',
            },
          ],
        },
      });

      return res.json({ transcript: (response.text ?? '').trim() });
    } catch (err) {
      const mapped = mapGeminiError(err);
      return res.status(mapped.status).json({ error: mapped.message });
    }
  });

  if (isProduction) {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ChemLab LK server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start ChemLab LK server:', err);
  process.exit(1);
});
