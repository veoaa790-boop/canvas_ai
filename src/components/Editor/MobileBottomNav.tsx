import React from 'react';
import { Layout, Type, Shapes, Image, Layers as LayersIcon } from 'lucide-react';
import { DynamicIcon } from '../Common/DynamicIcon';
import { ICON_KEYS } from '../../utils/constants';

interface MobileBottomNavProps {
  onOpenSidebar: () => void;
  onOpenLayers: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenSidebar, onOpenLayers }) => {
  const actions = [
    { icon: Layout, label: 'Templates', key: ICON_KEYS.SIDEBAR_TEMPLATES },
    { icon: Type, label: 'Text', key: ICON_KEYS.SIDEBAR_TEXT },
    { icon: Shapes, label: 'Shapes', key: ICON_KEYS.SIDEBAR_SHAPES },
    { icon: Image, label: 'Images', key: ICON_KEYS.SIDEBAR_IMAGES },
    { icon: LayersIcon, label: 'Layers', key: 'mobile_layers' },
  ];

  const handleAction = (index: number) => {
    if (index === actions.length - 1) {
      onOpenLayers();
    } else {
      onOpenSidebar();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden safe-bottom shadow-lg">
      <div className="grid grid-cols-5 gap-1 p-2">
        {actions.map((action, index) => (
          <button
            key={action.key}
            onClick={() => handleAction(index)}
            className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg active:bg-gray-100 transition-all touch-manipulation active:scale-95"
          >
            <DynamicIcon
              name={action.key}
              icon={action.icon}
              size={20}
              className="text-gray-600"
            />
            <span className="text-[10px] font-medium text-gray-600">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
