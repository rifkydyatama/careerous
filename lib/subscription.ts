

export type InstitutionLike = {
  subscriptionActive: boolean;
  subscriptionExpiresAt: Date | string | null;
} | null;


export function isInstitutionSubscribed(institution: InstitutionLike): boolean {
  if (!institution?.subscriptionActive) return false;
  if (!institution.subscriptionExpiresAt) return true;
  return new Date(institution.subscriptionExpiresAt).getTime() > Date.now();
}


export function isPremiumEffective(
  plan: string | null | undefined,
  institution: InstitutionLike
): boolean {
  return plan === "PREMIUM" || isInstitutionSubscribed(institution);
}


export type PremiumSource = "NONE" | "PERSONAL" | "INSTITUTION";

export function premiumSource(
  plan: string | null | undefined,
  institution: InstitutionLike
): PremiumSource {
  if (plan === "PREMIUM") return "PERSONAL";
  if (isInstitutionSubscribed(institution)) return "INSTITUTION";
  return "NONE";
}
