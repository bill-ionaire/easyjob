"use client";
import { WorkExperience } from "@/models/profile.model";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Edit } from "lucide-react";
import { TipTapContentViewer } from "../TipTapContentViewer";

interface ExperienceCardProps {
  experiences: WorkExperience[];
  openDialogForEdit: (index: number) => void;
}

function ExperienceCard({ experiences, openDialogForEdit }: ExperienceCardProps) {
  return (
    <>
      <CardTitle className="pl-6 py-3">Experience</CardTitle>
      {experiences.map((exp, index) => (
        <Card key={`${exp.company}_${exp.jobTitle}_${exp.startDate}`}>
          <CardHeader className="p-2 pb-0 flex-row justify-between relative">
            <CardTitle className="text-xl pl-4">{exp.jobTitle}</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 absolute top-0 right-1"
              onClick={() => openDialogForEdit(index)}
            >
              <Edit className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Edit
              </span>
            </Button>
          </CardHeader>
          <CardContent>
            <h3>{exp.company}</h3>
            <CardDescription>
              {exp.startDate} -{" "}
              {exp.endDate ? exp.endDate : "Present"}
              <br />
              {exp.location}
            </CardDescription>
            <div className="pt-2">
              <TipTapContentViewer content={exp.description ?? ""} />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}

export default ExperienceCard;
