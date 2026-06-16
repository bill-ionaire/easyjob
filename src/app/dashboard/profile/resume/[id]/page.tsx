import { getResumeById } from "@/actions/profile.actions";
import { ResumePageView } from "@/components/profile/ResumePageView";
import { notFound } from "next/navigation";

export default async function ResumePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getResumeById(id);
  if (!result?.success || !result.data) notFound();
  return <ResumePageView resume={result.data} />;
}
