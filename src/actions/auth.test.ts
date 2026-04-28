import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockCookies, mockGetUser } = vi.hoisted(() => ({
  mockCookies: vi.fn().mockResolvedValue({ getAll: () => [] }),
  mockGetUser: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies: mockCookies }));
vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: { getUser: () => mockGetUser() },
  }),
}));

import { getAuthUser } from "@/actions/auth";

describe("getAuthUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return user when authenticated", async () => {
    const mockUser = { id: "user-123", email: "test@example.com" };
    mockGetUser.mockResolvedValue({ data: { user: mockUser } });

    const result = await getAuthUser();
    expect(result).toEqual(mockUser);
  });

  it("should return null when not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const result = await getAuthUser();
    expect(result).toBe(null);
  });
});
