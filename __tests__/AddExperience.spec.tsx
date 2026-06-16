import AddExperience from "@/components/profile/AddExperience";
import { addExperience, updateExperience } from "@/actions/profile.actions";
import { screen, render, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WorkExperience } from "@/models/profile.model";
import { toast } from "@/components/ui/use-toast";

vi.mock("@/actions/profile.actions", () => ({
  addExperience: vi.fn(),
  updateExperience: vi.fn(),
}));

vi.mock("@/components/TiptapEditor", () => ({
  default: function TiptapEditor({ field }: any) {
    return (
      <textarea
        data-testid="tiptap-editor"
        value={field.value || ""}
        onChange={(e) => field.onChange(e.target.value)}
        placeholder="Enter job description"
      />
    );
  },
}));

vi.mock("@/components/DatePicker", () => ({
  DatePicker: ({ field, isEnabled }: any) => {
    return (
      <input
        data-testid={`datepicker-${field.name}`}
        type="date"
        value={
          field.value ? new Date(field.value).toISOString().split("T")[0] : ""
        }
        onChange={(e) =>
          field.onChange(e.target.value ? new Date(e.target.value) : undefined)
        }
        disabled={!isEnabled}
      />
    );
  },
}));

vi.mock("@/components/ui/use-toast", () => ({
  toast: vi.fn(),
}));

const mockExperiences: WorkExperience[] = [
  {
    id: "exp-1",
    company: "Tech Corp",
    jobTitle: "Software Engineer",
    location: "New York, NY",
    startDate: new Date("2020-01-01"),
    endDate: new Date("2022-12-31"),
    currentJob: false,
    description: "Worked on various projects",
  },
];

describe("AddExperience Component", () => {
  const mockSetDialogOpen = vi.fn();
  const mockResumeId = "resume-123";
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render Add Experience dialog with correct title", async () => {
    render(
      <AddExperience
        resumeId={mockResumeId}
        experienceId={undefined}
        experiences={undefined}
        dialogOpen={true}
        setDialogOpen={mockSetDialogOpen}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Add Experience")).toBeInTheDocument();
    });
  });

  it("should render Edit Experience dialog when experienceId is provided", async () => {
    render(
      <AddExperience
        resumeId={mockResumeId}
        experienceId="exp-1"
        experiences={mockExperiences}
        dialogOpen={true}
        setDialogOpen={mockSetDialogOpen}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Edit Experience")).toBeInTheDocument();
    });
  });

  it("should render all form fields correctly", async () => {
    render(
      <AddExperience
        resumeId={mockResumeId}
        experienceId={undefined}
        experiences={undefined}
        dialogOpen={true}
        setDialogOpen={mockSetDialogOpen}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/job title/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText("e.g. Software Engineer")).toBeInTheDocument();
      expect(screen.getByText(/company/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText("e.g. Acme Corp")).toBeInTheDocument();
      expect(screen.getByText(/job location/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText("e.g. Toronto, ON")).toBeInTheDocument();
      expect(screen.getByText(/start date/i)).toBeInTheDocument();
      expect(screen.getByTestId("datepicker-startDate")).toBeInTheDocument();
      expect(screen.getByText(/end date/i)).toBeInTheDocument();
      expect(screen.getByTestId("datepicker-endDate")).toBeInTheDocument();
      expect(screen.getByText(/job description/i)).toBeInTheDocument();
      expect(screen.getByTestId("tiptap-editor")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    });
  });

  it("should populate form fields when editing an experience", async () => {
    render(
      <AddExperience
        resumeId={mockResumeId}
        experienceId="exp-1"
        experiences={mockExperiences}
        dialogOpen={true}
        setDialogOpen={mockSetDialogOpen}
      />
    );

    await waitFor(() => {
      const titleInput = screen.getByPlaceholderText("e.g. Software Engineer") as HTMLInputElement;
      expect(titleInput.value).toBe("Software Engineer");

      const companyInput = screen.getByPlaceholderText("e.g. Acme Corp") as HTMLInputElement;
      expect(companyInput.value).toBe("Tech Corp");

      const locationInput = screen.getByPlaceholderText("e.g. Toronto, ON") as HTMLInputElement;
      expect(locationInput.value).toBe("New York, NY");
    });
  });

  it("should close dialog when Cancel button is clicked", async () => {
    render(
      <AddExperience
        resumeId={mockResumeId}
        experienceId={undefined}
        experiences={undefined}
        dialogOpen={true}
        setDialogOpen={mockSetDialogOpen}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockSetDialogOpen).toHaveBeenCalledWith(false);
  });

  it("should disable Save button when form is not dirty", async () => {
    render(
      <AddExperience
        resumeId={mockResumeId}
        experienceId={undefined}
        experiences={undefined}
        dialogOpen={true}
        setDialogOpen={mockSetDialogOpen}
      />
    );

    await waitFor(() => {
      const saveButton = screen.getByRole("button", { name: /save/i });
      expect(saveButton).toBeDisabled();
    });
  });

  it("should disable end date when current job is checked", async () => {
    render(
      <AddExperience
        resumeId={mockResumeId}
        experienceId={undefined}
        experiences={undefined}
        dialogOpen={true}
        setDialogOpen={mockSetDialogOpen}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole("switch")).toBeInTheDocument();
    });

    const currentJobSwitch = screen.getByRole("switch");
    const endDateInput = screen.getByTestId("datepicker-endDate") as HTMLInputElement;

    expect(endDateInput).not.toBeDisabled();

    await user.click(currentJobSwitch);

    await waitFor(() => {
      expect(endDateInput).toBeDisabled();
    });
  });

  it("should toggle current job label text", async () => {
    render(
      <AddExperience
        resumeId={mockResumeId}
        experienceId={undefined}
        experiences={undefined}
        dialogOpen={true}
        setDialogOpen={mockSetDialogOpen}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/job ended/i)).toBeInTheDocument();
    });

    const currentJobSwitch = screen.getByRole("switch");
    await user.click(currentJobSwitch);

    await waitFor(() => {
      expect(screen.getByText(/current job/i)).toBeInTheDocument();
    });
  });

  it("should call addExperience when submitting a new experience", async () => {
    (addExperience as any).mockResolvedValue({
      success: true,
      message: "Experience added successfully",
    });

    render(
      <AddExperience
        resumeId={mockResumeId}
        experienceId={undefined}
        experiences={undefined}
        dialogOpen={true}
        setDialogOpen={mockSetDialogOpen}
      />
    );

    const titleInput = screen.getByPlaceholderText("e.g. Software Engineer");
    const companyInput = screen.getByPlaceholderText("e.g. Acme Corp");
    const locationInput = screen.getByPlaceholderText("e.g. Toronto, ON");
    const startDateInput = screen.getByTestId("datepicker-startDate");
    const jobDescriptionEditor = screen.getByTestId("tiptap-editor");

    fireEvent.change(titleInput, { target: { value: "Senior Engineer" } });
    fireEvent.change(companyInput, { target: { value: "Big Corp" } });
    fireEvent.change(locationInput, { target: { value: "Toronto, ON" } });
    fireEvent.change(startDateInput, { target: { value: "2023-01-01" } });
    fireEvent.change(jobDescriptionEditor, { target: { value: "Developed amazing features" } });

    await waitFor(() => {
      const saveButton = screen.getByRole("button", { name: /save/i });
      expect(saveButton).not.toBeDisabled();
    });

    const saveButton = screen.getByRole("button", { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(addExperience).toHaveBeenCalledTimes(1);
      expect(addExperience).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Senior Engineer",
          company: "Big Corp",
          location: "Toronto, ON",
          jobDescription: "Developed amazing features",
        })
      );
    });
  });

  it("should call updateExperience when editing an existing experience", async () => {
    (updateExperience as any).mockResolvedValue({
      success: true,
      message: "Experience updated successfully",
    });

    render(
      <AddExperience
        resumeId={mockResumeId}
        experienceId="exp-1"
        experiences={mockExperiences}
        dialogOpen={true}
        setDialogOpen={mockSetDialogOpen}
      />
    );

    await waitFor(() => {
      const titleInput = screen.getByPlaceholderText("e.g. Software Engineer") as HTMLInputElement;
      expect(titleInput.value).toBe("Software Engineer");
    });

    const titleInput = screen.getByPlaceholderText("e.g. Software Engineer");
    await user.clear(titleInput);
    await user.type(titleInput, "Senior Engineer");

    await waitFor(() => {
      const saveButton = screen.getByRole("button", { name: /save/i });
      expect(saveButton).not.toBeDisabled();
    });

    const saveButton = screen.getByRole("button", { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(updateExperience).toHaveBeenCalledTimes(1);
      expect(updateExperience).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "exp-1",
          title: "Senior Engineer",
        })
      );
    });
  });

  it("should close dialog and show success toast on successful submission", async () => {
    (addExperience as any).mockResolvedValue({
      success: true,
      message: "Experience added successfully",
    });

    render(
      <AddExperience
        resumeId={mockResumeId}
        experienceId={undefined}
        experiences={undefined}
        dialogOpen={true}
        setDialogOpen={mockSetDialogOpen}
      />
    );

    const titleInput = screen.getByPlaceholderText("e.g. Software Engineer");
    const companyInput = screen.getByPlaceholderText("e.g. Acme Corp");
    const locationInput = screen.getByPlaceholderText("e.g. Toronto, ON");
    const startDateInput = screen.getByTestId("datepicker-startDate");
    const jobDescriptionEditor = screen.getByTestId("tiptap-editor");

    fireEvent.change(titleInput, { target: { value: "Senior Engineer" } });
    fireEvent.change(companyInput, { target: { value: "Big Corp" } });
    fireEvent.change(locationInput, { target: { value: "Toronto, ON" } });
    fireEvent.change(startDateInput, { target: { value: "2023-01-01" } });
    fireEvent.change(jobDescriptionEditor, { target: { value: "Developed amazing features" } });

    await waitFor(() => {
      const saveButton = screen.getByRole("button", { name: /save/i });
      expect(saveButton).not.toBeDisabled();
    });

    const saveButton = screen.getByRole("button", { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockSetDialogOpen).toHaveBeenCalledWith(false);
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "success",
          description: "Experience has been added successfully",
        })
      );
    });
  });

  it("should show error toast on failed submission", async () => {
    (addExperience as any).mockResolvedValue({
      success: false,
      message: "Failed to add experience",
    });

    render(
      <AddExperience
        resumeId={mockResumeId}
        experienceId={undefined}
        experiences={undefined}
        dialogOpen={true}
        setDialogOpen={mockSetDialogOpen}
      />
    );

    const titleInput = screen.getByPlaceholderText("e.g. Software Engineer");
    const companyInput = screen.getByPlaceholderText("e.g. Acme Corp");
    const locationInput = screen.getByPlaceholderText("e.g. Toronto, ON");
    const startDateInput = screen.getByTestId("datepicker-startDate");
    const jobDescriptionEditor = screen.getByTestId("tiptap-editor");

    fireEvent.change(titleInput, { target: { value: "Senior Engineer" } });
    fireEvent.change(companyInput, { target: { value: "Big Corp" } });
    fireEvent.change(locationInput, { target: { value: "Toronto, ON" } });
    fireEvent.change(startDateInput, { target: { value: "2023-01-01" } });
    fireEvent.change(jobDescriptionEditor, { target: { value: "Developed amazing features" } });

    await waitFor(() => {
      const saveButton = screen.getByRole("button", { name: /save/i });
      expect(saveButton).not.toBeDisabled();
    });

    const saveButton = screen.getByRole("button", { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
          title: "Error!",
          description: "Failed to add experience",
        })
      );
      expect(mockSetDialogOpen).not.toHaveBeenCalledWith(false);
    });
  });

  it("should not render dialog when dialogOpen is false", () => {
    render(
      <AddExperience
        resumeId={mockResumeId}
        experienceId={undefined}
        experiences={undefined}
        dialogOpen={false}
        setDialogOpen={mockSetDialogOpen}
      />
    );

    expect(screen.queryByText("Add Experience")).not.toBeInTheDocument();
  });
});
