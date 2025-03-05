export interface DropdownCardProps {
    readonly options: readonly string[]; // Marked as readonly
    readonly onSelect: (selected: string) => void; // Function to handle selection
    readonly defaultLabel?: string; // Default label for the button
  }