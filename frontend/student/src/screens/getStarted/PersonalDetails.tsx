import React, { useRef } from 'react';
import Quote from '../../components/Quote';
import { useFormContext } from 'react-hook-form';
import { PersonalDetailsSchema } from './validation';
import SignatureCanvas from 'react-signature-canvas';

interface Props {
  setCurrentStep: React.Dispatch<React.SetStateAction<string>>;
}

export default function PersonalDetails({ setCurrentStep }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useFormContext<PersonalDetailsSchema>(); // Use the correct schema type

  const signatureRef = useRef<SignatureCanvas>(null);

  const onSubmit = () => {
    setCurrentStep('EducationalDetails');
  };

  const handleGenderChange = (value: string) => {
    setValue('gender', value);
  };

  return (
    <div className="flex flex-col justify-between min-h-screen p-6 ">
      <form onSubmit={handleSubmit(onSubmit)} className="font-fira">
        <p className="mb-4 text-2xl font-bold font-fira text-foreground ">
          Personal Details
        </p>
        <p className="mb-4 text-xl font-fira text-foreground ">
          Fill out your personal details
        </p>
        <div className="mb-6 space-y-6">
          <div>
            <input
              {...register('phone_number')}
              className="min-h-10 w-full max-w-80 rounded-xl px-4 outline outline-1 bg-card text-foreground"
              placeholder="Mobile Number"
              type="number"
            />
            {errors.phone_number && (
              <p className="text-red-500">{errors.phone_number?.message}</p>
            )}
          </div>

{/*           <div>
            <input
              {...register('roll_number')}
              className="min-h-10 w-full max-w-80 rounded-xl px-4 outline outline-1 bg-card text-foreground"
              placeholder="Student Id"
              type="number"
            />
            {errors.roll_number && (
              <p className="text-red-500">{errors.roll_number?.message}</p>
            )}
          </div> */}

          <div>
            <select
              className="min-h-10 w-full max-w-80 rounded-xl px-4 outline outline-1 bg-card text-foreground"
              onChange={(e) => handleGenderChange(e.target.value as string)}
              //value={getValues('gender')} // Use getValues instead of watch
              color="blue"
              defaultValue="Select Gender"
            >
              <option disabled>Select Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
            {errors.gender && (
              <p className="text-red-500">{errors.gender?.message as string}</p>
            )}
          </div>

          <div>
            <p className="text-foreground">Draw your signature</p>
            <SignatureCanvas
              ref={signatureRef}
              canvasProps={{
                className: 'w-full h-32 border border-gray-300 bg-white',
              }}
              onEnd={() => {
                const signatureData = signatureRef.current?.toData();
                setValue('signature', signatureData || []);
              }}
            />
            <button
              type="button"
              onClick={() => {
                signatureRef.current?.clear();
                setValue('signature', []);
              }}
              className="mt-2 btn btn-primary border-2 border-mute px-2 py-1 rounded-full text-sm text-mute hover:bg-card/80 active:bg-card/60"
            >
              Clear
            </button>
            {errors.signature && (
              <p className="text-red-500">{errors.signature?.message}</p>
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="btn btn-primary border-2 border-vitality px-2 py-1 rounded-full text-vitality"
          >
            Continue
          </button>
        </div>
      </form>
      <div>
        <Quote />
      </div>
    </div>
  );
}
