import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import RegisterPage from "@/app/register/page";
import { register } from "@/lib/api";

const { push } = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
}));

vi.mock("@/lib/api", () => ({
  register: vi.fn(),
}));

describe("RegisterPage", () => {
  beforeEach(() => {
    localStorage.clear();
    push.mockClear();
    vi.mocked(register).mockReset();
  });

  it("registers a demo administrator and opens the dashboard", async () => {
    vi.mocked(register).mockResolvedValue({
      access_token: "registered-token",
      token_type: "bearer",
    });

    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText("Повне ім’я"), {
      target: {
        value: "Demo Admin",
      },
    });

    fireEvent.change(screen.getByLabelText("Email"), {
      target: {
        value: "demo@example.com",
      },
    });

    fireEvent.change(screen.getByLabelText("Пароль"), {
      target: {
        value: "password123",
      },
    });

    fireEvent.change(screen.getByLabelText("Роль для демо"), {
      target: {
        value: "admin",
      },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Створити й увійти" }),
    );

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith({
        full_name: "Demo Admin",
        email: "demo@example.com",
        password: "password123",
        role: "admin",
      });
    });

    expect(localStorage.getItem("opero_access_token")).toBe("registered-token");
    expect(push).toHaveBeenCalledWith("/dashboard");
  });
});