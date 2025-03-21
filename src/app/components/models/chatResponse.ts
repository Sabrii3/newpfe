export interface ChatResponse {
    subject: string;
    category: string;
    category_prob: number;
    subcategory: string;
    subcategory_prob: number;
    location: string;
    response: string;
  }