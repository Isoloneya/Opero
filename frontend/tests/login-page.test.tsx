import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import LoginPage from "@/app/login/page";
import { login } from "@/lib/api";

const { push } = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
}));

vi.mock("@/lib/api", () => ({
  login: vi.fn(),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    localStorage.clear();
    push.mockClear();
    vi.mocked(login).mockReset();
  });

  it("stores the access token and navigates to the dashboard", async () => {
    vi.mocked(login).mockResolvedValue({
      access_token: "test-token",
      token_type: "bearer",
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: {
        value: "admin@example.com",
      },
    });

    fireEvent.change(screen.getByLabelText("Пароль"), {
      target: {
        value: "password123",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "Увійти" }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith("admin@example.com", "password123");
    });

    expect(localStorage.getItem("opero_access_token")).toBe("test-token");
    expect(push).toHaveBeenCalledWith("/dashboard");
  });

  it("shows an API error", async () => {
    vi.mocked(login).mockRejectedValue(new Error("Невірний email або пароль"));

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: {
        value: "admin@example.com",
      },
    });

    fireEvent.change(screen.getByLabelText("Пароль"), {
      target: {
        value: "incorrect-password",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "Увійти" }));

    expect(
      await screen.findByText("Невірний email або пароль"),
    ).toBeInTheDocument();
  });
});