// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "@/src/i18n";
import { CameraDialog } from "./CameraCapture";

const stopTrack = vi.fn();
const fakeStream = { getTracks: () => [{ stop: stopTrack }] } as unknown as MediaStream;

function mockCamera(getUserMedia: () => Promise<MediaStream>) {
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: {
      getUserMedia: vi.fn(getUserMedia),
      enumerateDevices: vi.fn(async () => [{ kind: "videoinput" }]),
    },
  });
}

const renderDialog = () => {
  const onCapture = vi.fn();
  const onChooseFile = vi.fn();
  render(
    <CameraDialog open onOpenChange={vi.fn()} onCapture={onCapture} onChooseFile={onChooseFile} />
  );
  return { onCapture, onChooseFile };
};

describe("CameraDialog", () => {
  beforeEach(() => {
    stopTrack.mockClear();
    URL.createObjectURL = vi.fn(() => "blob:photo");
    URL.revokeObjectURL = vi.fn();
    // jsdom has no media or canvas: a 640×480 frame that encodes to a JPEG.
    Object.defineProperty(HTMLVideoElement.prototype, "videoWidth", {
      configurable: true,
      get: () => 640,
    });
    Object.defineProperty(HTMLVideoElement.prototype, "videoHeight", {
      configurable: true,
      get: () => 480,
    });
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((done) =>
      done(new Blob(["jpeg"], { type: "image/jpeg" }))
    );
  });

  afterEach(() => vi.restoreAllMocks());

  it("takes a photo, allows a retake, and hands over the one used", async () => {
    mockCamera(async () => fakeStream);
    const { onCapture } = renderDialog();

    const shutter = await screen.findByRole("button", { name: "Take the photo" });
    await waitFor(() => expect(shutter).toBeEnabled());
    await userEvent.click(shutter);
    expect(screen.getByRole("img", { name: "The photo you took" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Retake" }));
    await userEvent.click(screen.getByRole("button", { name: "Take the photo" }));
    await userEvent.click(screen.getByRole("button", { name: "Use this photo" }));

    expect(onCapture).toHaveBeenCalledOnce();
    const photo = onCapture.mock.calls[0]?.[0] as File;
    expect(photo.type).toBe("image/jpeg");
    expect(photo.name).toMatch(/^photo-\d+\.jpg$/);
    // The camera goes off once the photo is used.
    expect(stopTrack).toHaveBeenCalled();
  });

  it("explains a blocked camera and offers a file instead", async () => {
    mockCamera(async () => {
      throw new DOMException("denied", "NotAllowedError");
    });
    const { onChooseFile } = renderDialog();

    expect(await screen.findByRole("alert")).toHaveTextContent("Camera access is blocked");
    await userEvent.click(screen.getByRole("button", { name: "Choose a file instead" }));
    expect(onChooseFile).toHaveBeenCalledOnce();
  });
});
