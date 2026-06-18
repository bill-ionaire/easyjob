import { useForm } from "react-hook-form";
import { AddSummarySectionFormSchema } from "@/models/addSummaryForm.schema";
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
import { Loader, X } from "lucide-react";
import { useEffect, useTransition } from "react";
import { toast } from "../ui/use-toast";
import { z } from "zod";
import TiptapEditor from "../TiptapEditor";
import { addResumeSummary, updateResumeSummary } from "@/actions/profile.actions";

interface AddResumeSummaryProps {
  resumeId: string | undefined;
  summaryContent?: string | null;
  onClose: () => void;
}

function AddResumeSummary({
  resumeId,
  summaryContent,
  onClose,
}: AddResumeSummaryProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!summaryContent;

  const form = useForm<z.infer<typeof AddSummarySectionFormSchema>>({
    resolver: zodResolver(AddSummarySectionFormSchema),
    defaultValues: { resumeId, content: "" },
  });

  const { reset, formState } = form;

  useEffect(() => {
    if (summaryContent) {
      reset({ resumeId, content: summaryContent }, { keepDefaultValues: true });
    } else {
      reset({ resumeId, content: "" });
    }
  }, [summaryContent, resumeId, reset]);

  const onSubmit = (data: z.infer<typeof AddSummarySectionFormSchema>) => {
    startTransition(async () => {
      const res = isEditing
        ? await updateResumeSummary(data)
        : await addResumeSummary(data);
      if (!res.success) {
        toast({ variant: "destructive", title: "Error!", description: res.message });
      } else {
        reset();
        onClose();
        toast({
          variant: "success",
          description: `Summary has been ${isEditing ? "updated" : "created"} successfully`,
        });
      }
    });
  };

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          {isEditing ? "Edit Summary" : "Add Summary"}
        </h3>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resume Summary</FormLabel>
                <FormControl>
                  <TiptapEditor field={field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end gap-2 pt-1">
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

export default AddResumeSummary;
