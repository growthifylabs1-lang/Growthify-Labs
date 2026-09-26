const messages = {
  "auth/email-already-in-use": "An account already exists for this email.",
  "auth/invalid-credential": "Invalid email or password.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/operation-not-allowed":
    "Email and password sign-in is not enabled for this Firebase project.",
  "auth/too-many-requests": "Too many attempts. Wait a little and try again.",
  "auth/user-not-found": "Invalid email or password.",
  "auth/weak-password": "Use a stronger password with at least 8 characters.",
  "auth/wrong-password": "Invalid email or password.",
  "auth/network-request-failed":
    "Network error. Check your connection and try again.",
};

export function getAuthErrorMessage(error) {
  return messages[error?.code] || "Authentication failed. Please try again.";
}
