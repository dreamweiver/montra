import { describe, it, expect, vi, beforeEach } from "vitest";

// =============================================================================
// Mocks
// =============================================================================
const { mockSql, mockGetAuthUser, mockRevalidatePath } = vi.hoisted(() => ({
  mockSql: vi.fn(),
  mockGetAuthUser: vi.fn(),
  mockRevalidatePath: vi.fn(),
}));

vi.mock("@/db/neon", () => ({ sql: mockSql }));
vi.mock("next/cache", () => ({ revalidatePath: mockRevalidatePath }));
vi.mock("@/actions/auth", () => ({ getAuthUser: mockGetAuthUser }));

import { getUserSettings, updateUserSettings } from "@/actions/settings";

// =============================================================================
// Tests
// =============================================================================
describe("Settings Server Actions", () => {
  const mockUser = { id: "user-123" };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuthUser.mockResolvedValue(mockUser);
  });

  // ---------------------------------------------------------------------------
  // getUserSettings
  // ---------------------------------------------------------------------------
  describe("getUserSettings", () => {
    it("should return error if not authenticated", async () => {
      mockGetAuthUser.mockResolvedValueOnce(null);
      const result = await getUserSettings();
      expect(result).toEqual({ success: false, error: "You must be logged in" });
    });

    it("should return defaults if no settings row exists", async () => {
      mockSql.mockResolvedValueOnce([]);
      const result = await getUserSettings();
      expect(result.success).toBe(true);
      expect(result.data?.default_currency).toBe("INR");
      expect(result.data?.date_format).toBe("dd/MM/yyyy");
      expect(result.data?.user_id).toBe("user-123");
    });

    it("should return saved settings", async () => {
      const settings = {
        id: 1,
        user_id: "user-123",
        default_currency: "USD",
        date_format: "MM/dd/yyyy",
      };
      mockSql.mockResolvedValueOnce([settings]);
      const result = await getUserSettings();
      expect(result.success).toBe(true);
      expect(result.data).toEqual(settings);
    });

    it("should handle DB error gracefully", async () => {
      mockSql.mockRejectedValueOnce(new Error("Connection failed"));
      const result = await getUserSettings();
      expect(result.success).toBe(false);
      expect(result.error).toBe("Connection failed");
    });
  });

  // ---------------------------------------------------------------------------
  // updateUserSettings
  // ---------------------------------------------------------------------------
  describe("updateUserSettings", () => {
    it("should return error if not authenticated", async () => {
      mockGetAuthUser.mockResolvedValueOnce(null);
      const formData = new FormData();
      formData.set("default_currency", "USD");
      formData.set("date_format", "MM/dd/yyyy");
      const result = await updateUserSettings(formData);
      expect(result).toEqual({ success: false, error: "You must be logged in" });
    });

    it("should update settings successfully", async () => {
      mockSql.mockResolvedValueOnce([]);
      const formData = new FormData();
      formData.set("default_currency", "EUR");
      formData.set("date_format", "yyyy-MM-dd");
      const result = await updateUserSettings(formData);
      expect(result).toEqual({ success: true });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/settings");
    });

    it("should handle DB error gracefully", async () => {
      mockSql.mockRejectedValueOnce(new Error("Upsert failed"));
      const formData = new FormData();
      formData.set("default_currency", "USD");
      formData.set("date_format", "dd/MM/yyyy");
      const result = await updateUserSettings(formData);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Upsert failed");
    });
  });
});
