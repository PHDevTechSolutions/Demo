export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto p-8 text-gray-800 leading-relaxed">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500">
          Effective Date: <span className="font-medium">September 24, 2025</span>
        </p>
      </header>

      {/* Intro */}
      <section className="mb-8">
        <p>
          This Privacy Policy explains how we collect, use, and safeguard your
          personal information when you use our application (“the App”). By
          continuing to use the App, you acknowledge that you have read,
          understood, and agree to the practices outlined in this Policy.
        </p>
      </section>

      {/* Sections */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">1. Information We Collect</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Google Account Information</strong>: When you sign in with
            Google, we may access your basic profile details (name, email
            address) for authentication.
          </li>
          <li>
            <strong>Survey Data</strong>: If you send or respond to surveys, we
            may store the recipient email and survey-related details.
          </li>
          <li>
            <strong>Form Activity</strong>: Information you provide in forms
            such as remarks, project details, or sales activity data.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">2. How We Use Your Information</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>To authenticate your account securely using Google Sign-In.</li>
          <li>To send survey emails as requested by you.</li>
          <li>
            To save and process activity or project-related data within the App.
          </li>
          <li>To improve the functionality and reliability of our services.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">3. Data Sharing</h2>
        <p className="mb-3">
          We do not sell, rent, or trade your personal data. Information is only
          shared:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            With Google APIs (for authentication and sending emails) in
            compliance with Google’s policies.
          </li>
          <li>As required by law, regulation, or legal process.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">4. Data Security</h2>
        <p>
          We implement reasonable technical and organizational measures to
          protect your information against unauthorized access, alteration,
          disclosure, or destruction. However, no method of electronic storage
          is 100% secure.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">5. Your Rights</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            You may request to access, correct, or delete your data stored in
            our system.
          </li>
          <li>
            You may revoke access via your Google Account settings at any time.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">6. Third-Party Services</h2>
        <p>
          Our App integrates with Google APIs (OAuth2, Gmail API, Firestore).
          Use of these services is subject to Google’s own{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline font-medium"
          >
            Privacy Policy
          </a>
          .
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">7. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Updates will be
          posted on this page with a new effective date.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-3">8. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact
          us at:
        </p>
        <p className="mt-2">
          📧{" "}
          <a
            href="mailto:it.ecoshiftcorp@gmail.com"
            className="text-blue-600 hover:underline font-medium"
          >
            it.ecoshiftcorp@gmail.com
          </a>
        </p>
      </section>
    </main>
  );
}
