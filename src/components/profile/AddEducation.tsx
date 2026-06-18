"use client";
import { AddEducationFormSchema } from "@/models/AddEductionForm.schema";
import { Education } from "@/models/profile.model";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import TiptapEditor from "../TiptapEditor";
import { Button } from "../ui/button";
import { useEffect, useTransition } from "react";
import { toast } from "../ui/use-toast";
import { Loader, X } from "lucide-react";
import { addEducation, updateEducation } from "@/actions/profile.actions";

type AddEducationProps = {
  resumeId: string | undefined;
  educationIndex: number | undefined;
  educations: Education[] | undefined;
  onClose: () => void;
};

function AddEducation({
  resumeId,
  educationIndex,
  educations,
  onClose,
}: AddEducationProps) {
  const educationToEdit =
    educationIndex !== undefined ? educations?.[educationIndex] : undefined;

  const pageTitle = educationToEdit ? "Edit Education" : "Add Education";
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof AddEducationFormSchema>>({
    resolver: zodResolver(AddEducationFormSchema),
    defaultValues: {
      resumeId,
      degreeCompleted: true,
      institution: "",
      degree: "",
      fieldOfStudy: "",
      location: "",
      startDate: "",
      endDate: "",
      cgpa: "",
    },
  });

  const { watch, reset, setValue, formState } = form;
  const degreeCompletedValue = watch("degreeCompleted");

  useEffect(() => {
    if (educationToEdit) {
      reset(
        {
          index: educationIndex,
          resumeId,
          institution: educationToEdit.institution,
          degree: educationToEdit.degree,
          fieldOfStudy: educationToEdit.fieldOfStudy,
          location: educationToEdit.location,
          startDate: String(educationToEdit.startDate),
          endDate: educationToEdit.endDate ? String(educationToEdit.endDate) : "",
          cgpa: educationToEdit.cgpa ?? "",
          description: educationToEdit.description,
          degreeCompleted: !!educationToEdit.endDate,
        },
        { keepDefaultValues: true },
      );
    } else {
      reset(
        {
          resumeId,
          degreeCompleted: true,
          institution: "",
          degree: "",
          fieldOfStudy: "",
          location: "",
          startDate: "",
          endDate: "",
          cgpa: "",
        },
        { keepDefaultValues: true },
      );
    }
  }, [educationToEdit, educationIndex, resumeId, reset]);

  const onDegreeCompleted = (completed: boolean) => {
    if (!completed) setValue("endDate", "");
  };

  const onSubmit = (data: z.infer<typeof AddEducationFormSchema>) => {
    startTransition(async () => {
      const res = educationToEdit
        ? await updateEducation(data)
        : await addEducation(data);
      if (!res.success) {
        toast({ variant: "destructive", title: "Error!", description: res.message });
      } else {
        reset();
        onClose();
        toast({
          variant: "success",
          description: `Education has been ${educationToEdit ? "updated" : "added"} successfully`,
        });
      }
    });
  };

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{pageTitle}</h3>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          <FormField
            control={form.control}
            name="institution"
            render={({ field }) => (
              <FormItem>
                <FormLabel>School</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: Stanford" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Toronto, ON" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="degree"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Degree</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: Bachelor's" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fieldOfStudy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Field of study</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: Computer Science" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Year</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. 2018" maxLength={4} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Year</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="e.g. 2022"
                    maxLength={4}
                    disabled={!degreeCompletedValue}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="degreeCompleted"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-3 pt-1">
                <Switch
                  checked={field.value}
                  onCheckedChange={(c) => {
                    field.onChange(c);
                    onDegreeCompleted(c);
                  }}
                />
                <FormLabel className="mb-0">
                  {field.value ? "Degree Completed" : "Currently Studying"}
                </FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cgpa"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  GPA / CGPA{" "}
                  <span className="text-xs text-muted-foreground font-normal">
                    (optional)
                  </span>
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. 3.76/4.0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <TiptapEditor field={field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!formState.isDirty || isPending}>
              Save
              {isPending && <Loader className="h-4 w-4 shrink-0 animate-spin ml-1" />}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default AddEducation;
