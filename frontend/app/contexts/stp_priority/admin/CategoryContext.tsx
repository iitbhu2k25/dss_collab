'use client'
import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { DataRow } from '@/app/interface/table';
// =============================================
// TYPES AND INTERFACES
// =============================================

export interface Category {
  id: number;
  file_name: string;
  weight: number;
  description?: string;
  category_type?: string;
  data_source?: string;
  last_updated?: string;
  is_active?: boolean;
}

export interface SelectRasterLayer {
  file_name: string;
  Influence: number;
  weight?: number;
  priority?: number;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
}

interface CategoryContextType {
  // Core data
  categories: Category[];
  selectedCategories: SelectRasterLayer[];
  
  // Category management
  toggleCategory: (file_name: string) => void;
  updateCategoryInfluence: (file_name: string, influence: number) => void;
  updateCategoryWeight: (file_name: string, weight: number) => void;
  selectAllCategories: () => void;
  clearAllCategories: () => void;
  
  // Category utilities
  isSelected: (file_name: string) => boolean;
  getCategoryInfluence: (file_name: string) => number;
  getCategoryWeight: (file_name: string) => number;
  getSelectedCategoriesWithWeights: () => SelectRasterLayer[];
  
  // Process management
  stpProcess: boolean;
  setStpProcess: (value: boolean) => void;
  
  // Loading and error states
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  
  // Table management
  showTable: boolean;
  setShowTable: (value: boolean) => void;
  tableData: DataRow[];
  setTableData: (value: DataRow[]) => void;
  
  // API functions
  refreshCategories: () => Promise<void>;
  exportSelectedCategories: () => string;
  importSelectedCategories: (data: string) => boolean;
  
  // Validation
  validateSelection: () => { isValid: boolean; message?: string };
}

interface CategoryProviderProps {
  children: ReactNode;
  apiBaseUrl?: string;
  enableAutoSave?: boolean;
  maxCategories?: number;
}

// =============================================
// CONTEXT CREATION
// =============================================

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

// =============================================
// ENHANCED CATEGORY PROVIDER
// =============================================

export const CategoryProvider = ({ 
  children, 
  
  enableAutoSave = true,
  maxCategories = 10
}: CategoryProviderProps) => {
  // Core state
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryItems, setSelectedCategoryItems] = useState<SelectRasterLayer[]>([]);
  const [stpProcess, setStpProcess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Table state
  const [tableData, setTableData] = useState<DataRow[]>([]);
  const [showTable, setShowTable] = useState<boolean>(false);

  // =============================================
  // WEIGHT CALCULATION LOGIC
  // =============================================

  const calculateWeights = useCallback((categories: SelectRasterLayer[]): SelectRasterLayer[] => {
    if (categories.length === 0) return [];
    
    // Calculate sum of all influences
    const totalInfluence = categories.reduce((sum, category) => sum + category.Influence, 0);
    
    // If sum is 0, assign equal weights
    if (totalInfluence === 0) {
      const equalWeight = parseFloat((1 / categories.length).toFixed(4));
      return categories.map(category => ({
        ...category,
        weight: equalWeight
      }));
    }
    
    // Calculate normalized weights
    return categories.map((category, index) => {
      const weight = parseFloat((category.Influence / totalInfluence).toFixed(4));
      return {
        ...category,
        weight,
        priority: index + 1
      };
    });
  }, []);

  // Memoized selected categories with calculated weights
  const selectedCategories = useMemo(() => {
    return calculateWeights(selectedCategoryItems);
  }, [selectedCategoryItems, calculateWeights]);

  // =============================================
  // API FUNCTIONS
  // =============================================

  const fetchCategories = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/stp_sutability/get_priority_category?all_data=true', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },  
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: Category[] = await response.json();
      
      // Validate and clean data
      const validatedData = data.filter(item => 
        item && 
        typeof item.file_name === 'string' && 
        item.file_name.length > 0 &&
        typeof item.weight === 'number' && 
        item.weight >= 0
      );
      
      setCategories(validatedData);
      
      // Load saved selections from localStorage if available
      if (enableAutoSave) {
        try {
          const saved = localStorage.getItem('selectedCategories');
          if (saved) {
            const savedCategories: SelectRasterLayer[] = JSON.parse(saved);
            // Validate saved categories still exist
            const validSaved = savedCategories.filter(saved => 
              validatedData.some(cat => cat.file_name === saved.file_name)
            );
            setSelectedCategoryItems(validSaved);
          }
        } catch (e) {
          console.warn('Failed to load saved categories:', e);
        }
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch categories';
      setError(errorMessage);
      console.error('Error fetching categories:', err);
    } finally {
      setIsLoading(false);
    }
  }, [ enableAutoSave]);

  const refreshCategories = useCallback(async (): Promise<void> => {
    await fetchCategories();
  }, [fetchCategories]);

  // =============================================
  // CATEGORY MANAGEMENT FUNCTIONS
  // =============================================

  const toggleCategory = useCallback((file_name: string): void => {
    setSelectedCategoryItems(prev => {
      const isSelected = prev.some(item => item.file_name === file_name);
      
      let newSelection: SelectRasterLayer[];
      
      if (isSelected) {
        // Remove if already selected
        newSelection = prev.filter(item => item.file_name !== file_name);
      } else {
        // Check max categories limit
        if (prev.length >= maxCategories) {
          setError(`Maximum ${maxCategories} categories can be selected`);
          return prev;
        }
        
        // Add with default weight from categories
        const category = categories.find(cat => cat.file_name === file_name);
        if (category) {
          newSelection = [...prev, { 
            file_name, 
            Influence: category.weight,
            weight: 0, // Will be calculated
            priority: prev.length + 1
          }];
        } else {
          setError(`Category ${file_name} not found`);
          return prev;
        }
      }
      
      // Auto-save if enabled
      if (enableAutoSave) {
        try {
          localStorage.setItem('selectedCategories', JSON.stringify(newSelection));
        } catch (e) {
          console.warn('Failed to save categories:', e);
        }
      }
      
      return newSelection;
    });
  }, [categories, maxCategories, enableAutoSave]);

  const updateCategoryInfluence = useCallback((file_name: string, influence: number): void => {
    // Clamp influence between 0 and 100
    const clampedInfluence = Math.min(Math.max(influence, 0), 100);
    
    setSelectedCategoryItems(prev => {
      const categoryIndex = prev.findIndex(item => item.file_name === file_name);
      
      if (categoryIndex !== -1) {
        // Update existing category influence
        const updatedCategories = [...prev];
        updatedCategories[categoryIndex] = {
          ...updatedCategories[categoryIndex],
          Influence: clampedInfluence
        };
        
        // Auto-save if enabled
        if (enableAutoSave) {
          try {
            localStorage.setItem('selectedCategories', JSON.stringify(updatedCategories));
          } catch (e) {
            console.warn('Failed to save categories:', e);
          }
        }
        
        return updatedCategories;
      } else {
        // Add category with custom influence if not already selected
        const category = categories.find(cat => cat.file_name === file_name);
        if (category) {
          const newSelection = [...prev, { 
            file_name, 
            Influence: clampedInfluence,
            weight: 0,
            priority: prev.length + 1
          }];
          
          if (enableAutoSave) {
            try {
              localStorage.setItem('selectedCategories', JSON.stringify(newSelection));
            } catch (e) {
              console.warn('Failed to save categories:', e);
            }
          }
          
          return newSelection;
        }
        return prev;
      }
    });
  }, [categories, enableAutoSave]);

  const updateCategoryWeight = useCallback((file_name: string, weight: number): void => {
    const clampedWeight = Math.min(Math.max(weight, 0), 1);
    
    setSelectedCategoryItems(prev => {
      const categoryIndex = prev.findIndex(item => item.file_name === file_name);
      
      if (categoryIndex !== -1) {
        const updatedCategories = [...prev];
        updatedCategories[categoryIndex] = {
          ...updatedCategories[categoryIndex],
          weight: clampedWeight
        };
        return updatedCategories;
      }
      return prev;
    });
  }, []);

  const selectAllCategories = useCallback((): void => {
    const limitedCategories = categories.slice(0, maxCategories);
    const allCategories = limitedCategories.map((category, index) => ({
      file_name: category.file_name,
      Influence: category.weight,
      weight: 0,
      priority: index + 1
    }));
    
    setSelectedCategoryItems(allCategories);
    
    if (enableAutoSave) {
      try {
        localStorage.setItem('selectedCategories', JSON.stringify(allCategories));
      } catch (e) {
        console.warn('Failed to save categories:', e);
      }
    }
    
    if (categories.length > maxCategories) {
      setError(`Only first ${maxCategories} categories selected due to limit`);
    }
  }, [categories, maxCategories, enableAutoSave]);

  const clearAllCategories = useCallback((): void => {
    setSelectedCategoryItems([]);
    
    if (enableAutoSave) {
      try {
        localStorage.removeItem('selectedCategories');
      } catch (e) {
        console.warn('Failed to clear saved categories:', e);
      }
    }
  }, [enableAutoSave]);

  // =============================================
  // UTILITY FUNCTIONS
  // =============================================

  const isSelected = useCallback((file_name: string): boolean => {
    return selectedCategoryItems.some(item => item.file_name === file_name);
  }, [selectedCategoryItems]);

  const getCategoryInfluence = useCallback((file_name: string): number => {
    const selectedCategory = selectedCategoryItems.find(item => item.file_name === file_name);
    if (selectedCategory) {
      return selectedCategory.Influence;
    }
    
    const defaultCategory = categories.find(cat => cat.file_name === file_name);
    return defaultCategory ? defaultCategory.weight : 0;
  }, [selectedCategoryItems, categories]);

  const getCategoryWeight = useCallback((file_name: string): number => {
    const selectedCategory = selectedCategories.find(item => item.file_name === file_name);
    return selectedCategory?.weight ?? 0;
  }, [selectedCategories]);

  const getSelectedCategoriesWithWeights = useCallback((): SelectRasterLayer[] => {
    return selectedCategories;
  }, [selectedCategories]);

  const validateSelection = useCallback((): { isValid: boolean; message?: string } => {
    if (selectedCategories.length === 0) {
      return { isValid: false, message: 'Please select at least one category' };
    }
    
    if (selectedCategories.length > maxCategories) {
      return { isValid: false, message: `Maximum ${maxCategories} categories allowed` };
    }
    
    const totalWeight = selectedCategories.reduce((sum, cat) => sum + (cat.weight || 0), 0);
    if (Math.abs(totalWeight - 1.0) > 0.01) {
      return { isValid: false, message: 'Category weights must sum to 1.0' };
    }
    
    return { isValid: true };
  }, [selectedCategories, maxCategories]);

  const exportSelectedCategories = useCallback((): string => {
    const exportData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      categories: selectedCategories,
      metadata: {
        totalCategories: categories.length,
        selectedCount: selectedCategories.length
      }
    };
    return JSON.stringify(exportData, null, 2);
  }, [selectedCategories, categories.length]);

  const importSelectedCategories = useCallback((data: string): boolean => {
    try {
      const importData = JSON.parse(data);
      
      if (importData.categories && Array.isArray(importData.categories)) {
        // Validate imported categories exist in current categories
        const validCategories = importData.categories.filter((imported: SelectRasterLayer) =>
          categories.some(cat => cat.file_name === imported.file_name)
        );
        
        setSelectedCategoryItems(validCategories);
        
        if (enableAutoSave) {
          localStorage.setItem('selectedCategories', JSON.stringify(validCategories));
        }
        
        return true;
      }
      return false;
    } catch (e) {
      setError('Failed to import categories: Invalid format');
      return false;
    }
  }, [categories, enableAutoSave]);

  // =============================================
  // EFFECTS
  // =============================================

  // Initial data fetch
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // =============================================
  // CONTEXT VALUE
  // =============================================

  const contextValue: CategoryContextType = {
    // Core data
    categories,
    selectedCategories,
    
    // Category management
    toggleCategory,
    updateCategoryInfluence,
    updateCategoryWeight,
    selectAllCategories,
    clearAllCategories,
    
    // Category utilities
    isSelected,
    getCategoryInfluence,
    getCategoryWeight,
    getSelectedCategoriesWithWeights,
    
    // Process management
    stpProcess,
    setStpProcess,
    
    // Loading and error states
    isLoading,
    error,
    setError,
    
    // Table management
    showTable,
    setShowTable,
    tableData,
    setTableData,
    
    // API functions
    refreshCategories,
    exportSelectedCategories,
    importSelectedCategories,
    
    // Validation
    validateSelection
  };

  return (
    <CategoryContext.Provider value={contextValue}>
      {children}
    </CategoryContext.Provider>
  );
};

// =============================================
// CUSTOM HOOK
// =============================================

export const useCategory = (): CategoryContextType => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategory must be used within a CategoryProvider');
  }
  return context;
};

// =============================================
// ADDITIONAL UTILITY HOOKS
// =============================================

export const useCategoryValidation = () => {
  const { selectedCategories, validateSelection } = useCategory();
  
  return useMemo(() => {
    const validation = validateSelection();
    return {
      ...validation,
      hasSelection: selectedCategories.length > 0,
      selectionCount: selectedCategories.length,
      totalWeight: selectedCategories.reduce((sum, cat) => sum + (cat.weight || 0), 0)
    };
  }, [selectedCategories, validateSelection]);
};

export const useCategoryStats = () => {
  const { categories, selectedCategories } = useCategory();
  
  return useMemo(() => {
    return {
      totalCategories: categories.length,
      selectedCount: selectedCategories.length,
      selectionPercentage: categories.length > 0 ? (selectedCategories.length / categories.length) * 100 : 0,
      averageInfluence: selectedCategories.length > 0 
        ? selectedCategories.reduce((sum, cat) => sum + cat.Influence, 0) / selectedCategories.length 
        : 0,
      maxInfluence: selectedCategories.length > 0 
        ? Math.max(...selectedCategories.map(cat => cat.Influence)) 
        : 0,
      minInfluence: selectedCategories.length > 0 
        ? Math.min(...selectedCategories.map(cat => cat.Influence)) 
        : 0
    };
  }, [categories, selectedCategories]);
};