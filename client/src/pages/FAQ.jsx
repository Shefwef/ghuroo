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
];

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <div className="min-h-screen bg-white text-black">
      <div
        className="relative bg-cover bg-center h-[28rem] flex flex-col justify-center items-center text-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1607083206173-2f79a1d97679?auto=format&fit=crop&w=1470&q=80')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/40 to-white/0 backdrop-blur-sm z-0" />
        <h1 className="relative z-10 text-4xl md:text-5xl font-bold drop-shadow-xl text-gray-800">
          Frequently Asked Questions
        </h1>
        <p className="relative z-10 text-lg md:text-xl mt-2 text-gray-700">
          We’re here to help with any questions you have about tours, bookings,
          and support.
        </p>
      </div>

      <div className="-mt-16 pt-20 pb-16 bg-white rounded-t-3xl shadow-xl z-10 relative max-w-3xl mx-auto px-4">
        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-gradient-to-r from-orange-50 via-white to-orange-50 border border-orange-200 shadow hover:shadow-xl transition-shadow"
            >
              <button
                className={`w-full flex justify-between items-center px-6 py-5 text-lg font-semibold focus:outline-none transition-colors ${
                  open === idx
                    ? "text-orange-600 bg-orange-100"
                    : "text-orange-700 bg-white"
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
                    open === idx ? "rgba(255, 237, 213, 0.7)" : "transparent",
                  borderRadius: "0 0 0.75rem 0.75rem",
                }}
              >
                <div className="overflow-hidden">
                  <p className="text-orange-700 text-base leading-relaxed">
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
