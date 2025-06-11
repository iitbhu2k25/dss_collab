'use client'
import React from 'react';
import { useCategory } from '@/app/contexts/stp_sutability/admin/CategoryContext';

interface CategorySliderProps {
  activeTab: 'condition' | 'constraint';
}

export const CategorySlider: React.FC<CategorySliderProps> = ({ activeTab }) => {
  const {
    condition_categories,
    constraint_categories,
    selectedCondition,
    selectedConstraint,
    updateConditionCategoryInfluence,
    updateConstraintCategoryInfluence,
    getConditionCategoryInfluence,
    getConstraintCategoryInfluence,
    isConditionSelected,
    isConstraintSelected,
    getConditionCategoryWeight
  } = useCategory();

  // Format file name for display
  const formatName = (fileName: string): string => {
    return fileName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  // Display condition sliders
  if (activeTab === 'condition') {
    if (selectedCondition.length === 0) {
      return (
        <div className="p-4 text-center text-gray-500">
          Select condition categories to adjust their influences
        </div>
      );
    }

    return (
      <div className="w-full p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Condition Category Influence</h3>
        
        <div className="space-y-5">
          {condition_categories.map((category) => (
            // Only render sliders for selected categories
            isConditionSelected(category.file_name) && (
              <div key={category.id} className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {formatName(category.file_name)}
                  </span>
                  <span className="text-sm font-bold">
                    {getConditionCategoryWeight(category.file_name)}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-xs text-gray-500 w-24 text-left">
                    <span className="font-medium">1</span> (Least Important)
                  </div>
                  
                  <div className="relative flex-1">
                    {/* Custom slider track with gradient */}
                    <div className="absolute h-2 w-full rounded-lg bg-gradient-to-r from-blue-100 to-blue-600"></div>
                    
                    {/* Tick marks for reference points */}
                    <div className="absolute w-full flex justify-between px-1 -mt-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-4 w-0.5 bg-gray-300"></div>
                      ))}
                    </div>
                    
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="0.1"
                      value={getConditionCategoryInfluence(category.file_name)}
                      onChange={(e) => updateConditionCategoryInfluence(category.file_name, parseFloat(e.target.value))}
                      className="relative w-full h-2 bg-transparent appearance-none cursor-pointer z-10"
                      style={{
                        // Custom thumb styling for better visibility
                        WebkitAppearance: 'none',
                        appearance: 'none'
                      }}
                      aria-label={`Adjust importance of ${formatName(category.file_name)} from 1 (least important) to  (most important)`}
                    />
                  </div>
                  
                  <div className="text-xs text-gray-500 w-24 text-right">
                    <span className="font-medium">10</span> (Most Important)
                  </div>
                </div>
                
                {/* Visual scale indicators */}
                <div className="flex justify-between mt-1 px-24">
                  <div className="flex gap-1 items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-100"></div>
                    <span className="text-xs text-gray-400">Low</span>
                  </div>
                  <div className="flex gap-1 items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-300"></div>
                    <span className="text-xs text-gray-400">Medium</span>
                  </div>
                  <div className="flex gap-1 items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    <span className="text-xs text-gray-400">High</span>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
        
        <div className="mt-6 p-3 bg-gray-50 rounded text-sm text-gray-600 border-l-4 border-blue-400">
          <p className="font-medium mb-1">How to use:</p>
          <p>Drag the sliders to adjust the importance of each category. Higher values (closer to 10) give more weight to that factor in the analysis.</p>
        </div>
      </div>
    );
  }
  
  // Display constraint categories (no sliders, just names)
  else {
    if (selectedConstraint.length === 0) {
      return (
        <div className="p-4 text-center text-gray-500">
          Select constraint categories to view them
        </div>
      );
    }

    return (
      <div className="w-full p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Selected Constraint Categories</h3>
        
        <div className="space-y-2">
          {constraint_categories.map((category) => (
            isConstraintSelected(category.file_name) && (
              <div key={category.id} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">
                    {formatName(category.file_name)}
                  </span>
                  <span className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-full border border-red-100">
                    Constraint
                  </span>
                </div>
              </div>
            )
          ))}
        </div>
        
        <div className="mt-6 p-3 bg-gray-50 rounded text-sm text-gray-600 border-l-4 border-red-400">
          <p>Constraint categories define areas that are excluded from the analysis.</p>
        </div>
      </div>
    );
  }
};

export default CategorySlider;