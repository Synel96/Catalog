// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { useMockBackend } from "@/src/test/mock-server";
import { OverlordSearch } from "./OverlordSearch";

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }));
vi.mock("vike/client/router", () => ({ navigate }));

describe("OverlordSearch", () => {
  useMockBackend();

  it("searches all overlords by slave name and opens one with the keyboard", async () => {
    render(<OverlordSearch />);
    await userEvent.type(screen.getByRole("combobox"), "sabrina");

    const options = await screen.findAllByRole("option", {}, { timeout: 2000 });
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent("Salem");
    expect(options[1]).toHaveTextContent("Luna");
    expect(options[1]).toHaveTextContent("Slave: sabrina");

    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(navigate).toHaveBeenCalledWith("/overlord?id=7");
  });

  it("says so when nothing matches", async () => {
    render(<OverlordSearch />);
    await userEvent.type(screen.getByRole("combobox"), "doge");
    expect(await screen.findByText("No results", {}, { timeout: 2000 })).toBeInTheDocument();
  });
});
