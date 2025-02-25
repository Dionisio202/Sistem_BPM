// FilterInput.tsx
import React from 'react';
import { TextField } from '@mui/material';

interface FilterInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const FilterInput: React.FC<FilterInputProps> = ({ label, value, onChange }) => {
  return (
    <TextField
      label={label}
      variant="outlined"
      size="small"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      fullWidth
    />
  );
};

export default FilterInput;