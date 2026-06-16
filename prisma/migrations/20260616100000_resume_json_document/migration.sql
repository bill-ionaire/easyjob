-- Resume JSON Document migration
-- Removes Profile, File, CoverLetter and child resume tables.
-- Resume becomes a self-contained JSON document owned directly by User.

-- Step 1: Add userId to Resume (backfill from Profile, then remove default)
ALTER TABLE "Resume" ADD COLUMN "userId" TEXT NOT NULL DEFAULT '';
UPDATE "Resume" r SET "userId" = p."userId" FROM "Profile" p WHERE r."profileId" = p.id;
ALTER TABLE "Resume" ALTER COLUMN "userId" DROP DEFAULT;

-- Step 2: Add summary + JSON content columns to Resume
ALTER TABLE "Resume" ADD COLUMN "summary" TEXT;
ALTER TABLE "Resume" ADD COLUMN "contactInfo" JSONB;
ALTER TABLE "Resume" ADD COLUMN "experiences" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "Resume" ADD COLUMN "skills" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "Resume" ADD COLUMN "educations" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "Resume" ADD COLUMN "certifications" JSONB NOT NULL DEFAULT '[]';

-- Step 3: Backfill contactInfo JSON from ContactInfo table
UPDATE "Resume" r
SET "contactInfo" = jsonb_build_object(
  'firstName', ci."firstName",
  'lastName', ci."lastName",
  'headline', ci."headline",
  'email', ci."email",
  'phone', ci."phone",
  'address', ci."address"
)
FROM "ContactInfo" ci
WHERE ci."resumeId" = r.id;

-- Step 4: Backfill experiences JSON via ResumeSection join
UPDATE "Resume" r
SET "experiences" = COALESCE((
  SELECT jsonb_agg(jsonb_build_object(
    'id', we.id,
    'company', c.label,
    'jobTitle', jt.label,
    'location', l.label,
    'startDate', we."startDate",
    'endDate', we."endDate",
    'description', we.description
  ) ORDER BY we."startDate" DESC)
  FROM "WorkExperience" we
  JOIN "ResumeSection" rs ON rs.id = we."resumeSectionId"
  JOIN "Company" c ON c.id = we."companyId"
  JOIN "JobTitle" jt ON jt.id = we."jobTitleId"
  JOIN "Location" l ON l.id = we."locationId"
  WHERE rs."resumeId" = r.id
), '[]'::jsonb);

-- Step 5: Backfill educations JSON via ResumeSection join
UPDATE "Resume" r
SET "educations" = COALESCE((
  SELECT jsonb_agg(jsonb_build_object(
    'id', edu.id,
    'institution', edu.institution,
    'degree', edu.degree,
    'fieldOfStudy', edu."fieldOfStudy",
    'location', l.label,
    'startDate', edu."startDate",
    'endDate', edu."endDate",
    'description', edu.description
  ) ORDER BY edu."startDate" DESC)
  FROM "Education" edu
  JOIN "ResumeSection" rs ON rs.id = edu."resumeSectionId"
  JOIN "Location" l ON l.id = edu."locationId"
  WHERE rs."resumeId" = r.id
), '[]'::jsonb);

-- Step 6: Backfill certifications JSON via ResumeSection join
UPDATE "Resume" r
SET "certifications" = COALESCE((
  SELECT jsonb_agg(jsonb_build_object(
    'id', lc.id,
    'title', lc.title,
    'organization', lc.organization,
    'issueDate', lc."issueDate",
    'expirationDate', lc."expirationDate",
    'credentialUrl', lc."credentialUrl"
  ))
  FROM "LicenseOrCertification" lc
  JOIN "ResumeSection" rs ON rs.id = lc."resumeSectionId"
  WHERE rs."resumeId" = r.id
), '[]'::jsonb);

-- Step 7: Drop coverLetterId from Job
ALTER TABLE "Job" DROP CONSTRAINT IF EXISTS "Job_coverLetterId_fkey";
ALTER TABLE "Job" DROP COLUMN IF EXISTS "coverLetterId";

-- Step 8: Drop FK constraints referencing tables we are about to drop
ALTER TABLE "Resume" DROP CONSTRAINT IF EXISTS "Resume_profileId_fkey";
ALTER TABLE "Resume" DROP CONSTRAINT IF EXISTS "Resume_FileId_fkey";
ALTER TABLE "Resume" DROP CONSTRAINT IF EXISTS "Resume_jobProfileId_fkey";
ALTER TABLE "CoverLetter" DROP CONSTRAINT IF EXISTS "CoverLetter_profileId_fkey";
ALTER TABLE "ResumeSection" DROP CONSTRAINT IF EXISTS "ResumeSection_summaryId_fkey";
ALTER TABLE "ResumeSection" DROP CONSTRAINT IF EXISTS "ResumeSection_resumeId_fkey";
ALTER TABLE "ContactInfo" DROP CONSTRAINT IF EXISTS "ContactInfo_resumeId_fkey";
ALTER TABLE "WorkExperience" DROP CONSTRAINT IF EXISTS "WorkExperience_companyId_fkey";
ALTER TABLE "WorkExperience" DROP CONSTRAINT IF EXISTS "WorkExperience_jobTitleId_fkey";
ALTER TABLE "WorkExperience" DROP CONSTRAINT IF EXISTS "WorkExperience_locationId_fkey";
ALTER TABLE "WorkExperience" DROP CONSTRAINT IF EXISTS "WorkExperience_resumeSectionId_fkey";
ALTER TABLE "Education" DROP CONSTRAINT IF EXISTS "Education_locationId_fkey";
ALTER TABLE "Education" DROP CONSTRAINT IF EXISTS "Education_resumeSectionId_fkey";
ALTER TABLE "LicenseOrCertification" DROP CONSTRAINT IF EXISTS "LicenseOrCertification_resumeSectionId_fkey";
ALTER TABLE "OtherSection" DROP CONSTRAINT IF EXISTS "OtherSection_resumeSectionId_fkey";
ALTER TABLE "Profile" DROP CONSTRAINT IF EXISTS "Profile_userId_fkey";

-- Step 9: Drop old child tables and lookup tables
DROP TABLE IF EXISTS "OtherSection";
DROP TABLE IF EXISTS "LicenseOrCertification";
DROP TABLE IF EXISTS "Education";
DROP TABLE IF EXISTS "WorkExperience";
DROP TABLE IF EXISTS "ContactInfo";
DROP TABLE IF EXISTS "Summary";
DROP TABLE IF EXISTS "ResumeSection";
DROP TABLE IF EXISTS "CoverLetter";
DROP TABLE IF EXISTS "File";
DROP TABLE IF EXISTS "SkillCategory";
DROP TABLE IF EXISTS "Profile";

-- Step 10: Drop old columns from Resume
DROP INDEX IF EXISTS "Resume_FileId_key";
ALTER TABLE "Resume" DROP COLUMN IF EXISTS "profileId";
ALTER TABLE "Resume" DROP COLUMN IF EXISTS "cvData";
ALTER TABLE "Resume" DROP COLUMN IF EXISTS "FileId";

-- Step 11: Add FK for Resume.userId → User.id + re-add jobProfileId FK
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_jobProfileId_fkey" FOREIGN KEY ("jobProfileId") REFERENCES "JobProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 12: Add index
CREATE INDEX "Resume_userId_idx" ON "Resume"("userId");
