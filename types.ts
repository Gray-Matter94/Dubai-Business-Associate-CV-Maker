export interface CVData {
  fullName: string;
  professionalTitle: string;
  contact: {
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
  };
  summary: string;
  skills: string[];
  experience: {
    role: string;
    company: string;
    location: string;
    dates: string;
    achievements: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    location: string;
    year: string;
  }[];
  languages?: string[];
}

export enum AppState {
  INPUT = 'INPUT',
  PROCESSING = 'PROCESSING',
  PREVIEW = 'PREVIEW',
  ERROR = 'ERROR'
}