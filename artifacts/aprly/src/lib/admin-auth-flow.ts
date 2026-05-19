const CHALLENGE_KEY = "adminChallengeToken";
const EMAIL_KEY = "adminChallengeEmail";

export function saveAdminChallenge(token: string, email: string): void {
  sessionStorage.setItem(CHALLENGE_KEY, token);
  sessionStorage.setItem(EMAIL_KEY, email);
}

export function readAdminChallenge(): { token: string; email: string } | null {
  const token = sessionStorage.getItem(CHALLENGE_KEY);
  const email = sessionStorage.getItem(EMAIL_KEY);
  if (!token || !email) return null;
  return { token, email };
}

export function clearAdminChallenge(): void {
  sessionStorage.removeItem(CHALLENGE_KEY);
  sessionStorage.removeItem(EMAIL_KEY);
}
