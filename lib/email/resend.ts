import { Resend } from "resend";

let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY!);
  }
  return resendInstance;
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  const resend = getResend();
  const fromAddress =
    params.from ?? process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

  try {
    const { error } = await resend.emails.send({
      from: fromAddress,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    if (error) {
      console.error("[Resend] Error enviando email:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[Resend] Excepción enviando email:", err);
    return false;
  }
}
