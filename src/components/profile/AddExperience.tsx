"use client";
import { AddExperienceFormSchema } from "@/models/addExperienceForm.schema";
import { WorkExperience } from "@/models/profile.model";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Loader } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import TiptapEditor from "../TiptapEditor";
import { toast } from "../ui/use-toast";
import { DatePicker } from "../DatePicker";
import { Switch } from "../ui/switch";
import { addExperience, updateExperience } from "@/actions/profile.actions";

type AddExperienceProps = {
  resumeId: string | undefined;
  experienceIndex: number | undefined;
  experiences: WorkExperience[] | undefined;
  dialogOpen: boolean;
  setDialogOpen: (e: boolean) => void;
};

function AddExperience({
  resumeId,
  experienceIndex,
  experiences,
  dialogOpen,
  setDialogOpen,
}: AddExperienceProps) {
  const experienceToEdit = experienceIndex !== undefined
    ? experiences?.[experienceIndex]
    : undefined;

  const pageTitle = experienceToEdit ? "Edit Experience" : "Add Experience";
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof AddExperienceFormSchema>>({
    resolver: zodResolver(AddExperienceFormSchema),
    defaultValues: { resumeId },
  });

  const { watch, reset, formState, resetField } = form;
  const currentJobValue = watch("currentJob");

  useEffect(() => {
    if (!dialogOpen) return;
    if (experienceToEdit) {
      reset({
        index: experienceIndex,
        resumeId,
        title: experienceToEdit.jobTitle,
        company: experienceToEdit.company,
        location: experienceToEdit.location,
        startDate: new Date(experienceToEdit.startDate),
        endDate: experienceToEdit.endDate ? new Date(experienceToEdit.endDate) : null,
        jobDescription: experienceToEdit.description ?? "",
        currentJob: experienceToEdit.currentJob ?? !experienceToEdit.endDate,
      });
    } else {
      reset({ resumeId }, { keepDefaultValues: true });
    }
  }, [dialogOpen, experienceToEdit, experienceIndex, reset, resumeId]);

  const onSubmit = (data: z.infer<typeof AddExperienceFormSchema>) => {
    startTransition(async () => {
      const res = experienceToEdit
        ? await updateExperience(data)
        : await addExperience(data);
      if (!res.success) {
        toast({ variant: "destructive", title: "Error!", description: res.message });
      } else {
        reset();
        setDialogOpen(false);
        toast({
          variant: "success",
          description: `Experience has been ${experienceToEdit ? "updated" : "added"} successfully`,
        });
      }
    });
  };

  const onCurrentJob = (current: boolean) => {
    if (current) resetField("endDate");
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="h-full md:h-[85%] lg:max-h-screen md:max-w-[40rem] overflow-y-scroll">
        <DialogHeader>
          <DialogTitle>{pageTitle}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2"
          >
            <div>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Software Engineer" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Acme Corp" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Job Location</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Toronto, ON" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <DatePicker field={field} presets={false} isEnabled={true} captionLayout={true} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center">
              <FormField
                control={form.control}
                name="currentJob"
                render={({ field }) => (
                  <FormItem className="flex flex-row">
                    <Switch
                      checked={field.value}
                      onCheckedChange={(c) => { field.onChange(c); onCurrentJob(c); }}
                    />
                    <FormLabel className="flex items-center ml-4 mb-2">
                      {field.value ? "Current Job" : "Job Ended"}
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col">
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <DatePicker field={field} presets={false} isEnabled={!currentJobValue} captionLayout={true} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="jobDescription"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Job Description</FormLabel>
                    <FormControl>
                      <TiptapEditor field={field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="md:col-span-2 mt-4">
              <DialogFooter>
                <Button type="reset" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!formState.isDirty}>
                  Save
                  {isPending && <Loader className="h-4 w-4 shrink-0 spinner" />}
                </Button>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default AddExperience;
