import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function resendEmail({ to, subject, html }) {
  try {
    const response = await resend.emails.send({
      from: "info@littleribboncakes.com",
      to,
      subject,
      html,
    });
    return response;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
}
export async function sendResetEmail({ to, token }) {
  const year = new Date().getFullYear();
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/index.html?token=${token}`;
  const subject = "Password Reset Request";
  const html = `
    <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Password Reset</title>
  </head>
  <body style="margin:0; padding:0; font-family:Arial, sans-serif; background:#f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 2rem 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; padding:2rem; box-shadow:0 2px 6px rgba(0,0,0,0.1);">
            <tr>
              <td style="text-align:center;">
                <h2 style="color:#333333;">Reset Your Password</h2>
                <p style="color:#555555; font-size:16px;">Hello,</p>
                <p style="color:#555555; font-size:16px;">
                  We received a request to reset your password. Click the button below to proceed.
                </p>
                <p style="margin:2rem 0;">
                  <a href="${resetUrl}" style="display:inline-block; padding:0.75rem 1.5rem; background-color:#007bff; color:#ffffff; text-decoration:none; border-radius:4px; font-weight:bold;">
                    Reset Password
                  </a>
                </p>
                <p style="color:#999999; font-size:14px;">
                  If you didn’t request this, you can safely ignore this email.
                </p>
                <hr style="margin:2rem 0; border:none; border-top:1px solid #eeeeee;" />
                <p style="color:#cccccc; font-size:12px;">
                  This link will expire in 30 minutes.<br />
                  &copy; ${year} Cooking. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>

  `;

  return await resendEmail({ to, subject, html });
}
