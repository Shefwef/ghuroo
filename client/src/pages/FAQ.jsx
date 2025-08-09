import { useState } from "react";

const faqs = [
  {
    question: "How do I book a tour?",
    answer:
      "Browse our tours, select your favorite, and click 'Book Now'. Fill out the booking form and submit.",
  },
  {
    question: "Can I cancel or reschedule my booking?",
    answer:
      "Yes, you can manage your bookings from your profile. Cancellation and rescheduling policies apply.",
  },
  {
    question: "How do I contact support?",
    answer:
      "Use our contact form or email us at info@ghuroo.com. We're here to help 24/7.",
  },
  {
    question: "Are your tours guided?",
    answer:
      "Yes, all tours include expert local guides for a safe and enriching experience.",
  },
  {
    question: "How do I pay for my booking?",
    answer: "We accept all major credit cards and secure online payments.",
  },
  {
    question: "What safety measures are in place for tours?",
    answer:
      "All tours follow strict safety protocols and our guides are trained to ensure your well-being throughout the journey.",
  },
  {
    question: "Can I get a custom tour package?",
    answer:
      "Absolutely! Contact our support team with your preferences and we’ll help you create a personalized tour experience.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex flex-col items-center px-2 py-0 relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1500&q=80')",
      }}
    >
      {/* Overlay for glass effect */}
      <div className="w-full min-h-screen absolute inset-0 bg-white/70 backdrop-blur-[2px] pointer-events-none -z-10" />

      <div className="w-full max-w-3xl mx-auto pt-16 pb-24">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-gray-900 drop-shadow mb-2 font-sans">
          Frequently Asked Questions
        </h1>
        <p className="text-center text-lg text-gray-700 mb-8 font-sans">
          We’re here to help with any questions you have about tours, bookings,
          and support.
        </p>
        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white/80 backdrop-blur-md border border-orange-100 shadow-lg hover:shadow-2xl transition-shadow"
            >
              <button
                className={`w-full flex justify-between items-center px-6 py-5 text-lg font-semibold focus:outline-none transition-colors rounded-2xl ${
                  open === idx
                    ? "text-orange-700 bg-gradient-to-r from-orange-100 via-white to-orange-50"
                    : "text-gray-900 bg-transparent"
                }`}
                onClick={() => setOpen(open === idx ? null : idx)}
                aria-expanded={open === idx}
                aria-controls={`faq-answer-${idx}`}
              >
                <span>{faq.question}</span>
                <span
                  className={`ml-4 transition-transform duration-300 ${
                    open === idx
                      ? "rotate-180 text-orange-500"
                      : "rotate-0 text-orange-300"
                  }`}
                >
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </button>
              <div
                id={`faq-answer-${idx}`}
                className={`grid transition-all duration-500 ease-in-out ${
                  open === idx
                    ? "grid-rows-[1fr] opacity-100 py-4 px-6"
                    : "grid-rows-[0fr] opacity-0 py-0 px-6"
                }`}
                style={{
                  background:
                    open === idx
                      ? "linear-gradient(90deg, #fff7edcc 0%, #ffe0b2cc 100%)"
                      : "transparent",
                  borderRadius: "0 0 1rem 1rem",
                  boxShadow:
                    open === idx ? "0 4px 24px 0 #ffd699cc" : undefined,
                }}
              >
                <div className="overflow-hidden">
                  <p className="text-gray-800 text-base leading-relaxed font-sans">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
