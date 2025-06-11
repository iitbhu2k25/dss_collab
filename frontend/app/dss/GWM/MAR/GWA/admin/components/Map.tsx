'use client';

import React, { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import { fromLonLat } from 'ol/proj';
import 'ol/ol.css';

// Define base map type interface
interface BaseMapDefinition {
  name: string;
  source: () => OSM | XYZ;
  icon: string;
}

// Define baseMaps with appropriate TypeScript typing
const baseMaps: Record<string, BaseMapDefinition> = {
  osm: {
    name: 'OpenStreetMap',
    source: () => new OSM({
      crossOrigin: 'anonymous'
    }),
    icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
  },
  satellite: {
    name: 'Esri World Imagery',
    source: () =>
      new XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        maxZoom: 19,
        attributions: 'Tiles © <a href="https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9">Esri</a>, USGS, NOAA',
        crossOrigin: 'anonymous'
      }),
    icon: 'M17.66 8L12 2.35 6.34 8C4.78 9.56 4 11.64 4 13.64s.78 4.11 2.34 5.67 3.61 2.35 5.66 2.35 4.1-.79 5.66-2.35S20 15.64 20 13.64 19.22 9.56 17.66 8z',
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

const MapComponent = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const baseLayerRef = useRef<TileLayer<any> | null>(null);
  const [selectedBaseMap, setSelectedBaseMap] = useState<string>('satellite');
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);

  // Initialize the map
  useEffect(() => {
    if (!mapRef.current) return;

    // Create initial base layer
    const initialBaseLayer = new TileLayer({
      source: baseMaps.satellite.source(),
      zIndex: 0,
      properties: { type: 'base' },
    });

    baseLayerRef.current = initialBaseLayer;

    // Create the map
    const map = new Map({
      target: mapRef.current,
      layers: [initialBaseLayer],
      view: new View({
        center: fromLonLat([78.9629, 20.5937]), // Centered on India
        zoom: 5,
      }),
    });

    mapInstanceRef.current = map;
    map.updateSize();
    map.renderSync();

    return () => {
      map.setTarget('');
    };
  }, []);

  // Change basemap
  const changeBaseMap = (baseMapKey: string) => {
    if (!mapInstanceRef.current || !baseLayerRef.current) return;

    // Remove current base layer
    mapInstanceRef.current.removeLayer(baseLayerRef.current);

    // Create and add new base layer
    const baseMapConfig = baseMaps[baseMapKey];
    const newBaseLayer = new TileLayer({
      source: baseMapConfig.source(),
      zIndex: 0,
      properties: { type: 'base' },
    });

    // Update reference and add to map
    baseLayerRef.current = newBaseLayer;
    mapInstanceRef.current.getLayers().insertAt(0, newBaseLayer);
    mapInstanceRef.current.renderSync();

    // Update state
    setSelectedBaseMap(baseMapKey);
    setIsPanelOpen(false); // Close panel after selection
  };

  // Toggle panel visibility
  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  // Close panel when clicking outside
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsPanelOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full h-[600px] flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="relative w-full h-full flex-grow overflow-hidden rounded-xl shadow-2xl border border-gray-200">
        <div ref={mapRef} className="w-full h-full bg-blue-50" />
        <div className="absolute top-3 right-2 sm:right-4 z-10" ref={panelRef}>
          <button
            onClick={togglePanel}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-white/20 transition-all duration-200 hover:scale-110"
            title="Change Basemap"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </button>
          {isPanelOpen && (
            <div className="absolute top-12 right-0 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl p-4 sm:p-6 w-72 sm:w-80 z-50 animate-in slide-in-from-top-2 duration-300 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 flex items-center text-lg">
                  <svg
                    className="w-5 h-5 mr-2 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                  Base Maps
                </h3>
                <button
                  onClick={() => setIsPanelOpen(false)}
                  className="text-gray-400 hover:text-gray-600 rounded-full p-2 hover:bg-gray-100 transition-all duration-200"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(baseMaps).map(([key, baseMap]) => (
                  <button
                    key={key}
                    onClick={() => changeBaseMap(key)}
                    className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl transition-all duration-200 border-2 ${
                      selectedBaseMap === key
                        ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300 text-blue-700 transform scale-105 shadow-lg'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200 hover:border-gray-300 hover:scale-102'
                    }`}
                  >
                    <svg
                      className="w-6 h-6 sm:w-8 sm:h-8 mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={baseMap.icon}
                      />
                    </svg>
                    <span className="text-xs sm:text-sm font-medium text-center leading-tight">
                      {baseMap.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        @keyframes animate-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-in {
          animation: animate-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MapComponent;