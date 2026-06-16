"use client";
import {
  FilePenLine,
  MoreHorizontal,
  Pencil,
  Trash,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Resume } from "@/models/profile.model";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "../ui/button";
import { useMemo, useState } from "react";
import { toast } from "../ui/use-toast";
import { deleteResumeById } from "@/actions/profile.actions";
import { DeleteAlertDialog } from "../DeleteAlertDialog";

type ResumeTableProps = {
  resumes: Resume[];
  onEditResume: (resume: Resume) => void;
  reloadResumes: () => void;
};

function ResumeTable({ resumes, onEditResume, reloadResumes }: ResumeTableProps) {
  const [alertOpen, setAlertOpen] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState<Resume | undefined>();

  const onDeleteResume = useMemo(
    () => (resume: Resume) => {
      if (!resume.id) return;
      setAlertOpen(true);
      setResumeToDelete(resume);
    },
    [],
  );

  const deleteResume = async (resume: Resume) => {
    if (!resume.id) return;
    if ((resume._count?.Job ?? 0) > 0) {
      return toast({
        variant: "destructive",
        title: "Error!",
        description: "Number of jobs using this resume must be 0!",
      });
    }

    const { success, message } = await deleteResumeById(resume.id);
    if (success) {
      toast({ variant: "success", description: "Resume has been deleted successfully" });
      reloadResumes();
    } else {
      toast({ variant: "destructive", title: "Error!", description: message });
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="hidden md:table-cell">Updated</TableHead>
            <TableHead>Jobs</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resumes.map((resume) => (
            <TableRow key={resume.id}>
              <TableCell className="font-medium">
                <Link href={`/dashboard/profile/resume/${resume.id}`} className="hover:underline">
                  {resume.title}
                </Link>
              </TableCell>
              <TableCell>
                {resume.createdAt && format(new Date(resume.createdAt), "PP")}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {resume.updatedAt && format(new Date(resume.updatedAt), "PP")}
              </TableCell>
              <TableCell>{resume._count?.Job ?? 0}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      aria-haspopup="true"
                      size="icon"
                      variant="ghost"
                      data-testid="document-actions-menu-btn"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => onEditResume(resume)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Resume Title
                    </DropdownMenuItem>
                    <Link href={`/dashboard/profile/resume/${resume.id}`}>
                      <DropdownMenuItem className="cursor-pointer">
                        <FilePenLine className="mr-2 h-4 w-4" />
                        View/Edit Resume
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem
                      className="text-red-600 cursor-pointer"
                      onClick={() => onDeleteResume(resume)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <DeleteAlertDialog
        pageTitle="resume"
        open={alertOpen}
        onOpenChange={setAlertOpen}
        onDelete={() => deleteResume(resumeToDelete!)}
      />
    </>
  );
}

export default ResumeTable;
