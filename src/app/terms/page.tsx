import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Terms of Use — CSS HQ",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-extrabold tracking-tight">Terms of Use</h1>
      <p className="mt-2 text-muted-foreground">Last updated: June 2025</p>

      <Card className="mt-8">
        <CardContent className="p-6 prose prose-sm max-w-none dark:prose-invert">
          <h2>1. Acceptance of terms</h2>
          <p>
            By accessing or using CSS HQ (the "Platform"), you agree to be bound
            by these Terms of Use. If you do not agree, please do not use the
            Platform.
          </p>

          <h2>2. Personal use only</h2>
          <p>
            When you purchase notes, you are granted a single-user, non-exclusive,
            non-transferable license to access and read the content for your
            personal exam preparation. You may NOT:
          </p>
          <ul>
            <li>Share, resell, or distribute the notes (in whole or part)</li>
            <li>Upload the notes to any public website, forum, or group</li>
            <li>Use the content commercially</li>
            <li>Remove any copyright or attribution notices</li>
          </ul>

          <h2>3. Intellectual property</h2>
          <p>
            All notes, questions, answers, MCQs, outlines, and analysis on the
            Platform are the intellectual property of CSS HQ / Ali Ihsan. They
            are protected under applicable copyright laws. Unauthorized sharing
            or reproduction will result in immediate termination of access
            without refund, and may be pursued legally.
          </p>

          <h2>4. Payment and access</h2>
          <p>
            Payments are processed manually via JazzCash, EasyPaisa, NayaPay,
            SadaPay, or Payoneer. After you submit a payment receipt, access is
            granted at our discretion once the payment is verified. We reserve
            the right to refuse access if a payment cannot be verified.
          </p>

          <h2>5. No guarantee of exam success</h2>
          <p>
            While our notes are built around a 95% exam coverage claim based on
            past paper analysis, we do not guarantee any specific exam result.
            Your success depends on your own effort, preparation, and
            performance on exam day.
          </p>

          <h2>6. Account security</h2>
          <p>
            You are responsible for keeping your account credentials secure. Do
            not share your login with others. If you suspect unauthorized access,
            contact us immediately so we can reset your account.
          </p>

          <h2>7. Changes to terms</h2>
          <p>
            We may update these Terms from time to time. Continued use of the
            Platform after changes constitutes acceptance of the new Terms.
          </p>

          <h2>8. Contact</h2>
          <p>
            For any questions about these Terms, contact us:
          </p>
          <ul>
            <li>
              WhatsApp:{" "}
              <a href="https://wa.me/923085202620" className="text-primary">
                +92 308 5202620
              </a>
            </li>
            <li>
              Email:{" "}
              <a href="mailto:aliihsan.devs@gmail.com" className="text-primary">
                aliihsan.devs@gmail.com
              </a>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
