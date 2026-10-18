import { API_MOCKS } from "./site";

// Makes it obvious that nothing on screen comes from the real backend.
export function MockModeBanner() {
  if (!API_MOCKS) return null;

  return (
    <div
      role="status"
      className="bg-primary text-primary-foreground px-4 py-1 text-center text-xs font-medium"
    >
      Demo mode: the backend is mocked in your browser. Log in with any username and password.
    </div>
  );
}
