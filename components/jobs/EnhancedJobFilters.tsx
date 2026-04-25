"use client";

import React, { useState, useEffect } from 'react';
import { X, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { theme } from '@/lib/theme';

interface EnhancedJobFiltersProps {
  filters: {
    search?: string;
    sector?: string;
    state?: string;
    town?: string;
    jobType?: string;
    workMode?: string;
    salaryRange?: { min: number; max: number; enabled: boolean };
  };
  availableTowns?: string[]; // Fetched from jobs data
  onFiltersChange: (filters: any) => void;
  isOpen: boolean;
  onToggle: () => void;
}

// Static data for filters
const sectors = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
  'Retail', 'Construction', 'Transportation', 'Media', 'Hospitality',
  'Agriculture', 'Telecommunications', 'Energy', 'Real Estate', 'Consulting'
];

const states = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT - Abuja',
  'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 
  'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 
  'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

const jobTypes = [
  'Full-time', 'Part-time', 'Contract', 'Freelance', 'NYSC', 'Internship'
];

const workModes = [
  'Remote', 'On-site', 'Hybrid'
];

export default function EnhancedJobFilters({ 
  filters, 
  availableTowns = [],
  onFiltersChange, 
  isOpen, 
  onToggle 
}: EnhancedJobFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [salaryEnabled, setSalaryEnabled] = useState(filters.salaryRange?.enabled || false);

  useEffect(() => {
    setLocalFilters(filters);
    setSalaryEnabled(filters.salaryRange?.enabled || false);
  }, [filters]);

  const handleSectorChange = (value: string) => {
    const newFilters = { ...localFilters, sector: value || undefined };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleStateChange = (value: string) => {
    const newFilters = { ...localFilters, state: value || undefined };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleTownChange = (value: string) => {
    const newFilters = { ...localFilters, town: value || undefined };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleJobTypeChange = (value: string) => {
    const newFilters = { ...localFilters, jobType: value || undefined };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleWorkModeChange = (value: string) => {
    const newFilters = { ...localFilters, workMode: value || undefined };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSalaryChange = (type: 'min' | 'max', value: string) => {
    const numValue = parseInt(value) || 0;
    const newRange = { 
      ...(localFilters.salaryRange || { min: 0, max: 0, enabled: salaryEnabled }),
      [type]: numValue,
      enabled: salaryEnabled
    };
    
    const newFilters = { ...localFilters, salaryRange: newRange };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const toggleSalaryEnabled = () => {
    const newEnabled = !salaryEnabled;
    setSalaryEnabled(newEnabled);
    
    const newRange = { 
      ...(localFilters.salaryRange || { min: 0, max: 0 }),
      enabled: newEnabled
    };
    
    const newFilters = { 
      ...localFilters, 
      salaryRange: newRange
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      search: filters.search,
      sector: undefined,
      state: undefined,
      town: undefined,
      jobType: undefined,
      workMode: undefined,
      salaryRange: { min: 0, max: 0, enabled: false }
    };
    setLocalFilters(clearedFilters);
    setSalaryEnabled(false);
    onFiltersChange(clearedFilters);
    onToggle();
  };

  const hasActiveFilters = !!(
    localFilters.sector ||
    localFilters.state ||
    localFilters.town ||
    localFilters.jobType ||
    localFilters.workMode ||
    (localFilters.salaryRange?.enabled && (localFilters.salaryRange.min > 0 || localFilters.salaryRange.max > 0))
  );

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onToggle}
        />
      )}

      {/* Center Modal */}
      <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] bg-white rounded-xl shadow-2xl z-50 transition-all duration-300 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b" style={{ borderColor: theme.colors.border.DEFAULT }}>
            <div className="flex items-center gap-3">
              <SlidersHorizontal size={20} style={{ color: theme.colors.primary.DEFAULT }} />
              <h2 className="text-lg font-semibold" style={{ color: theme.colors.text.primary }}>
                Advanced Filters
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={onToggle}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} style={{ color: theme.colors.text.secondary }} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Sector */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                    Sector
                  </label>
                  <div className="relative">
                    <select
                      value={localFilters.sector || ''}
                      onChange={(e) => handleSectorChange(e.target.value)}
                      className="w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      style={{ borderColor: theme.colors.border.DEFAULT }}
                    >
                      <option value="">Select sector</option>
                      {sectors.map(sector => (
                        <option key={sector} value={sector}>{sector}</option>
                      ))}
                    </select>
                    <ChevronDown 
                      size={16} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" 
                      style={{ color: theme.colors.text.secondary }} 
                    />
                  </div>
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                    State
                  </label>
                  <div className="relative">
                    <select
                      value={localFilters.state || ''}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      style={{ borderColor: theme.colors.border.DEFAULT }}
                    >
                      <option value="">Select state</option>
                      {states.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                    <ChevronDown 
                      size={16} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" 
                      style={{ color: theme.colors.text.secondary }} 
                    />
                  </div>
                </div>

                {/* Town - Dropdown */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                    Town/City
                  </label>
                  <div className="relative">
                    <select
                      value={localFilters.town || ''}
                      onChange={(e) => handleTownChange(e.target.value)}
                      className="w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      style={{ borderColor: theme.colors.border.DEFAULT }}
                    >
                      <option value="">Select town</option>
                      {availableTowns.map(town => (
                        <option key={town} value={town}>{town}</option>
                      ))}
                    </select>
                    <ChevronDown 
                      size={16} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" 
                      style={{ color: theme.colors.text.secondary }} 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Job Type - Dropdown */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                    Job Type
                  </label>
                  <div className="relative">
                    <select
                      value={localFilters.jobType || ''}
                      onChange={(e) => handleJobTypeChange(e.target.value)}
                      className="w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      style={{ borderColor: theme.colors.border.DEFAULT }}
                    >
                      <option value="">Select job type</option>
                      {jobTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <ChevronDown 
                      size={16} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" 
                      style={{ color: theme.colors.text.secondary }} 
                    />
                  </div>
                </div>

                {/* Work Mode - Dropdown */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                    Work Mode
                  </label>
                  <div className="relative">
                    <select
                      value={localFilters.workMode || ''}
                      onChange={(e) => handleWorkModeChange(e.target.value)}
                      className="w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      style={{ borderColor: theme.colors.border.DEFAULT }}
                    >
                      <option value="">Select work mode</option>
                      {workModes.map(mode => (
                        <option key={mode} value={mode}>{mode}</option>
                      ))}
                    </select>
                    <ChevronDown 
                      size={16} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" 
                      style={{ color: theme.colors.text.secondary }} 
                    />
                  </div>
                </div>
              </div>

              {/* Salary Range */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium" style={{ color: theme.colors.text.primary }}>
                    Salary Range
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={salaryEnabled}
                      onChange={toggleSalaryEnabled}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm" style={{ color: theme.colors.text.secondary }}>
                      Enable salary filter
                    </span>
                  </label>
                </div>
                
                {salaryEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Minimum Salary (₦)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={localFilters.salaryRange?.min || ''}
                        onChange={(e) => handleSalaryChange('min', e.target.value)}
                        className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ borderColor: theme.colors.border.DEFAULT }}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Maximum Salary (₦)</label>
                      <input
                        type="number"
                        placeholder="No limit"
                        value={localFilters.salaryRange?.max || ''}
                        onChange={(e) => handleSalaryChange('max', e.target.value)}
                        className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ borderColor: theme.colors.border.DEFAULT }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}