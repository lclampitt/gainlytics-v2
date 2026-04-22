import React, { useEffect } from 'react';
import '../styles/legal.css';

/**
 * Terms of Service — static public page.
 * Content last updated: April 2026.
 */
export default function Terms() {
  useEffect(() => {
    window.scrollTo(0, 0);
    const prevTitle = document.title;
    document.title = 'Terms of Service — MacroVault';
    return () => {
      document.title = prevTitle;
    };
  }, []);

  return (
    <div className="legal-page">
      <div className="legal-page__container">
        <h1 className="legal-page__title">MacroVault Terms of Service</h1>
        <p className="legal-page__updated">Last updated: April 2026</p>

        <div className="legal-page__body">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By creating an account or using MacroVault ("the Service"), you
            agree to be bound by these Terms of Service. If you do not agree,
            do not use the Service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            MacroVault is a fitness tracking platform that provides tools for
            macro tracking, meal planning, workout logging, body composition
            estimation, and goal planning. The Service is intended for general
            fitness and wellness purposes only.
          </p>

          <h2>3. Not Medical Advice</h2>
          <p>
            The information, calculations, and suggestions provided by
            MacroVault — including but not limited to body fat estimates,
            calorie targets, macro recommendations, and AI-generated meal
            suggestions — are for informational and general wellness purposes
            only. Nothing on MacroVault constitutes medical advice, diagnosis,
            or treatment. Always seek the advice of a qualified healthcare
            provider before beginning any diet, nutrition, or exercise program.
            MacroVault assumes no liability for any health outcomes resulting
            from use of the Service.
          </p>

          <h2>4. Body Composition Estimates</h2>
          <p>
            Body fat percentage, lean mass, and related metrics displayed in
            MacroVault are estimates calculated using standard anthropometric
            formulas including but not limited to the U.S. Navy method and
            BMI-based calculations. These estimates are based solely on
            user-inputted measurements and may vary from clinical measurements
            by 3 to 8 percentage points or more depending on individual factors
            including age, genetics, hydration, and body type. These figures
            are intended to help users track general trends over time and are
            not a substitute for clinical body composition testing or
            professional medical assessment. MacroVault makes no claim that
            its estimates are exact, precise, or clinically accurate.
          </p>

          <h2>5. AI-Generated Content</h2>
          <p>
            MacroVault uses artificial intelligence to generate meal
            suggestions and nutritional recommendations. These suggestions are
            generated automatically and are not reviewed by nutritionists or
            medical professionals. They are provided as general ideas only and
            should not be treated as personalized medical or dietary advice.
            MacroVault does not guarantee the accuracy, completeness, or
            suitability of any AI-generated content for your individual needs.
          </p>

          <h2>6. User Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your
            account credentials. You must be at least 13 years of age to use
            the Service. You agree to provide accurate information when
            creating your account. MacroVault reserves the right to suspend or
            permanently terminate accounts at any time for any of the
            following reasons:
          </p>
          <ul>
            <li>Violation of these Terms of Service</li>
            <li>
              Misuse of the Service including but not limited to abuse of AI
              features, automated scraping, or attempting to access other
              users data
            </li>
            <li>Failure to pay for a paid subscription after reasonable notice</li>
            <li>
              Providing false or misleading information during registration
            </li>
            <li>
              Any behavior that MacroVault determines in its sole discretion
              to be harmful to the Service, other users, or MacroVault itself
            </li>
          </ul>
          <p>
            MacroVault will make reasonable efforts to notify you before
            suspending or terminating your account except where immediate
            action is required to protect the Service or other users. No
            refunds will be issued for accounts terminated due to violations
            of these Terms.
          </p>

          <h2>7. Subscription and Payments</h2>
          <p>
            MacroVault offers free and paid subscription tiers. Paid
            subscriptions are billed through Stripe. By subscribing you
            authorize MacroVault to charge your payment method on a recurring
            basis. You may cancel your subscription at any time through your
            account settings. Cancellations take effect at the end of the
            current billing period. MacroVault does not offer refunds for
            partial billing periods unless required by applicable law.
          </p>

          <h2>8. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service for any unlawful purpose</li>
            <li>Attempt to access other users accounts or data</li>
            <li>
              Reverse engineer, copy, or redistribute any part of the Service
            </li>
            <li>
              Use automated tools to scrape or extract data from the Service
            </li>
            <li>
              Upload content that is harmful, offensive, or violates any third
              party rights
            </li>
          </ul>

          <h2>9. Intellectual Property</h2>
          <p>
            All content, design, code, and features of MacroVault are the
            intellectual property of MacroVault and its creator. You may not
            copy, reproduce, or distribute any part of the Service without
            express written permission. Your personal data belongs to you —
            MacroVault does not claim ownership of any data you input into
            the Service.
          </p>

          <h2>10. Data and Privacy</h2>
          <p>
            Your use of the Service is also governed by our{' '}
            <a href="/privacy">Privacy Policy</a>, which is incorporated into
            these Terms by reference. By using MacroVault you consent to the
            collection and use of your data as described in the Privacy Policy.
          </p>

          <h2>11. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, MacroVault and its creator
            shall not be liable for any indirect, incidental, special,
            consequential, or punitive damages arising from your use of the
            Service, including but not limited to health outcomes, data loss,
            or service interruptions. MacroVaults total liability to you for
            any claim arising from use of the Service shall not exceed the
            amount you paid for the Service in the three months preceding the
            claim.
          </p>

          <h2>12. Disclaimer of Warranties</h2>
          <p>
            The Service is provided as is and as available without warranties
            of any kind, either express or implied. MacroVault does not
            warrant that the Service will be uninterrupted, error-free, or
            completely accurate.
          </p>

          <h2>13. Changes to Terms</h2>
          <p>
            MacroVault reserves the right to update these Terms at any time.
            Continued use of the Service after changes are posted constitutes
            acceptance of the updated Terms. We will make reasonable efforts
            to notify users of significant changes via email or in-app
            notification.
          </p>

          <h2>14. Governing Law</h2>
          <p>
            These Terms shall be governed by the laws of the State of
            California, without regard to its conflict of law provisions.
          </p>

          <h2>15. Contact</h2>
          <p>
            For questions about these Terms contact:{' '}
            <a href="mailto:lclampitt44@outlook.com">lclampitt44@outlook.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
