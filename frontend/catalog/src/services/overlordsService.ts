import { api, toApiError } from "./api";
import type { Overlord } from "@/src/types/api";

// The list endpoint may be paginated or wrapped depending on DRF settings.
function extractList(data: unknown): Overlord[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (Array.isArray(record.overlords)) return record.overlords;
    if (Array.isArray(record.results)) return record.results;
    const firstArray = Object.values(record).find(Array.isArray);
    if (firstArray) return firstArray;
  }
  console.warn("Unexpected overlords response:", data);
  return [];
}

export async function getMyOverlords(): Promise<Overlord[]> {
  try {
    const response = await api.get("profiles/overlords/");
    return extractList(response.data);
  } catch (error) {
    throw toApiError(error, "Failed to fetch overlords.");
  }
}

export async function createOverlord(formData: FormData): Promise<Overlord> {
  try {
    const response = await api.post<Overlord>("profiles/overlords/", formData);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to create overlord.");
  }
}

export async function updateOverlord(id: number, formData: FormData): Promise<Overlord> {
  try {
    const response = await api.patch<Overlord>(`profiles/overlords/${id}/`, formData);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to update overlord.");
  }
}

export async function deleteOverlord(id: number): Promise<void> {
  try {
    await api.delete(`profiles/overlords/${id}/`);
  } catch (error) {
    throw toApiError(error, "Failed to delete overlord.");
  }
}
