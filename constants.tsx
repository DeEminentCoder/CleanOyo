
import React from 'react';
import { PickupStatus, WasteType, ZoneData, UserRole } from './types';

export const IBADAN_ZONES: ZoneData[] = [
  { id: '1', name: 'Bodija', floodRisk: 'Low', activeRequests: 12, coordinates: [7.4443, 3.9187] },
  { id: '2', name: 'Akobo', floodRisk: 'Medium', activeRequests: 25, coordinates: [7.4350, 3.9450] },
  { id: '3', name: 'Challenge', floodRisk: 'High', activeRequests: 45, coordinates: [7.3487, 3.8762] },
  { id: '4', name: 'Dugbe', floodRisk: 'Medium', activeRequests: 18, coordinates: [7.3887, 3.8962] },
  { id: '5', name: 'Moniya', floodRisk: 'High', activeRequests: 32, coordinates: [7.5333, 3.9167] },
  { id: '6', name: 'Apata', floodRisk: 'Low', activeRequests: 15, coordinates: [7.3750, 3.8450] },
];

export const STATUS_COLORS = {
  [PickupStatus.SCHEDULED]: 'bg-blue-100 text-blue-800',
  [PickupStatus.ON_THE_WAY]: 'bg-yellow-100 text-yellow-800',
  [PickupStatus.COMPLETED]: 'bg-green-100 text-green-800',
  [PickupStatus.CANCELLED]: 'bg-red-100 text-red-800',
  [PickupStatus.PENDING]: 'bg-slate-100 text-slate-800',
};

export const WASTE_ICONS = {
  [WasteType.GENERAL]: '🗑️',
  [WasteType.RECYCLABLE]: '♻️',
  [WasteType.ORGANIC]: '🍎',
  [WasteType.HAZARDOUS]: '⚠️',
  [WasteType.CONSTRUCTION]: '🏗️',
};

export interface MenuItem {
  icon: string;
  label: string;
}

export const ROLE_MENU_ITEMS: Record<UserRole, MenuItem[]> = {
  [UserRole.RESIDENT]: [
    { icon: '📊', label: 'Dashboard' },
    { icon: '📅', label: 'My Schedule' },
    { icon: '📜', label: 'History' },
    { icon: '🌿', label: 'Waste Tips' },
    { icon: '⚙️', label: 'Settings' },
  ],
  [UserRole.PSP_OPERATOR]: [
    { icon: '🚚', label: "Today's Route" },
    { icon: '📝', label: 'Pickups' },
    { icon: '🗺️', label: 'Map View' },
    { icon: '📊', label: 'Performance' },
    { icon: '🏢', label: 'PSP Directory' },
  ],
  [UserRole.ADMIN]: [
    { icon: '📈', label: 'Overview' },
    { icon: '🗂️', label: 'All Requests' },
    { icon: '👥', label: 'User Management' },
    { icon: '🏢', label: 'PSP Managers' },
    { icon: '📍', label: 'Zones' },
    { icon: '⚠️', label: 'Flood Risk' },
    { icon: '📜', label: 'System Logs' },
  ],
};

export const ROLE_DEFAULT_TABS: Record<UserRole, string> = {
  [UserRole.RESIDENT]: 'Dashboard',
  [UserRole.PSP_OPERATOR]: "Today's Route",
  [UserRole.ADMIN]: 'Overview',
};
