"use client";
import { Resume, SkillCategory } from "@/models/profile.model";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import AddResumeSection, { AddResumeSectionRef } from "./AddResumeSection";
import ContactInfoCard from "./ContactInfoCard";
import { useRef, useState } from "react";
import { toast } from "../ui/use-toast";
import SummarySectionCard from "./SummarySectionCard";
import SkillsCard from "./SkillsCard";
import ExperienceCard from "./ExperienceCard";
import EducationCard from "./EducationCard";
import CertificationCard from "./CertificationCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { MoreHorizontal, FileDown } from "lucide-react";

function ResumeContainer({ resume }: { resume: Resume }) {
  const resumeSectionRef = useRef<AddResumeSectionRef>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPdf = async () => {
    const hasName =
      resume.contactInfo?.firstName?.trim() ||
      resume.contactInfo?.lastName?.trim();
    const hasContent =
      resume.summary ||
      resume.experiences?.length ||
      resume.educations?.length ||
      resume.certifications?.length;

    if (!hasName && !hasContent) {
      toast({
        title: "Nothing to export",
        description:
          "Add your contact info and at least one section (Summary, Experience, or Education) before exporting.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      const { downloadResumePdf } = await import("./resume-pdf");
      await downloadResumePdf(resume);
      toast({ title: "PDF exported", description: "Saved to your Downloads folder." });
    } catch {
      toast({ title: "Failed to generate PDF. Please try again.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const { title, contactInfo, summary, skills, experiences, educations, certifications } = resume ?? {};

  const openContactInfoDialog = () => {
    resumeSectionRef.current?.openContactInfoDialog(contactInfo!);
  };
  const openSummaryDialogForEdit = () => {
    resumeSectionRef.current?.openSummaryDialog(summary ?? undefined);
  };
  const openSkillsCategoryDialogForEdit = (sc: SkillCategory) => {
    resumeSectionRef.current?.openSkillsCategoryDialog(sc);
  };
  const openSkillsCategoryDialogForAdd = () => {
    resumeSectionRef.current?.openSkillsCategoryDialog();
  };
  const openExperienceDialogForEdit = (experienceId: string) => {
    resumeSectionRef.current?.openExperienceDialog(experienceId);
  };
  const openEducationDialogForEdit = (educationId: string) => {
    resumeSectionRef.current?.openEducationDialog(educationId);
  };
  const openCertificationDialogForEdit = (certificationId: string) => {
    resumeSectionRef.current?.openCertificationDialog(certificationId);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex-col gap-2 sm:flex-row sm:justify-between sm:items-center lg:grid lg:grid-cols-3 lg:items-center">
          <CardTitle>Resume</CardTitle>
          <CardDescription className="mt-0 lg:flex lg:justify-center">
            {title}
          </CardDescription>
          <div className="flex items-center gap-2 flex-wrap lg:justify-end">
            <AddResumeSection resume={resume} ref={resumeSectionRef} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={handleExportPdf}
                  disabled={isExporting}
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  {isExporting ? "Generating…" : "Export to PDF"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
      </Card>
      {contactInfo && (
        <ContactInfoCard
          contactInfo={contactInfo}
          openDialog={openContactInfoDialog}
        />
      )}
      {summary && (
        <SummarySectionCard
          summary={summary}
          openDialogForEdit={openSummaryDialogForEdit}
        />
      )}
      {skills && skills.length > 0 && (
        <SkillsCard
          resumeId={resume.id!}
          skills={skills}
          openDialogForEdit={openSkillsCategoryDialogForEdit}
          openDialogForAdd={openSkillsCategoryDialogForAdd}
        />
      )}
      {experiences && experiences.length > 0 && (
        <ExperienceCard
          experiences={experiences}
          openDialogForEdit={openExperienceDialogForEdit}
        />
      )}
      {educations && educations.length > 0 && (
        <EducationCard
          educations={educations}
          openDialogForEdit={openEducationDialogForEdit}
        />
      )}
      {certifications && certifications.length > 0 && (
        <CertificationCard
          certifications={certifications}
          openDialogForEdit={openCertificationDialogForEdit}
        />
      )}
    </>
  );
}

export default ResumeContainer;
