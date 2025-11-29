'use client';

import React, { useState, useMemo } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, Check, Search } from 'lucide-react';
import type { BaseDropdownProps, DropdownOption } from '../types/dropdown';

export function Dropdown<TValue = string>({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  searchable = false,
  className,
}: BaseDropdownProps<TValue>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Filter options if searchable
  const filteredOptions = useMemo(() => {
    if (!searchable || !search) {
      return options;
    }
    const searchLower = search.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(searchLower));
  }, [options, search, searchable]);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={disabled}
          className={`w-full justify-between ${!selectedOption ? 'text-muted-foreground' : ''} ${className || ''}`}
        >
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full p-0" align="start">
        {searchable && (
          <div className="border-b p-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}
        <div className="max-h-[300px] overflow-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">No options found</div>
          ) : (
            filteredOptions.map((option) => (
              <DropdownMenuItem
                key={String(option.value)}
                disabled={option.disabled}
                onSelect={() => {
                  onChange(option.value);
                  setOpen(false);
                  setSearch('');
                }}
                className="cursor-pointer"
              >
                {option.icon && <span className="mr-2">{option.icon}</span>}
                <span className="flex-1">{option.label}</span>
                {value === option.value && <Check className="ml-2 h-4 w-4" />}
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
