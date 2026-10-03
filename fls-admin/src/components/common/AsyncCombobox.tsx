import * as React from 'react';
import { Check, ChevronsUpDown, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

export interface ComboboxOption {
  value: string;
  label: string;
  sublabel?: string;
  avatar?: React.ReactNode;
}

export interface AsyncComboboxProps {
  value?: string;
  onChange: (value: string, option?: ComboboxOption) => void;
  loadOptions: (query: string) => Promise<ComboboxOption[]>;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  selectedOption?: ComboboxOption;
  className?: string;
}

export const AsyncCombobox: React.FC<AsyncComboboxProps> = ({
  value,
  onChange,
  loadOptions,
  placeholder = 'Sélectionner...',
  searchPlaceholder = 'Rechercher (2 caractères min)...',
  emptyText = 'Aucun résultat trouvé.',
  disabled = false,
  selectedOption: initialSelected,
  className,
}) => {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [options, setOptions] = React.useState<ComboboxOption[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [currentOption, setCurrentOption] = React.useState<ComboboxOption | undefined>(
    initialSelected
  );

  React.useEffect(() => {
    if (initialSelected) {
      setCurrentOption(initialSelected);
    }
  }, [initialSelected]);

  // Load when query changes with debounce
  React.useEffect(() => {
    if (!open) return;
    if (query.trim().length < 2) {
      setOptions([]);
      return;
    }

    let active = true;
    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const results = await loadOptions(query);
        if (active) {
          setOptions(results);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setIsLoading(false);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, open, loadOptions]);

  const handleSelect = (option: ComboboxOption) => {
    setCurrentOption(option);
    onChange(option.value, option);
    setOpen(false);
    setQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentOption(undefined);
    onChange('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between h-10 px-3 rounded-xl font-normal border-line bg-white text-left focus:ring-2 focus:ring-brand-500/30 focus:border-brand-600',
            !currentOption && 'text-muted',
            className
          )}
        >
          <div className="flex items-center gap-2 truncate">
            {currentOption?.avatar}
            <span className="truncate text-ink font-medium">
              {currentOption ? currentOption.label : placeholder}
            </span>
            {currentOption?.sublabel && (
              <span className="text-xs text-muted truncate">
                ({currentOption.sublabel})
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            {currentOption && !disabled && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                className="p-0.5 hover:bg-muted/30 rounded-full text-muted hover:text-ink cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-2 rounded-xl shadow-lg border-line bg-white" align="start">
        <div className="relative mb-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 text-xs rounded-lg pr-7"
            autoFocus
          />
          {isLoading && (
            <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted" />
          )}
        </div>

        <div className="max-h-60 overflow-y-auto space-y-1">
          {query.trim().length < 2 ? (
            <p className="text-xs text-center text-muted py-4">
              Tapez au moins 2 caractères pour rechercher
            </p>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-6 text-xs text-muted gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
              Recherche en cours...
            </div>
          ) : options.length === 0 ? (
            <p className="text-xs text-center text-muted py-4">{emptyText}</p>
          ) : (
            options.map((opt) => {
              const isSelected = value === opt.value;
              return (
                <div
                  key={opt.value}
                  onClick={() => handleSelect(opt)}
                  className={cn(
                    'flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition-colors hover:bg-brand-50',
                    isSelected && 'bg-brand-50/80 font-semibold text-brand-700'
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    {opt.avatar}
                    <div>
                      <div className="text-ink font-medium truncate">{opt.label}</div>
                      {opt.sublabel && (
                        <div className="text-[11px] text-muted truncate">
                          {opt.sublabel}
                        </div>
                      )}
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-brand-600 shrink-0" />}
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AsyncCombobox;
