export const AUTH_SOCIAL_PROVIDERS = [
  {
    id: "google",
    name: "Google",
    icon: "google" as const,
  },
] as const;

export type SocialProviderId = (typeof AUTH_SOCIAL_PROVIDERS)[number]["id"];
