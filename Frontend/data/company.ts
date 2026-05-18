// ─── Static reference data (non-employee, non-seeded) ─────────────────────────
// Employee data now comes from the backend API. This file keeps static reference
// data used by policies, departments, leave types and company info screens.

// export const COMPANIES: Record<string, any> = {
//   'monk-outsourcing': {
//     id: 'monk-outsourcing', name: 'Monk Outsourcing', fullName: 'Monk Outsourcing Pvt. Ltd.',
//     tagline: 'Making Digital Marketing Work for You', primaryColor: '#F5A623',
//     website: 'https://monkoutsourcing.com', email: 'info@monkoutsourcing.com',
//     phone: { usa: '+1-307-218-0394', uk: '0207-183-5625' },
//     address: { usa: '30 N Gould St, Sheridan, WY 82801, USA', uae: 'Meydan Grandstand, 6th Floor, Dubai, U.A.E.' },
//     services: ['SEO Services', 'Web Design & Development', 'Pay for Performance SEO', 'Social Media', 'Reputation Management', 'Mobile App Development'],
//     founded: '2018', awards: '10+', clients: '25+', projects: '750+',
//   },
//   'monk-travel-tech': {
//     id: 'monk-travel-tech', name: 'Monk Travel Tech', fullName: 'Monk Travel Tech Pvt. Ltd.',
//     tagline: 'Simplifying Travel Worldwide', primaryColor: '#00BCD4',
//     website: 'https://monktraveltech.com', email: 'info@monktraveltech.com',
//     phone: '+91 120 4148188', address: 'A-23, 4th Floor, Sector-03, Noida - 201301',
//     cin: 'U63030DL2018PTC333490', brands: ['CheckNFly', 'FlightForUs', 'Neptuno Proximo'], founded: '2018',
//   },
// };
export const COMPANIES = {
  'monk-outsourcing': {
    id: 'monk-outsourcing',
    name: 'Monk Outsourcing',
    fullName: 'Monk Outsourcing Pvt. Ltd.',
    type: 'IT Services & Digital Marketing',
    tagline: 'Making Digital Marketing Work for You',

    primaryColor: '#4F46E5',

    contact: {
      email: 'info@monkoutsourcing.com',
      phone: {
        usa: '+1-307-218-0394',
        uk: '0207-183-5625',
      },
      website: 'https://monkoutsourcing.com',
    },

    headquarters: {
      usa: '30 N Gould St, Sheridan, WY 82801, USA',
      uae: 'Meydan Grandstand, 6th Floor, Dubai, U.A.E.',
      india: 'Noida, Uttar Pradesh, India',
    },

    stats: {
      founded: 2018,
      employees: 250,
      clients: 25,
      projects: 750,
      awards: 10,
    },

    services: [
      'SEO & Digital Marketing',
      'Performance Marketing',
      'Web Development',
      'Mobile App Development',
      'UI/UX Design',
      'Reputation Management',
    ],
  },

  'monk-travel-tech': {
    id: 'monk-travel-tech',
    name: 'Monk Travel Tech',
    fullName: 'Monk Travel Tech Pvt. Ltd.',
    type: 'Travel Technology & SaaS',
    tagline: 'Simplifying Travel Worldwide',

    primaryColor: '#06B6D4',

    contact: {
      email: 'info@monktraveltech.com',
      phone: '+91 120 4148188',
      website: 'https://monktraveltech.com',
    },

    headquarters: {
      india: 'A-23, 4th Floor, Sector-03, Noida - 201301',
    },

    stats: {
      founded: 2018,
      brands: ['CheckNFly', 'FlightForUs', 'Neptuno Proximo'],
    },

    cin: 'U63030DL2018PTC333490',
  },
};

// export const DEPARTMENTS = [

//   { id: 'leadership', name: 'Leadership',          icon: 'ribbon',               color: '#F5A623' },
//   { id: 'hr',         name: 'Human Resources',     icon: 'people',               color: '#E91E63' },
//   { id: 'it',         name: 'IT & Development',    icon: 'code-slash',           color: '#2196F3' },
//   { id: 'seo',        name: 'SEO & Marketing',     icon: 'trending-up',          color: '#4CAF50' },
//   { id: 'sales',      name: 'Sales',               icon: 'briefcase',            color: '#FF9800' },
//   { id: 'design',     name: 'Design',              icon: 'color-palette',        color: '#9C27B0' },
//   { id: 'operations', name: 'Operations',          icon: 'settings',             color: '#00BCD4' },
//   { id: 'accounts',   name: 'Accounts & Finance',  icon: 'cash',                 color: '#795548' },
// ];

export const DEPARTMENTS = [
  {
    id: 'leadership',
    name: 'Leadership',
    code: 'LDR',
    icon: 'ribbon',
    color: '#4F46E5',
    level: 1,
    access: ['ALL'],
  },
  {
    id: 'hr',
    name: 'Human Resources',
    code: 'HR',
    icon: 'people',
    color: '#EC4899',
    level: 2,
    access: ['EMPLOYEE', 'MANAGER', 'ADMIN'],
  },
  {
    id: 'engineering',
    name: 'Engineering',
    code: 'ENG',
    icon: 'code-slash',
    color: '#3B82F6',
    level: 2,
    access: ['DEV', 'LEAD', 'ADMIN'],
  },
  {
    id: 'marketing',
    name: 'Marketing & Growth',
    code: 'MKT',
    icon: 'trending-up',
    color: '#10B981',
    level: 2,
    access: ['MARKETING', 'LEAD'],
  },
  {
    id: 'sales',
    name: 'Sales & Business',
    code: 'SLS',
    icon: 'briefcase',
    color: '#F59E0B',
    level: 2,
    access: ['SALES', 'MANAGER'],
  },
  {
    id: 'design',
    name: 'Design & UX',
    code: 'DSN',
    icon: 'color-palette',
    color: '#8B5CF6',
    level: 2,
    access: ['DESIGN', 'CREATIVE'],
  },
  {
    id: 'finance',
    name: 'Finance & Accounts',
    code: 'FIN',
    icon: 'cash',
    color: '#14B8A6',
    level: 2,
    access: ['FINANCE', 'ADMIN'],
  },
];

// export const LEAVE_TYPES = [
//   { id: 'cl',  name: 'Casual Leave',      short: 'CL',  total: 12,  color: '#4CAF50', icon: 'umbrella-outline',       desc: 'For personal/casual reasons' },
//   { id: 'sl',  name: 'Sick Leave',        short: 'SL',  total: 12,  color: '#F44336', icon: 'medkit-outline',         desc: 'For illness or medical needs' },
//   { id: 'el',  name: 'Earned Leave',      short: 'EL',  total: 15,  color: '#2196F3', icon: 'star-outline',           desc: 'Accrued leave based on tenure' },
//   { id: 'ml',  name: 'Maternity Leave',   short: 'ML',  total: 180, color: '#E91E63', icon: 'heart-outline',          desc: 'For expecting mothers' },
//   { id: 'pl',  name: 'Paternity Leave',   short: 'PL',  total: 15,  color: '#9C27B0', icon: 'person-outline',         desc: 'For new fathers' },
//   { id: 'lop', name: 'Leave Without Pay', short: 'LOP', total: 0,   color: '#FF9800', icon: 'remove-circle-outline',  desc: 'Unpaid leave' },
// ];


export const LEAVE_TYPES = [
  {
    id: 'CL',
    name: 'Casual Leave',
    code: 'CL',
    annualLimit: 12,
    carryForward: false,
    maxConsecutive: 3,
    color: '#10B981',
    icon: 'sunny-outline',
    description: 'For personal or urgent short-term needs',
  },
  {
    id: 'SL',
    name: 'Sick Leave',
    code: 'SL',
    annualLimit: 12,
    medicalRequiredAfterDays: 3,
    color: '#EF4444',
    icon: 'medkit-outline',
    description: 'For medical illness or health-related issues',
  },
  {
    id: 'EL',
    name: 'Earned Leave',
    code: 'EL',
    annualLimit: 15,
    accrualRate: '1.25/month',
    carryForwardLimit: 30,
    color: '#3B82F6',
    icon: 'star-outline',
    description: 'Earned based on tenure',
  },
  {
    id: 'ML',
    name: 'Maternity Leave',
    code: 'ML',
    annualLimit: 180,
    eligibility: '80+ working days',
    color: '#EC4899',
    icon: 'heart-outline',
    description: 'As per government policy',
  },
  {
    id: 'PL',
    name: 'Paternity Leave',
    code: 'PL',
    annualLimit: 15,
    color: '#8B5CF6',
    icon: 'person-outline',
    description: 'For new fathers',
  },
  {
    id: 'LOP',
    name: 'Leave Without Pay',
    code: 'LOP',
    annualLimit: 0,
    color: '#F59E0B',
    icon: 'remove-circle-outline',
    description: 'Unpaid approved leave',
  },
];
// export const POLICIES = [
//   { id: 'P1', title: 'Leave Policy', icon: 'calendar-outline', color: '#4CAF50',
//     sections: [
//       { heading: 'Casual Leave (CL)',   content: '12 days per year. For personal or emergency use. Cannot be carried forward. Max 3 consecutive days at a time.' },
//       { heading: 'Sick Leave (SL)',     content: '12 days per year. Medical certificate required for 3+ consecutive days. Cannot be encashed.' },
//       { heading: 'Earned Leave (EL)',   content: '15 days per year, accrued at 1.25 days/month. Can be carried forward up to 30 days.' },
//       { heading: 'Maternity Leave',     content: '180 days (26 weeks) as per Maternity Benefit Act 2017. For female employees with 80+ days of service.' },
//     ]},
//   { id: 'P2', title: 'Code of Conduct', icon: 'shield-checkmark-outline', color: '#2196F3',
//     sections: [
//       { heading: 'Professional Behavior', content: 'All employees must maintain professional behavior at all times. Respect for colleagues, clients, and management is mandatory.' },
//       { heading: 'Dress Code',            content: 'Business casual attire required on all working days. Client-facing roles must wear formal attire.' },
//       { heading: 'Confidentiality',       content: 'All company and employee data is strictly confidential. Sharing sensitive information externally is a disciplinary offense.' },
//     ]},
//   { id: 'P3', title: 'Work From Home Policy', icon: 'home-outline', color: '#9C27B0',
//     sections: [
//       { heading: 'Eligibility',  content: 'All permanent employees with 3+ months of service are eligible for WFH after manager approval.' },
//       { heading: 'WFH Days',    content: 'Maximum 2 days per week with prior approval. Core hours 10 AM - 4 PM must be observed.' },
//       { heading: 'Attendance',  content: 'Biometric attendance is mandatory on office days. WFH days must be marked in the HRMS.' },
//     ]},
//   { id: 'P4', title: 'POSH Policy', icon: 'people-circle-outline', color: '#E91E63',
//     sections: [
//       { heading: 'Zero Tolerance',     content: 'Monk Group has zero tolerance for sexual harassment of any kind.' },
//       { heading: 'ICC Committee',      content: 'Internal Complaints Committee handles all complaints within 90 days of inquiry.' },
//       { heading: 'Mandatory Training', content: 'Annual POSH awareness training is mandatory for all employees.' },
//     ]},
//   { id: 'P5', title: 'IT & Security Policy', icon: 'lock-closed-outline', color: '#FF9800',
//     sections: [
//       { heading: 'Device Usage',    content: 'Company devices must be used for official work only. Unauthorized software installation is prohibited.' },
//       { heading: 'Password Policy', content: 'Passwords must be changed every 90 days. Minimum 8 characters with mixed case, numbers, and symbols.' },
//     ]},
//   { id: 'P6', title: 'Compensation & Benefits', icon: 'cash-outline', color: '#00BCD4',
//     sections: [
//       { heading: 'Salary Structure', content: 'CTC includes Basic (50%), HRA (20%), Conveyance (10%), and Special Allowance. Credited on last working day of month.' },
//       { heading: 'PF & ESI',        content: 'PF: 12% of Basic deducted + 12% employer contribution. ESI applicable for eligible employees.' },
//     ]},
// ];




export const POLICIES = [
  {
    id: 'POL-LEAVE-001',
    title: 'Leave Management Policy',
    category: 'HR',
    priority: 'HIGH',
    icon: 'calendar-outline',
    color: '#4F46E5',
    version: '2.0',

    sections: [
      {
        heading: 'Leave Entitlement',
        content: 'Employees are entitled to annual leaves based on company policy and tenure.',
      },
      {
        heading: 'Approval Workflow',
        content: 'All leave requests must be approved by reporting manager via HRMS.',
      },
      {
        heading: 'Carry Forward Rules',
        content: 'Only earned leave can be carried forward up to defined limits.',
      },
    ],
  },

  {
    id: 'POL-CONDUCT-001',
    title: 'Code of Conduct',
    category: 'COMPLIANCE',
    priority: 'HIGH',
    icon: 'shield-checkmark-outline',
    color: '#3B82F6',

    sections: [
      {
        heading: 'Professional Behavior',
        content: 'Employees must maintain professionalism in all internal and external communications.',
      },
      {
        heading: 'Data Confidentiality',
        content: 'All company data must remain confidential and protected.',
      },
    ],
  },

  {
    id: 'POL-REMOTE-001',
    title: 'Remote Work Policy',
    category: 'OPERATIONS',
    priority: 'MEDIUM',
    icon: 'home-outline',
    color: '#8B5CF6',

    sections: [
      {
        heading: 'Eligibility',
        content: 'Based on role and performance approval.',
      },
      {
        heading: 'Work Hours',
        content: 'Core hours must be maintained even in remote mode.',
      },
    ],
  },
];