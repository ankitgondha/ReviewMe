import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/verificationEmail";
import { ApiResponse } from "../../types/ApiResponse";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    console.log("Try block of Sending Verification Email");
    await resend.emails.send({
      from: 'ankitgondha007@gmail.com',
      to: email,
      subject: 'ReviewMe Verification Code',
      react: VerificationEmail({ username, otp: verifyCode }),
      // html: '', // Add an empty string as the value for the html property
    });
    return { success: true, message: 'Verification email sent successfully.' };
  } catch (emailError) {
    console.error('Error sending verification email:', emailError);
    return { success: false, message: 'Failed to send verification email.' };
  }
}