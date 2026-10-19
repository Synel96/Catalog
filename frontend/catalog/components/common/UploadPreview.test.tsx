// @vitest-environment jsdom
import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import "@/src/i18n";
import { resetUploadProgress, useUploadStore } from "@/src/store/useUploadStore";
import { UploadPreview } from "./UploadPreview";

const file = new File(["meow"], "dot.png", { type: "image/png" });

describe("UploadPreview", () => {
  beforeEach(() => {
    resetUploadProgress();
    URL.createObjectURL = vi.fn(() => "blob:dot");
    URL.revokeObjectURL = vi.fn();
  });

  it("shows the picked file without progress while idle", () => {
    render(<UploadPreview file={file} uploading={false} onRemove={vi.fn()} />);
    expect(screen.getByText("dot.png")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove image" })).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("follows the upload progress", () => {
    render(<UploadPreview file={file} uploading onRemove={vi.fn()} />);
    expect(screen.getByRole("progressbar")).not.toHaveAttribute("aria-valuenow");
    expect(screen.getByText("Uploading…")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove image" })).not.toBeInTheDocument();

    act(() => useUploadStore.getState().setProgress(0.42));
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "42");
    expect(screen.getByText("Uploading… 42%")).toBeInTheDocument();

    act(() => useUploadStore.getState().setProgress(1));
    expect(screen.getByText(/Almost there/)).toBeInTheDocument();
  });

  it("releases the preview URL", () => {
    const { unmount } = render(<UploadPreview file={file} uploading={false} />);
    unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:dot");
  });
});
