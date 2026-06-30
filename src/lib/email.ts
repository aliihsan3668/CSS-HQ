import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";

function isResendConfigured() {
  return !!process.env.RESEND_API_KEY && !!process.env.RESEND_FROM_EMAIL;
}

async function sendViaResend(to: string, subject: string, html: string) {
  if (!isResendConfigured()) {
    console.log(`[email:dev] To: ${to} | Subject: ${subject}`);
    console.log(html.slice(0, 200) + "...");
    return;
  }
  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject,
    html,
  });
}

export async function sendOrderNotification(orderId: string) {
  const s = await getSettings();
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { user: true, items: true },
  });
  if (!order) return;
  const adminEmail = s.SUPPORT_EMAIL;
  const itemsHtml = order.items
    .map((i) => `<li>${i.title} — PKR ${i.pricePkr.toLocaleString()}</li>`)
    .join("");
  const html = `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
      <h2 style="color:#0f766e;">New Order Submitted — CSS HQ</h2>
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Student:</strong> ${order.user.name || ""} (${order.user.email})</p>
      <p><strong>Phone:</strong> ${order.user.phone || "—"}</p>
      <p><strong>Amount:</strong> PKR ${order.totalAmountPkr.toLocaleString()}</p>
      <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
      <p><strong>Notes:</strong> ${order.paymentNotes || "—"}</p>
      <h3 style="margin-top:24px;">Items</h3>
      <ul>${itemsHtml}</ul>
      <p style="margin-top:24px;">
        <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/admin/orders/${order.id}"
           style="background:#0f766e;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;">
          Review & Approve
        </a>
      </p>
    </div>
  `;
  await sendViaResend(
    adminEmail,
    `[CSS HQ] New order #${order.id.slice(-6)} — PKR ${order.totalAmountPkr.toLocaleString()}`,
    html
  );
}

export async function sendOrderApproved(orderId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { user: true, items: true },
  });
  if (!order) return;
  const itemsHtml = order.items.map((i) => `<li>${i.title}</li>`).join("");
  const html = `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
      <h2 style="color:#0f766e;">Your notes are ready! — CSS HQ</h2>
      <p>Hi ${order.user.name || "there"},</p>
      <p>Great news — your order has been approved and your notes are now unlocked.</p>
      <h3>Items unlocked</h3>
      <ul>${itemsHtml}</ul>
      <p style="margin-top:24px;">
        <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard"
           style="background:#0f766e;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;">
          Open My Dashboard
        </a>
      </p>
      <p style="margin-top:16px;color:#666;">Best of luck with your prep!<br/>— CSS HQ</p>
    </div>
  `;
  await sendViaResend(order.user.email, "Your CSS HQ notes are unlocked 🎉", html);
}

export async function sendOrderRejected(orderId: string, reason: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { user: true },
  });
  if (!order) return;
  const html = `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
      <h2 style="color:#b91c1c;">Order needs attention — CSS HQ</h2>
      <p>Hi ${order.user.name || "there"},</p>
      <p>We couldn't verify your payment for order <strong>#${order.id.slice(-6)}</strong>.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
      <p>If this is a mistake, please reply to this email or WhatsApp us with your transaction ID.</p>
      <p style="margin-top:24px;">— CSS HQ</p>
    </div>
  `;
  await sendViaResend(
    order.user.email,
    `Action needed for your CSS HQ order #${order.id.slice(-6)}`,
    html
  );
}
