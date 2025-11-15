export const getRoomColor = (type: string): string => {
  const colors: Record<string, string> = {
    control: 'hsl(220, 70%, 50%)',      // Blue
    research: 'hsl(160, 70%, 45%)',     // Teal
    containment: 'hsl(0, 70%, 50%)',    // Red
    storage: 'hsl(40, 70%, 50%)',       // Orange
    medical: 'hsl(340, 70%, 55%)',      // Pink
    engineering: 'hsl(280, 70%, 50%)',  // Purple
    security: 'hsl(180, 70%, 40%)',     // Cyan
    laboratory: 'hsl(120, 60%, 45%)',   // Green
    observation: 'hsl(260, 70%, 55%)',  // Indigo
    decontamination: 'hsl(50, 80%, 55%)', // Yellow
    corridor: 'hsl(0, 0%, 60%)',        // Gray
    custom: 'hsl(var(--primary))',      // Primary color
  };
  
  return colors[type] || 'hsl(var(--primary))';
};

export const getRoomBorderColor = (type: string): string => {
  const color = getRoomColor(type);
  return color;
};

export const getRoomBackgroundColor = (type: string, opacity: number = 0.15): string => {
  const color = getRoomColor(type);
  return color.replace(')', ` / ${opacity})`);
};
