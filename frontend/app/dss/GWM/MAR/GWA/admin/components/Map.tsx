'use client';

import React, { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { fromLonLat } from 'ol/proj';
import 'ol/ol.css';

const MapComponent = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            attributions: [
              'Tiles © <a href="https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9">Esri</a>, USGS, NOAA',
            ],
          }),
        }),
      ],
      view: new View({
        center: fromLonLat([78.9629, 20.5937]), // Centered on India
        zoom: 5,
      }),
    });

    map.updateSize();
    map.renderSync();

    return () => {
      map.setTarget('');
    };
  }, []);

  return <div ref={mapRef} className="w-full h-[600px]" />;
};

export default MapComponent;