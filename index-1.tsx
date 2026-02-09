// Re-export all vocabulary data
export { LITERATURE_VOCABULARY } from './literature';
export { URBAN_LIFE_VOCABULARY } from './urban-life';
export { CLIMATE_CHANGE_VOCABULARY } from './climate-change';
export { CULTURE_VOCABULARY } from './culture';
export { ECONOMY_VOCABULARY } from './economy';
export { NUTRITION_VOCABULARY } from './nutrition';
export { GLOBAL_ISSUES_VOCABULARY } from './global-issues';
export { LEISURE_VOCABULARY } from './leisure';
export { TECHNOLOGY_VOCABULARY } from './technology';
export { LIFESTYLE_VOCABULARY } from './lifestyle';
export { MIGRATION_VOCABULARY } from './migration';
export { PERSONALITY_VOCABULARY } from './personality';
export { SCIENCE_VOCABULARY } from './science';
export { SPACE_VOCABULARY } from './space';

// Import all vocabularies for combined export
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

import { Word } from '../types';

// Combined vocabulary array with all words
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

// Categories list
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

// Utility function to get words by category
export function getWordsByCategory(category: Category): Word[] {
    if (category === "All") {
        return C1_VOCABULARY;
    }
    return C1_VOCABULARY.filter(word => word.category === category);
}

// Utility function to get word count by category
export function getWordCountByCategory(): Record<string, number> {
    const counts: Record<string, number> = { All: C1_VOCABULARY.length };

    CATEGORIES.forEach(category => {
        if (category !== "All") {
            counts[category] = C1_VOCABULARY.filter(w => w.category === category).length;
        }
    });

    return counts;
}

// Get random words
export function getRandomWords(count: number, category?: Category): Word[] {
    const words = category && category !== "All"
        ? getWordsByCategory(category)
        : C1_VOCABULARY;

    const shuffled = [...words].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Search words by term or translation
export function searchWords(query: string): Word[] {
    const lowerQuery = query.toLowerCase();
    return C1_VOCABULARY.filter(word =>
        word.term.toLowerCase().includes(lowerQuery) ||
        word.translation.toLowerCase().includes(lowerQuery) ||
        word.definition.toLowerCase().includes(lowerQuery)
    );
}
