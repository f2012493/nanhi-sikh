import { Card } from "@/components/ui/card";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-orange-50 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy & Compliance</h1>

        <div className="space-y-6">
          {/* COPPA Section */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">COPPA Compliance</h2>
            <div className="text-gray-700 space-y-3">
              <p>
                NanhiSikh is committed to protecting the privacy of children under 13 in compliance with the
                Children's Online Privacy Protection Act (COPPA).
              </p>
              <h3 className="font-semibold text-lg">Our Commitments:</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>We collect minimal personal information from children</li>
                <li>We require parental consent before collecting any child data</li>
                <li>Child photos are automatically deleted after 30 days</li>
                <li>We do not track or profile children for advertising</li>
                <li>We do not share child data with third parties</li>
                <li>Parents can request deletion of their child's data at any time</li>
              </ul>
            </div>
          </Card>

          {/* DPDP Section */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">DPDP Act Compliance (India)</h2>
            <div className="text-gray-700 space-y-3">
              <p>
                NanhiSikh complies with the Digital Personal Data Protection (DPDP) Act, 2023, which governs
                data protection for Indian users.
              </p>
              <h3 className="font-semibold text-lg">Our Commitments:</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>All data is stored and processed within India</li>
                <li>Explicit consent is obtained before data collection</li>
                <li>Users have the right to access their data</li>
                <li>Users have the right to correction of inaccurate data</li>
                <li>Users have the right to deletion (Right to be Forgotten)</li>
                <li>Data retention is limited to necessary periods</li>
                <li>Regular data protection impact assessments are conducted</li>
              </ul>
            </div>
          </Card>

          {/* Data Collection */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What Data We Collect</h2>
            <div className="text-gray-700 space-y-3">
              <h3 className="font-semibold text-lg">Parent Information:</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Name and email address (for account creation)</li>
                <li>Phone number (optional, for WhatsApp delivery)</li>
                <li>Payment information (processed securely through Razorpay)</li>
              </ul>

              <h3 className="font-semibold text-lg mt-4">Child Information:</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Child's name and age (for story personalization)</li>
                <li>Child's gender (for story customization)</li>
                <li>Child's photo (for character generation)</li>
                <li>Parenting challenge description (for story generation)</li>
              </ul>

              <h3 className="font-semibold text-lg mt-4">Supporting Characters:</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Photos of supporting characters (optional)</li>
                <li>Character names and roles</li>
              </ul>
            </div>
          </Card>

          {/* Data Retention */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Retention & Deletion</h2>
            <div className="text-gray-700 space-y-3">
              <h3 className="font-semibold text-lg">Auto-Deletion Policy:</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  <strong>Child Photos:</strong> Automatically deleted 30 days after story creation
                </li>
                <li>
                  <strong>Supporting Character Photos:</strong> Automatically deleted 30 days after story
                  creation
                </li>
                <li>
                  <strong>Story Videos:</strong> Retained for the subscription period (7-30 days or unlimited)
                </li>
                <li>
                  <strong>Story Scripts:</strong> Retained indefinitely for parental reference
                </li>
                <li>
                  <strong>Account Data:</strong> Retained until account deletion request
                </li>
              </ul>

              <h3 className="font-semibold text-lg mt-4">Parental Rights:</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Parents can request immediate deletion of child photos</li>
                <li>Parents can request deletion of all story data</li>
                <li>Parents can request account deletion at any time</li>
                <li>Deletion requests are processed within 7 business days</li>
              </ul>
            </div>
          </Card>

          {/* Security */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Security Measures</h2>
            <div className="text-gray-700 space-y-3">
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>All data is encrypted in transit using HTTPS/TLS</li>
                <li>Sensitive data is encrypted at rest</li>
                <li>Payment information is never stored locally</li>
                <li>Regular security audits and penetration testing</li>
                <li>Access controls and role-based permissions</li>
                <li>Secure authentication with OAuth 2.0</li>
              </ul>
            </div>
          </Card>

          {/* Contact */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <div className="text-gray-700 space-y-3">
              <p>
                If you have any questions about our privacy practices or compliance, please contact us at:
              </p>
              <ul className="space-y-2">
                <li>
                  <strong>Email:</strong> privacy@nanhisikh.com
                </li>
                <li>
                  <strong>Address:</strong> NanhiSikh, India
                </li>
                <li>
                  <strong>Data Protection Officer:</strong> dpo@nanhisikh.com
                </li>
              </ul>
            </div>
          </Card>

          {/* Last Updated */}
          <div className="text-center text-gray-600 text-sm">
            <p>Last updated: April 21, 2026</p>
            <p>This policy is subject to change. We recommend reviewing it periodically.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
