export interface MenuItem {
  id: string;
  name: string;
  url: string;
  icon?: string;
  children?: MenuItem[];
  badge?: string;
  disabled?: boolean;
  external?: boolean;
}

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    url: '/dashboard',
    icon: 'home-outline'
  },
  {
    id: 'settings',
    name: 'Settings',
    url: '/settings',
    icon: 'settings-outline',
    children: [
      {
        id: 'theme',
        name: 'Theme',
        url: '/settings/theme',
        icon: 'color-palette-outline'
      },
      {
        id: 'notifications',
        name: 'Notifications',
        url: '/settings/notifications',
        icon: 'notifications-outline'
      }
    ]
  },
  {
    id: 'profile',
    name: 'Profile',
    url: '/profile',
    icon: 'person-outline'
  },
  {
    id: 'help',
    name: 'Help & Support',
    url: '/help',
    icon: 'help-circle-outline'
  }
];

export const getMenuItemById = (id: string): MenuItem | undefined => {
  const findItem = (items: MenuItem[]): MenuItem | undefined => {
    for (const item of items) {
      if (item.id === id) {
        return item;
      }
      if (item.children) {
        const found = findItem(item.children);
        if (found) return found;
      }
    }
    return undefined;
  };

  return findItem(MENU_ITEMS);
};

export const getFlattenedMenuItems = (): MenuItem[] => {
  const flatten = (items: MenuItem[]): MenuItem[] => {
    return items.reduce((acc: MenuItem[], item) => {
      acc.push(item);
      if (item.children) {
        acc.push(...flatten(item.children));
      }
      return acc;
    }, []);
  };

  return flatten(MENU_ITEMS);
};