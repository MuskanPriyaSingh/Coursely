import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";

interface Testimonial {
  name: string;
  message: string;
  image: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Aryan Singh",
    message:
      "Coursely helped me understand complex topics with ease. The course quality is outstanding!",
    image: "person1.jpg",
  },
  {
    name: "Ruhana Sharma",
    message:
      "The referral system is amazing — earned credits & bought my next course at a discount!",
    image: "person2.jpg",
  },
  {
    name: "Rishav Sen",
    message:
      "Very structured content and professional mentors. I secured a job after finishing the course!",
    image: "person3.webp",
  },
];

export const AnimatedTestimonials: React.FC = () => {
  const [index, setIndex] = useState(0);

  // Auto-slide every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleNext = () => setIndex((prev) => (prev + 1) % testimonials.length);
  const handlePrev = () => setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <div className="relative w-full max-w-xl mx-auto">

      {/* Testimonials Slider */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.6 }}
          className="bg-blue-50 p-8 rounded-2xl shadow-xl border border-blue-100"
        >
          <div className="flex flex-col items-center">
            <img
              src={testimonials[index].image}
              alt="person"
              className="w-25 h-25 rounded-full border-4 border-white shadow-md mb-4"
            />
            <h3 className="text-xl font-semibold text-blue-700">
              {testimonials[index].name}
            </h3>
            <p className="text-gray-600 mt-3 max-w-md">
              "{testimonials[index].message}"
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-md p-2 rounded-full hover:bg-blue-100"
      >
        ◀
      </button>

      <button
        onClick={handleNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-md p-2 rounded-full hover:bg-blue-100"
      >
        ▶
      </button>

      {/* Indicators */}
      <div className="flex justify-center mt-4 gap-2">
        {testimonials.map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${
              i === index ? "bg-blue-600" : "bg-blue-200"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};
