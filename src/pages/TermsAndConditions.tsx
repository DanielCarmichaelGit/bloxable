import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TermsAndConditions() {
  const navigate = useNavigate();

  const handleReturnToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReturnToDashboard}
              className="flex items-center space-x-2"
            >
              <Home className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-2xl font-bold">Terms and Conditions</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Terms and Conditions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing and using Bloxable.io ("the Service"), you accept
                and agree to be bound by the terms and provision of this
                agreement. If you do not agree to abide by the above, please do
                not use this service.
              </p>

              <h2>2. Description of Service</h2>
              <p>
                Bloxable.io is a platform that enables users to create,
                configure, and manage automated workflows and marketplace
                integrations. The service includes:
              </p>
              <ul>
                <li>Workflow creation and configuration tools</li>
                <li>Marketplace for sharing and discovering workflows</li>
                <li>Integration with third-party services and APIs</li>
                <li>Webhook management and execution</li>
                <li>User account management and authentication</li>
              </ul>

              <h2>3. User Accounts</h2>
              <p>
                To access certain features of the Service, you must register for
                an account. You agree to:
              </p>
              <ul>
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your account information</li>
                <li>Maintain the security of your password and account</li>
                <li>
                  Accept responsibility for all activities under your account
                </li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>

              <h2>4. Acceptable Use</h2>
              <p>You agree not to use the Service to:</p>
              <ul>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on the rights of others</li>
                <li>Transmit harmful or malicious code</li>
                <li>Attempt to gain unauthorized access to the Service</li>
                <li>Interfere with the proper functioning of the Service</li>
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Spam or send unsolicited communications</li>
                <li>Violate any intellectual property rights</li>
              </ul>

              <h2>5. Content and Intellectual Property</h2>
              <p>
                You retain ownership of any content you create or upload to the
                Service. By using the Service, you grant us a limited license to
                use, store, and process your content as necessary to provide the
                Service.
              </p>
              <p>
                The Service and its original content, features, and
                functionality are owned by Bloxable.io and are protected by
                international copyright, trademark, patent, trade secret, and
                other intellectual property laws.
              </p>

              <h2>6. Marketplace and Third-Party Integrations</h2>
              <p>
                Our marketplace allows users to share and discover workflows.
                When using marketplace items:
              </p>
              <ul>
                <li>
                  You are responsible for ensuring compliance with third-party
                  terms of service
                </li>
                <li>
                  We do not guarantee the functionality or security of
                  third-party integrations
                </li>
                <li>You use marketplace items at your own risk</li>
                <li>
                  We reserve the right to remove marketplace items that violate
                  our policies
                </li>
              </ul>

              <h2>7. Payment Terms</h2>
              <p>If you purchase a paid subscription or service:</p>
              <ul>
                <li>Fees are charged in advance and are non-refundable</li>
                <li>Prices may change with 30 days' notice</li>
                <li>You are responsible for all applicable taxes</li>
                <li>We may suspend service for non-payment</li>
              </ul>

              <h2>8. Privacy and Data Protection</h2>
              <p>
                Your privacy is important to us. Please review our Privacy
                Policy, which also governs your use of the Service, to
                understand our practices.
              </p>

              <h2>9. Service Availability</h2>
              <p>
                We strive to maintain high service availability but do not
                guarantee uninterrupted access. The Service may be temporarily
                unavailable due to maintenance, updates, or circumstances beyond
                our control.
              </p>

              <h2>10. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, Bloxable.io shall not be
                liable for any indirect, incidental, special, consequential, or
                punitive damages, including without limitation, loss of profits,
                data, use, goodwill, or other intangible losses, resulting from
                your use of the Service.
              </p>

              <h2>11. Indemnification</h2>
              <p>
                You agree to defend, indemnify, and hold harmless Bloxable.io
                and its officers, directors, employees, and agents from and
                against any claims, damages, obligations, losses, liabilities,
                costs, or debt, and expenses (including attorney's fees) arising
                from your use of the Service or violation of these Terms.
              </p>

              <h2>12. Termination</h2>
              <p>
                We may terminate or suspend your account and access to the
                Service immediately, without prior notice or liability, for any
                reason whatsoever, including without limitation if you breach
                the Terms.
              </p>

              <h2>13. Governing Law</h2>
              <p>
                These Terms shall be interpreted and governed by the laws of
                [Your Jurisdiction], without regard to its conflict of law
                provisions.
              </p>

              <h2>14. Changes to Terms</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or
                replace these Terms at any time. If a revision is material, we
                will try to provide at least 30 days' notice prior to any new
                terms taking effect.
              </p>

              <h2>15. Contact Information</h2>
              <p>
                If you have any questions about these Terms and Conditions,
                please contact us at:
              </p>
              <ul>
                <li>Email: legal@bloxable.io</li>
                <li>Address: [Your Company Address]</li>
              </ul>

              <h2>16. Severability</h2>
              <p>
                If any provision of these Terms is held to be invalid or
                unenforceable by a court, the remaining provisions of these
                Terms will remain in effect.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
