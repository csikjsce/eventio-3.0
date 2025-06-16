import * as yup from 'yup';

export const personalDetailsSchema = (currentStep: string) =>
  yup.object({
    phone_number: yup
      .string()
      .matches(/^\d{10}$/, 'Mobile number must be 10 digits')
      .required('Mobile number is required'),

    roll_number: yup.string(),

    gender: yup
      .string()
      .is(['MALE', 'FEMALE'], 'Gender is required.')
      .required('Gender is required'),

    signature: yup
      .array()
      .of(
        yup.array().of(
          yup.object().shape({
            x: yup.number().required('X coordinate is required'),
            y: yup.number().required('Y coordinate is required'),
            time: yup.number().required('Time is required'),
            color: yup.string(),
          }),
        ),
      )
      .required('Signature is required'),

    year: yup
      .number()
      .typeError('Graduation year must be a number')
      .when([], {
        is: () => currentStep === 'EducationalDetails',
        then: (schema) => schema.required('Graduation year is required'),
        otherwise: (schema) => schema.notRequired(),
      }),

    branch: yup.string().when([], {
      is: () => currentStep === 'EducationalDetails',
      then: (schema) => schema.required('Branch is required'),
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
