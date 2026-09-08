import React from 'react';
import { useLocation } from 'wouter';
import { useSkin } from '../context/SkinContext';

export interface MobileBottomRailProps {
  currentTab: 'feed' | 'wall' | 'wire' | 'bounties' | 'profile' | 'search';
  onSelectTab: (tab: 'feed' | 'wall' | 'wire' | 'bounties' | 'profile' | 'search') => void;
  unreadWireCount?: number;
}

export const MobileBottomRail: React.FC<MobileBottomRailProps> = ({
  currentTab,
  onSelectTab,
  unreadWireCount = 0,
}) => {
  const [location, setLocation] = useLocation();
  const { skinConfig } = useSkin();
  const isProfile = location.startsWith('/profile');

  const items = [
    { id: 'feed' as const, label: 'Feed', icon: '📰', isRoute: false },
    { id: 'wire' as const, label: 'Wire', icon: '📡', isRoute: false, badge: unreadWireCount },
    { id: 'bounties' as const, label: 'Bounties', icon: '🎯', isRoute: false },
    { id: 'profile' as const, label: 'Profile', icon: '👤', isRoute: true, path: '/profile' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 font-mono shadow-2xl">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const isActive = item.isRoute ? isProfile : !isProfile && currentTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.isRoute && item.path) {
                  setLocation(item.path);
                } else {
                  if (location !== '/') {
                    setLocation('/');
                  }
                  onSelectTab(item.id);
                }
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1 relative transition-colors ${
                isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <div className="relative">
                <span className="text-lg leading-none">{item.icon}</span>
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-cyan-600 text-black text-[9px] font-bold rounded-full">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span
                className="text-[10px] font-bold mt-1 tracking-wider uppercase"
                style={isActive ? { color: skinConfig.hex } : undefined}
              >
                {item.label}
              </span>
              {isActive && (
                <span
                  className="absolute bottom-0 w-8 h-0.5 rounded-full"
                  style={{ backgroundColor: skinConfig.hex }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomRail;
