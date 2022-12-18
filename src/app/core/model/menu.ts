import { NavItem } from "src/app/core/model/nav-item";


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
    route: 'records',
    isParent: false,
  },
  {
    displayName: 'Configurations',
    iconName: 'settings',
    route: 'configurations',
    isParent: true,
    children: [
      {
        displayName: 'Service Type',
        iconName: 'work',
        route: 'configurations/service-type',
        isParent: false,
      },
      {
        displayName: 'Pet Type',
        iconName: 'pie_chart',
        route: 'configurations/pet-type',
        isParent: false,
      },
      {
        displayName: 'Pet Category',
        iconName: 'category',
        route: 'configurations/pet-category',
        isParent: false,
      },
    ]
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
  },
  {
    displayName: 'Reminders',
    iconName: 'today',
    route: 'reminders',
    isParent: false,
  }
];
