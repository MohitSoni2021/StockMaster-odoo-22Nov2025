import { ApplicationDetails } from '@/Constants/ApplicationDetails';
import ResetPasswordForm from './components/ResetPasswordForm';

export const metadata = {
  title: `${ApplicationDetails.ApplicationName} | Reset Password`,
  description: "Reset your password",
};

export default function ResetPassword() {
  return <ResetPasswordForm />;
}
