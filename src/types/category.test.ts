import { describe, it, expect } from "vitest";
import {
  DEFAULT_CATEGORY_ICONS,
  DEFAULT_CATEGORY_COLORS,
} from "@/types/category";

describe("Category Type Constants", () => {
  describe("DEFAULT_CATEGORY_ICONS", () => {
    it("should have icons for common expense categories", () => {
      expect(DEFAULT_CATEGORY_ICONS.Food).toBe("🍔");
      expect(DEFAULT_CATEGORY_ICONS.Transport).toBe("🚗");
      expect(DEFAULT_CATEGORY_ICONS.Shopping).toBe("🛍️");
      expect(DEFAULT_CATEGORY_ICONS.Rent).toBe("🏠");
      expect(DEFAULT_CATEGORY_ICONS.Entertainment).toBe("🎬");
      expect(DEFAULT_CATEGORY_ICONS.Bills).toBe("📄");
      expect(DEFAULT_CATEGORY_ICONS.Healthcare).toBe("🏥");
    });

    it("should have icons for income categories", () => {
      expect(DEFAULT_CATEGORY_ICONS.Salary).toBe("💰");
      expect(DEFAULT_CATEGORY_ICONS.Freelance).toBe("💻");
      expect(DEFAULT_CATEGORY_ICONS.Investment).toBe("📈");
    });

    it("should have a generic Others icon", () => {
      expect(DEFAULT_CATEGORY_ICONS.Others).toBe("📦");
    });
  });

  describe("DEFAULT_CATEGORY_COLORS", () => {
    it("should have hex colors for all categories", () => {
      const keys = Object.keys(DEFAULT_CATEGORY_COLORS);
      expect(keys.length).toBeGreaterThan(0);

      for (const color of Object.values(DEFAULT_CATEGORY_COLORS)) {
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
      }
    });

    it("should have unique colors for distinct categories", () => {
      const colors = Object.values(DEFAULT_CATEGORY_COLORS);
      // Others might share a color, so we check most are unique
      const unique = new Set(colors);
      expect(unique.size).toBeGreaterThanOrEqual(colors.length - 1);
    });

    it("should have matching keys between icons and colors", () => {
      const iconKeys = Object.keys(DEFAULT_CATEGORY_ICONS);
      const colorKeys = Object.keys(DEFAULT_CATEGORY_COLORS);
      expect(iconKeys.sort()).toEqual(colorKeys.sort());
    });
  });
});
