import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useEditor } from '../../context/EditorContext';

interface DynamicIconProps {
  name: string;
  icon: LucideIcon | string; // Can be a component or a URL string (legacy support)
  size?: number;
  className?: string;
  active?: boolean;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, icon: Icon, size = 20, className, active }) => {
  const { uiConfig } = useEditor();
  
  // Check for custom override in the map
  const customUrl = uiConfig.customIcons[name];
  
  // Determine Color Priority:
  // 1. Active State (Indigo) - Indicates selection
  // 2. Specific Icon Color (User configured)
  // 3. Global Icon Color (User configured)
  // 4. Default Fallback (Gray)
  
  const specificColor = uiConfig.iconColors?.[name];
  const baseColor = specificColor || uiConfig.iconColor || '#4b5563';
  
  const color = active ? '#4f46e5' : baseColor;

  // If a custom URL is provided via Admin Panel
  if (customUrl) {
    return (
      <img 
        src={customUrl} 
        alt={name} 
        style={{ width: size, height: size }} 
        className={`${className} object-contain`} 
      />
    );
  }

  // If the 'icon' prop itself is a string URL (legacy/direct usage)
  if (typeof Icon === 'string') {
    return (
      <img 
        src={Icon} 
        alt={name} 
        style={{ width: size, height: size }} 
        className={`${className} object-contain`} 
      />
    );
  }

  // Default Lucide Icon
  const LucideComponent = Icon as LucideIcon;
  return <LucideComponent size={size} color={color} className={className} />;
};
