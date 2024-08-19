import * as yup from 'yup';

export const personalDetailsSchema = (currentStep: string) =>
  yup.object({
    mobileNumber: yup
      .string()
      .matches(/^\d{10}$/, 'Mobile number must be 10 digits')
      .required('Mobile number is required'),

    studentId: yup.string().required('Student ID is required'),

    gender: yup.string().required('Gender is required'),

    graduationYear: yup
      .number()
      .typeError('Graduation year must be a number')
      .when([], {
        is: () => currentStep === 'EducationalDetails',
        then: (schema) => schema.required('Graduation year is required'),
        otherwise: (schema) => schema.notRequired(),
      }),

    department: yup.string().when([], {
      is: () => currentStep === 'EducationalDetails',
      then: (schema) => schema.required('Department is required'),
      otherwise: (schema) => schema.notRequired(),
    }),

    interests: yup
      .array()
      .of(yup.string())
      .when([], {
        is: () => currentStep === 'Interest',
        then: (schema) => schema.required('Interests are required'),
        otherwise: (schema) => schema.notRequired(),
      }),
  });

export type PersonalDetailsSchema = yup.InferType<
  ReturnType<typeof personalDetailsSchema>
>;
