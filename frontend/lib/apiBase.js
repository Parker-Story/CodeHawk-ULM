export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

// use environment variable for API base URL, with a fallback to localhost for development
// if variable is not set, it will default to "http://localhost:8080"