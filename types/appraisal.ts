export interface AppraisalCategory {
  id: string;
  name: string;
  description: string;
  weight: number; // Weight for overall score calculation
}

export interface AppraisalRating {
  categoryId: string;
  score: number; // 0-5 with decimal fractions
  comments: string;
}

export interface EmployeeSelfAssessment {
  categoryId: string;
  selfScore: number; // 0-5 with decimal fractions
  selfComments: string;
  achievements: string; // What they think they did well
  challenges: string; // What they found challenging
  goals: string; // Their goals for next period
}

export interface AppraisalTemplate {
  id: string;
  name: string;
  description: string;
  categories: AppraisalCategory[];
}

export interface AppraisalData {
  employeeName: string;
  employeeId: string;
  reviewerName: string;
  reviewDate: string;
  employeeGender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  template: AppraisalTemplate;
  ratings: AppraisalRating[];
  selfAssessment?: EmployeeSelfAssessment[]; // Optional self-assessment
  overallScore: number;
  generatedFeedback: string;
}

export interface LLMResponse {
  success: boolean;
  feedback: string;
  error?: string;
} 