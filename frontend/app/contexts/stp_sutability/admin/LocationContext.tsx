'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
}

export interface Towns {
  id: string | number;
  name: string;
  population: number;
  subdistrictId: string | number;
}

// Interface for selections return data
export interface SelectionsData {
  subDistricts: SubDistrict[];
  towns: Towns[];
  totalPopulation: number;
}

interface clip_rasters{
  file_name:string;
  layer_name:string;
  workspace:string;
}
// Define the context type
interface LocationContextType {
  states: State[];
  districts: District[];
  subDistricts: SubDistrict[];
  towns: Towns[];
  selectedState: number | null;
  selectedDistricts: number[];
  selectedSubDistricts: number[];
  selectedTowns: number[];
  totalPopulation: number;
  selectionsLocked: boolean;
  display_raster: clip_rasters[];
  setdisplay_raster: (layer: clip_rasters[]) => void;
  isLoading: boolean;
  handleStateChange: (stateId: number) => void;
  setSelectedDistricts: (districtIds: number[]) => void;
  setSelectedSubDistricts: (subDistrictIds: number[]) => void;
  setSelectedTowns: (townIds: number[]) => void;
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
  towns: [],
  selectedState: null,
  selectedDistricts: [],
  selectedSubDistricts: [],
  selectedTowns: [],
  totalPopulation: 0,
  selectionsLocked: false,
  isLoading: false,
  display_raster:[],
  setdisplay_raster: () => {},
  handleStateChange: () => {},
  setSelectedDistricts: () => {},
  setSelectedSubDistricts: () => {},
  setSelectedTowns: () => {},
  confirmSelections: () => null,
  resetSelections: () => {},
});

// Create the provider component
export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  // State for location data
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [subDistricts, setSubDistricts] = useState<SubDistrict[]>([]);
  const [towns, setTowns] = useState<Towns[]>([]);
  
  // State for selected locations
  const [selectedState, setSelectedState] = useState<number | null>(null);
  const [selectedDistricts, setSelectedDistricts] = useState<number[]>([]);
  const [selectedSubDistricts, setSelectedSubDistricts] = useState<number[]>([]);
  const [selectedTowns, setSelectedTowns] = useState<number[]>([]);
  
  // State for additional information
  const [totalPopulation, setTotalPopulation] = useState<number>(0);
  const [selectionsLocked, setSelectionsLocked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [display_raster, setdisplay_raster] = useState<clip_rasters[]>([]);
  // Load states on component mount
  useEffect(() => {
    const fetchStates = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/stp/get_states?all_data=true');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        const stateData: State[] = data.map((state: any) => ({
          id: state.id,
          name: state.name
        }));
        
        setStates(stateData);
      } catch (error) {
        console.error('Error fetching states:', error);
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
      setSubDistricts([]);
      setTowns([]);
      return;
    }
    
    const fetchDistricts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/stp/get_districts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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
          stateId: selectedState
        }));
        
        setDistricts(districtData);
      } catch (error) {
        console.error('Error fetching districts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDistricts();
    
    // Reset dependent selections when state changes
    setSelectedDistricts([]);
    setSelectedSubDistricts([]);
    setSelectedTowns([]);
    setTotalPopulation(0);
  }, [selectedState]);
  
  // Load sub-districts when districts are selected
  useEffect(() => {
    if (selectedDistricts.length === 0) {
      setSubDistricts([]);
      setTowns([]);
      return;
    }
    
    const fetchSubDistricts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/stp/get_sub_districts/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            districts: selectedDistricts 
          }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        const subDistrictData: SubDistrict[] = data.map((subDistrict: any) => ({
          id: subDistrict.id,
          name: subDistrict.name,
          districtId: subDistrict.district_id || selectedDistricts[0],
        }));
        
        setSubDistricts(subDistrictData);
      } catch (error) {
        console.error('Error fetching sub-districts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubDistricts();
    
    // Reset dependent selections when districts change
    setSelectedSubDistricts([]);
    setSelectedTowns([]);
    setTotalPopulation(0);
  }, [selectedDistricts]);
  
  useEffect(() => {
      const disp_raster = async () => {
        if (selectionsLocked === true) {
          console.log("Starting fetch...");
          try {
            const response = await fetch(
              "/api/stp_operation/stp_sutability_visual_display",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                  clip: selectedTowns,
                  place:"sub_district",}),
              }
            );
  
            const data = await response.json();
            setdisplay_raster(data);
          } catch (error) {
            console.error("Error:", error);
          }
        }
      };
  
      disp_raster();
    }, [selectionsLocked, selectedSubDistricts]);
  // Load towns when sub-districts are selected
  useEffect(() => {
    if (selectedSubDistricts.length === 0) {
      setTowns([]);
      return;
    }
    
    const fetchTowns = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/stp/get_towns/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            subdis_code: selectedSubDistricts 
          }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("nerw data ",data)
        const townData: Towns[] = data.map((town: any) => ({
          id: town.id,
          name: town.name,
          population: town.population || 0,
        }));
        
        setTowns(townData);
      } catch (error) {
        console.error('Error fetching towns:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTowns();
    
    // Reset town selections when sub-districts change
    setSelectedTowns([]);
    setTotalPopulation(0);
  }, [selectedSubDistricts]);

  // Calculate total population based on selected TOWNS (not sub-districts)
  useEffect(() => {
    if (selectedTowns.length > 0) {
      // Filter to get only selected towns
      const selectedTownObjects = towns.filter(town => 
        selectedTowns.includes(Number(town.id))
      );
      
      // Calculate total population from selected towns
      const total = selectedTownObjects.reduce(
        (sum, town) => sum + (town.population || 0), 
        0
      );
      
      setTotalPopulation(total);
    } else {
      setTotalPopulation(0);
    }
  }, [towns, selectedTowns]);

  // Handle state selection
  const handleStateChange = (stateId: number): void => {
    setSelectedState(stateId);
    setSelectedDistricts([]);
    setSelectedSubDistricts([]);
    setSelectedTowns([]);
    setSelectionsLocked(false);
    setTotalPopulation(0);
  };
  
  // Lock selections and return selected data (now requires towns to be selected)
  const confirmSelections = (): SelectionsData | null => {
    // Changed: Now requires towns to be selected instead of just sub-districts
    if (selectedTowns.length === 0) {
      return null;
    }
    
    const selectedSubDistrictObjects = subDistricts.filter(subDistrict => 
      selectedSubDistricts.includes(Number(subDistrict.id))
    );
    
    const selectedTownObjects = towns.filter(town => 
      selectedTowns.includes(Number(town.id))
    );
    
    setSelectionsLocked(true);
    
    // Population is now calculated from selected towns, not sub-districts
    return {
      subDistricts: selectedSubDistrictObjects,
      towns: selectedTownObjects,
      totalPopulation // This comes from selected towns
    };
  };
  
  // Reset all selections
  const resetSelections = (): void => {
    setSelectedState(null);
    setSelectedDistricts([]);
    setSelectedSubDistricts([]);
    setSelectedTowns([]);
    setTotalPopulation(0);
    setSelectionsLocked(false);
  };
  
  // Context value
  const contextValue: LocationContextType = {
    states,
    districts,
    subDistricts,
    towns,
    selectedState,
    selectedDistricts,
    selectedSubDistricts,
    selectedTowns,
    totalPopulation,
    selectionsLocked,
    isLoading,
    handleStateChange,
    setSelectedDistricts,
    setSelectedSubDistricts,
    setSelectedTowns,
    confirmSelections,
    resetSelections,
    display_raster,
    setdisplay_raster
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
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};