export function translateProfessionalJob(
  job: null | string | undefined,
  tProfessional: (key: string) => string
): string {
  if (!job) {
    return '';
  }
  try {
    const translationKey = `jobs.${job}`;
    const translated = tProfessional(translationKey);
    if (
      translated === translationKey ||
      translated === `professional.${translationKey}`
    ) {
      return job;
    }
    return translated;
  } catch {
    return job;
  }
}
