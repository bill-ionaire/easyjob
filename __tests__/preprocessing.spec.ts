import { convertResumeToText } from "@/lib/ai/tools/preprocessing";
import { Resume } from "@/models/profile.model";

// Minimal resume fixture shared across tests
const baseResume: Resume = {
  id: "resume-1",
  title: "My Resume",
};

describe("convertResumeToText - certification sections", () => {
  it("includes certification section with title and organization", async () => {
    const resume: Resume = {
      ...baseResume,
      certifications: [
        {
          id: "cert-1",
          title: "AWS Certified Solutions Architect",
          organization: "Amazon Web Services",
        },
      ],
    };

    const text = await convertResumeToText(resume);
    expect(text).toContain("## CERTIFICATIONS");
    expect(text).toContain("Title: AWS Certified Solutions Architect");
    expect(text).toContain("Organization: Amazon Web Services");
  });

  it("includes issue and expiration dates when present", async () => {
    const resume: Resume = {
      ...baseResume,
      certifications: [
        {
          id: "cert-1",
          title: "AWS SAA",
          organization: "AWS",
          issueDate: new Date("2023-06-01"),
          expirationDate: new Date("2026-06-01"),
        },
      ],
    };

    const text = await convertResumeToText(resume);
    expect(text).toContain("Issue Date:");
    expect(text).toContain("Expiration Date:");
  });

  it("shows 'No Expiration' when issueDate present but no expirationDate", async () => {
    const resume: Resume = {
      ...baseResume,
      certifications: [
        {
          id: "cert-1",
          title: "AWS SAA",
          organization: "AWS",
          issueDate: new Date("2023-06-01"),
        },
      ],
    };

    const text = await convertResumeToText(resume);
    expect(text).toContain("No Expiration");
  });

  it("omits date lines when no issueDate is provided", async () => {
    const resume: Resume = {
      ...baseResume,
      certifications: [
        {
          id: "cert-1",
          title: "AWS SAA",
          organization: "AWS",
        },
      ],
    };

    const text = await convertResumeToText(resume);
    expect(text).not.toContain("Issue Date:");
    expect(text).not.toContain("Expiration Date:");
    expect(text).not.toContain("No Expiration");
  });

  it("includes credential URL when present", async () => {
    const resume: Resume = {
      ...baseResume,
      certifications: [
        {
          id: "cert-1",
          title: "AWS SAA",
          organization: "AWS",
          credentialUrl: "https://credly.com/badges/abc",
        },
      ],
    };

    const text = await convertResumeToText(resume);
    expect(text).toContain("Credential URL: https://credly.com/badges/abc");
  });

  it("omits certification section when certifications is empty", async () => {
    const resume: Resume = {
      ...baseResume,
      certifications: [],
    };

    const text = await convertResumeToText(resume);
    expect(text).not.toContain("## CERTIFICATIONS");
  });

  it("includes multiple certifications", async () => {
    const resume: Resume = {
      ...baseResume,
      certifications: [
        { id: "cert-1", title: "AWS SAA", organization: "Amazon" },
        { id: "cert-2", title: "GCP Associate", organization: "Google" },
      ],
    };

    const text = await convertResumeToText(resume);
    expect(text).toContain("Title: AWS SAA");
    expect(text).toContain("Title: GCP Associate");
    expect(text).toContain("Organization: Amazon");
    expect(text).toContain("Organization: Google");
  });

  it("includes certifications alongside summary", async () => {
    const resume: Resume = {
      ...baseResume,
      summary: "Experienced engineer.",
      certifications: [
        { id: "cert-1", title: "AWS SAA", organization: "Amazon" },
      ],
    };

    const text = await convertResumeToText(resume);
    expect(text).toContain("## SUMMARY");
    expect(text).toContain("## CERTIFICATIONS");
    expect(text).toContain("Title: AWS SAA");
  });
});
