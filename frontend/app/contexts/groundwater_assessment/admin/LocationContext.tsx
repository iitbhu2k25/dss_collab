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
  population: number;
}

export interface Village {
  id: string | number;
  name: string;
  subDistrictId: string | number;
  population: number;
}

export interface WellPoint {
  id: string | number;
  name: string;
  villageId: string | number;
}

// Interface for selections return data
export interface SelectionsData {
  subDistricts: SubDistrict[];
  villages: Village[];
  wellPoints: WellPoint[];
  totalPopulation: number;
}

interface clip_rasters {
  file_name: string;
  layer_name: string;
  workspace: string;
}

// Define the context type
interface LocationContextType {
  states: State[];
  districts: District[];
  subDistricts: SubDistrict[];
  villages: Village[];
  wellPoints: WellPoint[];
  selectedState: number | null;
  selectedDistricts: number[];
  selectedSubDistricts: number[];
  selectedVillages: number[];
  selectedWellPoints: number[];
  totalPopulation: number;
  selectionsLocked: boolean;
  display_raster: clip_rasters[];
  setdisplay_raster: (layer: clip_rasters[]) => void;
  isLoading: boolean;
  handleStateChange: (stateId: number) => void;
  setSelectedDistricts: (districtIds: number[]) => void;
  setSelectedSubDistricts: (subDistrictIds: number[]) => void;
  setSelectedVillages: (villageIds: number[]) => void;
  setSelectedWellPoints: (wellPointIds: number[]) => void;
  confirmSelections: () => SelectionsData | null;
  resetSelections: () => void;
}

// Props for the LocationProvider component
interface LocationProviderProps {
  children: ReactNode;
}

// Create the location context with default values
const LocationContext = createContext<LocationContextType>({
  states: [],
  districts: [],
  subDistricts: [],
  villages: [],
  wellPoints: [],
  selectedState: null,
  selectedDistricts: [],
  selectedSubDistricts: [],
  selectedVillages: [],
  selectedWellPoints: [],
  totalPopulation: 0,
  selectionsLocked: false,
  isLoading: false,
  display_raster: [],
  setdisplay_raster: () => {},
  handleStateChange: () => {},
  setSelectedDistricts: () => {},
  setSelectedSubDistricts: () => {},
  setSelectedVillages: () => {},
  setSelectedWellPoints: () => {},
  confirmSelections: () => null,
  resetSelections: () => {},
});

// Create the provider component
export const LocationProvider: React.FC<LocationProviderProps> = ({
  children,
}) => {
  // State for location data
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [subDistricts, setSubDistricts] = useState<SubDistrict[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [wellPoints, setWellPoints] = useState<WellPoint[]>([]);

  // State for selected locations
  const [selectedState, setSelectedState] = useState<number | null>(null);
  const [selectedDistricts, setSelectedDistricts] = useState<number[]>([]);
  const [selectedSubDistricts, setSelectedSubDistricts] = useState<number[]>([]);
  const [selectedVillages, setSelectedVillages] = useState<number[]>([]);
  const [selectedWellPoints, setSelectedWellPoints] = useState<number[]>([]);

  // State for additional information
  const [totalPopulation, setTotalPopulation] = useState<number>(0);
  const [selectionsLocked, setSelectionsLocked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [display_raster, setdisplay_raster] = useState<clip_rasters[]>([]);

  useEffect(() => {
    const fetchStates = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/stp/get_states?all_data=true");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const stateData: State[] = data.map((state: any) => ({
          id: state.id,
          name: state.name,
        }));

        setStates(stateData);
      } catch (error) {
        console.error("Error fetching states:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStates();
  }, []);

  // Load districts when state is selected
  useEffect(() => {
    if (!selectedState) {
      setDistricts([]);
      return;
    }

    const fetchDistricts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/stp/get_districts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            state: selectedState,
            all_data: true,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const districtData: District[] = data.map((district: any) => ({
          id: district.id,
          name: district.name,
          stateId: selectedState,
        }));

        setDistricts(districtData);
      } catch (error) {
        console.error("Error fetching districts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDistricts();

    // Reset dependent selections
    setSelectedDistricts([]);
    setSelectedSubDistricts([]);
    setSelectedVillages([]);
    setSelectedWellPoints([]);
    setTotalPopulation(0);
  }, [selectedState]);

  // Load sub-districts when districts are selected
  useEffect(() => {
    if (selectedDistricts.length === 0) {
      setSubDistricts([]);
      return;
    }

    setIsLoading(true);

    const fetchSubDistricts = async () => {
      try {
        const response = await fetch("/api/stp/get_sub_districts/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            districts: selectedDistricts,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const subDistrictData: SubDistrict[] = data.map((subDistrict: any) => ({
          id: subDistrict.id,
          name: subDistrict.name,
          districtId: selectedDistricts[0], // Adjust based on data structure
          population: subDistrict.population || 0,
        }));

        setSubDistricts(subDistrictData);
      } catch (error) {
        console.error("Error fetching sub-districts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubDistricts();

    // Reset dependent selections
    setSelectedSubDistricts([]);
    setSelectedVillages([]);
    setSelectedWellPoints([]);
    setTotalPopulation(0);
  }, [selectedDistricts]);

  // Load villages when sub-districts are selected
  useEffect(() => {
    if (selectedSubDistricts.length === 0) {
      setVillages([]);
      return;
    }

    setIsLoading(true);

    const fetchVillages = async () => {
      try {
        const response = await fetch("/api/stp/get_villages/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subDistricts: selectedSubDistricts,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const villageData: Village[] = data.map((village: any) => ({
          id: village.id,
          name: village.name,
          subDistrictId: selectedSubDistricts[0], // Adjust based on data structure
          population: village.population || 0,
        }));

        setVillages(villageData);
      } catch (error) {
        console.error("Error fetching villages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVillages();

    // Reset dependent selections
    setSelectedVillages([]);
    setSelectedWellPoints([]);
  }, [selectedSubDistricts]);

  // Load well points when villages are selected
  useEffect(() => {
    if (selectedVillages.length === 0) {
      setWellPoints([]);
      return;
    }

    setIsLoading(true);

    const fetchWellPoints = async () => {
      try {
        const response = await fetch("/api/stp/get_well_points/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            villages: selectedVillages,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const wellPointData: WellPoint[] = data.map((wellPoint: any) => ({
          id: wellPoint.id,
          name: wellPoint.name,
          villageId: selectedVillages[0], // Adjust based on data structure
        }));

        setWellPoints(wellPointData);
      } catch (error) {
        console.error("Error fetching well points:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWellPoints();

    // Reset dependent selections
    setSelectedWellPoints([]);
  }, [selectedVillages]);

  useEffect(() => {
    const disp_raster = async () => {
      if (selectionsLocked === true) {
        console.log("Starting fetch...");
        try {
          const response = await fetch("/api/stp_operation/stp_visual_display", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              clip: selectedSubDistricts,
              place: "sub_district",
            }),
          });

          const data = await response.json();
          setdisplay_raster(data);
        } catch (error) {
          console.error("Error:", error);
        }
      }
    };

    disp_raster();
  }, [selectionsLocked, selectedSubDistricts]);

  // Calculate total population based on selected villages (or sub-districts if no villages selected)
  useEffect(() => {
    if (selectedVillages.length > 0) {
      const selectedVillageObjects = villages.filter((village) =>
        selectedVillages.includes(Number(village.id))
      );
      const total = selectedVillageObjects.reduce(
        (sum, village) => sum + village.population,
        0
      );
      setTotalPopulation(total);
    } else if (selectedSubDistricts.length > 0) {
      const selectedSubDistrictObjects = subDistricts.filter((subDistrict) =>
        selectedSubDistricts.includes(Number(subDistrict.id))
      );
      const total = selectedSubDistrictObjects.reduce(
        (sum, subDistrict) => sum + subDistrict.population,
        0
      );
      setTotalPopulation(total);
    } else {
      setTotalPopulation(0);
    }
  }, [selectedSubDistricts, selectedVillages, subDistricts, villages]);

  // Handle state selection
  const handleStateChange = (stateId: number): void => {
    setSelectedState(stateId);
    setSelectedDistricts([]);
    setSelectedSubDistricts([]);
    setSelectedVillages([]);
    setSelectedWellPoints([]);
    setSelectionsLocked(false);
  };

  // Lock selections and return selected data
  const confirmSelections = (): SelectionsData | null => {
    if (selectedSubDistricts.length === 0) {
      return null;
    }

    const selectedSubDistrictObjects = subDistricts.filter((subDistrict) =>
      selectedSubDistricts.includes(Number(subDistrict.id))
    );

    const selectedVillageObjects = villages.filter((village) =>
      selectedVillages.includes(Number(village.id))
    );

    const selectedWellPointObjects = wellPoints.filter((wellPoint) =>
      selectedWellPoints.includes(Number(wellPoint.id))
    );

    setSelectionsLocked(true);

    return {
      subDistricts: selectedSubDistrictObjects,
      villages: selectedVillageObjects,
      wellPoints: selectedWellPointObjects,
      totalPopulation,
    };
  };

  // Reset all selections
  const resetSelections = (): void => {
    setSelectedState(null);
    setSelectedDistricts([]);
    setSelectedSubDistricts([]);
    setSelectedVillages([]);
    setSelectedWellPoints([]);
    setTotalPopulation(0);
    setSelectionsLocked(false);
    setdisplay_raster([]);
  };

  // Context value
  const contextValue: LocationContextType = {
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
    totalPopulation,
    selectionsLocked,
    isLoading,
    handleStateChange,
    setSelectedDistricts,
    setSelectedSubDistricts,
    setSelectedVillages,
    setSelectedWellPoints,
    confirmSelections,
    resetSelections,
    display_raster,
    setdisplay_raster,
  };

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
};

// Custom hook to use the location context
export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};