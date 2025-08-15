import React from "react";
import { Phone, Mail, MapPin, Clock, MessageCircle, HelpCircle } from "lucide-react";

export default function Contact() {
  const contactMethods = [
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our travel experts",
      contact: "+1 (555) 123-4567",
      hours: "Mon-Fri: 9AM-6PM EST",
      color: "bg-blue-50 text-blue-600"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us detailed inquiries",
      contact: "support@ghuroo.com",
      hours: "Response within 24 hours",
      color: "bg-green-50 text-green-600"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Get instant help during business hours",
      contact: "Chat Now",
      hours: "Mon-Fri: 9AM-6PM EST",
      color: "bg-purple-50 text-purple-600"
    }
  ];

  const contactSteps = [
    {
      step: "1",
      title: "Choose Your Method",
      description: "Select the contact method that works best for your inquiry - phone for urgent matters, email for detailed questions, or live chat for quick help."
    },
    {
      step: "2",
      title: "Prepare Your Information",
      description: "Have your booking reference, travel dates, and specific questions ready to help us assist you more efficiently."
    },
    {
      step: "3",
      title: "Get Expert Assistance",
      description: "Our experienced travel consultants will provide personalized support and help you plan your perfect trip."
    }
  ];

  const faqItems = [
    {
      question: "What are your business hours?",
      answer: "We're available Monday through Friday, 9 AM to 6 PM EST. Our live chat and phone support operate during these hours."
    },
    {
      question: "How quickly will I receive a response?",
      answer: "Phone and live chat: Immediate during business hours. Email: Within 24 hours on business days."
    },
    {
      question: "Can I modify or cancel my booking?",
      answer: "Yes! Contact us at least 48 hours before your trip for modifications. Cancellation policies vary by tour package."
    },
    {
      question: "Do you offer group discounts?",
      answer: "Absolutely! We offer special rates for groups of 6 or more. Contact us for a custom quote."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Get in Touch with Us
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Need help planning your next adventure? Our travel experts are here to assist you every step of the way.
          </p>
        </div>

      
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {contactMethods.map((method, index) => (
            <div key={index} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className={`inline-flex p-3 rounded-lg ${method.color} mb-4`}>
                <method.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {method.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {method.description}
              </p>
              <div className="space-y-2">
                <p className="font-semibold text-gray-900">
                  {method.contact}
                </p>
                <p className="text-sm text-gray-500 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {method.hours}
                </p>
              </div>
            </div>
          ))}
        </div>

      
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How to Contact Us
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {contactSteps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full text-xl font-bold mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

   
        <div className="bg-white rounded-xl p-8 shadow-lg mb-16">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <MapPin className="h-6 w-6 mr-2 text-blue-600" />
                Our Office
              </h3>
              <div className="space-y-3 text-gray-600">
                <p className="font-semibold">Ghuroo Travel Company</p>
                <p>123 Adventure Street, Suite 456</p>
                <p>Travel City, TC 12345</p>
                <p>United States</p>
              </div>
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-2">Office Hours:</h4>
                <div className="space-y-1 text-gray-600">
                  <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p>Saturday: 10:00 AM - 4:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Emergency Contact</h4>
              <p className="text-gray-600 mb-3">
                For urgent travel emergencies during your trip:
              </p>
              <p className="font-semibold text-gray-900">
                24/7 Emergency Hotline: +1 (555) 999-8888
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This line is for emergencies only during active trips
              </p>
            </div>
          </div>
        </div>


      
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your Adventure?
          </h2>
          <p className="text-xl mb-6 text-blue-100">
            Contact us today and let's plan your perfect getaway together!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="tel:+15551234567" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center justify-center"
            >
              <Phone className="h-5 w-5 mr-2" />
              Call Now
            </a>
            <a 
              href="mailto:support@ghuroo.com" 
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center justify-center"
            >
              <Mail className="h-5 w-5 mr-2" />
              Send Email
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
