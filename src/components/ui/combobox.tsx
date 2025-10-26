
"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ComboboxProps {
  options: { label: string; value: string }[];
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function Combobox({ options, placeholder, value, onChange, disabled }: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(value || "");

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);
  
  const handleSelect = (currentValue: string) => {
    const newValue = currentValue.toLowerCase() === value.toLowerCase() ? "" : currentValue;
    onChange(newValue);
    setInputValue(newValue);
    setOpen(false);
  };
  
  const handleInputChange = (search: string) => {
      setInputValue(search);
      onChange(search);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          disabled={disabled}
        >
          {value
            ? options.find((option) => option.value.toLowerCase() === value.toLowerCase())?.label || value
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
        <Command shouldFilter={false}>
            <CommandInput 
                placeholder="Search or create team..." 
                onValueChange={handleInputChange}
                value={inputValue}
            />
          <CommandList>
            {options.filter(o => o.label.toLowerCase().includes(inputValue.toLowerCase())).length === 0 && inputValue && (
                 <CommandItem
                    value={inputValue}
                    onSelect={() => handleSelect(inputValue)}
                 >
                    <Check className={cn("mr-2 h-4 w-4", "opacity-0")} />
                    Create "{inputValue}"
                </CommandItem>
            )}
            <CommandGroup>
              {options.filter(o => o.label.toLowerCase().includes(inputValue.toLowerCase())).map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.toLowerCase() === option.value.toLowerCase() ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

    