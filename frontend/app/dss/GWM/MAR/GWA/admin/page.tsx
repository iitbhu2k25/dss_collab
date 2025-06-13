"use client";

import React, { useState } from "react";
import { StatusBar } from "./components/StatusBar";
import DataSelection from "./components/DataSelection";
import Map from "./components/Map";
import { LocationProvider } from "@/app/contexts/groundwater_assessment/admin/LocationContext";
import { MapProvider } from "@/app/contexts/groundwater_assessment/admin/MapContext";

export default function GroundwaterAssessmentAdmin() {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    { id: 1, name: "Data Collection" },
    { id: 2, name: "Groundwater Contour" },
    { id: 3, name: "Groundwater Trend" },
    { id: 4, name: "Timeseries Analysis and Forecasting" },
    { id: 5, name: "Groundwater Recharge" },
  ];

  const handleNext = () => {
    if (activeStep < steps.length) {
      setActiveStep(activeStep + 1);
    }
  };

  const handlePrevious = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  return (
    <LocationProvider>
      <MapProvider>
        <div className="min-h-screen bg-gray-100 flex flex-col">
          {/* Top Step Bar */}
          <StatusBar
            activeStep={activeStep}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />

          {/* Main Content */}
          <main className="container mx-auto p-2 flex-grow">
            <div className="flex gap-4 mt-4 mr-4 -ml-40">
              {/* Left Panel: DataSelection for step 1, placeholder for steps 2–5 */}
              <div className="w-3/5 bg-white p-6 rounded-lg shadow-md">
                {activeStep === 1 ? (
                  <DataSelection step={activeStep} />
                ) : (
                  <div className="text-gray-500">
                    <h2 className="text-xl font-semibold mb-4">{steps[activeStep - 1].name}</h2>
                    <p>Content for this step is not yet implemented.</p>
                  </div>
                )}
              </div>
              {/* Right Panel: Map for all steps */}
              <div className="flex-1 bg-white p-6 rounded-lg shadow-md -mr-15">
                <Map />
              </div>
            </div>
          </main>

          {/* Step Navigation */}
          <div className="bg-gray-100 p-6 border-t border-gray-300">
            <div className="flex justify-center space-x-4 max-w-4xl mx-auto">
              <button
                onClick={handlePrevious}
                disabled={activeStep === 1}
                className={`px-6 py-3 rounded-lg text-white font-semibold transition-all duration-300 ${
                  activeStep === 1
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
                }`}
              >
                Previous Step
              </button>
              <button
                onClick={handleNext}
                disabled={activeStep === steps.length}
                className={`px-6 py-3 rounded-lg text-white font-semibold transition-all duration-300 ${
                  activeStep === steps.length
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
                }`}
              >
                Next Step
              </button>
            </div>
          </div>
        </div>
      </MapProvider>
    </LocationProvider>
  );
}