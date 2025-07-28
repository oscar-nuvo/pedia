const stats = [
  {
    number: "2+ Hours",
    label: "Saved Daily Per Provider",
    description: "Reduce documentation time with AI-powered automation"
  },
  {
    number: "30 Seconds",
    label: "Time to First Value",
    description: "Start scheduling appointments immediately after signup"
  },
  {
    number: "50%",
    label: "Lower Cost",
    description: "Compared to traditional EHR solutions for small practices"
  },
  {
    number: "95%+",
    label: "User Satisfaction",
    description: "Pediatricians love our intuitive, efficiency-focused design"
  }
];

const StatsSection = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-primary to-secondary-purple">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center text-white">
              <div className="text-4xl lg:text-5xl font-bold mb-2">
                {stat.number}
              </div>
              <div className="text-lg font-semibold mb-2 opacity-90">
                {stat.label}
              </div>
              <div className="text-sm opacity-75 leading-relaxed">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;