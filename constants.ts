
import { Word } from './types';
import { LITERATURE_VOCABULARY } from './literature';
import { URBAN_LIFE_VOCABULARY } from './urban-life';
import { CLIMATE_CHANGE_VOCABULARY } from './climate-change';
import { CULTURE_VOCABULARY } from './culture';
import { ECONOMY_VOCABULARY } from './economy';
import { NUTRITION_VOCABULARY } from './nutrition';
import { GLOBAL_ISSUES_VOCABULARY } from './global-issues';
import { LEISURE_VOCABULARY } from './leisure';
import { TECHNOLOGY_VOCABULARY } from './technology';
import { LIFESTYLE_VOCABULARY } from './lifestyle';
import { MIGRATION_VOCABULARY } from './migration';
import { PERSONALITY_VOCABULARY } from './personality';
import { SCIENCE_VOCABULARY } from './science';
import { SPACE_VOCABULARY } from './space';

// Tổng hợp tất cả từ vựng C1
export const C1_VOCABULARY: Word[] = [
    ...LITERATURE_VOCABULARY,
    ...URBAN_LIFE_VOCABULARY,
    ...CLIMATE_CHANGE_VOCABULARY,
    ...CULTURE_VOCABULARY,
    ...ECONOMY_VOCABULARY,
    ...NUTRITION_VOCABULARY,
    ...GLOBAL_ISSUES_VOCABULARY,
    ...LEISURE_VOCABULARY,
    ...TECHNOLOGY_VOCABULARY,
    ...LIFESTYLE_VOCABULARY,
    ...MIGRATION_VOCABULARY,
    ...PERSONALITY_VOCABULARY,
    ...SCIENCE_VOCABULARY,
    ...SPACE_VOCABULARY,
];

export const CATEGORIES = [
    "All",
    "Literature",
    "Urban Life",
    "Climate Change",
    "Culture",
    "Economy",
    "Nutrition",
    "Global Issues",
    "Leisure",
    "Technology",
    "Lifestyle",
    "Migration",
    "Personality",
    "Science",
    "Space"
] as const;

export type Category = typeof CATEGORIES[number];

/**
 * Lấy từ vựng theo danh mục
 */
export function getWordsByCategory(category: string): Word[] {
    if (category === "All") return C1_VOCABULARY;
    return C1_VOCABULARY.filter(word => word.category === category);
}

/**
 * Lấy danh sách số lượng từ mỗi danh mục
 */
export function getWordCountByCategory(): Record<string, number> {
    const counts: Record<string, number> = { All: C1_VOCABULARY.length };
    CATEGORIES.forEach(cat => {
        if (cat !== "All") {
            counts[cat] = C1_VOCABULARY.filter(w => w.category === cat).length;
        }
    });
    return counts;
}

/**
 * Lấy n từ ngẫu nhiên (có thể lọc theo category)
 */
export function getRandomWords(count: number, category: string = "All"): Word[] {
    const pool = category === "All" ? C1_VOCABULARY : getWordsByCategory(category);
    return [...pool].sort(() => 0.5 - Math.random()).slice(0, count);
}
