export interface ResourcePanel {
  id: string
  title: string
  icon: string
  summary: string
  content: string[]
  links: { label: string; url: string }[]
  alertText?: string
}

export const resourcePanels: ResourcePanel[] = [
  {
    id: 'ssi',
    title: 'Supplemental Security Income (SSI)',
    icon: 'shield',
    summary: 'Monthly cash benefit for children and adults with disabilities who have limited income.',
    content: [
      'SSI provides monthly payments to individuals with disabilities and limited resources. For children under 18, parental income is "deemed" to the child.',
      'At age 18, only the child\'s own income and resources count — this often means children who were previously denied can now qualify.',
      'Apply 3 months before the child\'s 18th birthday. Contact your local Social Security office or call 1-800-772-1213.',
    ],
    links: [
      { label: 'SSA Official Site', url: 'https://ssa.gov' },
      { label: 'SSI for Children', url: 'https://www.ssa.gov/benefits/ssi' },
    ],
    alertText: 'Apply 3 months before your child turns 18 — do not wait until their birthday.',
  },
  {
    id: 'medicaid',
    title: 'Georgia Medicaid',
    icon: 'heart',
    summary: 'Health coverage for eligible low-income individuals, families, and people with disabilities.',
    content: [
      'Georgia Medicaid covers medical, behavioral health, and long-term services. Children with disabilities may qualify through multiple pathways.',
      'Katie Beckett (Deeming Waiver) allows children with significant disabilities to qualify for Medicaid regardless of parental income if they meet institutional level of care.',
      'At age 18, your child may qualify for Medicaid based on their own income through SSI linkage or other categories.',
    ],
    links: [
      { label: 'Georgia Medicaid', url: 'https://medicaid.georgia.gov' },
    ],
    alertText: 'Katie Beckett requires a Level of Care Statement — this is the most critical document in the application.',
  },
  {
    id: 'medicaid-layers',
    title: 'Understanding Medicaid Layers',
    icon: 'layers',
    summary: 'Medicaid is not one program — it is a funding architecture with layers most families never see. Understanding these layers changes outcomes.',
    content: [
      'Medicaid coverage and Medicaid waiver funding are two completely different things. Medicaid coverage pays for medical services — doctor visits, prescriptions, therapies, equipment. Waiver funding pays for support services — personal care, day programs, residential support, employment coaching. A child can have Medicaid coverage but not a waiver. A child with a waiver also has Medicaid coverage. They have separate applications, separate eligibility, and separate administrators in Georgia.',
      'Medicaid and private insurance can stack. If your family has employer-sponsored insurance, Medicaid sits underneath as a secondary payer. Private insurance pays first, Medicaid covers what\'s left — copays, deductibles, uncovered services. Families with good jobs assume they earn too much or don\'t need it. Both assumptions are wrong. A $500/month feeding supply regimen at 80% private coverage still costs $100/month out of pocket. Medicaid as secondary covers that.',
      'Self-direction means you control the money. Most families who get a NOW/COMP waiver assume a provider agency controls spending. Georgia allows self-direction — the family becomes the employer of record, hires their own workers (including family members in some cases), and manages the budget. A parent providing 40 hours/week of unpaid care can in some circumstances be compensated through the waiver. Almost nobody tells families this.',
      'Georgia\'s NOW/COMP waivers operate under Section 1915(c) with hard slot caps — that\'s why there\'s a 7,300+ person waitlist. Section 1915(i) state plan services don\'t have slot caps. Georgia has not fully maximized its 1915(i) authority. Organizations like GCDD are pushing for this. Parents who understand this can advocate more effectively at the legislative level.',
    ],
    links: [
      { label: 'Georgia Medicaid', url: 'https://medicaid.georgia.gov' },
      { label: 'GCDD', url: 'https://gcdd.org' },
    ],
    alertText: 'Medicaid is not an on/off switch — it is multiple funding streams that can stack. Ask CLIFF\'s Navigator to screen your family for every layer you may be missing.',
  },
  {
    id: 'medicare-dual',
    title: 'Medicare vs Medicaid & Dual Eligibility',
    icon: 'shield-check',
    summary: 'Medicare and Medicaid are different programs. Some individuals qualify for both, unlocking the most comprehensive coverage available.',
    content: [
      'Medicare is federal health insurance for people 65+ OR people who have received Social Security Disability Insurance (SSDI) for 24 months. Medicaid is the joint federal-state program for low-income individuals. They are completely separate programs with different eligibility rules.',
      'A young adult with a disability who receives SSI does NOT automatically get Medicare — they get Medicaid. But if they later qualify for SSDI (which is different from SSI and based on work history), after 24 months of SSDI they become Medicare eligible.',
      'When someone qualifies for both Medicare and Medicaid simultaneously, it\'s called dual eligibility. Dual-eligible individuals have extremely comprehensive coverage — Medicare covers hospital and medical care, Medicaid covers what Medicare doesn\'t including long-term services. Almost no parent of a young adult with a disability understands this pathway exists.',
      'If your adult child has any work history and becomes unable to work, explore SSDI eligibility. The 24-month Medicare qualifying period starts from the date of SSDI entitlement, not the application date.',
    ],
    links: [
      { label: 'Medicare.gov', url: 'https://www.medicare.gov' },
      { label: 'SSA Disability Benefits', url: 'https://www.ssa.gov/disability' },
    ],
    alertText: 'SSI gives you Medicaid. SSDI (after 24 months) gives you Medicare. If your child qualifies for both, they get the most comprehensive coverage in the system.',
  },
  {
    id: 'waivers',
    title: 'NOW & COMP Waivers',
    icon: 'clipboard',
    summary: 'Home and community-based services for individuals with intellectual/developmental disabilities.',
    content: [
      'NOW (New Options Waiver) and COMP (Comprehensive Supports Waiver) provide services like residential support, day programs, respite, and more.',
      'Both waivers have long waiting lists (5-15+ years). Getting on the Planning List as early as possible is critical.',
      'Contact DBHDD Intake at (404) 657-2252 to begin the intake process. You need a psychological evaluation and diagnosis documentation.',
    ],
    links: [
      { label: 'DBHDD Waivers', url: 'https://dbhdd.georgia.gov' },
    ],
    alertText: 'Get on the Planning List immediately — wait times can exceed 10 years.',
  },
  {
    id: 'katie-beckett',
    title: 'Katie Beckett / Deeming Waiver',
    icon: 'star',
    summary: 'Medicaid pathway for children with severe disabilities regardless of family income.',
    content: [
      'Katie Beckett allows children who meet an institutional level of care to receive Medicaid, even if family income is too high for regular Medicaid.',
      'The key document is the Level of Care Statement from your child\'s physician. Describe the worst day, not the best. Detail every support need.',
      'If your child was denied SSI, you can still apply for Katie Beckett. Keep the SSI denial letter — you\'ll need it.',
      'Call (678) 248-7449 to request the Katie Beckett application packet.',
    ],
    links: [
      { label: 'Georgia Medicaid', url: 'https://medicaid.georgia.gov' },
    ],
    alertText: 'Write the Level of Care Statement describing the worst day, not the best. Detail every support and supervision need.',
  },
  {
    id: 'transition',
    title: 'Age 18 & 21 Transitions',
    icon: 'calendar',
    summary: 'Critical deadlines and changes when your child turns 18 and 21.',
    content: [
      'At 18: Your child becomes a legal adult. SSI redetermination uses only their income. Apply for SSI if not already receiving. Consider guardianship or alternatives.',
      'At 21: EPSDT (Early Periodic Screening) ends. IDEA school services end. Your child ages out of many children\'s programs.',
      'Start planning at least 2 years before each transition. Ensure your child is on the NOW/COMP Planning List. Begin adult Medicaid pathway.',
    ],
    links: [
      { label: 'SSA', url: 'https://ssa.gov' },
      { label: 'GA DOE Special Education', url: 'https://gadoe.org/special-education/' },
    ],
    alertText: 'Start planning 2 years before each transition age. These deadlines are firm.',
  },
  {
    id: 'employment',
    title: 'Employment & Work Incentives',
    icon: 'briefcase',
    summary: 'Vocational services, supported employment, and critical work incentives that let your child work without losing benefits.',
    content: [
      'Bobby Dodd Institute offers employment services including job coaching, vocational training, and supported employment. Vocational Rehabilitation (VR) through Georgia DOL helps with job training, placement, and accommodations. DBHDD-funded day programs provide structured activities and community integration.',
      'The fear of losing Medicaid is the single biggest barrier to employment for adults with disabilities. But Georgia offers the Medicaid Buy-In for Workers with Disabilities — Medicaid can continue even after SSI ends if earnings are below a certain level. Most families don\'t know this.',
      'Social Security work incentives include: Ticket to Work (free employment support), Trial Work Period (9 months of unlimited earnings while keeping SSI), Impairment Related Work Expenses (IRWE — work costs deducted from countable income), and Substantial Gainful Activity thresholds. Each one allows a person to attempt work without immediately losing benefits.',
      'PASS (Plan to Achieve Self-Support) allows an SSI recipient to set aside income or resources toward a work goal — education, training, starting a business, buying equipment. The set-aside money doesn\'t count against SSI eligibility. For individuals with employment potential, PASS funds the path to work while maintaining benefits during the transition.',
    ],
    links: [
      { label: 'Bobby Dodd Institute', url: 'https://bobbydodd.org' },
      { label: 'Ticket to Work', url: 'https://choosework.ssa.gov' },
      { label: 'DBHDD', url: 'https://dbhdd.georgia.gov' },
    ],
    alertText: 'Your child can work without losing Medicaid. Ask about Medicaid Buy-In, Trial Work Period, and PASS before assuming employment means losing benefits.',
  },
  {
    id: 'financial',
    title: 'ABLE Accounts, STABLE & Financial Planning',
    icon: 'dollar',
    summary: 'Protect benefits while saving. ABLE/STABLE accounts, special needs trusts, PASS, and financial strategies most families never hear about.',
    content: [
      'Georgia STABLE (also called ABLE) accounts let individuals whose disability began before age 26 save up to $18,000/year without it counting toward the $2,000 SSI resource limit. The account can hold up to $100,000 before affecting SSI. Funds cover housing, education, transportation, assistive technology, and health expenses.',
      'Family members and friends can contribute to an ABLE/STABLE account — it\'s not limited to the individual. Under the ABLE to Work Act, individuals who work can contribute an additional amount up to their annual earned income on top of the $18,000 limit. Most families don\'t know either of these facts.',
      'Special Needs Trusts (SNTs) can hold unlimited assets without affecting benefits. A first-party trust holds the individual\'s own funds. A third-party trust holds gifts, inheritance, or family contributions. Consider establishing one before your child turns 18.',
      'PASS (Plan to Achieve Self-Support) lets SSI recipients set aside money for work goals without affecting benefits. Combined with an ABLE account, a person with a disability can save, invest, and work toward independence while maintaining SSI and Medicaid.',
    ],
    links: [
      { label: 'Georgia STABLE Account', url: 'https://georgiastable.com' },
      { label: 'ABLE National Resource Center', url: 'https://www.ablenrc.org' },
    ],
    alertText: 'ABLE/STABLE accounts let your child save $100,000+ without losing SSI. Family members can contribute. If they work, they can save even more under ABLE to Work.',
  },
  {
    id: 'federal-programs',
    title: 'Additional Federal Programs',
    icon: 'flag',
    summary: 'Title XX, DD Act organizations, TRICARE ECHO, and other federal funding streams that most families never discover.',
    content: [
      'Title XX Social Services Block Grant provides federal funding for respite care, day services, and home-based support. Georgia distributes this through DFCS. Families who don\'t qualify for Medicaid waivers may qualify for Title XX funded services. Almost nobody outside the system knows this exists.',
      'The Developmental Disabilities Act funds free assistance through Protection & Advocacy organizations, University Centers for Excellence, and state DD councils. In Georgia: Georgia Advocacy Office (legal advocacy), GCDD (Georgia Council on Developmental Disabilities), and Institute on Human Development and Disability at UGA. These provide free systems navigation and legal help.',
      'Military families: TRICARE\'s Extended Care Health Option (ECHO) provides supplemental coverage for dependents with disabilities. ECHO and Medicaid can coordinate — this is significant for Georgia families near Fort Moore and other installations. Contact TRICARE directly to explore ECHO eligibility.',
      'There are dozens of narrow, specific Medicaid eligibility categories for specific situations that most families never learn about. A skilled benefits counselor screens for all of them. CLIFF\'s Navigator is built to ask enough questions to surface eligibility your family didn\'t know to ask about.',
    ],
    links: [
      { label: 'Georgia Advocacy Office', url: 'https://thegao.org' },
      { label: 'GCDD', url: 'https://gcdd.org' },
      { label: 'TRICARE ECHO', url: 'https://tricare.mil/echo' },
    ],
    alertText: 'Don\'t assume you\'ve found every program. Title XX, DD Act organizations, and TRICARE ECHO are real funding sources most families miss entirely.',
  },
  {
    id: 'edwp',
    title: 'EDWP / CCSP (Elderly & Disabled Waiver)',
    icon: 'home',
    summary: 'Home and community-based services for seniors 65+ and individuals with physical disabilities as an alternative to nursing home placement.',
    content: [
      'The Elderly and Disabled Waiver Program (EDWP) is an umbrella waiver covering two sub-programs: CCSP and SOURCE. Both serve individuals who meet Nursing Facility Level of Care.',
      'CCSP (Community Care Services Program) serves elderly individuals 65+ and people with physical disabilities ages 0–64. CCSP allows higher income thresholds than standard Medicaid and provides spousal income protections.',
      'Services include personal support, adult day health, home-delivered meals, emergency response systems, respite care, skilled nursing, assistive technology, environmental modifications, and structured family caregiving (a family member can be paid as caregiver).',
      'Contact your local Area Agency on Aging (AAA) or the Aging & Disability Resource Connection at 1-866-552-4464 to apply. Georgia has 12 AAAs covering all 159 counties.',
    ],
    links: [
      { label: 'DHS Division of Aging Services', url: 'https://aging.dhs.georgia.gov' },
      { label: 'Georgia Dept of Community Health', url: 'https://dch.georgia.gov' },
    ],
    alertText: 'Contact your local Area Agency on Aging to start the application — call the Aging & Disability Resource Connection at 1-866-552-4464.',
  },
  {
    id: 'source',
    title: 'SOURCE Medicaid Waiver',
    icon: 'heart-pulse',
    summary: 'Integrated medical care and home-based services for SSI Medicaid recipients who meet nursing home level of care.',
    content: [
      'SOURCE (Service Options Using Resources in a Community Environment) is a sub-program under the EDWP waiver. It integrates primary medical care with home and community-based services — an "enhanced" care management model.',
      'SOURCE is specifically for SSI Medicaid recipients (lower income threshold than CCSP). Individuals must meet Nursing Facility Level of Care and reside in their own home or a loved one\'s home.',
      'Services include personal support (including consumer-directed), adult day health, home-delivered meals, emergency response, respite care, skilled nursing, assistive technology, environmental modifications, and structured family caregiving.',
      'SOURCE coordinates both your medical care AND long-term services through a single Care Management Organization. Contact your local Area Agency on Aging or the Aging & Disability Resource Connection at 1-866-552-4464.',
    ],
    links: [
      { label: 'Georgia Dept of Community Health', url: 'https://dch.georgia.gov' },
      { label: 'Aging & Disability Resource Connection', url: 'https://aging.dhs.georgia.gov' },
    ],
    alertText: 'SOURCE integrates medical care with home services — ideal for avoiding nursing home placement. Apply through your local Area Agency on Aging.',
  },
  {
    id: 'icwp',
    title: 'ICWP (Independent Care Waiver)',
    icon: 'activity',
    summary: 'Home and community-based services for adults 21+ with physical disabilities including TBI and spinal cord injuries.',
    content: [
      'The Independent Care Waiver Program (ICWP) serves adults ages 21+ with physical disabilities — including traumatic brain injury (TBI), spinal cord injury, and other physical disabilities — who do NOT have an intellectual/developmental disability diagnosis.',
      'Eligible individuals must meet Nursing Facility Level of Care and be enrolled in Georgia Medicaid. ICWP is administered directly by the Georgia Department of Community Health (DCH).',
      'Services include personal support, environmental modifications, assistive technology, specialized medical equipment and supplies, skilled nursing, case management, and community transition support.',
      'Contact DCH directly or through a Medicaid case manager to apply. A functional assessment will confirm your physical disability and nursing facility level of care requirement.',
    ],
    links: [
      { label: 'Georgia Dept of Community Health', url: 'https://dch.georgia.gov' },
      { label: 'Georgia Medicaid', url: 'https://medicaid.georgia.gov' },
    ],
    alertText: 'ICWP is for physical disabilities only (not I/DD). If you have an I/DD diagnosis, apply for NOW or COMP instead.',
  },
  {
    id: 'mfp',
    title: 'Money Follows the Person (MFP)',
    icon: 'arrow-right-circle',
    summary: 'Transition program helping Georgians move from nursing homes and institutions back to community living.',
    content: [
      'Money Follows the Person (MFP) helps Georgians currently in nursing homes, hospitals, or ICF/IID facilities transition back to community living. Georgia\'s MFP program launched in 2008 and is administered by DCH with DBHDD and DHS.',
      'To qualify: you must have resided in a qualifying institution for 90+ consecutive days, be Medicaid eligible, and desire to live in a community residence. MFP covers security deposits, furnishings, moving costs, environmental modifications, and 12 months of transition coordination.',
      'MFP connects individuals to the right long-term waiver: EDWP/CCSP/SOURCE for elderly and physically disabled, ICWP for adults with physical disabilities, or NOW/COMP for individuals with I/DD.',
      'Contact the Georgia MFP Program Office at 404-651-9961 or email [email protected]. An Options Counselor or Transition Coordinator will arrange a screening.',
    ],
    links: [
      { label: 'Georgia MFP Program', url: 'https://dch.georgia.gov' },
      { label: 'Georgia Medicaid', url: 'https://medicaid.georgia.gov' },
    ],
    alertText: 'If you or a family member wants to leave a nursing home or institution, call the MFP office at 404-651-9961 — they can help.',
  },
  {
    id: 'advocacy',
    title: 'Advocacy & Support',
    icon: 'users',
    summary: 'Peer support, advocacy organizations, and community resources across Georgia.',
    content: [
      'Parent to Parent of Georgia connects families with trained support parents who have similar experiences.',
      'Cam & Madi\'s Promise provides advocacy, resources, and community for families navigating Georgia disability services.',
      'Georgia Advocacy Office provides legal advocacy and protection for people with disabilities.',
    ],
    links: [
      { label: 'Parent to Parent of Georgia', url: 'https://p2pga.org' },
      { label: "Cam & Madi's Promise", url: 'https://camandmadispromise.org' },
    ],
  },
]
