import AddResumeSummary from "@/components/profile/AddResumeSummary";
import {
  addResumeSummary,
  updateResumeSummary,
} from "@/actions/profile.actions";
import { screen, render, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "@/components/ui/use-toast";

vi.mock("@/actions/profile.actions", () => ({
  addResumeSummary: vi.fn(),
  updateResumeSummary: vi.fn(),
}));

// Mock TiptapEditor component
vi.mock("@/components/TiptapEditor", () => ({
  default: function TiptapEditor({ field }: any) {
    return (
      <textarea
        data-testid="tiptap-editor"
        value={field.value || ""}
        onChange={(e) => field.onChange(e.target.value)}
        placeholder="Enter summary content"
      />
    );
  },
}));

// Mock toast
vi.mock("@/components/ui/use-toast", () => ({
  toast: vi.fn(),
}));

describe("AddResumeSummary Component", () => {
  const mockSetDialogOpen = vi.fn();
  const mockResumeId = "resume-123";
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render Add Summary dialog with correct title", () => {
    render(
      <AddResumeSummary
        resumeId={mockResumeId}
        dialogOpen={true}
        setDialogOpen={mockSetDialogOpen}
      />
    );

    expect(screen.getByText("Add Summary")).toBeInTheDocument();
  });

  it("should render Edit Summary dialog when summaryContent is provided", () => {
    render(
      <AddResumeSummary
        resumeId={mockResumeId}
        dialogOpen={true}
        setDialogOpen={mockSetDialogOpen}
        summaryContent="Experienced software developer"
      />
    );

    expect(screen.getByText("Edit Summary")).toBeInTheDocument();
  });

  it("should render form fields correctly", () => {
    render(
      <AddResumeSummary
        resumeId={mockResumeId}
        dialogOpen={true}
        setDialogOpen={mockSetDialogOpen}
      />
    );

    expect(screen.getByText(/resume summary/i)).toBeInTheDocument();
    expect(screen.getByTestId("tiptap-editor")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  it("should populate editor when editing a summary", () => {
    render(
      <AddResumeSummary
        resumeId={mockResumeId}
        dialogOpen={true}
        setDialogOpen={mockSetDialogOpen}
        summaryContent="Experienced software developer with 5+ years"
      />
    );

    const contentEditor = screen.getByTestId("tiptap-editor");
    expect(contentEditor).toHaveValue(
      "Experienced software developer with 5+ years"
    );
  });

  it("should close dialog when Cancel button is clicked", async () => {
    render(
      <AddResumeSummary
        resumeId={mockResumeId}
        dialogOpen={true}
        setDialogOpen={mockSetDialogOpen}
      />
    );

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockSetDialogOpen).toHaveBeenCalledWith(false);
  });

  it("should disable Save button when form is not dirty", () => {
    render(
      <AddResumeSummary
        resumeId={mockResumeId}
        dialogOpen={true}
        setDialogOpen={mockSetDialogOpen}
      />
    );

    const saveButton = screen.getByRole("button", { name: /save/i });
    expect(saveButton).toBeDisabled();
  });

  it("should call addResumeSummary when submitting a new summary", async () => {
    (addResumeSummary as any).mockResolvedValue({
      success: true,
      message: "Summary created successfully",
    });

    render(
      <AddResumeSummary
        resumeId={mockResumeId}
        dialogOpen={true}
        setDialogOpen={mockSetDialogOpen}
      />
    );

    const contentEditor = screen.getByTestId("tiptap-editor");

    fireEvent.change(contentEditor, {
      target: { value: "Experienced professional with strong skills" },
    });

    const saveButton = screen.getByRole("button", { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(addResumeSummary).toHaveBeenCalledTimes(1);
      expect(addResumeSummary).toHaveBeenCalledWith(
        expect.objectContaining({
          content: "Experienced professional with strong skills",
        })
      );
    });
  });

  it("should call updateResumeSummary when editing an existing summary", async () => {
    (updateResumeSummary as any).mockResolvedValue({
      success: true,
      message: "Summary updated successfully",
    });

    render(
      <AddResumeSummary
        resumeId={mockResumeId}
        dialogOpen={true}
        setDialogOpen={mockSetDialogOpen}
        summaryContent="Experienced software developer"
      />
    );

    const contentEditor = screen.getByTestId("tiptap-editor");
    fireEvent.change(contentEditor, {
      target: { value: "Updated professional summary content here" },
    });

    const saveButton = screen.getByRole("button", { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(updateResumeSummary).toHaveBeenCalledTimes(1);
    });
  });

  it("should close dialog and show success toast on successful submission", async () => {
    (addResumeSummary as any).mockResolvedValue({
      success: true,
      message: "Summary created successfully",
    });

    render(
      <AddResumeSummary
        resumeId={mockResumeId}
        dialogOpen={true}
        setDialogOpen={mockSetDialogOpen}
      />
    );

    const contentEditor = screen.getByTestId("tiptap-editor");
    fireEvent.change(contentEditor, {
      target: { value: "Experienced professional with strong skills" },
    });

    const saveButton = screen.getByRole("button", { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockSetDialogOpen).toHaveBeenCalledWith(false);
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "success",
          description: "Summary has been created successfully",
        })
      );
    });
  });

  it("should show error toast on failed submission", async () => {
    (addResumeSummary as any).mockResolvedValue({
      success: false,
      message: "Failed to create summary",
    });

    render(
      <AddResumeSummary
        resumeId={mockResumeId}
        dialogOpen={true}
        setDialogOpen={mockSetDialogOpen}
      />
    );

    const contentEditor = screen.getByTestId("tiptap-editor");
    fireEvent.change(contentEditor, {
      target: { value: "Experienced professional with strong skills" },
    });

    const saveButton = screen.getByRole("button", { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
          title: "Error!",
          description: "Failed to create summary",
        })
      );
      expect(mockSetDialogOpen).not.toHaveBeenCalledWith(false);
    });
  });

  it("should show updated success message when editing", async () => {
    (updateResumeSummary as any).mockResolvedValue({
      success: true,
      message: "Summary updated successfully",
    });

    render(
      <AddResumeSummary
        resumeId={mockResumeId}
        dialogOpen={true}
        setDialogOpen={mockSetDialogOpen}
        summaryContent="Experienced software developer"
      />
    );

    const contentEditor = screen.getByTestId("tiptap-editor");
    fireEvent.change(contentEditor, {
      target: { value: "Updated professional summary content here" },
    });

    const saveButton = screen.getByRole("button", { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "success",
          description: "Summary has been updated successfully",
        })
      );
    });
  });

  it("should not render dialog when dialogOpen is false", () => {
    render(
      <AddResumeSummary
        resumeId={mockResumeId}
        dialogOpen={false}
        setDialogOpen={mockSetDialogOpen}
      />
    );

    expect(screen.queryByText("Add Summary")).not.toBeInTheDocument();
  });

  it("should handle dialog open state change", async () => {
    const { rerender } = render(
      <AddResumeSummary
        resumeId={mockResumeId}
        dialogOpen={false}
        setDialogOpen={mockSetDialogOpen}
      />
    );

    expect(screen.queryByText("Add Summary")).not.toBeInTheDocument();

    rerender(
      <AddResumeSummary
        resumeId={mockResumeId}
        dialogOpen={true}
        setDialogOpen={mockSetDialogOpen}
      />
    );

    expect(screen.getByText("Add Summary")).toBeInTheDocument();
  });
});
