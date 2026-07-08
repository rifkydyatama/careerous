// Logika penentuan akses Premium efektif (paket pribadi ATAU langganan institusi).

export type InstitutionLike = {
  subscriptionActive: boolean;
  subscriptionExpiresAt: Date | string | null;
} | null;

// Apakah langganan institusi sedang aktif (dan belum kedaluwarsa)?
export function isInstitutionSubscribed(institution: InstitutionLike): boolean {
  if (!institution?.subscriptionActive) return false;
  if (!institution.subscriptionExpiresAt) return true;
  return new Date(institution.subscriptionExpiresAt).getTime() > Date.now();
}

// Akses Premium efektif: paket pribadi PREMIUM, atau institusi berlangganan.
export function isPremiumEffective(
  plan: string | null | undefined,
  institution: InstitutionLike
): boolean {
  return plan === "PREMIUM" || isInstitutionSubscribed(institution);
}

// Sumber akses Premium, untuk ditampilkan di UI.
export type PremiumSource = "NONE" | "PERSONAL" | "INSTITUTION";

export function premiumSource(
  plan: string | null | undefined,
  institution: InstitutionLike
): PremiumSource {
  if (plan === "PREMIUM") return "PERSONAL";
  if (isInstitutionSubscribed(institution)) return "INSTITUTION";
  return "NONE";
}
