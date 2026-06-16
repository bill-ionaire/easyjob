"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Loader, PanelRightClose, PanelRightOpen } from "lucide-react";
import { Resume, SkillCategory } from "@/models/profile.model";
import { Button } from "../ui/button";
import AddResumeSection, { AddResumeSectionRef } from "./AddResumeSection";
import ContactInfoCard from "./ContactInfoCard";
import SummarySectionCard from "./SummarySectionCard";
import SkillsCard from "./SkillsCard";
import ExperienceCard from "./ExperienceCard";
import EducationCard from "./EducationCard";
import CertificationCard from "./CertificationCard";
import { generateResumePdfBlob, sanitizeFilename } from "./resume-pdf/generateResumePdf";
import { toast } from "../ui/use-toast";

// ─── PDF preview ──────────────────────────────────────────────────────────────

function PdfPanel({ resume }: { resume: Resume }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const activeUrl = useRef<string | null>(null);

  useEffect(() => {
    setGenerating(true);
    generateResumePdfBlob(resume)
      .then(({ blob }) => {
        const url = URL.createObjectURL(blob);
        if (activeUrl.current) URL.revokeObjectURL(activeUrl.current);
        activeUrl.current = url;
        setBlobUrl(url);
      })
      .catch(() => {})
      .finally(() => setGenerating(false));
  // Resume title + updatedAt are enough to detect any save — avoids deep comparison
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resume.id, String(resume.updatedAt)]);

  useEffect(() => () => { if (activeUrl.current) URL.revokeObjectURL(activeUrl.current) }, []);

  return (
    <div className="relative h-full rounded-lg border bg-muted overflow-hidden">
      {generating && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
      {blobUrl ? (
        <iframe src={blobUrl} className="w-full h-full" title="Resume PDF preview" />
      ) : !generating ? (
        <div className="h-full flex items-center justify-center text-sm text-muted-foreground px-6 text-center">
          Add some content to see your resume preview.
        </div>
      ) : null}
    </div>
  );
}

// ─── Page view ────────────────────────────────────────────────────────────────

export function ResumePageView({ resume }: { resume: Resume }) {
  const sectionRef = useRef<AddResumeSectionRef>(null);
  const [showEdit, setShowEdit] = useState(true);

  const { contactInfo, summary, skills, experiences, educations, certifications } = resume;

  const backHref = resume.jobProfileId ? "/dashboard/job-profiles" : "/dashboard/profile";

  const handleDownload = async () => {
    try {
      const { blob, filename } = await generateResumePdfBlob(resume);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ variant: "destructive", title: "Failed to generate PDF." });
    }
  };

  return (
    <div className="col-span-3 flex flex-col gap-3 h-[calc(100dvh-5.5rem)]">

      {/* Top bar */}
      <div className="flex items-center gap-2 shrink-0">
        <Link href={backHref}>
          <Button variant="ghost" size="sm" className="gap-1.5 px-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </Link>
        <span className="font-semibold text-sm truncate flex-1 min-w-0">{resume.title}</span>
        <Button variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={handleDownload}>
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Download</span>
        </Button>
        <Button
          variant={showEdit ? "secondary" : "outline"}
          size="sm"
          className="gap-1.5 shrink-0"
          onClick={() => setShowEdit((v) => !v)}
        >
          {showEdit ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
          <span className="hidden sm:inline">{showEdit ? "Hide Edit" : "Edit"}</span>
        </Button>
      </div>

      {/* Split content area */}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* Left: PDF preview */}
        <div className="flex-1 min-w-0 min-h-0">
          <PdfPanel resume={resume} />
        </div>

        {/* Right: edit panel */}
        {showEdit && (
          <div className="w-[380px] xl:w-[430px] shrink-0 flex flex-col gap-3 min-h-0">
            {/* Edit panel header */}
            <div className="flex items-center justify-between shrink-0">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Editor</span>
              <AddResumeSection resume={resume} ref={sectionRef} />
            </div>

            {/* Scrollable section cards */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {!contactInfo && (
                <button
                  type="button"
                  onClick={() => sectionRef.current?.openContactInfoDialog({ firstName: "", lastName: "", headline: "" })}
                  className="w-full rounded-lg border border-dashed p-3 text-sm text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors text-left"
                >
                  + Add contact info
                </button>
              )}
              {contactInfo && (
                <ContactInfoCard
                  contactInfo={contactInfo}
                  openDialog={() => sectionRef.current?.openContactInfoDialog(contactInfo)}
                />
              )}
              {summary && (
                <SummarySectionCard
                  summary={summary}
                  openDialogForEdit={() => sectionRef.current?.openSummaryDialog(summary)}
                />
              )}
              {skills && skills.length > 0 && (
                <SkillsCard
                  resumeId={resume.id!}
                  skills={skills}
                  openDialogForEdit={(sc: SkillCategory, index: number) => sectionRef.current?.openSkillsCategoryDialog(sc, index)}
                  openDialogForAdd={() => sectionRef.current?.openSkillsCategoryDialog()}
                />
              )}
              {experiences && experiences.length > 0 && (
                <ExperienceCard
                  experiences={experiences}
                  openDialogForEdit={(index: number) => sectionRef.current?.openExperienceDialog(index)}
                />
              )}
              {educations && educations.length > 0 && (
                <EducationCard
                  educations={educations}
                  openDialogForEdit={(index: number) => sectionRef.current?.openEducationDialog(index)}
                />
              )}
              {certifications && certifications.length > 0 && (
                <CertificationCard
                  certifications={certifications}
                  openDialogForEdit={(index: number) => sectionRef.current?.openCertificationDialog(index)}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
