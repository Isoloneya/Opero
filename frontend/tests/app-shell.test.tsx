import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppShell } from "@/components/app-shell";

const { replace } = vi.hoisted(() => ({
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({
    replace,
  }),
}));

vi.mock("@/components/notification-panel", () => ({
  NotificationPanel: () => <button type="button">Сповіщення</button>,
}));

describe("AppShell", () => {
  beforeEach(() => {
    localStorage.clear();
    replace.mockClear();
  });

  it("removes the token and opens login after logout", () => {
    localStorage.setItem("opero_access_token", "test-token");

    render(
      <AppShell
        user={{
          id: 1,
          full_name: "Demo Administrator",
          email: "demo@example.com",
          role: "admin",
          is_active: true,
          created_at: "2026-09-30T12:00:00",
        }}
      >
        <div>Dashboard content</div>
      </AppShell>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Вийти" }));

    expect(localStorage.getItem("opero_access_token")).toBeNull();
    expect(replace).toHaveBeenCalledWith("/login");
  });
});