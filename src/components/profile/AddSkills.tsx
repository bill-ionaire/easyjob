"use client";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { AddSkillsFormSchema } from "@/models/addSkillsForm.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Loader } from "lucide-react";
import { useEffect, useTransition } from "react";
import { toast } from "../ui/use-toast";
import { z } from "zod";
import { addResumeSkills, updateResumeSkills } from "@/actions/profile.actions";
import { SkillCategory } from "@/models/profile.model";

interface AddSkillsProps {
  resumeId: string | undefined;
  dialogOpen: boolean;
  setDialogOpen: (e: boolean) => void;
  skillToEdit?: SkillCategory | null;
}

function AddSkills({
  resumeId,
  dialogOpen,
  setDialogOpen,
  skillToEdit,
}: AddSkillsProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!skillToEdit;

  const form = useForm<z.infer<typeof AddSkillsFormSchema> & { detailsText: string }>({
    resolver: zodResolver(AddSkillsFormSchema) as any,
    defaultValues: {
      resumeId,
      label: "",
      details: [],
      detailsText: "",
    },
  });

  const { reset, formState, setValue } = form;

  useEffect(() => {
    if (skillToEdit) {
      reset(
        {
          id: skillToEdit.id,
          resumeId,
          label: skillToEdit.label,
          details: skillToEdit.details,
          detailsText: skillToEdit.details.join(", "),
        },
        { keepDefaultValues: true },
      );
    } else {
      reset({ resumeId, label: "", details: [], detailsText: "" });
    }
  }, [skillToEdit, resumeId, reset]);

  const onSubmit = (data: z.infer<typeof AddSkillsFormSchema> & { detailsText: string }) => {
    startTransition(async () => {
      const res = isEditing
        ? await updateResumeSkills(data)
        : await addResumeSkills(data);
      if (!res.success) {
        toast({
          variant: "destructive",
          title: "Error!",
          description: res.message,
        });
      } else {
        reset();
        setDialogOpen(false);
        toast({
          variant: "success",
          description: `Skills ${isEditing ? "updated" : "added"} successfully`,
        });
      }
    });
  };

  const handleDetailsTextChange = (value: string) => {
    setValue("detailsText" as any, value);
    const parsed = value.split(",").map((s) => s.trim()).filter(Boolean);
    setValue("details", parsed, { shouldDirty: true });
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Skill" : "Add Skill"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4 p-2"
          >
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Programming Languages" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="details"
              render={() => (
                <FormItem>
                  <FormLabel>Skills</FormLabel>
                  <FormControl>
                    <Input
                      value={form.watch("detailsText" as any) ?? ""}
                      onChange={(e) => handleDetailsTextChange(e.target.value)}
                      placeholder="Ex: JavaScript, TypeScript, Python"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!formState.isDirty}>
                Save
                {isPending && <Loader className="h-4 w-4 shrink-0 spinner" />}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default AddSkills;
