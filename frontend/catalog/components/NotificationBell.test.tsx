// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { db } from "@/src/mocks/db";
import { useNotificationsStore } from "@/src/store/useNotificationsStore";
import { useMockBackend } from "@/src/test/mock-server";
import { NotificationBell } from "./NotificationBell";

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }));
vi.mock("vike/client/router", () => ({ navigate }));

// The seed has 3 unread notifications for the user's overlords.
describe("NotificationBell", () => {
  useMockBackend();

  const bell = () => screen.getByRole("button", { name: /^Notifications/ });

  it("shows the unread count", async () => {
    useNotificationsStore.getState().clear();
    render(<NotificationBell />);
    await vi.waitFor(() => expect(bell()).toHaveAccessibleName("Notifications (3 unread)"));
  });

  it("opens a notification: marks it read and follows its link", async () => {
    render(<NotificationBell />);
    await vi.waitFor(() => expect(bell()).toHaveAccessibleName("Notifications (3 unread)"));

    await userEvent.click(bell());
    await userEvent.click(screen.getByRole("button", { name: /A sunbeam\? In THIS economy/ }));

    expect(navigate).toHaveBeenCalledWith("/overlord?id=1");
    expect(bell()).toHaveAccessibleName("Notifications (2 unread)");
    await vi.waitFor(() => expect(db.notifications.find((n) => n.id === 1)?.is_read).toBe(true));
  });

  it("marks everything read", async () => {
    render(<NotificationBell />);
    await vi.waitFor(() => expect(bell()).toHaveAccessibleName("Notifications (3 unread)"));

    await userEvent.click(bell());
    await userEvent.click(screen.getByRole("button", { name: /Mark all read/ }));

    expect(bell()).toHaveAccessibleName("Notifications");
    await vi.waitFor(() => expect(db.notifications.every((n) => n.is_read)).toBe(true));
  });
});
