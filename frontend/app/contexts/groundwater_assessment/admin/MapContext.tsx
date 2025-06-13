"use client";

import React, {
  createContext,
  useContext,
  useRef,
  useEffect,
  ReactNode,
  useState,
} from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import ImageLayer from "ol/layer/Image";
import ImageWMS from "ol/source/ImageWMS";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import { fromLonLat } from "ol/proj";
import { useLocation } from "@/app/contexts/groundwater_assessment/admin/LocationContext";

// Base maps configuration
interface BaseMapDefinition {
  name: string;
  source: () => OSM | XYZ;
  icon: string;
}

const baseMaps: Record<string, BaseMapDefinition> = {
  osm: {
    name: 'OpenStreetMap',
    source: () => new OSM({ crossOrigin: 'anonymous' }),
    icon: 'M9 20l-5.447-2.724...',
  },
  satellite: {
    name: 'Esri World Imagery',
    source: () => new XYZ({
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      maxZoom: 19,
      crossOrigin: 'anonymous',
    }),
    icon: 'M17.66 8L12 2.35...',
  },
  street: {
    name: 'Esri World Street Map',
    source: () =>
      new XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        maxZoom: 19,
        attributions: 'Tiles © <a href="https://www.arcgis.com/home/item.html?id=3b93337983e9436f8db950e38a8629af">Esri</a>',
        crossOrigin: 'anonymous'
      }),
    icon: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0',
  },
  terrain: {
    name: 'Stamen Terrain',
    source: () =>
      new XYZ({
        url: 'https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg',
        maxZoom: 19,
        attributions: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.',
        crossOrigin: 'anonymous'
      }),
    icon: 'M14 11l4-8H6l4 8H6l6 10 6-10h-4z',
  },
  cartoLight: {
    name: 'Carto Light',
    source: () =>
      new XYZ({
        url: 'https://{a-d}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        maxZoom: 19,
        attributions: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, © <a href="https://carto.com/attributions">CARTO</a>',
        crossOrigin: 'anonymous'
      }),
    icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
  },
  topo: {
    name: 'Esri World Topographic Map',
    source: () =>
      new XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        maxZoom: 19,
        attributions: 'Tiles © <a href="https://www.arcgis.com/home/item.html?id=30e5fe3149c34df1ba922e6f5bbf808f">Esri</a>',
        crossOrigin: 'anonymous'
      }),
    icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9zM9 21V9h6v12',
  },
};

interface MapContextType {
  mapInstance: Map | null;
  selectedBaseMap: string;
  setMapContainer: (container: HTMLDivElement | null) => void;
  changeBaseMap: (baseMapKey: string) => void;
}

interface MapProviderProps {
  children: ReactNode;
}

const MapContext = createContext<MapContextType>({
  mapInstance: null,
  selectedBaseMap: 'osm',
  setMapContainer: () => {},
  changeBaseMap: () => {},
});

export const MapProvider: React.FC<MapProviderProps> = ({ children }) => {
  const mapInstanceRef = useRef<Map | null>(null);
  const baseLayerRef = useRef<TileLayer<any> | null>(null);
  const indiaLayerRef = useRef<ImageLayer<any> | null>(null);
  const stateLayerRef = useRef<ImageLayer<any> | null>(null);
  const districtLayerRef = useRef<ImageLayer<any> | null>(null);
  const subdistrictLayerRef = useRef<ImageLayer<any> | null>(null);
  const basinWellLayerRef = useRef<ImageLayer<any> | null>(null); // New ref for basin well layer
  const [mapContainer, setMapContainer] = useState<HTMLDivElement | null>(null);
  
  const [selectedBaseMap, setSelectedBaseMap] = useState<string>('osm');

  const {
    selectedState,
    selectedDistricts,
    selectedSubDistricts,
  } = useLocation();

  // Initialize map when container is set
  useEffect(() => {
    if (!mapContainer || mapInstanceRef.current) return;

    const initialBaseLayer = new TileLayer({
      source: baseMaps.osm.source(),
      zIndex: 0,
    });

    // Create India base layer
    const indiaLayer = new ImageLayer({
      source: new ImageWMS({
        url: 'http://localhost:9091/geoserver/myworkspace/wfs',
        params: {
          LAYERS: 'myworkspace:India',
          TILED: true,
        },
        ratio: 1,
        serverType: 'geoserver',
        crossOrigin: 'anonymous',
      }),
      zIndex: 1,
      opacity: 0.1,
    });

    baseLayerRef.current = initialBaseLayer;
    indiaLayerRef.current = indiaLayer;

    const map = new Map({
      target: mapContainer,
      layers: [initialBaseLayer, indiaLayer],
      view: new View({
        center: fromLonLat([78.9629, 20.5937]), // Center of India
        zoom: 4,
      }),
    });

    mapInstanceRef.current = map;
    console.log('Map initialized with India base layer');
  }, [mapContainer]);

  // Create WMS layer helper with error handling
  const createWMSLayer = (
    layerName: string,
    cqlFilter: string,
    zIndex: number,
    opacity: number
  ): ImageLayer<any> => {
    console.log(`Creating WMS layer: ${layerName} with filter: ${cqlFilter}`);
    
    const layer = new ImageLayer({
      source: new ImageWMS({
        url: 'http://localhost:9091/geoserver/myworkspace/wfs',
        params: {
          LAYERS: `myworkspace:${layerName}`,
          TILED: true,
          CQL_FILTER: cqlFilter,
        },
        ratio: 1,
        serverType: 'geoserver',
        crossOrigin: 'anonymous',
      }),
      zIndex,
      opacity,
    });

    // Add error handling
    const source = layer.getSource() as ImageWMS;
    source.on('imageloaderror', (event: any) => {
      console.error(`Error loading layer ${layerName}:`, event);
    });

    source.on('imageloadstart', () => {
      console.log(`Started loading layer ${layerName}`);
    });

    source.on('imageloadend', () => {
      console.log(`Successfully loaded layer ${layerName}`);
    });

    return layer;
  };

  // Zoom to feature helper
  const zoomToFeature = async (layerName: string, cqlFilter: string) => {
    if (!mapInstanceRef.current) return;

    try {
      console.log(`Attempting to zoom to ${layerName} with filter: ${cqlFilter}`);
      
      const wfsUrl = `http://localhost:9091/geoserver/myworkspace/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=myworkspace:${layerName}&outputFormat=application/json&CQL_FILTER=${encodeURIComponent(cqlFilter)}`;
      
      const response = await fetch(wfsUrl);
      if (!response.ok) {
        throw new Error(`WFS request failed: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`WFS response for ${layerName}:`, data);
      
      if (data.features && data.features.length > 0) {
        // Calculate bounds from all features
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        let validCoords = false;
        
        data.features.forEach((feature: any) => {
          if (feature.geometry && feature.geometry.coordinates) {
            const coords = feature.geometry.coordinates;
            
            // Handle different geometry types
            const processCoords = (coordArray: any) => {
              if (Array.isArray(coordArray)) {
                coordArray.forEach((item: any) => {
                  if (Array.isArray(item)) {
                    if (typeof item[0] === 'number' && typeof item[1] === 'number') {
                      // This is a coordinate pair
                      const x = item[0];
                      const y = item[1];
                      if (x >= -180 && x <= 180 && y >= -90 && y <= 90) { // Valid lat/lng
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                        validCoords = true;
                      }
                    } else {
                      // Nested array, process recursively
                      processCoords(item);
                    }
                  }
                });
              }
            };
            
            processCoords(coords);
          }
        });

        if (validCoords && minX !== Infinity) {
          console.log(`Calculated bounds: [${minX}, ${minY}, ${maxX}, ${maxY}]`);
          
          // Transform extent to map projection
          const extent = [
            ...fromLonLat([minX, minY]),
            ...fromLonLat([maxX, maxY])
          ];
          
          // Add some padding and ensure reasonable zoom level
          const view = mapInstanceRef.current.getView();
          view.fit(extent, {
            padding: [50, 50, 50, 50],
            maxZoom: layerName === 'B_subdistrict' ? 12 : layerName === 'B_district' ? 10 : 8,
            duration: 1000,
          });
          
          console.log(`Successfully zoomed to ${layerName}`);
        } else {
          console.warn(`No valid coordinates found for ${layerName}`);
        }
      } else {
        console.warn(`No features found for ${layerName} with filter: ${cqlFilter}`);
      }
    } catch (error) {
      console.error(`Error zooming to ${layerName}:`, error);
      // Don't break the map if zoom fails, just log the error
    }
  };

  // Update state layer
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedState) {
      // Remove state layer if no state selected
      if (stateLayerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(stateLayerRef.current);
        stateLayerRef.current = null;
      }
      return;
    }

    // Remove existing state layer
    if (stateLayerRef.current) {
      mapInstanceRef.current.removeLayer(stateLayerRef.current);
    }

    // Format state code with leading zeros (e.g., 9 -> 09, 8 -> 08)
    const formattedStateCode = selectedState.toString().padStart(2, '0');
    const cqlFilter = `STATE_CODE = '${formattedStateCode}'`;
    const stateLayer = createWMSLayer('B_district', cqlFilter, 2, 0.3);
    
    stateLayerRef.current = stateLayer;
    mapInstanceRef.current.addLayer(stateLayer);

    // Zoom to selected state
    zoomToFeature('B_district', cqlFilter);

    console.log('Added state layer with filter:', cqlFilter);
  }, [selectedState]);

  // Update district layer
  useEffect(() => {
    if (!mapInstanceRef.current || selectedDistricts.length === 0) {
      // Remove district layer if no districts selected
      if (districtLayerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(districtLayerRef.current);
        districtLayerRef.current = null;
      }
      return;
    }

    // Remove existing state layer when districts are selected
    if (stateLayerRef.current) {
      mapInstanceRef.current.removeLayer(stateLayerRef.current);
      stateLayerRef.current = null;
    }

    // Remove existing district layer
    if (districtLayerRef.current) {
      mapInstanceRef.current.removeLayer(districtLayerRef.current);
    }

    try {
      // Format district codes (ensure proper string format)
      const districtCodes = selectedDistricts.map(code => `'${code}'`).join(',');
      const cqlFilter = `DISTRICT_C IN (${districtCodes})`;
      const districtLayer = createWMSLayer('B_subdistrict', cqlFilter, 3, 0.3);
      
      districtLayerRef.current = districtLayer;
      mapInstanceRef.current.addLayer(districtLayer);

      // Zoom to selected districts
      zoomToFeature('B_district', cqlFilter);

      console.log('Added district layer with filter:', cqlFilter);
    } catch (error) {
      console.error('Error creating district layer:', error);
    }
  }, [selectedDistricts]);

  // Update subdistrict and basin well layers
  useEffect(() => {
    if (!mapInstanceRef.current || selectedSubDistricts.length === 0) {
      // Remove subdistrict layer if no subdistricts selected
      if (subdistrictLayerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(subdistrictLayerRef.current);
        subdistrictLayerRef.current = null;
      }
      
      // Remove basin well layer if no subdistricts selected
      if (basinWellLayerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(basinWellLayerRef.current);
        basinWellLayerRef.current = null;
      }
      return;
    }

    // Remove existing district layer when subdistricts are selected
    if (districtLayerRef.current) {
      mapInstanceRef.current.removeLayer(districtLayerRef.current);
      districtLayerRef.current = null;
    }

    // Remove existing subdistrict layer
    if (subdistrictLayerRef.current) {
      mapInstanceRef.current.removeLayer(subdistrictLayerRef.current);
    }

    // Remove existing basin well layer
    if (basinWellLayerRef.current) {
      mapInstanceRef.current.removeLayer(basinWellLayerRef.current);
    }

    try {
      // Format subdistrict codes (ensure proper string format)
      const subdistrictCodes = selectedSubDistricts.map(code => `'${code}'`).join(',');
      const cqlFilter = `SUBDIS_COD IN (${subdistrictCodes})`;
      
      console.log('Creating subdistrict layer with filter:', cqlFilter);
      
      // Create Village layer (subdistrict layer)
      const subdistrictLayer = createWMSLayer('Village', cqlFilter, 4, 0.3);
      
      // Add error handling for subdistrict layer loading
      subdistrictLayer.getSource().on('imageloaderror', (event: any) => {
        console.error('Subdistrict layer loading error:', event);
      });
      
      subdistrictLayer.getSource().on('imageloadend', () => {
        console.log('Subdistrict layer loaded successfully');
      });
      
      subdistrictLayerRef.current = subdistrictLayer;
      mapInstanceRef.current.addLayer(subdistrictLayer);

      // Create Basin Well layer with same filter
      console.log('Creating basin well layer with filter:', cqlFilter);
      const basinWellLayer = createWMSLayer('basin_well', cqlFilter, 5, 0.5);
      
      // Add error handling for basin well layer loading
      basinWellLayer.getSource().on('imageloaderror', (event: any) => {
        console.error('Basin well layer loading error:', event);
      });
      
      basinWellLayer.getSource().on('imageloadend', () => {
        console.log('Basin well layer loaded successfully');
      });
      
      basinWellLayerRef.current = basinWellLayer;
      mapInstanceRef.current.addLayer(basinWellLayer);

      // Zoom to selected subdistricts
      zoomToFeature('Village', cqlFilter);

      console.log('Added subdistrict and basin well layers with filter:', cqlFilter);
    } catch (error) {
      console.error('Error creating subdistrict or basin well layer:', error);
      // Ensure we don't break the map if layers fail
    }
  }, [selectedSubDistricts]);

  // Change base map
  const changeBaseMap = (baseMapKey: string) => {
    if (!mapInstanceRef.current || !baseLayerRef.current) {
      console.warn('Cannot change basemap: map or base layer not initialized');
      return;
    }

    try {
      mapInstanceRef.current.removeLayer(baseLayerRef.current);

      const newBaseLayer = new TileLayer({
        source: baseMaps[baseMapKey].source(),
        zIndex: 0,
      });

      baseLayerRef.current = newBaseLayer;
      mapInstanceRef.current.getLayers().insertAt(0, newBaseLayer);
      setSelectedBaseMap(baseMapKey);
      
      console.log(`Changed basemap to: ${baseMapKey}`);
    } catch (error) {
      console.error('Error changing basemap:', error);
    }
  };

  const contextValue: MapContextType = {
    mapInstance: mapInstanceRef.current,
    selectedBaseMap,
    setMapContainer,
    changeBaseMap,
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget('');
        mapInstanceRef.current = null;
      }
      baseLayerRef.current = null;
      indiaLayerRef.current = null;
      stateLayerRef.current = null;
      districtLayerRef.current = null;
      subdistrictLayerRef.current = null;
      basinWellLayerRef.current = null; // Clean up basin well layer ref
    };
  }, []);

  return (
    <MapContext.Provider value={contextValue}>
      {children}
    </MapContext.Provider>
  );
};

export const useMap = (): MapContextType => {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error("useMap must be used within a MapProvider");
  }
  return context;
};