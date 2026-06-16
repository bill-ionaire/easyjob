"use client";
import { PlusCircle } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import AddContactInfo from "./AddContactInfo";
import { forwardRef, useImperativeHandle, useState } from "react";
import {
  ContactInfo,
  Resume,
  SkillCategory,
} from "@/models/profile.model";
import AddResumeSummary from "./AddResumeSummary";
import AddExperience from "./AddExperience";
import AddEducation from "./AddEducation";
import AddCertification from "./AddCertification";
import AddSkills from "./AddSkills";

interface AddResumeSectionProps {
  resume: Resume;
}

export interface AddResumeSectionRef {
  openContactInfoDialog: (c: ContactInfo) => void;
  openSummaryDialog: (summaryContent?: string) => void;
  openSkillsCategoryDialog: (sc?: SkillCategory) => void;
  openExperienceDialog: (experienceId?: string) => void;
  openEducationDialog: (educationId?: string) => void;
  openCertificationDialog: (certificationId?: string) => void;
}

const AddResumeSection = forwardRef<AddResumeSectionRef, AddResumeSectionProps>(
  ({ resume }, ref) => {
    const [contactInfoDialogOpen, setContactInfoDialogOpen] = useState(false);
    const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
    const [experienceDialogOpen, setExperienceDialogOpen] = useState(false);
    const [educationDialogOpen, setEducationDialogOpen] = useState(false);
    const [skillsDialogOpen, setSkillsDialogOpen] = useState(false);
    const [certificationDialogOpen, setCertificationDialogOpen] = useState(false);

    const [contactInfoToEdit, setContactInfoToEdit] = useState<ContactInfo | null>(null);
    const [summaryToEdit, setSummaryToEdit] = useState<string | null>(null);
    const [skillToEdit, setSkillToEdit] = useState<SkillCategory | null>(null);
    const [experienceIdToEdit, setExperienceIdToEdit] = useState<string | undefined>(undefined);
    const [educationIdToEdit, setEducationIdToEdit] = useState<string | undefined>(undefined);
    const [certificationIdToEdit, setCertificationIdToEdit] = useState<string | undefined>(undefined);

    useImperativeHandle(ref, () => ({
      openContactInfoDialog(contactInfo: ContactInfo) {
        setContactInfoToEdit({ ...contactInfo });
        setContactInfoDialogOpen(true);
      },
      openSummaryDialog(summaryContent?: string) {
        setSummaryToEdit(summaryContent ?? null);
        setSummaryDialogOpen(true);
      },
      openSkillsCategoryDialog(sc?: SkillCategory) {
        setSkillToEdit(sc ? { ...sc } : null);
        setSkillsDialogOpen(true);
      },
      openExperienceDialog(experienceId?: string) {
        setExperienceIdToEdit(experienceId);
        setExperienceDialogOpen(true);
      },
      openEducationDialog(educationId?: string) {
        setEducationIdToEdit(educationId);
        setEducationDialogOpen(true);
      },
      openCertificationDialog(certificationId?: string) {
        setCertificationIdToEdit(certificationId);
        setCertificationDialogOpen(true);
      },
    }));

    const openContactInfoDialog = () => {
      setContactInfoToEdit(null);
      setContactInfoDialogOpen(true);
    };
    const openSummaryDialog = () => {
      setSummaryToEdit(null);
      setSummaryDialogOpen(true);
    };
    const openSkillsDialog = () => {
      setSkillToEdit(null);
      setSkillsDialogOpen(true);
    };
    const openExperienceDialog = () => {
      setExperienceIdToEdit(undefined);
      setExperienceDialogOpen(true);
    };
    const openEducationDialog = () => {
      setEducationIdToEdit(undefined);
      setEducationDialogOpen(true);
    };
    const openCertificationDialog = () => {
      setCertificationIdToEdit(undefined);
      setCertificationDialogOpen(true);
    };

    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1 cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Section
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={openContactInfoDialog}
                disabled={!!resume?.contactInfo}
              >
                Add Contact Info
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={openSummaryDialog}
                disabled={!!resume?.summary}
              >
                Add Summary
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={openSkillsDialog}
              >
                Add Skills
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={openExperienceDialog}
              >
                Add Experience
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={openEducationDialog}
              >
                Add Education
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={openCertificationDialog}
              >
                Add Certification / License
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <AddContactInfo
          resumeId={resume?.id}
          dialogOpen={contactInfoDialogOpen}
          setDialogOpen={setContactInfoDialogOpen}
          contactInfoToEdit={contactInfoToEdit}
        />
        <AddResumeSummary
          resumeId={resume?.id}
          dialogOpen={summaryDialogOpen}
          setDialogOpen={setSummaryDialogOpen}
          summaryContent={summaryToEdit}
        />
        <AddSkills
          resumeId={resume?.id}
          dialogOpen={skillsDialogOpen}
          setDialogOpen={setSkillsDialogOpen}
          skillToEdit={skillToEdit}
        />
        <AddExperience
          resumeId={resume?.id}
          experienceId={experienceIdToEdit}
          experiences={resume?.experiences}
          dialogOpen={experienceDialogOpen}
          setDialogOpen={setExperienceDialogOpen}
        />
        <AddEducation
          resumeId={resume?.id}
          educationId={educationIdToEdit}
          educations={resume?.educations}
          dialogOpen={educationDialogOpen}
          setDialogOpen={setEducationDialogOpen}
        />
        <AddCertification
          resumeId={resume?.id}
          certificationId={certificationIdToEdit}
          certifications={resume?.certifications}
          dialogOpen={certificationDialogOpen}
          setDialogOpen={setCertificationDialogOpen}
        />
      </>
    );
  },
);

AddResumeSection.displayName = "AddResumeSection";

export default AddResumeSection;
