import { ReadingVocab } from '../types';

const GEMINI_API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';

// Use gemini-2.0-flash-lite which has higher rate limits (30 RPM vs 2 RPM for flash)
const GEMINI_MODEL = 'gemini-2.0-flash-lite';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Simple request queue to prevent concurrent API calls
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL_MS = 3000; // Minimum 3 seconds between requests

async function waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL_MS) {
        const waitTime = MIN_REQUEST_INTERVAL_MS - timeSinceLastRequest;
        console.log(`Rate limit guard: waiting ${waitTime}ms before next request...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    lastRequestTime = Date.now();
}

/**
 * Parse raw vocabulary input using Gemini AI
 * Input format example:
 * testify chứng tỏ
 * Từ/Cấu trúc liên quan: testify to something
 * Giải thích nghĩa tiếng Việt: ...
 * Ví dụ:
 * His success testifies to his hard work. (...)
 * The ancient ruins testify to a powerful civilization. (...)
 */
export async function parseVocabularyWithGemini(rawInput: string): Promise<ReadingVocab[]> {
    if (!GEMINI_API_KEY) {
        console.warn('No Gemini API key found. Using manual parsing.');
        return parseVocabularyManually(rawInput);
    }

    const prompt = `Bạn là một trợ lý học tiếng Anh. Hãy phân tích đầu vào sau và trả về dạng JSON array.

Mỗi từ vựng trong input có thể theo format:
- Dòng đầu: [từ tiếng Anh] [nghĩa tiếng Việt ngắn]
- Từ/Cấu trúc liên quan: ...
- Giải thích nghĩa tiếng Việt: ...
- Ví dụ: (các dòng ví dụ tiếp theo)

Có thể có NHIỀU từ vựng trong một input, phân tách bởi dòng trống.

Trả về CHÍNH XÁC JSON array (không markdown, không \`\`\`json):
[
  {
    "term": "từ tiếng Anh",
    "meaning": "nghĩa tiếng Việt ngắn gọn",
    "relatedStructure": "cấu trúc liên quan",
    "explanation": "giải thích nghĩa chi tiết bằng tiếng Việt",
    "examples": ["ví dụ 1 bằng tiếng Anh (nghĩa tiếng Việt)", "ví dụ 2..."]
  }
]

Nếu thiếu trường nào, hãy để string rỗng "" hoặc mảng rỗng [].

INPUT:
${rawInput}`;

    const MAX_RETRIES = 3;
    const BASE_DELAY_MS = 15000; // 15 seconds - better for rate limit recovery

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            // Wait for rate limit guard
            await waitForRateLimit();

            const response = await fetch(
                `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0.1,
                            maxOutputTokens: 4096,
                        },
                    }),
                }
            );

            // Handle rate limiting with retry
            if (response.status === 429) {
                if (attempt < MAX_RETRIES) {
                    // Try to get retry delay from response headers
                    const retryAfter = response.headers.get('Retry-After');
                    const delay = retryAfter
                        ? parseInt(retryAfter) * 1000
                        : BASE_DELAY_MS * Math.pow(2, attempt); // 15s, 30s, 60s
                    console.warn(
                        `Gemini API rate limited (429). Retrying in ${delay / 1000}s... (attempt ${attempt + 1}/${MAX_RETRIES})`
                    );
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                console.error('Gemini API rate limited after all retries. Falling back to manual parsing.');
                return parseVocabularyManually(rawInput);
            }

            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Unknown error');
                console.error(`Gemini API error (${response.status}):`, errorText);
                if (attempt < MAX_RETRIES) {
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    continue;
                }
                return parseVocabularyManually(rawInput);
            }

            const data = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

            if (!text) {
                console.warn('Empty response from Gemini. Falling back to manual parsing.');
                return parseVocabularyManually(rawInput);
            }

            // Clean the response - remove markdown code blocks if present
            const cleanedText = text
                .replace(/```json\s*/g, '')
                .replace(/```\s*/g, '')
                .trim();

            const parsed = JSON.parse(cleanedText);

            if (!Array.isArray(parsed)) {
                console.warn('Gemini response is not an array. Falling back to manual parsing.');
                return parseVocabularyManually(rawInput);
            }

            console.log(`✅ Gemini parsed ${parsed.length} vocabulary items successfully.`);

            return parsed.map((item: any) => ({
                term: item.term || '',
                meaning: item.meaning || '',
                relatedStructure: item.relatedStructure || '',
                explanation: item.explanation || '',
                examples: Array.isArray(item.examples) ? item.examples : [],
                createdAt: Date.now(),
            }));
        } catch (error) {
            console.error(`Error parsing with Gemini (attempt ${attempt + 1}):`, error);
            if (attempt === MAX_RETRIES) {
                console.warn('All Gemini retries exhausted. Falling back to manual parsing.');
                return parseVocabularyManually(rawInput);
            }
            // Wait before retry on error
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }

    return parseVocabularyManually(rawInput);
}

/**
 * Fallback: Parse vocabulary manually without AI
 * Enhanced to handle more formats robustly
 */
function parseVocabularyManually(rawInput: string): ReadingVocab[] {
    console.log('📝 Using manual parser (no AI)...');
    const results: ReadingVocab[] = [];

    // Split by double newline for multiple entries
    const entries = rawInput.split(/\n\s*\n/).filter(e => e.trim());

    for (const entry of entries) {
        const lines = entry.trim().split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length === 0) continue;

        const vocab: ReadingVocab = {
            term: '',
            meaning: '',
            relatedStructure: '',
            explanation: '',
            examples: [],
            createdAt: Date.now(),
        };

        // First line: "testify chứng tỏ" or just "testify"
        // Try to split English and Vietnamese
        const firstLine = lines[0];

        // Strategy: find where English ends and Vietnamese begins
        // Vietnamese characters are in Unicode range
        const vietnameseMatch = firstLine.match(/^([a-zA-Z\s\-']+)\s+(.+)$/);
        if (vietnameseMatch) {
            vocab.term = vietnameseMatch[1].trim();
            vocab.meaning = vietnameseMatch[2].trim();
        } else {
            // Fallback: split by first space
            const firstSpaceIdx = firstLine.indexOf(' ');
            if (firstSpaceIdx > 0) {
                vocab.term = firstLine.substring(0, firstSpaceIdx).trim();
                vocab.meaning = firstLine.substring(firstSpaceIdx + 1).trim();
            } else {
                vocab.term = firstLine;
            }
        }

        let isExampleSection = false;

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            const lineLower = line.toLowerCase();

            if (
                lineLower.startsWith('từ/cấu trúc liên quan:') ||
                lineLower.startsWith('cấu trúc liên quan:') ||
                lineLower.startsWith('cấu trúc:') ||
                lineLower.startsWith('related structure:') ||
                lineLower.startsWith('structure:')
            ) {
                vocab.relatedStructure = line.split(':').slice(1).join(':').trim();
                isExampleSection = false;
            } else if (
                lineLower.startsWith('giải thích nghĩa tiếng việt:') ||
                lineLower.startsWith('giải thích nghĩa:') ||
                lineLower.startsWith('giải thích:') ||
                lineLower.startsWith('nghĩa:') ||
                lineLower.startsWith('explanation:')
            ) {
                vocab.explanation = line.split(':').slice(1).join(':').trim();
                isExampleSection = false;
            } else if (
                lineLower.startsWith('ví dụ:') ||
                lineLower.startsWith('examples:') ||
                lineLower.startsWith('example:')
            ) {
                isExampleSection = true;
                const afterColon = line.split(':').slice(1).join(':').trim();
                if (afterColon) {
                    vocab.examples.push(afterColon);
                }
            } else if (isExampleSection && line.trim()) {
                vocab.examples.push(line.trim());
            } else if (!isExampleSection && !vocab.explanation && line.trim()) {
                // Lines that don't match any pattern - could be continuation of explanation
                // or additional context
                if (vocab.explanation) {
                    vocab.explanation += ' ' + line.trim();
                }
            }
        }

        if (vocab.term) {
            results.push(vocab);
        }
    }

    console.log(`📝 Manual parser found ${results.length} vocabulary items.`);
    return results;
}
