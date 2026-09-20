type EmailInput = { to: string; subject: string; html: string };

export async function sendEmail({ to, subject, html }: EmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.info("[notifications] Email no enviado: faltan RESEND_API_KEY o EMAIL_FROM.", { to, subject });
    return { sent: false };
  }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!response.ok) {
      console.info("[notifications] Resend respondió con error.", { status: response.status, to, subject });
      return { sent: false };
    }
    return { sent: true };
  } catch (error) {
    console.info("[notifications] No se pudo enviar el correo.", { error: String(error), to, subject });
    return { sent: false };
  }
}
