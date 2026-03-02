
export interface Word {
  term: string;
  definition: string;
  translation: string;
  example?: string;
  category: string;
  partOfSpeech?: string; // n, v, adj, adv...
}

// Reading vocabulary entry - từ vựng từ bài reading
export interface ReadingVocab {
  id?: string;
  term: string;           // từ gốc: testify
  meaning: string;        // nghĩa tiếng Việt ngắn gọn: chứng tỏ
  relatedStructure: string; // cấu trúc liên quan: testify to something
  explanation: string;    // giải thích nghĩa chi tiết
  examples: string[];     // danh sách ví dụ
  source?: string;        // nguồn bài reading (tùy chọn)
  createdAt: number;      // timestamp
  tags?: string[];        // tags tùy chọn
}

export enum AppState {
  LANDING = 'LANDING',
  LEARNING = 'LEARNING',
  FLASHCARDS = 'FLASHCARDS',
  READING_VOCAB = 'READING_VOCAB',
  READING_FLASHCARDS = 'READING_FLASHCARDS'
}
