"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Define types for the location data
export interface State {
  id: string | number;
  name: string;
}

export interface District {
  id: string | number;
  name: string;
  stateId: string | number;
}

export interface SubDistrict {
  id: string | number;
  name: string;
  districtId: string | number;
  districtName: string;
  population?: number;
}

export interface SelectionsData {
  subDistricts: SubDistrict[];
  totalPopulation: number;
}

interface LocationContextType {
  states: State[];
  districts: District[];
  subDistricts: SubDistrict[];
  selectedState: number | null;
  selectedDistricts: number[];
  selectedSubDistricts: number[];
  totalPopulation: number;
  selectionsLocked: boolean;
  isLoading: boolean;
  error: string | null;
  handleStateChange: (stateId: number) => void;
  setSelectedDistricts: (districtIds: number[]) => void;
  setSelectedSubDistricts: (subDistrictIds: number[]) => void;
  confirmSelections: () => SelectionsData | null;
  resetSelections: () => void;
}

interface LocationProviderProps {
  children: ReactNode;
}

const LocationContext = createContext<LocationContextType>({
  states: [],
  districts: [],
  subDistricts: [],
  selectedState: null,
  selectedDistricts: [],
  selectedSubDistricts: [],
  totalPopulation: 0,
  selectionsLocked: false,
  isLoading: false,
  error: null,
  handleStateChange: () => {},
  setSelectedDistricts: () => {},
  setSelectedSubDistricts: () => {},
  confirmSelections: () => null,
  resetSelections: () => {},
});

export const LocationProvider: React.FC<LocationProviderProps> = ({
  children,
}) => {
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [subDistricts, setSubDistricts] = useState<SubDistrict[]>([]);
  const [selectedState, setSelectedState] = useState<number | null>(null);
  const [selectedDistricts, setSelectedDistricts] = useState<number[]>([]);
  const [selectedSubDistricts, setSelectedSubDistricts] = useState<number[]>([]);
  const [totalPopulation, setTotalPopulation] = useState<number>(0);
  const [selectionsLocked, setSelectionsLocked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch states on component mount
  useEffect(() => {
    const fetchStates = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log("Fetching states from /basics/state");
        const response = await fetch("/basics/state", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("States response:", data);
        const stateData: State[] = data.length > 0 ? data.map((state: any) => ({
          id: state.state_code,
          name: state.state_name,
        })) : [];
        setStates(stateData);
        if (data.length === 0) {
          setError("No states found.");
        }
      } catch (error: any) {
        console.error("Error fetching states:", error);
        setError(`Failed to fetch states: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    console.log("Triggering state fetch...");
    fetchStates();
  }, []);

  // Fetch districts when state is selected
  useEffect(() => {
    if (!selectedState) {
      setDistricts([]);
      setSelectedDistricts([]);
      setSubDistricts([]);
      setSelectedSubDistricts([]);
      setTotalPopulation(0);
      return;
    }

    const fetchDistricts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log("Fetching districts for state:", selectedState);
        const response = await fetch("/basics/district/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ state_code: selectedState }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Districts response:", data);
        const districtData: District[] = data.map((district: any) => ({
          id: district.district_code,
          name: district.district_name,
          stateId: selectedState,
        }));
        const sortedDistricts = [...districtData].sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setDistricts(sortedDistricts);
        if (data.length === 0) {
          setError("No districts found for the selected state.");
        }
      } catch (error: any) {
        console.error("Error fetching districts:", error);
        setError(`Failed to fetch districts: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    console.log("Triggering district fetch for state:", selectedState);
    fetchDistricts();
  }, [selectedState]);

  // Fetch sub-districts when districts are selected
  useEffect(() => {
    if (selectedDistricts.length === 0) {
      setSubDistricts([]);
      setSelectedSubDistricts([]);
      setTotalPopulation(0);
      return;
    }

    const fetchSubDistricts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log("Fetching sub-districts for districts:", selectedDistricts);
        const response = await fetch("/basics/subdistrict/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ district_code: selectedDistricts }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Sub-districts response:", data);
        const districtMap = new Map(
          districts.map((district) => [district.id.toString(), district.name])
        );
        const subDistrictData: SubDistrict[] = data.map((subDistrict: any) => {
          const districtId = subDistrict.district_code.toString();
          return {
            id: subDistrict.subdistrict_code,
            name: subDistrict.subdistrict_name,
            districtId: parseInt(districtId),
            districtName: districtMap.get(districtId) || "Unknown District",
ionato: subDistrict.population || 0,
          };
        });
        const sortedSubDistricts = [...subDistrictData].sort((a, b) => {
          const districtComparison = a.districtName.localeCompare(b.districtName);
          if (districtComparison !== 0) return districtComparison;
          return a.name.localeCompare(b.name);
        });
        setSubDistricts(sortedSubDistricts);
        if (data.length === 0) {
          setError("No sub-districts found for the selected districts.");
        }
      } catch (error: any) {
        console.error("Error fetching sub-districts:", error);
        setError(`Failed to fetch sub-districts: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    console.log("Triggering sub-district fetch for districts:", selectedDistricts);
    fetchSubDistricts();
  }, [selectedDistricts, districts]);

  // Calculate total population based on selected sub-districts
  useEffect(() => {
    if (selectedSubDistricts.length > 0) {
      const selectedSubDistrictObjects = subDistricts.filter((subDistrict) =>
        selectedSubDistricts.includes(Number(subDistrict.id))
      );
      const total = selectedSubDistrictObjects.reduce(
        (sum, subDistrict) => sum + (subDistrict.population || 0),
        0
      );
      setTotalPopulation(total);
    } else {
      setTotalPopulation(0);
    }
  }, [selectedSubDistricts, subDistricts]);

  // Handle state selection
  const handleStateChange = (stateId: number): void => {
    console.log("State changed to:", stateId);
    setSelectedState(stateId);
    setSelectedDistricts([]);
    setSelectedSubDistricts([]);
    setTotalPopulation(0);
    setSelectionsLocked(false);
  };

  // Lock selections and return selected data
  const confirmSelections = (): SelectionsData | null => {
    if (selectedSubDistricts.length === 0) {
      console.log("Cannot confirm: No sub-districts selected");
      setError("Please select at least one sub-district.");
      return null;
    }
    const selectedSubDistrictObjects = subDistricts.filter((subDistrict) =>
      selectedSubDistricts.includes(Number(subDistrict.id))
    );
    console.log("Confirming selections:", {
      subDistricts: selectedSubDistrictObjects,
      totalPopulation,
    });
    setSelectionsLocked(true);
    return {
      subDistricts: selectedSubDistrictObjects,
      totalPopulation,
    };
  };

  // Reset all selections
  const resetSelections = (): void => {
    console.log("Resetting all selections");
    setSelectedState(null);
    setSelectedDistricts([]);
    setSelectedSubDistricts([]);
    setTotalPopulation(0);
    setSelectionsLocked(false);
    setError(null);
  };

  const contextValue: LocationContextType = {
    states,
    districts,
    subDistricts,
    selectedState,
    selectedDistricts,
    selectedSubDistricts,
    totalPopulation,
    selectionsLocked,
    isLoading,
    error,
    handleStateChange,
    setSelectedDistricts,
    setSelectedSubDistricts,
    confirmSelections,
    resetSelections,
  };

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};