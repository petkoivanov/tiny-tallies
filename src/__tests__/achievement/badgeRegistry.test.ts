import {
  BADGES,
  getBadgeById,
  getBadgesByCategory,
} from '@/services/achievement/badgeRegistry';
import { SKILLS } from '@/services/mathEngine/skills';

describe('badgeRegistry', () => {
  describe('BADGES array integrity', () => {
    it('has all unique badge IDs (no duplicates)', () => {
      const ids = BADGES.map((b) => b.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('every skill-mastery badge references a skillId that exists in SKILLS', () => {
      const skillIds = new Set(SKILLS.map((s) => s.id));
      const skillMasteryBadges = BADGES.filter(
        (b) => b.condition.type === 'skill-mastery',
      );
      for (const badge of skillMasteryBadges) {
        if (badge.condition.type === 'skill-mastery') {
          expect(skillIds.has(badge.condition.skillId)).toBe(true);
        }
      }
    });

    it('contains exactly 14 skill-mastery badges (one per skill)', () => {
      const skillMasteryBadges = BADGES.filter(
        (b) => b.condition.type === 'skill-mastery',
      );
      expect(skillMasteryBadges).toHaveLength(14);
    });

    it('contains category-mastery badges for addition and subtraction', () => {
      const categoryBadges = BADGES.filter(
        (b) => b.condition.type === 'category-mastery',
      );
      const operations = categoryBadges.map((b) => {
        if (b.condition.type === 'category-mastery') return b.condition.operation;
        return undefined;
      });
      expect(operations).toContain('addition');
      expect(operations).toContain('subtraction');
      expect(categoryBadges).toHaveLength(2);
    });

    it('contains grade-mastery badges for grades 1, 2, and 3', () => {
      const gradeBadges = BADGES.filter(
        (b) => b.condition.type === 'grade-mastery',
      );
      const grades = gradeBadges.map((b) => {
        if (b.condition.type === 'grade-mastery') return b.condition.grade;
        return undefined;
      });
      expect(grades).toContain(1);
      expect(grades).toContain(2);
      expect(grades).toContain(3);
      expect(gradeBadges).toHaveLength(3);
    });

    it('contains tiered behavior badges for streak milestones (bronze/silver/gold)', () => {
      const streakBadges = BADGES.filter(
        (b) => b.condition.type === 'streak-milestone',
      );
      const tiers = streakBadges.map((b) => b.tier);
      expect(tiers).toContain('bronze');
      expect(tiers).toContain('silver');
      expect(tiers).toContain('gold');
      expect(streakBadges).toHaveLength(3);
    });

    it('contains tiered behavior badges for session count milestones (bronze/silver/gold)', () => {
      const sessionBadges = BADGES.filter(
        (b) => b.condition.type === 'sessions-milestone',
      );
      const tiers = sessionBadges.map((b) => b.tier);
      expect(tiers).toContain('bronze');
      expect(tiers).toContain('silver');
      expect(tiers).toContain('gold');
      expect(sessionBadges).toHaveLength(3);
    });

    it('contains tiered behavior badges for remediation victories (bronze/silver)', () => {
      const remediationBadges = BADGES.filter(
        (b) => b.condition.type === 'remediation-victory',
      );
      const tiers = remediationBadges.map((b) => b.tier);
      expect(tiers).toContain('bronze');
      expect(tiers).toContain('silver');
      expect(remediationBadges).toHaveLength(2);
    });

    it('every badge has all required fields', () => {
      for (const badge of BADGES) {
        expect(badge.id).toBeDefined();
        expect(typeof badge.id).toBe('string');
        expect(badge.id.length).toBeGreaterThan(0);

        expect(badge.name).toBeDefined();
        expect(typeof badge.name).toBe('string');
        expect(badge.name.length).toBeGreaterThan(0);

        expect(badge.description).toBeDefined();
        expect(typeof badge.description).toBe('string');
        expect(badge.description.length).toBeGreaterThan(0);

        expect(badge.category).toBeDefined();
        expect(['mastery', 'behavior']).toContain(badge.category);

        expect(badge.tier).toBeDefined();
        expect(['bronze', 'silver', 'gold']).toContain(badge.tier);

        expect(badge.condition).toBeDefined();
        expect(badge.condition.type).toBeDefined();
      }
    });

    it('has exactly 31 total badges', () => {
      expect(BADGES).toHaveLength(31);
    });
  });

  describe('getBadgeById', () => {
    it('returns the correct badge for a valid ID', () => {
      const firstBadge = BADGES[0];
      if (firstBadge) {
        const result = getBadgeById(firstBadge.id);
        expect(result).toBe(firstBadge);
      }
    });

    it('returns undefined for an invalid ID', () => {
      const result = getBadgeById('nonexistent.badge.id');
      expect(result).toBeUndefined();
    });
  });

  describe('getBadgesByCategory', () => {
    it('returns only mastery badges when filtering by mastery', () => {
      const masteryBadges = getBadgesByCategory('mastery');
      expect(masteryBadges.length).toBeGreaterThan(0);
      for (const badge of masteryBadges) {
        expect(badge.category).toBe('mastery');
      }
    });

    it('returns only behavior badges when filtering by behavior', () => {
      const behaviorBadges = getBadgesByCategory('behavior');
      expect(behaviorBadges.length).toBeGreaterThan(0);
      for (const badge of behaviorBadges) {
        expect(badge.category).toBe('behavior');
      }
    });

    it('mastery + behavior counts equal total badge count', () => {
      const mastery = getBadgesByCategory('mastery');
      const behavior = getBadgesByCategory('behavior');
      expect(mastery.length + behavior.length).toBe(BADGES.length);
    });
  });
});
