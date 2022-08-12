import { NavItem } from './nav-item';

export let menu: NavItem[] = [
  {
    displayName: 'Appointments',
    iconName: 'perm_contact_calendar',
    route: 'appointments',
    isParent: false,
  },
  {
    displayName: 'Health Records',
    iconName: 'assignment_turned_in',
    route: 'healrecords',
    isParent: false,
  },
  {
    displayName: 'Security',
    iconName: 'security',
    route: 'security',
    isParent: true,
    children: [
      {
        displayName: 'Users',
        iconName: 'account_circle',
        route: 'security/users',
        isParent: false,
      },
      {
        displayName: 'Roles',
        iconName: 'supervisor_account',
        route: 'security/roles',
        isParent: false,
      },
    ]
  }
];
