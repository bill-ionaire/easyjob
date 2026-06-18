"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Download, Loader, PanelRightClose, PanelRightOpen, Plus, RotateCcw, Save } from "lucide-react";
import { ContactInfo, Education, LicenseOrCertification, Resume, SkillCategory, WorkExperience } from "@/models/profile.model";
import { Button } from "../ui/button";
import AddResumeSection, { SectionKey } from "./AddResumeSection";
import ContactInfoCard from "./ContactInfoCard";
import SummarySectionCard from "./SummarySectionCard";
import SkillsCard from "./SkillsCard";
import ExperienceCard from "./ExperienceCard";
import EducationCard from "./EducationCard";
import CertificationCard from "./CertificationCard";
import AddContactInfo from "./AddContactInfo";
import AddResumeSummary from "./AddResumeSummary";
import AddSkills from "./AddSkills";
import AddCertification from "./AddCertification";
import { generateResumePdfBlob } from "./resume-pdf/generateResumePdf";
import type { ResumeHtmlNodes } from "./resume-pdf/generateResumePdf";
import { toast } from "../ui/use-toast";
import { saveFullResume } from "@/actions/profile.actions";

const PdfViewerPanel = dynamic(
  () => import("./resume-pdf/PdfViewerPanel").then((m) => ({ default: m.PdfViewerPanel })),
  { ssr: false },
);

// ─── Types ────────────────────────────────────────────────────────────────────

type ActiveForm =
  | { type: "contactInfo"; index?: undefined }
  | { type: "summary"; index?: undefined }
  | { type: "skills"; index?: number }
  | { type: "experience"; index?: number }
  | { type: "education"; index?: number }
  | { type: "certification"; index?: number };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionEmptyRow({ title, onAdd }: { title: string; onAdd: () => void }) {
  return (
    <div className="flex items-center justify-between pl-4 pr-1 py-1">
      <span className="text-sm font-semibold">{title}</span>
      <Button variant="ghost" size="sm" className="h-7 gap-1" onClick={onAdd}>
        <Plus className="h-3.5 w-3.5" />
        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap text-xs">Add</span>
      </Button>
    </div>
  );
}

// ─── PDF preview ──────────────────────────────────────────────────────────────

function PdfPanel({ resume }: { resume: Resume }) {
  const [htmlNodes, setHtmlNodes] = useState<ResumeHtmlNodes | null>(null);

  const contentKey = [
    resume.summary ?? "",
    ...(resume.experiences?.map((e) => e.description ?? "") ?? []),
    ...(resume.educations?.map((e) => e.description ?? "") ?? []),
  ].join("\0");

  useEffect(() => {
    import("./resume-pdf/html-to-pdf").then(({ htmlToPdfNodes }) => {
      setHtmlNodes({
        summary: resume.summary ? htmlToPdfNodes(resume.summary) : [],
        experiences: resume.experiences?.map((e) => e.description ? htmlToPdfNodes(e.description) : []) ?? [],
        educations: resume.educations?.map((e) => e.description ? htmlToPdfNodes(e.description) : []) ?? [],
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resume.id, contentKey]);

  if (!htmlNodes) {
    return (
      <div className="h-full rounded-lg border bg-muted flex items-center justify-center">
        <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full rounded-lg border overflow-hidden shadow-sm">
      <PdfViewerPanel resume={resume} htmlNodes={htmlNodes} />
    </div>
  );
}

// ─── Page view ────────────────────────────────────────────────────────────────

export function ResumePageView({ resume }: { resume: Resume }) {
  const [showEdit, setShowEdit] = useState(true);
  const [activeForm, setActiveForm] = useState<ActiveForm | null>(null);

  // Local-first state — changes apply to UI immediately, Save persists to backend
  const [localResume, setLocalResume] = useState<Resume>(resume);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, startSaveTransition] = useTransition();
  const savedRef = useRef<Resume>(resume);

  const updateLocal = (updates: Partial<Resume>) => {
    setLocalResume((prev) => ({ ...prev, ...updates }));
    setIsDirty(true);
  };

  const handleGlobalSave = () => {
    startSaveTransition(async () => {
      const res = await saveFullResume(localResume);
      if (!res.success) {
        toast({ variant: "destructive", title: "Failed to save.", description: res.message });
      } else {
        savedRef.current = localResume;
        setIsDirty(false);
        toast({ variant: "success", description: "Resume saved successfully." });
      }
    });
  };

  const handleDiscard = () => {
    setLocalResume(savedRef.current);
    setIsDirty(false);
    setActiveForm(null);
  };

  const { contactInfo, summary, skills, experiences, educations, certifications } = localResume;
  const backHref = resume.jobProfileId ? "/dashboard/job-profiles" : "/dashboard/profile";

  const [addedSections, setAddedSections] = useState<Set<SectionKey>>(() => {
    const s = new Set<SectionKey>();
    if (resume.contactInfo) s.add("contactInfo");
    if (resume.summary) s.add("summary");
    if (resume.skills?.length) s.add("skills");
    if (resume.experiences?.length) s.add("experience");
    if (resume.educations?.length) s.add("education");
    if (resume.certifications?.length) s.add("certification");
    return s;
  });

  const addSection = (section: SectionKey) => {
    setAddedSections((prev) => new Set([...prev, section]));
  };

  const toggleForm = (section: SectionKey, index?: number) => {
    setActiveForm((prev) =>
      prev?.type === section && prev?.index === index
        ? null
        : ({ type: section, ...(index !== undefined ? { index } : {}) } as ActiveForm)
    );
  };

  const openForm = (section: SectionKey, index?: number) => {
    setActiveForm({ type: section, ...(index !== undefined ? { index } : {}) } as ActiveForm);
  };

  const closeForm = () => setActiveForm(null);

  const handleDownload = async () => {
    try {
      const { blob, filename } = await generateResumePdfBlob(localResume);
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
        <span className="font-semibold text-sm truncate flex-1 min-w-0">{localResume.title}</span>

        {isDirty && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 shrink-0 text-muted-foreground"
              onClick={handleDiscard}
              disabled={isSaving}
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Discard</span>
            </Button>
            <Button
              size="sm"
              className="gap-1.5 shrink-0"
              onClick={handleGlobalSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">{isSaving ? "Saving…" : "Save"}</span>
            </Button>
          </>
        )}

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

        {/* Left: PDF preview — uses localResume for real-time updates */}
        <div className="flex-1 min-w-0 min-h-0">
          <PdfPanel resume={localResume} />
        </div>

        {/* Right: edit panel */}
        {showEdit && (
          <div className="w-[380px] xl:w-[430px] shrink-0 flex flex-col gap-3 min-h-0">
            {/* Edit panel header */}
            <div className="flex items-center justify-between shrink-0">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Editor</span>
              <AddResumeSection addedSections={addedSections} onOpen={addSection} />
            </div>

            {/* Scrollable section cards */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">

              {/* ── Contact Info ── */}
              {addedSections.has("contactInfo") && (
                <>
                  {contactInfo
                    ? activeForm?.type !== "contactInfo" && (
                        <ContactInfoCard contactInfo={contactInfo} onEdit={() => openForm("contactInfo")} />
                      )
                    : activeForm?.type !== "contactInfo" && (
                        <SectionEmptyRow title="Contact Info" onAdd={() => toggleForm("contactInfo")} />
                      )}
                  {activeForm?.type === "contactInfo" && (
                    <AddContactInfo
                      resumeId={resume.id}
                      contactInfoToEdit={contactInfo}
                      onClose={closeForm}
                      onLocalSave={(info: ContactInfo) => updateLocal({ contactInfo: info })}
                    />
                  )}
                </>
              )}

              {/* ── Summary ── */}
              {addedSections.has("summary") && (
                <>
                  {summary
                    ? activeForm?.type !== "summary" && (
                        <SummarySectionCard summary={summary} onEdit={() => openForm("summary")} />
                      )
                    : activeForm?.type !== "summary" && (
                        <SectionEmptyRow title="Summary" onAdd={() => toggleForm("summary")} />
                      )}
                  {activeForm?.type === "summary" && (
                    <AddResumeSummary
                      resumeId={resume.id}
                      summaryContent={summary}
                      onClose={closeForm}
                      onLocalSave={(s: string) => updateLocal({ summary: s })}
                    />
                  )}
                </>
              )}

              {/* ── Skills ── */}
              {addedSections.has("skills") && (
                <>
                  <SkillsCard
                    resumeId={resume.id!}
                    skills={skills ?? []}
                    onEdit={(sc: SkillCategory, index: number) => openForm("skills", index)}
                    onAdd={() => toggleForm("skills")}
                    onLocalDelete={(index: number) => {
                      updateLocal({ skills: (skills ?? []).filter((_, i) => i !== index) });
                    }}
                  />
                  {activeForm?.type === "skills" && (
                    <AddSkills
                      resumeId={resume.id}
                      skillToEdit={activeForm.index !== undefined ? skills?.[activeForm.index] : null}
                      skillIndex={activeForm.index}
                      onClose={closeForm}
                      onLocalSave={(skill: SkillCategory, index?: number) => {
                        const arr = skills ?? [];
                        updateLocal({
                          skills: index !== undefined
                            ? arr.map((s, i) => (i === index ? skill : s))
                            : [...arr, skill],
                        });
                      }}
                    />
                  )}
                </>
              )}

              {/* ── Experience ── */}
              {addedSections.has("experience") && (
                <ExperienceCard
                  resumeId={resume.id!}
                  experiences={experiences ?? []}
                  onLocalChange={(exps: WorkExperience[]) => updateLocal({ experiences: exps })}
                />
              )}

              {/* ── Education ── */}
              {addedSections.has("education") && (
                <EducationCard
                  resumeId={resume.id!}
                  educations={educations ?? []}
                  onLocalChange={(edus: Education[]) => updateLocal({ educations: edus })}
                />
              )}

              {/* ── Certifications ── */}
              {addedSections.has("certification") && (
                <>
                  <CertificationCard
                    certifications={certifications ?? []}
                    onEdit={(index: number) => openForm("certification", index)}
                    onAdd={() => toggleForm("certification")}
                  />
                  {activeForm?.type === "certification" && (
                    <AddCertification
                      resumeId={resume.id}
                      certificationIndex={activeForm.index}
                      certifications={certifications}
                      onClose={closeForm}
                      onLocalSave={(cert: LicenseOrCertification, index?: number) => {
                        const arr = certifications ?? [];
                        updateLocal({
                          certifications: index !== undefined
                            ? arr.map((c, i) => (i === index ? cert : c))
                            : [...arr, cert],
                        });
                      }}
                    />
                  )}
                </>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
