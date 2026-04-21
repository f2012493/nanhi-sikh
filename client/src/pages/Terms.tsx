import { Card } from "@/components/ui/card";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-orange-50 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>

        <div className="space-y-6">
          {/* Agreement */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
            <div className="text-gray-700 space-y-3">
              <p>
                By accessing and using NanhiSikh ("the Service"), you accept and agree to be bound by the terms
                and provision of this agreement. If you do not agree to abide by the above, please do not use
                this service.
              </p>
            </div>
          </Card>

          {/* Parental Consent */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Parental Consent & Responsibility</h2>
            <div className="text-gray-700 space-y-3">
              <p>
                NanhiSikh is designed for parents and guardians of children under 13. By using this service,
                you represent and warrant that:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>You are a parent or legal guardian of the child</li>
                <li>You have the authority to provide consent for the child's information</li>
                <li>You have read and agree to our Privacy Policy</li>
                <li>You will supervise your child's use of generated content</li>
                <li>You are responsible for all activities on your account</li>
              </ul>
            </div>
          </Card>

          {/* User Responsibilities */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Responsibilities</h2>
            <div className="text-gray-700 space-y-3">
              <p>You agree to:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Provide accurate and complete information during registration</li>
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Not share your account with unauthorized persons</li>
                <li>Use the service only for lawful purposes</li>
                <li>Not upload content that violates intellectual property rights</li>
                <li>Not attempt to hack or gain unauthorized access</li>
              </ul>
            </div>
          </Card>

          {/* Intellectual Property */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Intellectual Property Rights</h2>
            <div className="text-gray-700 space-y-3">
              <p>
                <strong>Your Content:</strong> You retain all rights to the photos and information you upload.
                By uploading content, you grant NanhiSikh a license to use it for story generation and delivery.
              </p>
              <p>
                <strong>Generated Stories:</strong> The generated story videos are created for personal use by
                the child and family. You may not redistribute, sell, or use them for commercial purposes
                without explicit permission.
              </p>
              <p>
                <strong>Service Content:</strong> All content, features, and functionality of NanhiSikh are
                owned by NanhiSikh, its licensors, or other providers of such material.
              </p>
            </div>
          </Card>

          {/* Limitation of Liability */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Limitation of Liability</h2>
            <div className="text-gray-700 space-y-3">
              <p>
                NanhiSikh is provided "as is" without warranties of any kind. To the fullest extent permitted
                by law, NanhiSikh disclaims all warranties, express or implied, including but not limited to
                implied warranties of merchantability and fitness for a particular purpose.
              </p>
              <p>
                In no event shall NanhiSikh be liable for any indirect, incidental, special, consequential, or
                punitive damages resulting from your use of or inability to use the service.
              </p>
            </div>
          </Card>

          {/* Payment Terms */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Payment Terms</h2>
            <div className="text-gray-700 space-y-3">
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>All prices are in Indian Rupees (₹) and include GST</li>
                <li>Payments are processed through Razorpay</li>
                <li>All sales are final, but we offer a 7-day money-back guarantee</li>
                <li>Refunds will be processed within 7-10 business days</li>
                <li>We reserve the right to change pricing with 30 days notice</li>
              </ul>
            </div>
          </Card>

          {/* Content Policy */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Content Policy</h2>
            <div className="text-gray-700 space-y-3">
              <p>You agree not to upload content that:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Is offensive, abusive, or discriminatory</li>
                <li>Violates privacy or intellectual property rights</li>
                <li>Contains malware or harmful code</li>
                <li>Is illegal or promotes illegal activities</li>
                <li>Exploits or harms children in any way</li>
              </ul>
              <p>
                NanhiSikh reserves the right to remove content and suspend accounts that violate this policy.
              </p>
            </div>
          </Card>

          {/* Termination */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Termination</h2>
            <div className="text-gray-700 space-y-3">
              <p>
                NanhiSikh may terminate or suspend your account immediately, without prior notice or liability,
                for any reason whatsoever, including if you breach the Terms of Service.
              </p>
            </div>
          </Card>

          {/* Changes to Terms */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to Terms</h2>
            <div className="text-gray-700 space-y-3">
              <p>
                NanhiSikh reserves the right to modify these terms at any time. Changes will be effective
                immediately upon posting to the website. Your continued use of the service following the
                posting of revised Terms means that you accept and agree to the changes.
              </p>
            </div>
          </Card>

          {/* Governing Law */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Governing Law</h2>
            <div className="text-gray-700 space-y-3">
              <p>
                These Terms of Service and any separate agreements we provide to use the Service shall be
                governed by and construed in accordance with the laws of India.
              </p>
            </div>
          </Card>

          {/* Contact */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Information</h2>
            <div className="text-gray-700 space-y-3">
              <p>If you have any questions about these Terms of Service, please contact us at:</p>
              <ul className="space-y-2">
                <li>
                  <strong>Email:</strong> support@nanhisikh.com
                </li>
                <li>
                  <strong>Address:</strong> NanhiSikh, India
                </li>
              </ul>
            </div>
          </Card>

          {/* Last Updated */}
          <div className="text-center text-gray-600 text-sm">
            <p>Last updated: April 21, 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
