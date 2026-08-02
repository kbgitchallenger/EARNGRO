// app/terms/page.tsx
import LegalDocLayout, { type LegalSection } from '@/components/legal/LegalDocLayout'

export const metadata = { title: 'Terms of Service — EarnGro' }

const sections: LegalSection[] = [
  {
    id: 'acceptance',
    heading: 'Acceptance of Terms',
    content: <p>These Terms of Service ("Terms") govern your access to and use of the EarnGro platform (the "Service"), operated by <strong>EarnGro</strong> ("we," "us," "our"). By creating an account or using the Service, you agree to be bound by these Terms and by our Privacy Policy, which is incorporated by reference. If you do not agree to these Terms, do not use the Service.</p>,
  },
  {
    id: 'eligibility',
    heading: 'Eligibility',
    content: <p>You must be at least 18 years old, or the age of legal majority in your jurisdiction, to use the Service. By using the Service, you represent that you meet this requirement.</p>,
  },
  {
    id: 'account-registration',
    heading: 'Account Registration',
    content: <p>You must provide accurate, current, and complete information when creating an account, and keep this information up to date. You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. Notify us immediately at info@earngro.app if you suspect unauthorized use of your account.</p>,
  },
  {
    id: 'user-responsibilities',
    heading: 'User Responsibilities and Acceptable Use',
    content: <p>You agree to use the Service only to support your own career development, and to comply with all applicable laws while doing so. You are solely responsible for the accuracy of the information you provide, including resume content and assessment responses.</p>,
  },
  {
    id: 'prohibited-activities',
    heading: 'Prohibited Activities',
    content: (
      <ul>
        <li>Providing false or misleading information about yourself or another person</li>
        <li>Creating content on behalf of someone else without their knowledge and consent</li>
        <li>Attempting to reverse-engineer, scrape, or extract our AI models or proprietary scoring logic</li>
        <li>Using automated means (bots, scripts) to access the Service beyond normal individual use</li>
        <li>Uploading malicious files or content that infringes a third party's rights</li>
        <li>Circumventing the credit system, usage limits, or payment obligations</li>
        <li>Using the Service for any unlawful purpose, or in a way that could harm or impair it</li>
      </ul>
    ),
  },
  {
    id: 'ai-disclaimer',
    heading: 'AI-Generated Content Disclaimer',
    content: (
      <>
        <p>The Service uses artificial intelligence to generate resume content, scores (including ATS scores, Hiring Readiness Scores, and Career Health Scores), career recommendations, interview feedback, and related outputs ("AI Outputs").</p>
        <ul>
          <li><strong>AI Outputs are estimates</strong> based on available information and general market data. They are not verified facts, professional advice, or guarantees of any outcome.</li>
          <li><strong>You are solely responsible</strong> for reviewing and verifying any AI-generated content before relying on it or submitting it to an employer.</li>
          <li><strong>We do not warrant the accuracy, completeness, or reliability</strong> of any AI Output.</li>
          <li>AI Outputs should not be treated as legal, financial, or professional career advice.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'no-guarantee',
    heading: 'No Guarantee of Employment or Interview Success',
    content: (
      <>
        <p>EarnGro is a career-development tool. We do not guarantee that you will be hired for any position, pass any interview, or see your compensation increase, and no score on the Service reflects an actual employer's or recruiter's evaluation of you.</p>
        <p>Employment outcomes depend on many factors outside our control, including individual employer hiring practices, market conditions, and your own qualifications and performance.</p>
      </>
    ),
  },
  {
    id: 'content-ownership',
    heading: 'Content Ownership and License',
    content: (
      <>
        <p><strong>Your content:</strong> you retain ownership of the resume content, personal information, and other material you upload or input into the Service ("User Content").</p>
        <p><strong>License you grant to us:</strong> by submitting User Content, you grant EarnGro a limited, non-exclusive, royalty-free license to use, process, store, and analyze that content solely to provide and improve the Service to you. This license ends when you delete the relevant content or close your account, except where retention is required by law.</p>
        <p><strong>AI-generated output ownership:</strong> subject to the disclaimers above, you own the resume drafts and other AI-generated content produced specifically for you, for your own personal career use.</p>
      </>
    ),
  },
  {
    id: 'subscriptions-billing',
    heading: 'Subscriptions, Credits, and Billing',
    content: (
      <>
        <p>Certain features consume "credits" from your account balance, allocated based on your subscription plan and reset or accumulated according to the terms presented at the time of subscription. Paid plans are billed on a recurring basis until cancelled; by subscribing, you authorize us to charge your chosen payment method on each renewal date. We may change subscription pricing, with notice provided before any change takes effect for existing subscribers. Prices may be subject to applicable taxes.</p>
      </>
    ),
  },
  {
    id: 'refunds-cancellation',
    heading: 'Refunds and Cancellation',
    content: (
      <>

        <p>You may cancel your subscription at any time through your account settings; cancellation takes effect at the end of the current billing cycle. Fees already paid are non-refundable except where required by applicable law.</p>
      </>
    ),
  },
  {
    id: 'intellectual-property',
    heading: 'Intellectual Property',
    content: <p>The Service, including its software, design, trademarks (including "EarnGro" and associated logos), and underlying technology, is owned by EarnGro or its licensors and is protected by intellectual property laws. Nothing in these Terms grants you any right to use our trademarks without our prior written consent.</p>,
  },
  {
    id: 'service-availability',
    heading: 'Service Availability and Beta Features',
    content: <p>We aim to keep the Service available and reliable but do not guarantee uninterrupted access. We may modify, suspend, or discontinue any part of the Service, including features labeled "Beta," at any time. Beta features are provided "as is" and may be less stable than generally available features.</p>,
  },
  {
    id: 'third-party-integrations',
    heading: 'Third-Party Integrations',
    content: <p>The Service may integrate with third-party services (e.g., Google Sign-In, payment processors, AI providers). Your use of those services is subject to their own terms and privacy policies.</p>,
  },
  {
    id: 'limitation-liability',
    heading: 'Limitation of Liability',
    content: (
      <>
       <p>To the maximum extent permitted by applicable law, the Service is provided "as is" and "as available," without warranties of any kind. We shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of employment opportunity or income, arising from your use of the Service. Our total aggregate liability for any claim shall not exceed the amount you paid us in the 12 months preceding the claim.</p>
      </>
    ),
  },
  {
    id: 'indemnification',
    heading: 'Indemnification',
    content: <p>You agree to indemnify and hold harmless EarnGro, its officers, employees, and affiliates from any claims, damages, or expenses arising from your violation of these Terms, misuse of the Service, or violation of a third party's rights.</p>,
  },
  {
    id: 'termination',
    heading: 'Termination and Suspension',
    content: <p>We may suspend or terminate your access to the Service if we reasonably believe you have violated these Terms, engaged in fraudulent activity, or created legal or security risk. You may terminate your account at any time through your account settings or by contacting info@earngro.app.</p>,
  },
  {
    id: 'governing-law',
    heading: 'Governing Law and Dispute Resolution',
    content: (
      <>
          <p>These Terms are governed by the laws of <strong>India</strong>, without regard to conflict-of-law principles.</p>
      </>
    ),
  },
  {
    id: 'changes-to-terms',
    heading: 'Changes to These Terms',
    content: <p>We may update these Terms from time to time. If we make material changes, we will provide notice through the Service or by email before the changes take effect. Continued use of the Service after changes take effect constitutes acceptance of the updated Terms.</p>,
  },
  {
    id: 'general-provisions',
    heading: 'General Provisions',
    content: (
      <ul>
        <li><strong>Entire Agreement:</strong> these Terms, together with our Privacy Policy, constitute the entire agreement between you and us regarding the Service.</li>
        <li><strong>Severability:</strong> if any provision is found unenforceable, the remaining provisions continue in full force.</li>
        <li><strong>No Waiver:</strong> our failure to enforce any provision is not a waiver of our right to do so later.</li>
        <li><strong>Assignment:</strong> you may not assign these Terms without our consent; we may assign them in connection with a merger, acquisition, or sale of assets.</li>
      </ul>
    ),
  },
  {
    id: 'contact',
    heading: 'Contact Information',
    content: <p><strong>EarnGro</strong><br />1108-10, Tower-1,Assotech Busienss Cresterra, Sector 135, Noida 201304, India<br />Email: info@earngro.app<br />Website: www.earngro.app</p>,
  },
]

export default function TermsPage() {
  return <LegalDocLayout title="Terms of Service" effectiveDate="August 2, 2026" sections={sections} />
}