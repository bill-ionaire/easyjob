"use client";
import { Edit, Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { SkillCategory } from "@/models/profile.model";
import { useTransition } from "react";
import { deleteSkillCategory } from "@/actions/profile.actions";
import { toast } from "../ui/use-toast";

interface SkillsCardProps {
  resumeId: string;
  skills: SkillCategory[];
  openDialogForEdit: (sc: SkillCategory, index: number) => void;
  openDialogForAdd: () => void;
}

function SkillsCard({
  resumeId,
  skills,
  openDialogForEdit,
  openDialogForAdd,
}: SkillsCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (index: number) => {
    startTransition(async () => {
      const res = await deleteSkillCategory(index, resumeId);
      if (!res.success) {
        toast({ variant: "destructive", title: "Failed to delete skill." });
      }
    });
  };

  return (
    <Card>
      <CardHeader className="flex-row justify-between items-center relative">
        <CardTitle>Skills</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1"
          onClick={openDialogForAdd}
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add
          </span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-1">
        {skills.map((sc, index) => (
          <div key={sc.label} className="flex items-start justify-between group">
            <p className="text-sm">
              <span className="font-semibold">{sc.label}:</span>{" "}
              {sc.details.join(", ")}
            </p>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => openDialogForEdit(sc, index)}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-destructive"
                disabled={isPending}
                onClick={() => handleDelete(index)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default SkillsCard;
