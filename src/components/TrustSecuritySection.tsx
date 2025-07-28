import { Shield, Lock, CheckCircle, Globe, Clock, Award } from "lucide-react";

const securityFeatures = [
  {
    icon: Shield,
    title: "HIPAA Compliant",
    description: "Full HIPAA compliance with end-to-end encryption and audit logging"
  },
  {
    icon: Award,
    title: "SOC 2 Certified",
    description: "Type II SOC 2 certification for security, availability, and confidentiality"
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description: "Bank-level encryption, multi-factor authentication, and role-based access"
  },
  {
    icon: Clock,
    title: "99.9% Uptime",
    description: "Reliable cloud infrastructure with automatic backups and disaster recovery"
  }
];

const integrations = [
  { name: "Google Calendar", logo: "📅" },
  { name: "QuickBooks", logo: "📊" },
  { name: "HL7 FHIR", logo: "🔗" },
  { name: "Change Healthcare", logo: "🏥" },
  { name: "State Registries", logo: "🏛️" },
  { name: "VaxCare", logo: "💉" }
];

const certifications = [
  { name: "HIPAA", status: "Compliant" },
  { name: "SOC 2", status: "Certified" },
  { name: "FDA", status: "Registered" },
  { name: "ONC", status: "Certified" }
];

const TrustSecuritySection = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <Shield className="w-12 h-12 text-brand-yellow mx-auto mb-4" />
          <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
            Enterprise-Grade Security & Trust
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Your patients' data is protected by the same security standards used by Fortune 500 companies
          </p>
        </div>

        {/* Security Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {securityFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-neutral-50 rounded-2xl p-6 text-center">
                <div className="bg-brand-yellow rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-black" />
                </div>
                <h3 className="font-semibold text-black mb-2">{feature.title}</h3>
                <p className="text-sm text-neutral-600">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* System Status */}
        <div className="bg-black rounded-3xl p-8 mb-16">
          <div className="grid md:grid-cols-3 gap-8 text-white">
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-yellow mb-2">99.9%</div>
              <div className="text-neutral-300">Uptime Last 12 Months</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-yellow mb-2">&lt;50ms</div>
              <div className="text-neutral-300">Average Response Time</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="text-lg font-bold">All Systems Operational</div>
              </div>
              <div className="text-neutral-300">Real-time Status</div>
            </div>
          </div>
        </div>

        {/* Integrations */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-black text-center mb-8">
            Seamlessly Integrates With Your Existing Tools
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {integrations.map((integration, index) => (
              <div key={index} className="bg-neutral-50 rounded-xl p-4 text-center hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">{integration.logo}</div>
                <div className="text-sm font-medium text-neutral-700">{integration.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="bg-neutral-50 rounded-3xl p-8">
          <h3 className="text-2xl font-bold text-black text-center mb-8">
            Certified & Compliant
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            {certifications.map((cert, index) => (
              <div key={index} className="bg-white rounded-xl p-6 text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <h4 className="font-semibold text-black mb-1">{cert.name}</h4>
                <p className="text-sm text-green-600">{cert.status}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-neutral-600 mb-4">
              Trusted by healthcare organizations nationwide
            </p>
            <button className="text-neutral-600 hover:text-black transition-colors font-medium">
              View Security Documentation →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSecuritySection;