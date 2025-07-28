import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Dr. Sarah Chen",
    role: "Pediatrician, Solo Practice",
    practice: "Little Stars Pediatrics",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
    quote: "PediatricAI has transformed my practice. I save 2+ hours daily on documentation and can focus entirely on my patients. The AI understands pediatric workflows perfectly.",
    rating: 5,
    highlight: "Saves 2+ hours daily"
  },
  {
    name: "Dr. Maria Rodriguez",
    role: "Practice Owner",
    practice: "Sunshine Pediatric Group",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face",
    quote: "The family-centric scheduling and AI receptionist have revolutionized how we manage our 4-provider practice. Our no-show rate dropped to under 3%.",
    rating: 5,
    highlight: "3% no-show rate"
  },
  {
    name: "Dr. James Kim",
    role: "Pediatrician",
    practice: "Growing Kids Medical",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face",
    quote: "Setup took literally 30 seconds. The AI co-pilot helps with medication dosing and clinical decisions. It's like having a pediatric specialist always available.",
    rating: 5,
    highlight: "30-second setup"
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-neutral-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
            Trusted by 1,000+ Pediatricians
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Join pediatricians who've already transformed their practice with PediatricAI
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-brand-yellow fill-current" />
                ))}
              </div>
              
              <Quote className="w-8 h-8 text-brand-yellow mb-4" />
              
              <p className="text-neutral-700 leading-relaxed mb-6">
                "{testimonial.quote}"
              </p>
              
              <div className="flex items-center gap-4">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-black">{testimonial.name}</h4>
                  <p className="text-sm text-neutral-600">{testimonial.role}</p>
                  <p className="text-sm text-neutral-500">{testimonial.practice}</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <span className="inline-block bg-brand-yellow text-black px-3 py-1 rounded-full text-sm font-medium">
                  {testimonial.highlight}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-neutral-600 mb-4">
            Join 1,000+ pediatricians who switched this month
          </p>
          <div className="flex justify-center items-center gap-4">
            <div className="flex -space-x-2">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="w-8 h-8 bg-brand-yellow rounded-full border-2 border-white"></div>
              ))}
            </div>
            <span className="text-sm text-neutral-600">+995 more</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;