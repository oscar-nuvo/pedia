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
    <section className="py-24 bg-bg-primary">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <Calculator className="w-12 h-12 text-brand-purple mx-auto mb-4" />
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-neutral-800">
            Calculate Your Practice Savings
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            See how much time and money PediatricAI can save your practice
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Calculator Inputs */}
          <div className="bg-white rounded-3xl p-8 shadow-lg shadow-brand-pink/10 border border-brand-peach/30">
            <h3 className="text-2xl font-semibold mb-6 text-neutral-700">Your Practice Details</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-600">Number of Providers</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={providers}
                  onChange={(e) => setProviders(Number(e.target.value))}
                  className="w-full h-2 bg-brand-peach/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-coral [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <div className="flex justify-between text-sm text-neutral-500 mt-1">
                  <span>1</span>
                  <span className="font-semibold text-brand-purple">{providers}</span>
                  <span>10</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-600">Current Documentation Hours/Day</label>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(Number(e.target.value))}
                  className="w-full h-2 bg-brand-peach/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-coral [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <div className="flex justify-between text-sm text-neutral-500 mt-1">
                  <span>1hr</span>
                  <span className="font-semibold text-brand-purple">{hoursPerDay}hrs</span>
                  <span>6hrs</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-600">Physician Hourly Rate ($)</label>
                <input
                  type="range"
                  min="100"
                  max="300"
                  step="25"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full h-2 bg-brand-peach/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-coral [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <div className="flex justify-between text-sm text-neutral-500 mt-1">
                  <span>$100</span>
                  <span className="font-semibold text-brand-purple">${hourlyRate}</span>
                  <span>$300</span>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-brand-coral to-brand-peach text-white rounded-3xl p-8 shadow-lg shadow-brand-coral/20">
              <Clock className="w-8 h-8 mb-4" />
              <h4 className="text-lg font-semibold mb-2">Time Savings</h4>
              <p className="text-3xl font-bold">{providers * 2} hours/day</p>
              <p className="text-sm opacity-80">2 hours saved per provider daily</p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg shadow-brand-pink/10 border border-brand-peach/30">
              <DollarSign className="w-8 h-8 text-brand-purple mb-4" />
              <h4 className="text-lg font-semibold mb-2 text-neutral-700">Monthly Value Creation</h4>
              <p className="text-3xl font-bold text-brand-coral">${monthlySavings.toLocaleString()}</p>
              <p className="text-sm text-neutral-600">From time savings alone</p>
            </div>

            <div className="bg-gradient-to-br from-brand-lavender/20 to-brand-purple/20 rounded-3xl p-8 shadow-lg shadow-brand-lavender/10 border border-brand-lavender/30">
              <TrendingUp className="w-8 h-8 text-brand-purple mb-4" />
              <h4 className="text-lg font-semibold mb-2 text-neutral-700">Annual ROI</h4>
              <p className="text-3xl font-bold text-brand-purple">${annualSavings.toLocaleString()}</p>
              <p className="text-sm text-neutral-600">vs. ${(providers * 1800).toLocaleString()} platform cost</p>
              <p className="text-lg font-bold text-brand-coral mt-2">
                {Math.round((annualSavings / (providers * 1800) - 1) * 100)}x ROI
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-neutral-600 mb-6">
            Plus 50% cost savings vs. traditional EHR systems
          </p>
          <button className="bg-gradient-to-r from-brand-pink to-brand-coral text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg hover:shadow-brand-pink/30 transition-all">
            Start Saving Today - Free Trial
          </button>
        </div>
      </div>
    </section>
  );
};

export default ROICalculatorSection;