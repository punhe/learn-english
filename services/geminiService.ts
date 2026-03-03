import { ReadingVocab } from '../types';

const GEMINI_API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';

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
        // Fallback: parse manually without AI
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
    const BASE_DELAY_MS = 2000; // 2 seconds

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
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
                    const delay = BASE_DELAY_MS * Math.pow(2, attempt); // 2s, 4s, 8s
                    console.warn(`Gemini API rate limited (429). Retrying in ${delay / 1000}s... (attempt ${attempt + 1}/${MAX_RETRIES})`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                console.error('Gemini API rate limited after all retries. Falling back to manual parsing.');
                return parseVocabularyManually(rawInput);
            }

            if (!response.ok) {
                console.error('Gemini API error:', response.status);
                return parseVocabularyManually(rawInput);
            }

            const data = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

            // Clean the response - remove markdown code blocks if present
            const cleanedText = text
                .replace(/```json\s*/g, '')
                .replace(/```\s*/g, '')
                .trim();

            const parsed = JSON.parse(cleanedText);

            if (!Array.isArray(parsed)) {
                return parseVocabularyManually(rawInput);
            }

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
                return parseVocabularyManually(rawInput);
            }
        }
    }

    return parseVocabularyManually(rawInput);
}

/**
 * Fallback: Parse vocabulary manually without AI
 */
function parseVocabularyManually(rawInput: string): ReadingVocab[] {
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
        const firstLine = lines[0];
        const firstSpaceIdx = firstLine.indexOf(' ');
        if (firstSpaceIdx > 0) {
            vocab.term = firstLine.substring(0, firstSpaceIdx).trim();
            vocab.meaning = firstLine.substring(firstSpaceIdx + 1).trim();
        } else {
            vocab.term = firstLine;
        }

        let isExampleSection = false;

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];

            if (line.startsWith('Từ/Cấu trúc liên quan:') || line.startsWith('Cấu trúc:')) {
                vocab.relatedStructure = line.split(':').slice(1).join(':').trim();
                isExampleSection = false;
            } else if (line.startsWith('Giải thích nghĩa tiếng Việt:') || line.startsWith('Giải thích:')) {
                vocab.explanation = line.split(':').slice(1).join(':').trim();
                isExampleSection = false;
            } else if (line.startsWith('Ví dụ:')) {
                isExampleSection = true;
                const afterColon = line.split(':').slice(1).join(':').trim();
                if (afterColon) {
                    vocab.examples.push(afterColon);
                }
            } else if (isExampleSection && line.trim()) {
                vocab.examples.push(line.trim());
            }
        }

        if (vocab.term) {
            results.push(vocab);
        }
    }

    return results;
}
