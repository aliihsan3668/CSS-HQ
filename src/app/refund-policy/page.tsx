import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Refund Policy — CSS HQ",
};

export default function RefundPolicyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-extrabold tracking-tight">Refund Policy</h1>
      <p className="mt-2 text-muted-foreground">Last updated: June 2025</p>

      <Card className="mt-8">
        <CardContent className="p-6 prose prose-sm max-w-none dark:prose-invert">
          <h2>Before access is granted</h2>
          <p>
            If your payment is rejected (wrong amount, unclear screenshot, etc.),
            you are not charged and your access is simply not granted. You may
            re-submit with the correct payment details at any time. No refund
            request is needed in this case.
          </p>

          <h2>After access is granted</h2>
          <p>
            CSS HQ sells digital products (PDF notes). Once access is granted
            and you can download or view the notes, we are unable to offer
            refunds. This is standard for digital products because the content
            cannot be "returned" once it has been accessed or downloaded.
          </p>

          <h2>If something goes wrong</h2>
          <p>
            If you experience a technical issue accessing your notes, or you
            believe you were charged incorrectly, contact us immediately:
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
          <p>
            We will make every reasonable effort to resolve the issue, including
            re-granting access or providing the content through an alternative
            method.
          </p>

          <h2>Quality guarantee</h2>
          <p>
            We stand behind our 95% exam coverage claim. If a major topic within
            any purchased subject's scope is missing from the notes, contact us
            and we will add it for free in the next update — at no extra cost to
            you.
          </p>

          <h2>Disputes</h2>
          <p>
            For any unresolved disputes, please reach out via WhatsApp or email
            first. We are a small, honest operation and we want every customer
            to be satisfied.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
