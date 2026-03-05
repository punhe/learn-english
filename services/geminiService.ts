import { ReadingVocab } from '../types';

// Support multiple API keys for rotation (comma-separated in env)
const GEMINI_API_KEYS: string[] = (() => {
    const raw = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
    return raw.split(',').map((k: string) => k.trim()).filter(Boolean);
})();

// Track which keys are blocked
const blockedKeys: Map<string, number> = new Map();
let currentKeyIndex = 0;

const GEMINI_MODELS = [
    'gemini-2.5-flash-lite',  // 10 RPM on this account
    'gemini-2.5-flash',       // 5 RPM on this account
];

function getAvailableApiKey(): string | null {
    if (GEMINI_API_KEYS.length === 0) return null;
    const now = Date.now();
    for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
        const idx = (currentKeyIndex + i) % GEMINI_API_KEYS.length;
        const key = GEMINI_API_KEYS[idx];
        const blockedUntil = blockedKeys.get(key);
        if (!blockedUntil || now >= blockedUntil) {
            if (blockedUntil) blockedKeys.delete(key);
            currentKeyIndex = idx;
            return key;
        }
    }
    return null; // All keys blocked
}

function blockApiKey(key: string, durationMs: number = 60000) {
    blockedKeys.set(key, Date.now() + durationMs);
    currentKeyIndex = (currentKeyIndex + 1) % GEMINI_API_KEYS.length;
}

let lastRequestTime = 0;
async function waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const elapsed = now - lastRequestTime;
    if (elapsed < 4000) {
        await new Promise(resolve => setTimeout(resolve, 4000 - elapsed));
    }
    lastRequestTime = Date.now();
}

/**
 * Parse raw vocabulary input - tries Gemini AI first, falls back to manual parser
 */
export async function parseVocabularyWithGemini(rawInput: string): Promise<ReadingVocab[]> {
    // Try AI parsing first
    const aiResult = await tryGeminiParsing(rawInput);
    if (aiResult && aiResult.length > 0) {
        return aiResult;
    }

    // AI failed or unavailable - use manual parser
    console.log('🔧 AI unavailable, using intelligent manual parser...');
    return parseVocabularyManually(rawInput);
}

async function tryGeminiParsing(rawInput: string): Promise<ReadingVocab[] | null> {
    const apiKey = getAvailableApiKey();
    if (!apiKey) {
        console.warn('⚠️ No Gemini API key available.');
        return null;
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

    for (const model of GEMINI_MODELS) {
        try {
            await waitForRateLimit();
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.1, maxOutputTokens: 4096 },
                }),
            });

            if (response.status === 429) {
                blockApiKey(apiKey, 60000);
                continue;
            }
            if (!response.ok) continue;

            const data = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (!text) continue;

            const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
            const parsed = JSON.parse(cleaned);
            if (!Array.isArray(parsed)) continue;

            console.log(`✅ Gemini (${model}) parsed ${parsed.length} items.`);
            return parsed.map((item: any) => ({
                term: item.term || '',
                meaning: item.meaning || '',
                relatedStructure: item.relatedStructure || '',
                explanation: item.explanation || '',
                examples: Array.isArray(item.examples) ? item.examples : [],
                createdAt: Date.now(),
            }));
        } catch {
            continue;
        }
    }
    return null;
}

/**
 * Intelligent manual parser - handles multiple vocabulary formats
 * Works WITHOUT any AI/API dependency
 */
function parseVocabularyManually(rawInput: string): ReadingVocab[] {
    console.log('📝 Intelligent manual parser running...');
    const results: ReadingVocab[] = [];

    // Normalize line endings
    const normalized = rawInput.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Split entries by double newline OR by detecting new vocabulary words
    const entries = splitIntoEntries(normalized);

    for (const entry of entries) {
        const vocab = parseEntry(entry);
        if (vocab && vocab.term) {
            results.push(vocab);
        }
    }

    console.log(`📝 Manual parser found ${results.length} vocabulary items.`);
    return results;
}

/**
 * Intelligently split raw input into separate vocabulary entries
 */
function splitIntoEntries(text: string): string[] {
    // First try: split by double newline
    const byDoubleNewline = text.split(/\n\s*\n/).filter(e => e.trim());

    if (byDoubleNewline.length > 1) {
        return byDoubleNewline;
    }

    // If only one block, check if it contains multiple vocabulary words
    // by looking for lines that start with an English word followed by Vietnamese
    const lines = text.split('\n');
    const entries: string[] = [];
    let currentEntry: string[] = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
            if (currentEntry.length > 0) {
                entries.push(currentEntry.join('\n'));
                currentEntry = [];
            }
            continue;
        }

        // Check if this line starts a new vocabulary entry
        // Pattern: English word(s) followed by Vietnamese text
        const isNewEntry = /^[a-zA-Z][a-zA-Z\s\-']*\s+[\u00C0-\u024F\u1E00-\u1EFF\u0100-\u017F\u0300-\u036F\u00C0-\u00FF\u0102\u0103\u0110\u0111\u0128\u0129\u0168\u0169\u01A0\u01A1\u01AF\u01B0]/.test(trimmed) &&
            !isLabelLine(trimmed);

        if (isNewEntry && currentEntry.length > 0) {
            entries.push(currentEntry.join('\n'));
            currentEntry = [trimmed];
        } else {
            currentEntry.push(trimmed);
        }
    }

    if (currentEntry.length > 0) {
        entries.push(currentEntry.join('\n'));
    }

    return entries.length > 0 ? entries : [text];
}

/**
 * Check if a line is a label/header line (not a new vocab entry)
 */
function isLabelLine(line: string): boolean {
    const lower = line.toLowerCase();
    const labels = [
        'từ/cấu trúc liên quan:', 'cấu trúc liên quan:', 'cấu trúc:',
        'giải thích nghĩa tiếng việt:', 'giải thích nghĩa:', 'giải thích:',
        'nghĩa:', 'ví dụ:', 'examples:', 'example:', 'explanation:',
        'related structure:', 'structure:', 'meaning:', 'definition:',
        'usage:', 'synonym:', 'antonym:', 'note:', 'ghi chú:',
    ];
    return labels.some(label => lower.startsWith(label));
}

/**
 * Parse a single vocabulary entry into a ReadingVocab object
 */
function parseEntry(entry: string): ReadingVocab | null {
    const lines = entry.trim().split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return null;

    const vocab: ReadingVocab = {
        term: '',
        meaning: '',
        relatedStructure: '',
        explanation: '',
        examples: [],
        createdAt: Date.now(),
    };

    // Parse first line: "testify chứng tỏ" or "testify - chứng tỏ" or just "testify"
    const firstLine = lines[0];
    parseFirstLine(firstLine, vocab);

    // Parse remaining lines
    let currentSection: 'none' | 'structure' | 'explanation' | 'examples' = 'none';

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const lower = line.toLowerCase();

        // Detect section headers
        if (matchesLabel(lower, ['từ/cấu trúc liên quan:', 'cấu trúc liên quan:', 'cấu trúc:', 'related structure:', 'structure:'])) {
            vocab.relatedStructure = extractAfterColon(line);
            currentSection = 'structure';
        } else if (matchesLabel(lower, ['giải thích nghĩa tiếng việt:', 'giải thích nghĩa:', 'giải thích:', 'nghĩa:', 'explanation:', 'meaning:', 'definition:'])) {
            vocab.explanation = extractAfterColon(line);
            currentSection = 'explanation';
        } else if (matchesLabel(lower, ['ví dụ:', 'examples:', 'example:'])) {
            currentSection = 'examples';
            const afterColon = extractAfterColon(line);
            if (afterColon) {
                vocab.examples.push(cleanExample(afterColon));
            }
        } else {
            // Content line - add to current section
            switch (currentSection) {
                case 'structure':
                    // Continuation of structure (rare but possible)
                    if (vocab.relatedStructure) {
                        vocab.relatedStructure += ', ' + line;
                    } else {
                        vocab.relatedStructure = line;
                    }
                    break;
                case 'explanation':
                    // Continuation of explanation
                    if (vocab.explanation) {
                        vocab.explanation += ' ' + line;
                    } else {
                        vocab.explanation = line;
                    }
                    break;
                case 'examples':
                    // Each line is an example
                    if (line.trim()) {
                        vocab.examples.push(cleanExample(line));
                    }
                    break;
                default:
                    // No section header yet - try to guess
                    // If line looks like an example (starts with capital, contains period)
                    if (/^[A-Z]/.test(line) && line.includes('.')) {
                        currentSection = 'examples';
                        vocab.examples.push(cleanExample(line));
                    } else if (!vocab.explanation) {
                        vocab.explanation = line;
                        currentSection = 'explanation';
                    }
                    break;
            }
        }
    }

    return vocab.term ? vocab : null;
}

/**
 * Parse the first line to extract term and meaning
 */
function parseFirstLine(line: string, vocab: ReadingVocab): void {
    // Try pattern: "word - meaning" or "word – meaning"
    const dashMatch = line.match(/^([a-zA-Z][a-zA-Z\s\-']*?)\s*[-–—:]\s+(.+)$/);
    if (dashMatch) {
        vocab.term = dashMatch[1].trim();
        vocab.meaning = dashMatch[2].trim();
        return;
    }

    // Try pattern: "english_word(s) vietnamese_meaning"
    // Vietnamese chars: à-ỹ etc
    const vnMatch = line.match(/^([a-zA-Z][a-zA-Z\s\-']*?)\s+([\u00C0-\u024F\u1E00-\u1EFF\u0100-\u017F\u0300-\u036F\u00C0-\u00FF\u0041-\u005A\u0061-\u007A].*)$/);
    if (vnMatch) {
        const potentialTerm = vnMatch[1].trim();
        const potentialMeaning = vnMatch[2].trim();
        // Make sure "term" looks like English words (not too many words)
        if (potentialTerm.split(/\s+/).length <= 5) {
            vocab.term = potentialTerm;
            vocab.meaning = potentialMeaning;
            return;
        }
    }

    // Fallback: split by first space
    const spaceIdx = line.indexOf(' ');
    if (spaceIdx > 0) {
        vocab.term = line.substring(0, spaceIdx).trim();
        vocab.meaning = line.substring(spaceIdx + 1).trim();
    } else {
        vocab.term = line.trim();
    }
}

function matchesLabel(lower: string, labels: string[]): boolean {
    return labels.some(l => lower.startsWith(l));
}

function extractAfterColon(line: string): string {
    const colonIdx = line.indexOf(':');
    return colonIdx >= 0 ? line.substring(colonIdx + 1).trim() : line.trim();
}

function cleanExample(ex: string): string {
    // Remove leading bullets, dashes, numbers
    return ex.replace(/^[\s\-•*·→►▸\d.)\]]+\s*/, '').trim();
}
