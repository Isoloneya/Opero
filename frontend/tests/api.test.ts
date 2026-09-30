import { afterEach, describe, expect, it, vi } from "vitest";

import { login } from "@/lib/api";

describe("API client", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends login data to the API", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: "test-token",
          token_type: "bearer",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    const response = await login("admin@example.com", "password123");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "admin@example.com",
          password: "password123",
        }),
      },
    );

    expect(response.access_token).toBe("test-token");
  });

  it("returns the API error message", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          detail: "Невірний email або пароль",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    await expect(login("admin@example.com", "incorrect-password")).rejects.toThrow(
      "Невірний email або пароль",
    );
  });
});