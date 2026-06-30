export type SubscriptionTier = "free" | "pro" | "team";

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  preferredLanguage: "tr" | "en";
  subscriptionTier: SubscriptionTier;
  createdAt: string;
}
