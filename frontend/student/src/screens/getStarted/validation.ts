import * as yup from 'yup';

export const personalDetailsSchema = yup.object({
  mobileNumber: yup
    .string()
    .matches(/^\d{10}$/, 'Mobile number must be 10 digits')
    .required('Mobile number is required'),

  studentId: yup.string().required('Student ID is required'),

  gender: yup.string().required('Gender is required'),

  graduationYear: yup
    .number()
    .typeError('Graduation year must be a number')
    .required('Graduation year is required'),

  department: yup.string().required('Department is required'),

  interests: yup.array().of(yup.string()).required('Interests are required'),
});

export type PersonalDetailsSchema = yup.InferType<typeof personalDetailsSchema>;
