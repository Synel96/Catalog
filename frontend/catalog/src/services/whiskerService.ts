import { api, toApiError } from "./api";

// A whisker is a follow: `from` (one of the user's overlords) whiskers `to`.

export async function createWhisker(fromId: number, toId: number): Promise<void> {
  try {
    await api.post("feed/whiskers/", { from_overlord: fromId, to_overlord: toId });
  } catch (error) {
    throw toApiError(error, "Failed to whisker overlord.");
  }
}

export async function deleteWhisker(fromId: number, toId: number): Promise<void> {
  try {
    await api.delete("feed/whiskers/remove/", { params: { from: fromId, to: toId } });
  } catch (error) {
    throw toApiError(error, "Failed to unwhisker overlord.");
  }
}

export async function getWhiskerStatus(fromId: number, toId: number): Promise<boolean> {
  try {
    const response = await api.get<{ exists: boolean }>("feed/whiskers/status/", {
      params: { from: fromId, to: toId },
    });
    return response.data.exists;
  } catch (error) {
    throw toApiError(error, "Failed to fetch whisker status.");
  }
}
