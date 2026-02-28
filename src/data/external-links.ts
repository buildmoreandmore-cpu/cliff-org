export interface ExternalLink {
  label: string
  url: string
  description: string
  category: string
}

export const externalLinks: ExternalLink[] = [
  {
    label: 'Parent to Parent of Georgia',
    url: 'https://p2pga.org',
    description: 'Peer support network connecting families of children with disabilities.',
    category: 'Support',
  },
  {
    label: 'Bobby Dodd Institute',
    url: 'https://bobbydodd.org',
    description: 'Employment services and community programs for individuals with disabilities.',
    category: 'Employment',
  },
  {
    label: 'Georgia Medicaid',
    url: 'https://medicaid.georgia.gov',
    description: 'Official Georgia Medicaid portal for eligibility, applications, and renewals.',
    category: 'Benefits',
  },
  {
    label: 'DBHDD',
    url: 'https://dbhdd.georgia.gov',
    description:
      'Georgia Department of Behavioral Health and Developmental Disabilities — waiver services and planning lists.',
    category: 'Benefits',
  },
  {
    label: 'Social Security (SSI)',
    url: 'https://ssa.gov',
    description: 'Supplemental Security Income applications, status, and resources.',
    category: 'Benefits',
  },
  {
    label: "Cam & Madi's Promise",
    url: 'https://camandmadispromise.org',
    description: 'Advocacy and resources for families navigating Georgia disability services.',
    category: 'Advocacy',
  },
  {
    label: 'Georgia STABLE Account',
    url: 'https://georgiastable.com',
    description: 'Tax-advantaged savings for individuals with disabilities without losing benefits.',
    category: 'Financial',
  },
  {
    label: 'GA DOE Special Education',
    url: 'https://gadoe.org/special-education/',
    description: 'Georgia Department of Education special education services, IEP resources, and transition planning.',
    category: 'Education',
  },
]
