type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  degree: string;
  branch: string;
  gender: string;
  interests: string[];
  phone_number: number;
  photo_url: string;
  roll_number: number;
  year: number;
  about: string;
  college: string;
  is_somaiya_student: boolean;
};

type UserResponse = {
  error: boolean;
  message?: string;
  user?: User;
};
