export interface Resume {
  id?: string;
  userId?: string;
  jobProfileId?: string;
  title: string;
  summary?: string;
  contactInfo?: ContactInfo;
  skills?: SkillCategory[];
  experiences?: WorkExperience[];
  educations?: Education[];
  certifications?: LicenseOrCertification[];
  createdAt?: Date;
  updatedAt?: Date;
  _count?: {
    Job?: number;
  };
}

export interface ContactInfo {
  firstName: string;
  lastName: string;
  headline: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface SkillCategory {
  id?: string;
  label: string;
  details: string[];
}

export interface WorkExperience {
  id?: string;
  company: string;
  jobTitle: string;
  location: string;
  startDate: Date | string;
  endDate?: Date | string | null;
  currentJob?: boolean;
  description?: string;
}

export interface Education {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  startDate: Date | string;
  endDate?: Date | string | null;
  description?: string;
}

export interface LicenseOrCertification {
  id?: string;
  title: string;
  organization: string;
  issueDate?: Date | string | null;
  expirationDate?: Date | string | null;
  credentialUrl?: string;
}

export interface CoverLetter {
  id?: string;
  userId?: string;
  title: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
  _count?: {
    Job?: number;
  };
}
