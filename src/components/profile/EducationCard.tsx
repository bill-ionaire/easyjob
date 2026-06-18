"use client";
import { Education } from "@/models/profile.model";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Edit, Plus } from "lucide-react";
import { TipTapContentViewer } from "../TipTapContentViewer";

interface EducationCardProps {
  educations: Education[];
  onEdit: (index: number) => void;
  onAdd: () => void;
}

function EducationCard({ educations, onEdit, onAdd }: EducationCardProps) {
  return (
    <>
      <div className="flex items-center justify-between pl-4 pr-1 py-1">
        <span className="text-sm font-semibold">Education</span>
        <Button variant="ghost" size="sm" className="h-7 gap-1" onClick={onAdd}>
          <Plus className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap text-xs">Add</span>
        </Button>
      </div>
      {educations.map((edu, index) => (
        <Card key={`${edu.institution}_${String(edu.startDate)}`}>
          <CardHeader className="p-2 pb-0 flex-row justify-between relative">
            <CardTitle className="text-xl pl-4">{edu.institution}</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 absolute top-0 right-1"
              onClick={() => onEdit(index)}
            >
              <Edit className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Edit</span>
            </Button>
          </CardHeader>
          <CardContent>
            <h3>
              {edu.degree}, {edu.fieldOfStudy}
            </h3>
            <CardDescription>
              {edu.startDate} – {edu.endDate ? edu.endDate : "Present"}
              {edu.cgpa && <> · GPA: {edu.cgpa}</>}
              <br />
              {edu.location}
            </CardDescription>
            {edu.description && (
              <div className="pt-2">
                <TipTapContentViewer content={edu.description} />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </>
  );
}

export default EducationCard;
