import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
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
import { Loader } from "lucide-react";
import { useEffect, useTransition } from "react";
import { toast } from "../ui/use-toast";
import { z } from "zod";
import TiptapEditor from "../TiptapEditor";
import {
  addResumeSummary,
  updateResumeSummary,
} from "@/actions/profile.actions";

interface AddResumeSummaryProps {
  resumeId: string | undefined;
  dialogOpen: boolean;
  setDialogOpen: (e: boolean) => void;
  summaryContent?: string | null;
}

function AddResumeSummary({
  resumeId,
  dialogOpen,
  setDialogOpen,
  summaryContent,
}: AddResumeSummaryProps) {
  const [isPending, startTransition] = useTransition();

  const isEditing = !!summaryContent;
  const pageTitle = isEditing ? "Edit Summary" : "Add Summary";

  const form = useForm<z.infer<typeof AddSummarySectionFormSchema>>({
    resolver: zodResolver(AddSummarySectionFormSchema),
    defaultValues: {
      resumeId,
      content: "",
    },
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
          description: `Summary has been ${isEditing ? "updated" : "created"} successfully`,
        });
      }
    });
  };

  const closeDialog = () => setDialogOpen(false);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="lg:max-h-screen overflow-y-scroll">
        <DialogHeader>
          <DialogTitle>{pageTitle}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4 p-2"
          >
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Resume Summary</FormLabel>
                  <FormControl>
                    <TiptapEditor field={field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="mt-4">
              <Button
                type="reset"
                variant="outline"
                onClick={closeDialog}
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

export default AddResumeSummary;
