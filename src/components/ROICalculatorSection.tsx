import { useState } from "react";
import { Calculator, Clock, DollarSign, TrendingUp } from "lucide-react";

const ROICalculatorSection = () => {
  const [providers, setProviders] = useState(1);
  const [hoursPerDay, setHoursPerDay] = useState(3);
  const [hourlyRate, setHourlyRate] = useState(150);

  const dailySavings = providers * 2 * hourlyRate; // 2 hours saved per provider
  const monthlySavings = dailySavings * 22; // 22 working days
  const annualSavings = monthlySavings * 12;
  const costSavings = providers * 100; // $100/month savings per provider vs competitors

  return (
    <section className="py-24 bg-black text-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <Calculator className="w-12 h-12 text-brand-yellow mx-auto mb-4" />
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Calculate Your Practice Savings
          </h2>
          <p className="text-xl text-neutral-300 max-w-3xl mx-auto">
            See how much time and money PediatricAI can save your practice
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Calculator Inputs */}
          <div className="bg-neutral-900 rounded-3xl p-8">
            <h3 className="text-2xl font-bold mb-6">Your Practice Details</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Number of Providers</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={providers}
                  onChange={(e) => setProviders(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-700 rounded-full appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-neutral-400 mt-1">
                  <span>1</span>
                  <span className="font-bold text-brand-yellow">{providers}</span>
                  <span>10</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Current Documentation Hours/Day</label>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-700 rounded-full appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-neutral-400 mt-1">
                  <span>1hr</span>
                  <span className="font-bold text-brand-yellow">{hoursPerDay}hrs</span>
                  <span>6hrs</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Physician Hourly Rate ($)</label>
                <input
                  type="range"
                  min="100"
                  max="300"
                  step="25"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-700 rounded-full appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-neutral-400 mt-1">
                  <span>$100</span>
                  <span className="font-bold text-brand-yellow">${hourlyRate}</span>
                  <span>$300</span>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            <div className="bg-brand-yellow text-black rounded-3xl p-8">
              <Clock className="w-8 h-8 mb-4" />
              <h4 className="text-lg font-semibold mb-2">Time Savings</h4>
              <p className="text-3xl font-bold">{providers * 2} hours/day</p>
              <p className="text-sm opacity-80">2 hours saved per provider daily</p>
            </div>

            <div className="bg-neutral-900 rounded-3xl p-8">
              <DollarSign className="w-8 h-8 text-brand-yellow mb-4" />
              <h4 className="text-lg font-semibold mb-2">Monthly Value Creation</h4>
              <p className="text-3xl font-bold text-brand-yellow">${monthlySavings.toLocaleString()}</p>
              <p className="text-sm text-neutral-400">From time savings alone</p>
            </div>

            <div className="bg-neutral-900 rounded-3xl p-8">
              <TrendingUp className="w-8 h-8 text-brand-yellow mb-4" />
              <h4 className="text-lg font-semibold mb-2">Annual ROI</h4>
              <p className="text-3xl font-bold text-brand-yellow">${annualSavings.toLocaleString()}</p>
              <p className="text-sm text-neutral-400">vs. ${(providers * 1800).toLocaleString()} platform cost</p>
              <p className="text-lg font-bold text-green-400 mt-2">
                {Math.round((annualSavings / (providers * 1800) - 1) * 100)}x ROI
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-neutral-300 mb-6">
            Plus 50% cost savings vs. traditional EHR systems
          </p>
          <button className="bg-brand-yellow text-black px-8 py-4 rounded-full font-semibold hover:bg-brand-lime transition-colors">
            Start Saving Today - Free Trial
          </button>
        </div>
      </div>
    </section>
  );
};

export default ROICalculatorSection;