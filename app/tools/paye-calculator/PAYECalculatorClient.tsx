"use client";

import React, { useState, useMemo } from 'react';
import { Calculator, Info, TrendingDown, TrendingUp, Home, PiggyBank, DollarSign, AlertCircle } from 'lucide-react';
import { theme } from '@/lib/theme';

interface PAYEResult {
  grossAnnual: number;
  grossMonthly: number;
  pension: number;
  nhf: number;
  rentRelief: number;
  chargeableIncome: number;
  annualTax: number;
  monthlyTax: number;
  netAnnual: number;
  netMonthly: number;
  effectiveRate: number;
}

const TAX_BANDS = [
  { min: 0, max: 800000, rate: 0 },
  { min: 800000, max: 3000000, rate: 15 },
  { min: 3000000, max: 12000000, rate: 18 },
  { min: 12000000, max: 25000000, rate: 21 },
  { min: 25000000, max: 50000000, rate: 23 },
  { min: 50000000, max: Infinity, rate: 25 },
];

export default function PAYECalculatorClient() {
  const [basicSalary, setBasicSalary] = useState<number>(0);
  const [housingAllowance, setHousingAllowance] = useState<number>(0);
  const [transportAllowance, setTransportAllowance] = useState<number>(0);
  const [otherAllowances, setOtherAllowances] = useState<number>(0);
  const [annualRent, setAnnualRent] = useState<number>(0);
  const [includeNHF, setIncludeNHF] = useState<boolean>(false);
  const [pensionRate, setPensionRate] = useState<number>(8);

  const calculatePAYE = useMemo((): PAYEResult => {
    const monthlyBasic = basicSalary;
    const monthlyHousing = housingAllowance;
    const monthlyTransport = transportAllowance;
    const monthlyOther = otherAllowances;

    const grossMonthly = monthlyBasic + monthlyHousing + monthlyTransport + monthlyOther;
    const grossAnnual = grossMonthly * 12;

    const qualifyingEmoluments = monthlyBasic + monthlyHousing + monthlyTransport;
    const pension = (qualifyingEmoluments * pensionRate / 100) * 12;

    const nhf = includeNHF ? (monthlyBasic * 2.5 / 100) * 12 : 0;

    const rentRelief = Math.min(500000, annualRent * 0.2);

    const chargeableIncome = Math.max(0, grossAnnual - pension - nhf - rentRelief);

    let annualTax = 0;
    let remainingIncome = chargeableIncome;

    for (const band of TAX_BANDS) {
      if (remainingIncome <= 0) break;
      const bandSize = band.max - band.min;
      const taxableInBand = Math.min(remainingIncome, bandSize);
      annualTax += taxableInBand * (band.rate / 100);
      remainingIncome -= taxableInBand;
    }

    if (chargeableIncome <= 800000) {
      annualTax = 0;
    }

    const monthlyTax = annualTax / 12;
    const netAnnual = grossAnnual - annualTax - pension - nhf;
    const netMonthly = netAnnual / 12;
    const effectiveRate = grossAnnual > 0 ? (annualTax / grossAnnual) * 100 : 0;

    return {
      grossAnnual,
      grossMonthly,
      pension,
      nhf,
      rentRelief,
      chargeableIncome,
      annualTax,
      monthlyTax,
      netAnnual,
      netMonthly,
      effectiveRate,
    };
  }, [basicSalary, housingAllowance, transportAllowance, otherAllowances, annualRent, includeNHF, pensionRate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return value.toFixed(1) + '%';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: `1px solid ${theme.colors.border.DEFAULT}` }}>
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calculator size={20} className="text-blue-600" />
          Enter Your Details
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Basic Salary (Monthly) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
              <input
                type="number"
                value={basicSalary || ''}
                onChange={(e) => setBasicSalary(parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Housing Allowance (Monthly)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
              <input
                type="number"
                value={housingAllowance || ''}
                onChange={(e) => setHousingAllowance(parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transport Allowance (Monthly)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
              <input
                type="number"
                value={transportAllowance || ''}
                onChange={(e) => setTransportAllowance(parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Other Allowances (Monthly)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
              <input
                type="number"
                value={otherAllowances || ''}
                onChange={(e) => setOtherAllowances(parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Bonuses, overtime, etc."
              />
            </div>
          </div>

          <hr className="border-gray-200" />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Annual Rent Paid
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
              <input
                type="number"
                value={annualRent || ''}
                onChange={(e) => setAnnualRent(parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="For rent relief calculation"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Rent Relief: min(₦500,000, 20% of rent paid)
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Include NHF</label>
              <p className="text-xs text-gray-500">National Housing Fund (2.5%)</p>
            </div>
            <button
              onClick={() => setIncludeNHF(!includeNHF)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                includeNHF ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  includeNHF ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pension Contribution (%)
            </label>
            <select
              value={pensionRate}
              onChange={(e) => setPensionRate(parseFloat(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={8}>8% (Standard)</option>
              <option value={10}>10%</option>
              <option value={12}>12%</option>
              <option value={14}>14%</option>
              <option value={18}>18%</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: `1px solid ${theme.colors.border.DEFAULT}` }}>
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign size={20} className="text-green-600" />
            Your Salary Breakdown
          </h2>

          <div className="mb-4 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500 mb-1">Gross Monthly</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(calculatePAYE.grossMonthly)}</p>
            <p className="text-xs text-gray-500">{formatCurrency(calculatePAYE.grossAnnual)} /year</p>
          </div>

          <div className="mb-4 p-4 bg-green-50 rounded-xl border border-green-200">
            <p className="text-sm text-green-700 mb-1">Net Monthly (Take Home)</p>
            <p className="text-3xl font-bold text-green-700">{formatCurrency(calculatePAYE.netMonthly)}</p>
            <p className="text-xs text-green-600">{formatCurrency(calculatePAYE.netAnnual)} /year</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <TrendingDown size={14} className="text-red-500" />
                PAYE Tax
              </span>
              <span className="font-medium text-red-600">-{formatCurrency(calculatePAYE.annualTax)}/yr</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <PiggyBank size={14} className="text-blue-500" />
                Pension
              </span>
              <span className="font-medium text-gray-700">-{formatCurrency(calculatePAYE.pension)}/yr</span>
            </div>
            {calculatePAYE.nhf > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Home size={14} className="text-purple-500" />
                  NHF
                </span>
                <span className="font-medium text-gray-700">-{formatCurrency(calculatePAYE.nhf)}/yr</span>
              </div>
            )}
            {calculatePAYE.rentRelief > 0 && (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Home size={14} className="text-green-500" />
                  Rent Relief (added back)
                </span>
                <span className="font-medium text-green-600">+{formatCurrency(calculatePAYE.rentRelief)}</span>
              </div>
            )}
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700">Effective Tax Rate</span>
              <span className="font-bold text-blue-700">{formatPercent(calculatePAYE.effectiveRate)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: `1px solid ${theme.colors.border.DEFAULT}` }}>
          <h3 className="font-bold text-gray-900 mb-3">Tax Bands (2026)</h3>
          <div className="space-y-2 text-sm">
            {TAX_BANDS.slice(0, -1).map((band, index) => (
              <div key={index} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                <span className="text-gray-600">
                  ₦{(band.min / 1000000).toFixed(1)}M - ₦{(band.max / 1000000).toFixed(1)}M
                </span>
                <span className="font-medium">{band.rate}%</span>
              </div>
            ))}
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Above ₦50M</span>
              <span className="font-medium">25%</span>
            </div>
          </div>
        </div>

        {calculatePAYE.chargeableIncome <= 800000 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-green-700 font-medium">
              <Calculator size={18} />
              Tax Exempt!
            </div>
            <p className="text-sm text-green-600 mt-1">
              Your chargeable income is below ₦800,000. You are exempt from PAYE tax.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
