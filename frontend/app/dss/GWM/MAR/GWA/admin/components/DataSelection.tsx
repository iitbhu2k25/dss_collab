"use client";

import React from "react";
import { MultiSelect } from "./Multiselect";
import { useLocation, SubDistrict, Village, WellPoint } from "@/app/contexts/groundwater_assessment/admin/LocationContext";

interface DataSelectionProps {
  onConfirm?: (selectedData: {
    subDistricts: SubDistrict[];
    villages: Village[];
    wellPoints: WellPoint[];
    totalPopulation: number;
  }) => void;
  onReset?: () => void;
}

const DataSelection: React.FC<DataSelectionProps> = ({ onConfirm, onReset }) => {
  const {
    states,
    districts,
    subDistricts,
    villages,
    wellPoints,
    selectedState,
    selectedDistricts,
    selectedSubDistricts,
    selectedVillages,
    selectedWellPoints,
    selectionsLocked,
    isLoading,
    error,
    handleStateChange,
    setSelectedDistricts,
    setSelectedSubDistricts,
    setSelectedVillages,
    setSelectedWellPoints,
    confirmSelections,
    resetSelections,
  } = useLocation();

  console.log("DataSelection render:", {
    states: states.length,
    districts: districts.length,
    subDistricts: subDistricts.length,
    selectedState,
    selectedDistricts,
    selectedSubDistricts,
  });

  const handleStateSelect = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    if (!selectionsLocked) {
      const stateId = parseInt(e.target.value);
      console.log("Selected state ID:", stateId);
      handleStateChange(stateId);
    }
  };

  const handleDistrictsChange = (selectedIds: number[]): void => {
    if (!selectionsLocked) {
      console.log("Selected districts:", selectedIds);
      setSelectedDistricts(selectedIds);
    }
  };

  const handleSubDistrictsChange = (selectedIds: number[]): void => {
    if (!selectionsLocked) {
      console.log("Selected sub-districts:", selectedIds);
      setSelectedSubDistricts(selectedIds);
    }
  };

  const handleVillagesChange = (selectedIds: number[]): void => {
    if (!selectionsLocked) {
      console.log("Selected villages:", selectedIds);
      setSelectedVillages(selectedIds);
    }
  };

  const handleWellPointsChange = (selectedIds: number[]): void => {
    if (!selectionsLocked) {
      console.log("Selected well points:", selectedIds);
      setSelectedWellPoints(selectedIds);
    }
  };

  const handleConfirm = (): void => {
    if (selectedSubDistricts.length > 0 && !selectionsLocked) {
      console.log("Confirming selections...");
      const selectedData = confirmSelections();
      if (onConfirm && selectedData) {
        onConfirm(selectedData);
      }
    } else {
      console.log("Cannot confirm: Sub-districts empty or selections locked");
    }
  };

  const handleReset = (): void => {
    console.log("Resetting selections...");
    resetSelections();
    if (onReset) {
      onReset();
    }
  };

  const formatSubDistrictDisplay = (subDistrict: SubDistrict): string => {
    return `${subDistrict.name}`;
  };

  const formatVillageDisplay = (village: Village): string => {
    return `${village.name}`;
  };

  const formatWellPointDisplay = (wellPoint: WellPoint): string => {
    return `${wellPoint.name}`;
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      {isLoading && (
        <div className="mb-4 p-2 bg-blue-100 text-blue-700 rounded">
          Loading data...
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label htmlFor="state-dropdown" className="block text-sm font-semibold text-gray-700 mb-2">
            State:
          </label>
          <select
            id="state-dropdown"
            className="w-full p-2 text-sm border border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedState || ""}
            onChange={handleStateSelect}
            disabled={selectionsLocked || isLoading}
          >
            <option value="">--Choose a State--</option>
            {states.map((state) => (
              <option key={state.id} value={state.id}>
                {state.name}
              </option>
            ))}
          </select>
        </div>

        <MultiSelect
          items={districts}
          selectedItems={selectedDistricts}
          onSelectionChange={handleDistrictsChange}
          label="District"
          placeholder="--Choose Districts--"
          disabled={!selectedState || selectionsLocked || isLoading}
        />

        <MultiSelect
          items={subDistricts}
          selectedItems={selectedSubDistricts}
          onSelectionChange={handleSubDistrictsChange}
          label="Sub-District"
          placeholder="--Choose SubDistricts--"
          disabled={selectedDistricts.length === 0 || selectionsLocked || isLoading}
          displayPattern={formatSubDistrictDisplay}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <MultiSelect
          items={villages}
          selectedItems={selectedVillages}
          onSelectionChange={handleVillagesChange}
          label="Village"
          placeholder="--Choose Villages--"
          disabled={selectedSubDistricts.length === 0 || selectionsLocked || isLoading}
          displayPattern={formatVillageDisplay}
        />

        <MultiSelect
          items={wellPoints}
          selectedItems={selectedWellPoints}
          onSelectionChange={handleWellPointsChange}
          label="Well Point"
          placeholder="--Choose Well Points--"
          disabled={selectedVillages.length === 0 || selectionsLocked || isLoading}
          displayPattern={formatWellPointDisplay}
        />
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-md font-medium text-gray-800 mb-2">Selected Locations</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <span className="font-medium">State:</span>{" "}
            {states.find((s) => s.id === selectedState)?.name || "None"}
          </p>
          <p>
            <span className="font-medium">Districts:</span>{" "}
            {selectedDistricts.length > 0
              ? selectedDistricts.length === districts.length
                ? "All Districts"
                : districts
                    .filter((d) => selectedDistricts.includes(Number(d.id)))
                    .map((d) => d.name)
                    .join(", ")
              : "None"}
          </p>
          <p>
            <span className="font-medium">Sub-Districts:</span>{" "}
            {selectedSubDistricts.length > 0
              ? selectedSubDistricts.length === subDistricts.length
                ? "All Sub-Districts"
                : subDistricts
                    .filter((sd) => selectedSubDistricts.includes(Number(sd.id)))
                    .map((sd) => sd.name)
                    .join(", ")
              : "None"}
          </p>
          <p>
            <span className="font-medium">Villages:</span>{" "}
            {selectedVillages.length > 0
              ? selectedVillages.length === villages.length
                ? "All Villages"
                : villages
                    .filter((v) => selectedVillages.includes(Number(v.id)))
                    .map((v) => v.name)
                    .join(", ")
              : "None"}
          </p>
          <p>
            <span className="font-medium">Well Points:</span>{" "}
            {selectedWellPoints.length > 0
              ? selectedWellPoints.length === wellPoints.length
                ? "All Well Points"
                : wellPoints
                    .filter((w) => selectedWellPoints.includes(Number(w.id)))
                    .map((w) => w.name)
                    .join(", ")
              : "None"}
          </p>
          {selectionsLocked && (
            <p className="mt-2 text-green-600 font-medium">Selections confirmed and locked</p>
          )}
        </div>
      </div>

      <div className="flex space-x-4 mt-4">
        <button
          className={`${
            selectedSubDistricts.length > 0 && !selectionsLocked
              ? "bg-blue-500 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
          } text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
          onClick={handleConfirm}
          disabled={selectedSubDistricts.length === 0 || selectionsLocked || isLoading}
        >
          Confirm
        </button>
        <button
          className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          onClick={handleReset}
          disabled={isLoading}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default DataSelection;