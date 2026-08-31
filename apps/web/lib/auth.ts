export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("sprintly_token") || localStorage.getItem("sprintly_token");
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("sprintly_token", token);
  localStorage.setItem("sprintly_token", token);
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("sprintly_token");
  localStorage.removeItem("sprintly_token");
}

