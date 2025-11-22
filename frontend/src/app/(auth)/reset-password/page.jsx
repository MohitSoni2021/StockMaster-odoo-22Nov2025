import { ApplicationDetails } from '@/Constants/ApplicationDetails';
import ResetPasswordForm from './components/ResetPasswordForm';
import { Suspense } from 'react';

export const metadata = {
  title: `${ApplicationDetails.ApplicationName} | Reset Password`,
  description: "Reset your password",
};

export default function ResetPassword() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
