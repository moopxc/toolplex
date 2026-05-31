"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  label: string; // required — needed for accessible name
  className?: string;
}

export function Slider({ min, max, step = 1, value, onChange, label, className }: SliderProps) {
  const id = React.useId();
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between mb-2">
        <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-semibold text-blue-600" aria-live="polite">{value}</span>
      </div>
      <div className="relative h-5 flex items-center">
        <div className="w-full h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-blue-600 rounded-full transition-all"
            style={{ width: `${percentage}%` }}
            aria-hidden="true"
          />
        </div>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-5"
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
        />
        <div
          className="absolute w-5 h-5 bg-white border-2 border-blue-600 rounded-full shadow-sm pointer-events-none transition-all"
          style={{ left: `calc(${percentage}% - 10px)` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
