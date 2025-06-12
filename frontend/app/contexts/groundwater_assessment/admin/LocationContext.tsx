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

export interface Village {
  id: string | number;
  name: string;
  subDistrictId: string | number;
  subDistrictName: string;
  districtName: string;
  population: number;
}

export interface WellPoint {
  id: string | number;
  name: string;
  villageId: string | number;
}

export interface ClipRasters {
  file_name: string;
  layer_name: string;
  workspace: string;
}

export interface SelectionsData {
  subDistricts: SubDistrict[];
  villages: Village[];
  wellPoints: WellPoint[];
  totalPopulation: number;
}

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
  isLoading: boolean;
  error: string | null;
  display_raster: ClipRasters[];
  setdisplay_raster: (layer: ClipRasters[]) => void;
  handleStateChange: (stateId: number) => void;
  setSelectedDistricts: (districtIds: number[]) => void;
  setSelectedSubDistricts: (subDistrictIds: number[]) => void;
  setSelectedVillages: (villageIds: number[]) => void;
  setSelectedWellPoints: (wellPointIds: number[]) => void;
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
  error: null,
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

export const LocationProvider: React.FC<LocationProviderProps> = ({
  children,
}) => {
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [subDistricts, setSubDistricts] = useState<SubDistrict[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [wellPoints, setWellPoints] = useState<WellPoint[]>([]);
  const [selectedState, setSelectedState] = useState<number | null>(null);
  const [selectedDistricts, setSelectedDistricts] = useState<number[]>([]);
  const [selectedSubDistricts, setSelectedSubDistricts] = useState<number[]>([]);
  const [selectedVillages, setSelectedVillages] = useState<number[]>([]);
  const [selectedWellPoints, setSelectedWellPoints] = useState<number[]>([]);
  const [totalPopulation, setTotalPopulation] = useState<number>(0);
  const [selectionsLocked, setSelectionsLocked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [display_raster, setdisplay_raster] = useState<ClipRasters[]>([]);

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
      setVillages([]);
      setSelectedVillages([]);
      setWellPoints([]);
      setSelectedWellPoints([]);
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
      setVillages([]);
      setSelectedVillages([]);
      setWellPoints([]);
      setSelectedWellPoints([]);
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
            population: subDistrict.population || 0,
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

  // Fetch villages when sub-districts are selected
  useEffect(() => {
    if (selectedSubDistricts.length === 0) {
      setVillages([]);
      setSelectedVillages([]);
      setWellPoints([]);
      setSelectedWellPoints([]);
      setTotalPopulation(0);
      return;
    }

    const fetchVillages = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log("Fetching villages for sub-districts:", selectedSubDistricts);
        const response = await fetch("/basics/village/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ subdistrict_code: selectedSubDistricts }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Villages response:", data);
        const subDistrictMap = new Map(
          subDistricts.map((sd) => [
            sd.id.toString(),
            { name: sd.name, districtName: sd.districtName },
          ])
        );
        const villageData: Village[] = data.map((village: any) => {
          const subDistrictId = village.subdistrict_code.toString();
          const subDistrictInfo = subDistrictMap.get(subDistrictId);
          return {
            id: village.village_code,
            name: village.village_name,
            subDistrictId: parseInt(subDistrictId),
            subDistrictName: subDistrictInfo?.name || "Unknown SubDistrict",
            districtName: subDistrictInfo?.districtName || "Unknown District",
            population: village.population_2011 || 0,
          };
        });
        const sortedVillages = [...villageData].sort((a, b) => {
          const districtComparison = a.districtName.localeCompare(b.districtName);
          if (districtComparison !== 0) return districtComparison;
          const subDistrictComparison = a.subDistrictName.localeCompare(
            b.subDistrictName
          );
          if (subDistrictComparison !== 0) return subDistrictComparison;
          return a.name.localeCompare(b.name);
        });
        setVillages(sortedVillages);
        if (data.length === 0) {
          setError("No villages found for the selected sub-districts.");
        }
      } catch (error: any) {
        console.error("Error fetching villages:", error);
        setError(`Failed to fetch villages: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVillages();
  }, [selectedSubDistricts, subDistricts]);

  // Fetch well points when villages are selected
  useEffect(() => {
    if (selectedVillages.length === 0) {
      setWellPoints([]);
      setSelectedWellPoints([]);
      return;
    }

    const fetchWellPoints = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log("Fetching well points for villages:", selectedVillages);
        const response = await fetch("/api/stp/get_well_points/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ villages: selectedVillages }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Well points response:", data);
        const wellPointData: WellPoint[] = data.map((wellPoint: any) => ({
          id: wellPoint.id,
          name: wellPoint.name,
          villageId: selectedVillages.includes(Number(wellPoint.village_id))
            ? Number(wellPoint.village_id)
            : selectedVillages[0],
        }));
        setWellPoints(wellPointData);
        if (data.length === 0) {
          setError("No well points found for the selected villages.");
        }
      } catch (error: any) {
        console.error("Error fetching well points:", error);
        setError(`Failed to fetch well points: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWellPoints();
  }, [selectedVillages]);

  // Fetch raster data when selections are locked
  useEffect(() => {
    const fetchRaster = async () => {
      if (selectionsLocked && selectedSubDistricts.length > 0) {
        setIsLoading(true);
        setError(null);
        try {
          console.log("Fetching raster data for sub-districts:", selectedSubDistricts);
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
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const data = await response.json();
          console.log("Raster data response:", data);
          setdisplay_raster(data);
        } catch (error: any) {
          console.error("Error fetching raster data:", error);
          setError(`Failed to fetch raster data: ${error.message}`);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchRaster();
  }, [selectionsLocked, selectedSubDistricts]);

  // Calculate total population based on selected villages
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
    } else {
      setTotalPopulation(0);
    }
  }, [selectedVillages, villages]);

  // Handle state selection
  const handleStateChange = (stateId: number): void => {
    console.log("State changed to:", stateId);
    setSelectedState(stateId);
    setSelectedDistricts([]);
    setSelectedSubDistricts([]);
    setSelectedVillages([]);
    setSelectedWellPoints([]);
    setTotalPopulation(0);
    setSelectionsLocked(false);
    setdisplay_raster([]);
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
    const selectedVillageObjects = villages.filter((village) =>
      selectedVillages.includes(Number(village.id))
    );
    const selectedWellPointObjects = wellPoints.filter((wellPoint) =>
      selectedWellPoints.includes(Number(wellPoint.id))
    );
    console.log("Confirming selections:", {
      subDistricts: selectedSubDistrictObjects,
      villages: selectedVillageObjects,
      wellPoints: selectedWellPointObjects,
      totalPopulation,
    });
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
    console.log("Resetting all selections");
    setSelectedState(null);
    setSelectedDistricts([]);
    setSelectedSubDistricts([]);
    setSelectedVillages([]);
    setSelectedWellPoints([]);
    setTotalPopulation(0);
    setSelectionsLocked(false);
    setdisplay_raster([]);
    setError(null);
  };

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
    error,
    display_raster,
    setdisplay_raster,
    handleStateChange,
    setSelectedDistricts,
    setSelectedSubDistricts,
    setSelectedVillages,
    setSelectedWellPoints,
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