// services/api.ts

// Define the base URL for your DRF API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Interface for organization data
export interface Organization {
  id: number;
  name: string;
}

// Interface for raster file data
export interface RasterFile {
  id: number;
  name: string;
  url: string;
  organization_id: number;
  organization_name?: string;
  description?: string;
  date_uploaded?: string;
  file_size?: number;
  extent?: [number, number, number, number]; // [minX, minY, maxX, maxY]
  projection?: string;
}

// Helper function to handle fetch errors
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP error! Status: ${response.status}`);
  }
  return response.json();
};

// API methods
export const RasterAPI = {
  // Get all organizations
  getAllOrganizations: async (): Promise<Organization[]> => {
    const response = await fetch(`${API_BASE_URL}/organizations/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<Organization[]>(response);
  },

  // Get all raster files
  getAllRasters: async (): Promise<RasterFile[]> => {
    const response = await fetch(`${API_BASE_URL}/rasters/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<RasterFile[]>(response);
  },
  
  // Get raster files by organization
  getRastersByOrganization: async (organizationId: number): Promise<RasterFile[]> => {
    const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/rasters/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<RasterFile[]>(response);
  },

  // Get a specific raster file by ID
  getRasterById: async (id: number): Promise<RasterFile> => {
    const response = await fetch(`${API_BASE_URL}/rasters/${id}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<RasterFile>(response);
  },

  // Download a raster file
  downloadRaster: async (id: number): Promise<Blob> => {
    const response = await fetch(`${API_BASE_URL}/rasters/${id}/download/`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error! Status: ${response.status}`);
    }
    
    return response.blob();
  },

  // Upload a new raster file (if your app needs this functionality)
  uploadRaster: async (formData: FormData): Promise<RasterFile> => {
    const response = await fetch(`${API_BASE_URL}/rasters/upload/`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header manually when using FormData
      // The browser will set it automatically with the correct boundary
    });
    
    return handleResponse<RasterFile>(response);
  },
};

export default RasterAPI;