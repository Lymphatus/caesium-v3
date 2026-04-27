import * as React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface NumberInputProps extends Omit<React.ComponentProps<'input'>, 'value' | 'onChange' | 'type' | 'size'> {
  value?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  hideStepper?: boolean;
  endAdornment?: React.ReactNode;
  size?: 'default' | 'sm' | 'xs';
}

function clamp(n: number, min?: number, max?: number) {
  if (min !== undefined && n < min) return min;
  if (max !== undefined && n > max) return max;
  return n;
}

function NumberInput({
  value,
  onValueChange,
  min,
  max,
  step = 1,
  disabled,
  hideStepper,
  endAdornment,
  className,
  size,
  ...props
}: NumberInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      onValueChange?.(min ?? 0);
      return;
    }
    const n = Number(raw);
    if (!Number.isNaN(n)) onValueChange?.(clamp(n, min, max));
  };

  const adjust = (delta: number) => {
    const base = value ?? min ?? 0;
    onValueChange?.(clamp(base + delta, min, max));
  };

  const atMax = max !== undefined && value !== undefined && value >= max;
  const atMin = min !== undefined && value !== undefined && value <= min;

  return (
    <div className={cn('relative', size === 'xs' ? 'h-6' : size === 'sm' ? 'h-8' : 'h-9', className)}>
      <Input
        className={cn(
          '[appearance:textfield] text-right [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
          !hideStepper && 'pr-10',
          endAdornment && !hideStepper && 'pr-16',
          endAdornment && hideStepper && 'pr-8',
        )}
        disabled={disabled}
        max={max}
        min={min}
        size={size}
        step={step}
        type="number"
        value={value ?? ''}
        onChange={handleChange}
        {...props}
      />
      {endAdornment && (
        <div
          className={cn(
            'text-muted-foreground absolute inset-y-0 flex items-center text-sm',
            !hideStepper ? 'right-9' : 'right-3',
            size === 'xs' ? 'text-xs' : size === 'sm' ? 'text-sm' : 'text-base',
          )}
        >
          {endAdornment}
        </div>
      )}
      {!hideStepper && (
        <div
          className={cn(
            'absolute inset-y-0 right-1 flex flex-col items-center justify-between gap-0.5 px-2',
            size === 'xs' ? 'py-px' : size === 'sm' ? 'py-0.5' : 'py-1',
          )}
        >
          <Button
            className="size-3 p-1"
            disabled={disabled || atMax}
            size="xs"
            tabIndex={-1}
            type="button"
            variant="ghost"
            onClick={() => adjust(step)}
          >
            <ChevronUp className="size-3" />
          </Button>
          <Button
            className="size-3 p-1"
            disabled={disabled || atMin}
            size="xs"
            tabIndex={-1}
            variant="ghost"
            onClick={() => adjust(-step)}
          >
            <ChevronDown />
          </Button>
        </div>
      )}
    </div>
  );
}

export { NumberInput };
