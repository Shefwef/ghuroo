import React, { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  HelpCircle,
} from "lucide-react";
import Footer from "../components/Footer";

export default function Contact() {
  const [openFaq, setOpenFaq] = useState(null);

  const contactMethods = [
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our travel experts",
      contact: "+1 (555) 123-4567",
      hours: "Mon-Fri: 9AM-6PM EST",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us detailed inquiries",
      contact: "support@ghuroo.com",
      hours: "Response within 24 hours",
      color: "bg-blue-50 text-blue-500",
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Get instant help during business hours",
      contact: "Chat Now",
      hours: "Mon-Fri: 9AM-6PM EST",
      color: "bg-blue-50 text-blue-400",
    },
  ];

  const contactSteps = [
    {
      step: "1",
      title: "Choose Your Method",
      description:
        "Select the contact method that works best for your inquiry: phone for urgent matters, email for detailed questions, or live chat for quick help.",
    },
    {
      step: "2",
      title: "Prepare Your Information",
      description:
        "Have your booking reference, travel dates, and specific questions ready to help us assist you more efficiently.",
    },
    {
      step: "3",
      title: "Get Expert Assistance",
      description:
        "Our experienced travel consultants will provide personalized support and help you plan your perfect trip.",
    },
  ];

  // FAQ content
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

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col justify-between">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
            Contact Ghuroo
          </h1>
          <p className="text-lg text-blue-700 max-w-2xl mx-auto">
            Need help planning your next adventure? Our friendly travel experts
            are here for you!
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 mb-16">
          {contactMethods.map((method, index) => (
            <div
              key={index}
              className={`group bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow border border-blue-100 hover:-translate-y-2 duration-200`}
            >
              <div
                className={`inline-flex p-3 rounded-lg ${method.color} mb-4 transition-all group-hover:scale-110`}
              >
                <method.icon className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                {method.title}
              </h3>
              <p className="text-blue-700 mb-4">{method.description}</p>
              <div className="space-y-2">
                <p className="font-semibold text-blue-900">{method.contact}</p>
                <p className="text-sm text-blue-500 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {method.hours}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Steps */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-blue-900 mb-8 text-center">
            How to Contact Us
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {contactSteps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full text-xl font-bold mb-4 shadow">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-blue-700">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Office & Emergency */}
        <div className="bg-white rounded-xl p-8 shadow mb-16 flex flex-col md:flex-row gap-10 items-start">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
              <MapPin className="h-6 w-6 mr-2 text-blue-600" />
              Our Office
            </h3>
            <div className="space-y-2 text-blue-700 mb-6">
              <p className="font-semibold">Ghuroo Travel Company</p>
              <p>123 Adventure Street, Suite 456</p>
              <p>Travel City, TC 12345</p>
              <p>United States</p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">
                Office Hours:
              </h4>
              <div className="space-y-1 text-blue-700">
                <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p>Saturday: 10:00 AM - 4:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
          </div>
          <div className="bg-blue-100 rounded-lg p-6 flex-1 shadow-inner">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
              <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
              Emergency Contact
            </h4>
            <p className="text-blue-700 mb-2">
              For urgent travel emergencies during your trip:
            </p>
            <p className="font-semibold text-blue-900 text-lg">
              24/7 Emergency Hotline: +1 (555) 999-8888
            </p>
            <p className="text-xs text-blue-500 mt-2">
              This line is for emergencies only during active trips
            </p>
          </div>
        </div>

        {/* FAQ Accordion Section */}
        <div className="mb-20 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-blue-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-white/90 backdrop-blur-sm border border-blue-100 shadow-lg hover:shadow-2xl transition-shadow"
              >
                <button
                  className={`w-full flex justify-between items-center px-6 py-5 text-lg font-semibold focus:outline-none rounded-2xl transition-colors ${
                    openFaq === idx
                      ? "text-blue-700 bg-white"
                      : "text-blue-900 bg-transparent"
                  }`}
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  aria-expanded={openFaq === idx}
                  aria-controls={`faq-answer-${idx}`}
                >
                  <span>{faq.question}</span>
                  <span
                    className={`ml-4 transition-transform duration-300 ${
                      openFaq === idx
                        ? "rotate-180 text-blue-500"
                        : "rotate-0 text-blue-300"
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
                    openFaq === idx
                      ? "grid-rows-[1fr] opacity-100 py-4 px-6 bg-white"
                      : "grid-rows-[0fr] opacity-0 py-0 px-6"
                  }`}
                  style={{
                    background: openFaq === idx ? "white" : "transparent",
                    borderRadius: "0 0 1rem 1rem",
                  }}
                >
                  <div className="overflow-hidden">
                    <p className="text-blue-800 text-base leading-relaxed font-sans">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="bg-white border border-blue-100 p-10 rounded-xl text-center mt-16 mb-4 shadow hover:shadow-lg transition">
          <h2 className="text-2xl font-bold text-blue-900 mb-2">
            Ready to Start Your Adventure?
          </h2>
          <p className="mb-6 text-blue-700">
            Contact us now and let's plan your perfect getaway together!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+15551234567"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center focus:ring-2 focus:ring-blue-300"
            >
              <Phone className="h-5 w-5 mr-2" />
              Call Now
            </a>
            <a
              href="mailto:support@ghuroo.com"
              className="bg-white border-2 border-blue-600 text-blue-700 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 hover:text-blue-700 transition-colors inline-flex items-center justify-center focus:ring-2 focus:ring-blue-200"
            >
              <Mail className="h-5 w-5 mr-2" />
              Send Email
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
