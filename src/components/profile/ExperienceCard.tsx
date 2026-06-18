"use client";
import { WorkExperience } from "@/models/profile.model";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Edit, Plus, Trash2 } from "lucide-react";
import { TipTapContentViewer } from "../TipTapContentViewer";
import { useState, useTransition } from "react";
import { deleteExperience } from "@/actions/profile.actions";
import { toast } from "../ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import AddExperience from "./AddExperience";

interface ExperienceCardProps {
  resumeId: string;
  experiences: WorkExperience[];
  onAdd: () => void;
}

function ExperienceCard({ resumeId, experiences, onAdd }: ExperienceCardProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = (index: number) => {
    startTransition(async () => {
      const res = await deleteExperience(index, resumeId);
      if (!res?.success) {
        toast({ variant: "destructive", title: "Failed to delete experience." });
      }
    });
  };

  return (
    <>
      <div className="flex items-center justify-between pl-4 pr-1 py-1">
        <span className="text-sm font-semibold">Experience</span>
        <Button variant="ghost" size="sm" className="h-7 gap-1" onClick={onAdd}>
          <Plus className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap text-xs">Add</span>
        </Button>
      </div>

      {experiences.map((exp, index) => (
        <Card key={`${exp.company}_${exp.jobTitle}_${exp.startDate}`}>
          <CardHeader className="p-2 pb-0 flex-row justify-between relative">
            <CardTitle className="text-xl pl-4">{exp.jobTitle}</CardTitle>
            <div className="flex gap-0.5 absolute top-0 right-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setEditingIndex(index)}
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                disabled={isPending}
                onClick={() => handleDelete(index)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <h3>{exp.company}</h3>
            <CardDescription>
              {exp.startDate} – {exp.endDate ? exp.endDate : "Present"}
              <br />
              {exp.location}
            </CardDescription>
            <div className="pt-2">
              <TipTapContentViewer content={exp.description ?? ""} />
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog
        open={editingIndex !== null}
        onOpenChange={(open) => { if (!open) setEditingIndex(null); }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Experience</DialogTitle>
          </DialogHeader>
          {editingIndex !== null && (
            <AddExperience
              variant="dialog"
              resumeId={resumeId}
              experienceIndex={editingIndex}
              experiences={experiences}
              onClose={() => setEditingIndex(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ExperienceCard;
