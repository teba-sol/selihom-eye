// A freshly created exam has server "now" as its createdAt. When the backend
// safety-net resumes a previously saved draft (walk-in POST with no
// encounterId/appointmentId), createdAt is the draft's original creation time,
// which is older. This fallback catches resumed drafts even if an older API
// build doesn't return the explicit `resumed` flag yet.
const DRAFT_RESUME_AGE_MS = 30_000;

export function isResumedDraft(encounter: Record<string, any> | null | undefined): boolean {
  if (!encounter) return false;
  if (encounter.resumed === true) return true;
  if (encounter.resumed === false) return false;
  if (typeof encounter.createdAt === 'string') {
    return Date.now() - new Date(encounter.createdAt).getTime() > DRAFT_RESUME_AGE_MS;
  }
  return false;
}