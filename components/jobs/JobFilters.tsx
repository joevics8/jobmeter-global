"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Filter, X, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { theme } from '@/lib/theme';

interface JobFiltersProps {
  filters: {
    search?: string;
    location?: string[];
    sector?: string[];
    employmentType?: string[];
    salaryRange?: { min: number; max: number };
    remote?: boolean;
    country?: string;
  };
  onFiltersChange: (filters: any) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const countries = [
  'Global', 'Nigeria', 'United States', 'United Kingdom', 'Canada', 'Australia', 
  'Germany', 'France', 'India', 'Kenya', 'South Africa', 'Ghana',
  'United Arab Emirates', 'Saudi Arabia', 'Singapore', 'Netherlands',
  'Spain', 'Italy', 'Brazil', 'Mexico', 'Japan', 'China', 'Ireland',
  'Switzerland', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Poland',
  'Portugal', 'Austria', 'New Zealand', 'Israel', 'Malaysia',
  'Philippines', 'Indonesia', 'Thailand', 'Vietnam', 'South Korea', 'Egypt',
  'Argentina', 'Bangladesh', 'Belgium', 'Colombia', 'Czech Republic', 'Chile',
  'Ecuador', 'Ethiopia', 'Greece', 'Hong Kong', 'Hungary', 'Iraq',
  'Jordan', 'Kuwait', 'Lebanon', 'Morocco', 'Oman', 'Pakistan', 'Peru',
  'Qatar', 'Romania', 'Russia', 'Sri Lanka', 'Taiwan', 'Tanzania', 'Turkey',
  'Ukraine', 'Venezuela', 'Zimbabwe'
];

const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT - Abuja',
  'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 
  'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 
  'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

const sectors = [
  'Information Technology & Software',
  'Engineering & Manufacturing', 
  'Finance & Banking', 
  'Healthcare & Medical', 
  'Education & Training', 
  'Sales & Marketing', 
  'Human Resources & Recruitment', 
  'Customer Service & Support', 
  'Media Advertising & Communications', 
  'Design Arts & Creative', 
  'Construction & Real Estate', 
  'Logistics Transport & Supply Chain', 
  'Agriculture & Agribusiness', 
  'Energy & Utilities', 
  'Legal & Compliance', 
  'Government & Public Administration', 
  'Retail & E-commerce', 
  'Hospitality & Tourism', 
  'Science & Research', 
  'Security & Defense', 
  'Telecommunications', 
  'Nonprofit & NGO', 
  'Environment & Sustainability', 
  'Product Management & Operations', 
  'Data & Analytics'
];

const employmentTypes = [
  'Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship', 'Remote'
];

// Multi-select dropdown component
const MultiSelectDropdown = ({ 
  options, 
  selected, 
  onChange, 
  placeholder, 
  label 
}: { 
  options: string[]; 
  selected: string[]; 
  onChange: (selected: string[]) => void; 
  placeholder: string; 
  label: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = (option: string) => {
    const newSelected = selected.includes(option)
      ? selected.filter(item => item !== option)
      : [...selected, option];
    onChange(newSelected);
    setIsOpen(false); // Close dropdown after selection
  };

  const handleRemove = (option: string) => {
    const newSelected = selected.filter(item => item !== option);
    onChange(newSelected);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
        {label}
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border rounded-lg text-left flex items-center justify-between transition-all hover:border-blue-400"
        style={{
          borderColor: theme.colors.border.DEFAULT,
          backgroundColor: theme.colors.background.DEFAULT,
        }}
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {selected.length === 0 ? (
            <span style={{ color: theme.colors.text.muted }}>{placeholder}</span>
          ) : (
            selected.map(item => (
              <span
                key={item}
                className="px-2 py-1 text-xs rounded-full flex items-center gap-1"
                style={{
                  backgroundColor: theme.colors.primary.DEFAULT + '15',
                  color: theme.colors.primary.DEFAULT,
                }}
              >
                {item}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(item);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      handleRemove(item);
                    }
                  }}
                  className="hover:text-red-500 cursor-pointer"
                >
                  <X size={12} />
                </span>
              </span>
            ))
          )}
        </div>
        <ChevronDown 
          size={20} 
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: theme.colors.text.secondary }}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-3 border-b">
            <input
              type="text"
              placeholder="Search options..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
              style={{ borderColor: theme.colors.border.DEFAULT }}
            />
          </div>
          <div className="max-h-48 overflow-y-auto pb-4">
            {filteredOptions.map(option => (
              <button
                key={option}
                onClick={() => handleToggle(option)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between transition-colors"
              >
                <span>{option}</span>
                {selected.includes(option) && (
                  <Check size={16} style={{ color: theme.colors.primary.DEFAULT }} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function JobFilters({ filters, onFiltersChange, isOpen, onToggle }: JobFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['location']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleLocationToggle = (location: string) => {
    const newLocations = filters.location?.includes(location)
      ? filters.location.filter(l => l !== location)
      : [...(filters.location || []), location];
    
    onFiltersChange({ ...filters, location: newLocations });
  };

  const handleSectorToggle = (sector: string) => {
    const newSectors = filters.sector?.includes(sector)
      ? filters.sector.filter(s => s !== sector)
      : [...(filters.sector || []), sector];
    
    onFiltersChange({ ...filters, sector: newSectors });
  };

  const handleEmploymentTypeToggle = (type: string) => {
    const newTypes = filters.employmentType?.includes(type)
      ? filters.employmentType.filter(t => t !== type)
      : [...(filters.employmentType || []), type];
    
    onFiltersChange({ ...filters, employmentType: newTypes });
  };

  const handleSalaryRangeChange = (type: 'min' | 'max', value: string) => {
    const numValue = parseInt(value) || 0;
    const currentRange = filters.salaryRange || { min: 0, max: 0 };
    const newRange = { ...currentRange, [type]: numValue };
    
    onFiltersChange({ ...filters, salaryRange: newRange });
  };

  const handleRemoteToggle = () => {
    onFiltersChange({ ...filters, remote: !filters.remote });
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      search: filters.search,
      location: [] as string[],
      sector: [] as string[],
      employmentType: [] as string[],
      remote: false,
      country: ''
    };
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = (
    (filters.location?.length || 0) > 0 ||
    (filters.sector?.length || 0) > 0 ||
    (filters.employmentType?.length || 0) > 0 ||
    filters.remote ||
    filters.country
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

      {/* Side Modal */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Filters</h2>
            <button
              onClick={onToggle}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

{/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="w-full text-sm text-red-600 hover:text-red-700 font-medium py-2 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                Clear All Filters
              </button>
            )}

            {/* Country & State Filter - Same row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Country Filter */}
              <div className="space-y-2">
                <MultiSelectDropdown
                  options={countries}
                  selected={filters.country ? [filters.country] : []}
                  onChange={(selected) => {
                    if (selected[0] === 'Global') {
                      onFiltersChange({ ...filters, country: '', location: [] });
                    } else {
                      onFiltersChange({ ...filters, country: selected[0] || '', location: selected[0] === 'Nigeria' ? filters.location : [] });
                    }
                  }}
                  placeholder="Select country..."
                  label="Country"
                />
              </div>

              {/* State Filter - Only show for Nigeria */}
              {filters.country === 'Nigeria' && (
                <div className="space-y-2">
                  <MultiSelectDropdown
                    options={nigerianStates}
                    selected={filters.location || []}
                    onChange={(selected) => onFiltersChange({ ...filters, location: selected })}
                    placeholder="Select states..."
                    label="State"
                  />
                </div>
              )}
            </div>

            {/* Sector Filter */}
            <div className="space-y-2">
              <MultiSelectDropdown
                options={sectors}
                selected={filters.sector || []}
                onChange={(selected) => onFiltersChange({ ...filters, sector: selected })}
                placeholder="Select sectors..."
                label="Sector"
              />
            </div>

            {/* Employment Type Filter */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Employment Type</h3>
              <div className="grid grid-cols-2 gap-2">
                {employmentTypes.map(type => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer py-2 px-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={filters.employmentType?.includes(type) || false}
                      onChange={() => handleEmploymentTypeToggle(type)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Remote Work Filter with Apply Button */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="remote-filter"
                  checked={filters.remote || false}
                  onChange={handleRemoteToggle}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Remote Only</span>
              </label>
              
              <button
                onClick={onToggle}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                Filter
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}