import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Privacy() {
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
            <h1 className="text-2xl font-bold">Privacy Policy</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Policy</CardTitle>
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <h2>1. Information We Collect</h2>
              <p>
                We collect information you provide directly to us, such as when
                you create an account, use our services, or contact us for
                support. This may include:
              </p>
              <ul>
                <li>Account information (name, email address, password)</li>
                <li>Profile information (company name, contact details)</li>
                <li>Workflow configurations and marketplace listings</li>
                <li>Communication data (support requests, feedback)</li>
                <li>
                  Payment information (processed securely through third-party
                  providers)
                </li>
              </ul>

              <h2>2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices, updates, and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Monitor and analyze trends and usage</li>
                <li>Detect, investigate, and prevent security incidents</li>
              </ul>

              <h2>3. Information Sharing and Disclosure</h2>
              <p>
                We do not sell, trade, or otherwise transfer your personal
                information to third parties without your consent, except in the
                following circumstances:
              </p>
              <ul>
                <li>
                  With service providers who assist us in operating our platform
                </li>
                <li>When required by law or to protect our rights</li>
                <li>In connection with a business transfer or acquisition</li>
                <li>With your explicit consent</li>
              </ul>

              <h2>4. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures
                to protect your personal information against unauthorized
                access, alteration, disclosure, or destruction. This includes:
              </p>
              <ul>
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication measures</li>
                <li>Secure data centers and infrastructure</li>
              </ul>

              <h2>5. Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to
                provide our services and fulfill the purposes outlined in this
                privacy policy, unless a longer retention period is required or
                permitted by law.
              </p>

              <h2>6. Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access your personal information</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Delete your personal information</li>
                <li>Object to processing of your personal information</li>
                <li>Data portability</li>
                <li>Withdraw consent where applicable</li>
              </ul>

              <h2>7. Cookies and Tracking Technologies</h2>
              <p>
                We use cookies and similar tracking technologies to enhance your
                experience on our platform. You can control cookie settings
                through your browser preferences.
              </p>

              <h2>8. Third-Party Services</h2>
              <p>
                Our platform may integrate with third-party services. These
                services have their own privacy policies, and we encourage you
                to review them.
              </p>

              <h2>9. International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in
                countries other than your own. We ensure appropriate safeguards
                are in place for such transfers.
              </p>

              <h2>10. Children's Privacy</h2>
              <p>
                Our services are not intended for children under 13 years of
                age. We do not knowingly collect personal information from
                children under 13.
              </p>

              <h2>11. Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will
                notify you of any changes by posting the new policy on this page
                and updating the "Last updated" date.
              </p>

              <h2>12. Contact Us</h2>
              <p>
                If you have any questions about this privacy policy or our data
                practices, please contact us at:
              </p>
              <ul>
                <li>Email: privacy@bloxable.io</li>
                <li>Address: [Your Company Address]</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
