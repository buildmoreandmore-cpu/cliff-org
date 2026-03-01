export const COLORS = {
  coral: '#E85D3A',
  coralDark: '#D14E2E',
  navy: '#1A2535',
  navyLight: '#2A3A4F',
  cream: '#F5F3F0',
  offWhite: '#FAFAFA',
  white: '#FFFFFF',
} as const

export const EASING = [0.22, 1, 0.36, 1] as const

export const FADE_UP = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: EASING },
}

export const STAGGER_CONTAINER = {
  animate: { transition: { staggerChildren: 0.12 } },
}

export const EXTERNAL_LINKS = {
  parentToParentGA: { label: 'Parent to Parent of Georgia', url: 'https://p2pga.org' },
  bobbyDoddInstitute: { label: 'Bobby Dodd Institute', url: 'https://bobbydodd.org' },
  georgiaMedicaid: { label: 'Georgia Medicaid', url: 'https://medicaid.georgia.gov' },
  dbhdd: { label: 'DBHDD', url: 'https://dbhdd.georgia.gov' },
  ssa: { label: 'Social Security (SSI)', url: 'https://ssa.gov' },
  camAndMadisPromise: { label: "Cam & Madi's Promise", url: 'https://camandmadispromise.org' },
  georgiaABLE: { label: 'Georgia STABLE Account', url: 'https://georgiastable.com' },
  gadoeSpecialEd: {
    label: 'GA DOE Special Education',
    url: 'https://gadoe.org/special-education/',
  },
} as const

export const CONTACTS = {
  dbhddIntake: '(404) 657-2252',
  katieBeckettPacket: '(678) 248-7449',
} as const

export const NAV_LINKS = [
  { label: 'Resources', href: '/resources' },
  { label: 'Navigator', href: '/navigator' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Advocacy', href: '/advocacy' },
  { label: 'Donate', href: '/donate' },
  { label: 'About', href: '/about' },
] as const
