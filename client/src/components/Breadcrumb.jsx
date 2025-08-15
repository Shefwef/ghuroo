import { Home } from "lucide-react";

export default function Breadcrumb({ steps = [] }) {
  return (
    <nav className="flex items-center space-x-2" aria-label="Breadcrumb">
      {/* Home Icon */}
      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FF6B47] text-white">
        <Home className="w-5 h-5" />
      </span>
      {/* Steps */}
      {steps.map((step, idx) => (
        <div className="flex items-center" key={step.label || step}>
          
          <svg
            className="w-4 h-4 mx-2 text-[#BDC3C7]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
          
          {idx === steps.length - 1 ? (
            <span className="font-semibold text-[#FF6B47]">
              {step.label || step}
            </span>
          ) : (
            <span className="text-[#2C3E50] font-medium">
              {step.label || step}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
