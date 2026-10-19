// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useMockBackend } from "@/src/test/mock-server";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }));
vi.mock("vike/client/router", () => ({ navigate }));

beforeEach(() => navigate.mockReset());

describe("LoginForm", () => {
  useMockBackend({ loggedIn: false });

  it("logs in, stores the user and goes to My Slave", async () => {
    useAuthStore.setState({ user: null, isAuthenticated: false });
    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText(/username/i), "mirci_fan");
    await userEvent.type(screen.getByLabelText(/password/i), "tuna");
    await userEvent.click(screen.getByRole("button", { name: "Login" }));

    await vi.waitFor(() => expect(navigate).toHaveBeenCalledWith("/my-slave"));
    expect(useAuthStore.getState()).toMatchObject({
      isAuthenticated: true,
      user: { username: "mirci_fan" },
    });
  });

  it("submits what was typed before hydration (uncontrolled inputs)", async () => {
    render(<LoginForm />);
    // Simulates text that landed in the prerendered inputs before React
    // took over: set straight on the DOM, no React change events.
    (screen.getByLabelText(/username/i) as HTMLInputElement).value = "early_bird";
    (screen.getByLabelText(/password/i) as HTMLInputElement).value = "x";
    await userEvent.click(screen.getByRole("button", { name: "Login" }));

    await vi.waitFor(() => expect(navigate).toHaveBeenCalled());
    expect(useAuthStore.getState().user?.username).toBe("early_bird");
  });
});

describe("RegisterForm", () => {
  useMockBackend({ loggedIn: false });

  it("stops on mismatched passwords without calling the API", async () => {
    render(<RegisterForm />);
    await userEvent.type(screen.getByLabelText(/slavename/i), "newbie");
    await userEvent.type(screen.getByLabelText(/email/i), "n@example.com");
    await userEvent.type(screen.getByLabelText(/^password/i), "one");
    await userEvent.type(screen.getByLabelText(/confirm password/i), "two");
    await userEvent.click(screen.getByRole("button", { name: "Register" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Passwords do not match.");
    expect(navigate).not.toHaveBeenCalled();
  });
});
