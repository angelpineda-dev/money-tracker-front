import { describe, expect, it } from 'vitest';
import { HOME, PATHS, SECTION, SECTION_HOME, sectionOf } from './paths';

describe('sectionOf', () => {
    it('maps expenses URLs to the expenses section', () => {
        expect(sectionOf(PATHS.expenses.debt(3))).toBe(SECTION.EXPENSES);
        expect(sectionOf(PATHS.expenses.summary)).toBe(SECTION.EXPENSES);
    });

    it('maps investment and global URLs to investments', () => {
        expect(sectionOf(PATHS.investments.asset(1))).toBe(SECTION.INVESTMENTS);
        expect(sectionOf(PATHS.settings)).toBe(SECTION.INVESTMENTS);
    });

    it('every section home belongs to its own section', () => {
        for (const section of Object.values(SECTION)) {
            expect(sectionOf(SECTION_HOME[section])).toBe(section);
        }
        expect(HOME).toBe(SECTION_HOME[SECTION.INVESTMENTS]);
    });
});
