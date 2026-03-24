'use client';

import { Combobox as ComboboxPrimitive } from '@base-ui/react';
import { CheckIcon, ChevronDownIcon, XIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import { cn } from '@/lib/utils';

const Combobox = ComboboxPrimitive.Root;

const ComboboxInputContext = React.createContext<string | undefined>(undefined);

function ComboboxChip({
  children,
  className,
  showRemove = true,
  ...props
}: {
  showRemove?: boolean;
} & ComboboxPrimitive.Chip.Props) {
  return (
    <ComboboxPrimitive.Chip
      className={cn(
        'has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50 has-data-[slot=combobox-chip-remove]:pr-0 flex h-[calc(--spacing(5.5))] w-fit items-center justify-center gap-1 whitespace-nowrap rounded-sm bg-muted px-1.5 text-xs font-medium text-foreground',
        className
      )}
      data-slot='combobox-chip'
      {...props}
    >
      {children}
      {showRemove && (
        <ComboboxPrimitive.ChipRemove
          className='-ml-1 opacity-50 hover:opacity-100'
          data-slot='combobox-chip-remove'
          render={<Button variant='ghost' />}
        >
          <XIcon className='pointer-events-none' />
        </ComboboxPrimitive.ChipRemove>
      )}
    </ComboboxPrimitive.Chip>
  );
}

function ComboboxChips({
  className,
  ...props
}: ComboboxPrimitive.Chips.Props &
  React.ComponentPropsWithRef<typeof ComboboxPrimitive.Chips>) {
  return (
    <ComboboxPrimitive.Chips
      className={cn(
        'shadow-xs has-aria-invalid:border-destructive has-aria-invalid:ring-[3px] has-aria-invalid:ring-destructive/20 has-data-[slot=combobox-chip]:px-1.5 dark:has-aria-invalid:border-destructive/50 dark:has-aria-invalid:ring-destructive/40 flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent bg-clip-padding px-2.5 py-1.5 text-sm transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 dark:bg-input/30',
        className
      )}
      data-slot='combobox-chips'
      {...props}
    />
  );
}

function ComboboxChipsInput({
  className,
  ...props
}: ComboboxPrimitive.Input.Props) {
  return (
    <ComboboxPrimitive.Input
      className={cn('min-w-16 flex-1 outline-none', className)}
      data-slot='combobox-chip-input'
      {...props}
    />
  );
}

function ComboboxClear({ className, ...props }: ComboboxPrimitive.Clear.Props) {
  return (
    <ComboboxPrimitive.Clear
      className={cn(className)}
      data-slot='combobox-clear'
      render={<InputGroupButton size='icon-xs' variant='ghost' />}
      {...props}
    >
      <XIcon className='pointer-events-none' />
    </ComboboxPrimitive.Clear>
  );
}

function ComboboxCollection({ ...props }: ComboboxPrimitive.Collection.Props) {
  return (
    <ComboboxPrimitive.Collection data-slot='combobox-collection' {...props} />
  );
}

function ComboboxContent({
  align = 'start',
  alignOffset = 0,
  anchor,
  className,
  side = 'bottom',
  sideOffset = 6,
  ...props
}: ComboboxPrimitive.Popup.Props &
  Pick<
    ComboboxPrimitive.Positioner.Props,
    'align' | 'alignOffset' | 'anchor' | 'side' | 'sideOffset'
  >) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className='isolate z-50'
        side={side}
        sideOffset={sideOffset}
      >
        <ComboboxPrimitive.Popup
          className={cn(
            'group/combobox-content w-(--anchor-width) max-w-(--available-width) origin-(--transform-origin) data-[chips=true]:min-w-(--anchor-width) data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 relative max-h-96 min-w-[calc(var(--anchor-width)+--spacing(7))] overflow-hidden rounded-md bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 *:data-[slot=input-group]:m-1 *:data-[slot=input-group]:mb-0 *:data-[slot=input-group]:h-8 *:data-[slot=input-group]:border-input/30 *:data-[slot=input-group]:bg-input/30 *:data-[slot=input-group]:shadow-none',
            className
          )}
          data-chips={!!anchor}
          data-slot='combobox-content'
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  );
}

function ComboboxEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props) {
  return (
    <ComboboxPrimitive.Empty
      className={cn(
        'group-data-empty/combobox-content:flex hidden w-full justify-center py-2 text-center text-sm text-muted-foreground',
        className
      )}
      data-slot='combobox-empty'
      {...props}
    />
  );
}

function ComboboxGroup({ className, ...props }: ComboboxPrimitive.Group.Props) {
  return (
    <ComboboxPrimitive.Group
      className={cn(className)}
      data-slot='combobox-group'
      {...props}
    />
  );
}

function ComboboxInput({
  children,
  className,
  disabled = false,
  inputClassName,
  showClear = false,
  showTrigger = true,
  triggerIconClassName,
  ...props
}: {
  inputClassName?: string;
  showClear?: boolean;
  showTrigger?: boolean;
  triggerIconClassName?: string;
} & ComboboxPrimitive.Input.Props) {
  return (
    <ComboboxInputContext.Provider value={triggerIconClassName}>
      <InputGroup className={cn('w-auto', className)}>
        <ComboboxPrimitive.Input
          render={
            <InputGroupInput className={inputClassName} disabled={disabled} />
          }
          {...props}
        />
        <InputGroupAddon align='inline-end'>
          {showTrigger && (
            <InputGroupButton
              asChild
              className='group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent'
              data-slot='input-group-button'
              disabled={disabled}
              size='icon-xs'
              variant='ghost'
            >
              <ComboboxTrigger />
            </InputGroupButton>
          )}
          {showClear && <ComboboxClear disabled={disabled} />}
        </InputGroupAddon>
        {children}
      </InputGroup>
    </ComboboxInputContext.Provider>
  );
}

function ComboboxItem({
  children,
  className,
  ...props
}: ComboboxPrimitive.Item.Props) {
  return (
    <ComboboxPrimitive.Item
      className={cn(
        "outline-hidden data-highlighted:bg-accent data-highlighted:text-accent-foreground relative flex w-full cursor-default select-none items-center gap-2 rounded-sm py-1.5 pl-2 pr-8 text-sm data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-slot='combobox-item'
      {...props}
    >
      {children}
      <ComboboxPrimitive.ItemIndicator
        data-slot='combobox-item-indicator'
        render={
          <span className='pointer-events-none absolute right-2 flex size-4 items-center justify-center' />
        }
      >
        <CheckIcon className='pointer-coarse:size-5 pointer-events-none size-4' />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  );
}

function ComboboxLabel({
  className,
  ...props
}: ComboboxPrimitive.GroupLabel.Props) {
  return (
    <ComboboxPrimitive.GroupLabel
      className={cn(
        'pointer-coarse:px-3 pointer-coarse:py-2 pointer-coarse:text-sm px-2 py-1.5 text-xs text-muted-foreground',
        className
      )}
      data-slot='combobox-label'
      {...props}
    />
  );
}

function ComboboxList({ className, ...props }: ComboboxPrimitive.List.Props) {
  return (
    <ComboboxPrimitive.List
      className={cn(
        'data-empty:p-0 max-h-[min(calc(--spacing(96)---spacing(9)),calc(var(--available-height)---spacing(9)))] scroll-py-1 overflow-y-auto p-1',
        className
      )}
      data-slot='combobox-list'
      {...props}
    />
  );
}

function ComboboxSeparator({
  className,
  ...props
}: ComboboxPrimitive.Separator.Props) {
  return (
    <ComboboxPrimitive.Separator
      className={cn('-mx-1 my-1 h-px bg-border', className)}
      data-slot='combobox-separator'
      {...props}
    />
  );
}

function ComboboxTrigger({
  children,
  className,
  ...props
}: ComboboxPrimitive.Trigger.Props) {
  const triggerIconClassName = React.useContext(ComboboxInputContext);
  return (
    <ComboboxPrimitive.Trigger
      className={cn("[&_svg:not([class*='size-'])]:size-4", className)}
      data-slot='combobox-trigger'
      {...props}
    >
      {children}
      <ChevronDownIcon
        className={cn(
          'pointer-events-none size-4 text-muted-foreground',
          triggerIconClassName
        )}
        data-slot='combobox-trigger-icon'
      />
    </ComboboxPrimitive.Trigger>
  );
}

function ComboboxValue({ ...props }: ComboboxPrimitive.Value.Props) {
  return <ComboboxPrimitive.Value data-slot='combobox-value' {...props} />;
}

function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null);
}

export {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
};
