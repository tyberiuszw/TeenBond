import React from 'react';
import { CHAMELEON_COLORS, getChameleonDef } from '@/lib/constants';
import { Check } from 'lucide-react';

interface ColorPickerProps {
  selectedColor: string;
  onSelectColor: (colorHex: string) => void;
  className?: string;
  label?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  onSelectColor,
  className = '',
  label = 'Wybierz barwę swojego kameleona:',
}) => {
  const selectedDef = getChameleonDef(selectedColor);

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-300">{label}</label>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1.5"
            style={{
              borderColor: selectedDef.hex,
              color: selectedDef.hex,
              backgroundColor: `${selectedDef.hex}15`,
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedDef.hex }} />
            {selectedDef.namePl} ({selectedDef.nameEn})
          </span>
        </div>
      )}

      {/* Grid of 8 colors */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
        {CHAMELEON_COLORS.map((colorDef) => {
          const isSelected = selectedDef.hex.toLowerCase() === colorDef.hex.toLowerCase();

          return (
            <button
              key={colorDef.id}
              type="button"
              onClick={() => onSelectColor(colorDef.hex)}
              className={`group relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 border bg-slate-800/80 hover:bg-slate-700/80 ${
                isSelected
                  ? 'border-white ring-2 shadow-lg scale-105'
                  : 'border-slate-700 hover:border-slate-500 hover:scale-102'
              }`}
              style={{
                boxShadow: isSelected ? `0 0 16px ${colorDef.hex}70` : undefined,
              }}
              title={`${colorDef.namePl}: ${colorDef.description}`}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm"
                style={{ backgroundColor: colorDef.hex }}
              >
                {isSelected && <Check className="w-4 h-4 text-slate-950 font-bold" strokeWidth={3} />}
              </div>
              <span className="text-[11px] font-medium text-slate-300 mt-1 truncate max-w-full">
                {colorDef.namePl}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-slate-400 italic">
        {selectedDef.description}
      </p>
    </div>
  );
};
