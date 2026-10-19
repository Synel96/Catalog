// @vitest-environment jsdom
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { db } from "@/src/mocks/db";
import { useNotificationsStore } from "@/src/store/useNotificationsStore";
import { useMockBackend } from "@/src/test/mock-server";
import type { Overlord } from "@/src/types/api";
import { NotificationBell } from "./NotificationBell";

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }));
vi.mock("vike/client/router", () => ({ navigate }));

const cat = (id: number, name: string): Overlord => ({
  id,
  name,
  avatar: null,
  bio: "",
  breed: "",
  slave: 1,
});
const mirci = cat(1, "Mirci");
const cirmi = cat(2, "Cirmi");

// The seed has 3 unread notifications for Mirci and 1 for Cirmi.
describe("NotificationBell", () => {
  useMockBackend();

  const bell = () => screen.getByRole("button", { name: /^Notifications/ });

  it("shows only the unread count of the overlord on the Street", async () => {
    useNotificationsStore.getState().clear();
    const { rerender } = render(<NotificationBell overlord={mirci} />);
    await vi.waitFor(() => expect(bell()).toHaveAccessibleName("Notifications (3 unread)"));

    rerender(<NotificationBell overlord={cirmi} />);
    await vi.waitFor(() => expect(bell()).toHaveAccessibleName("Notifications (1 unread)"));
    await userEvent.click(bell());
    expect(screen.getByText("For Cirmi")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Duchess commented/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /A sunbeam\? In THIS economy/ })).toBeNull();
  });

  it("opens a notification: marks it read and follows its link", async () => {
    render(<NotificationBell overlord={mirci} />);
    await vi.waitFor(() => expect(bell()).toHaveAccessibleName("Notifications (3 unread)"));

    await userEvent.click(bell());
    await userEvent.click(screen.getByRole("button", { name: /A sunbeam\? In THIS economy/ }));

    expect(navigate).toHaveBeenCalledWith("/overlord?id=1");
    expect(bell()).toHaveAccessibleName("Notifications (2 unread)");
    await vi.waitFor(() => expect(db.notifications.find((n) => n.id === 1)?.is_read).toBe(true));
  });

  it("marks everything of this overlord read, and only that", async () => {
    render(<NotificationBell overlord={mirci} />);
    await vi.waitFor(() => expect(bell()).toHaveAccessibleName("Notifications (3 unread)"));

    await userEvent.click(bell());
    await userEvent.click(screen.getByRole("button", { name: /Mark all read/ }));

    expect(bell()).toHaveAccessibleName("Notifications");
    const of = (overlord: number) => db.notifications.filter((n) => n.overlord === overlord);
    await vi.waitFor(() => expect(of(1).every((n) => n.is_read)).toBe(true));
    expect(of(2).some((n) => !n.is_read)).toBe(true);
  });

  it("ignores a late answer for a cat that has gone home", async () => {
    const store = useNotificationsStore.getState();
    const pending = store.fetch(1);
    act(() => useNotificationsStore.getState().clear());
    await pending;
    expect(useNotificationsStore.getState().notifications).toEqual([]);
  });
});
