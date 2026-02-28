#!/bin/bash
# Seed CLIFF Supabase database with Georgia program content
SUPABASE_URL="https://gzzosucbyqllrodvmyft.supabase.co"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6em9zdWNieXFsbHJvZHZteWZ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjMwMDEyMiwiZXhwIjoyMDg3ODc2MTIyfQ._YqJu2YrzcbmVzwp-rfse_WZ2F6zBLZyyougyJYG3zU"
HEADERS=(-H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" -H "Content-Type: application/json" -H "Prefer: return=minimal")

echo "=== Seeding content_blocks ==="

# We already inserted SSI, skip it with upsert
curl -s -X POST "$SUPABASE_URL/rest/v1/content_blocks" "${HEADERS[@]}" -H "Prefer: return=minimal,resolution=merge-duplicates" -d @- <<'EOF'
[
  {
    "slug": "medicaid",
    "title": "Georgia Medicaid",
    "body": "Georgia Medicaid covers medical, behavioral health, and long-term services for eligible low-income individuals, families, and people with disabilities.\n\nPathways to Medicaid for Children with Disabilities:\n1. SSI-Linked: Automatically eligible if receiving SSI\n2. Katie Beckett (Deeming Waiver): For children meeting institutional level of care, regardless of family income\n3. Low-Income Family Medicaid: Based on household income (generally under 138% FPL for children)\n4. Aged, Blind, and Disabled (ABD): For adults meeting disability and income criteria\n\nWhat Medicaid Covers:\n- Doctor visits and hospitalizations\n- Prescription medications\n- Behavioral health services\n- Home health and nursing\n- Durable medical equipment\n- Dental and vision (for children)\n- Transportation to medical appointments\n\nAt age 18, your child may qualify for Medicaid based on their own income through SSI linkage or other adult categories.\n\nContact: Georgia Medicaid Customer Service: 1-866-322-4260\nApply online: gateway.ga.gov",
    "source_url": "https://medicaid.georgia.gov",
    "source_name": "Georgia Department of Community Health",
    "is_published": true
  },
  {
    "slug": "katie-beckett",
    "title": "Katie Beckett / Deeming Waiver",
    "body": "Katie Beckett (also called the Deeming Waiver or TEFRA) allows children with severe disabilities to receive Medicaid regardless of family income, provided they meet an institutional level of care.\n\nEligibility Requirements:\n1. Child must be under 18\n2. Child must have a disability that meets institutional level of care\n3. Child must live at home (not in an institution)\n4. It must be appropriate and cost-effective for the child to receive care at home\n\nThe Level of Care Statement:\nThis is THE most critical document in the Katie Beckett application. It must be completed by your child's physician and must:\n- Describe the child's condition in detail\n- Document 24-hour care needs including overnight\n- Explain why institutional level of care is needed\n- Describe all support and supervision needs\n\nCritical Tips:\n- Write about the WORST day, not the best\n- Include overnight care needs (many families forget this)\n- Detail every type of support: feeding, bathing, mobility, medication management, behavioral supervision\n- If your child was denied SSI, keep the denial letter — you'll need it for Katie Beckett\n\nHow to Apply:\nCall (678) 248-7449 to request the Katie Beckett application packet.\n\nKatie Beckett ends when the child turns 18. Plan for the transition to adult Medicaid pathways.",
    "source_url": "https://medicaid.georgia.gov",
    "source_name": "Georgia Department of Community Health",
    "is_published": true
  },
  {
    "slug": "now-comp-waivers",
    "title": "NOW & COMP Waivers",
    "body": "NOW (New Options Waiver) and COMP (Comprehensive Supports Waiver) provide home and community-based services for individuals with intellectual and developmental disabilities (I/DD).\n\nNOW Waiver Services:\n- Community living support\n- Community access (day services)\n- Respite care\n- Supported employment\n- Environmental accessibility adaptations\n- Specialized medical supplies\n- Vehicle modifications\n- Annual cap varies by service\n\nCOMP Waiver Services:\n- Everything in NOW plus:\n- Residential support (group homes, host homes)\n- More intensive community living support\n- Additional behavioral support\n- Higher service caps\n\nWaitlist Reality:\n- Both waivers have waiting lists of 5-15+ years\n- Getting on the Planning List as early as possible is critical\n- There are approximately 7,000+ individuals on the combined waiting list\n- Slots open based on legislative funding — typically 100-250 new slots per year\n\nHow to Get on the Planning List:\n1. Contact DBHDD Intake at (404) 657-2252\n2. Complete the intake process\n3. You will need:\n   - Psychological evaluation (within 3 years)\n   - Diagnosis documentation (I/DD diagnosis before age 22)\n   - Proof of Georgia residency\n   - Level of care determination\n\nFollow up regularly — at least annually — to ensure your place on the list is maintained.",
    "source_url": "https://dbhdd.georgia.gov",
    "source_name": "Georgia DBHDD",
    "is_published": true
  },
  {
    "slug": "epsdt",
    "title": "EPSDT (Early and Periodic Screening, Diagnostic and Treatment)",
    "body": "EPSDT is a comprehensive Medicaid benefit for children and young adults under age 21. It is one of the most powerful benefits available because it requires states to provide ANY medically necessary service, even if the state Medicaid plan doesn't normally cover it.\n\nWhat EPSDT Covers:\n- Well-child visits and developmental screenings\n- Vision, dental, and hearing services\n- Immunizations\n- Lab tests\n- Mental health and behavioral services\n- Physical, occupational, and speech therapy\n- Any medically necessary treatment or service\n\nThe EPSDT Guarantee:\nUnder federal law, states MUST provide any Medicaid-coverable service that is medically necessary for a child under 21, even if that service isn't in the state plan. This is called the EPSDT mandate.\n\nThis means if a doctor says your child needs a service, Medicaid must cover it — even if it's something Georgia Medicaid doesn't normally pay for.\n\nCritical Warning — Age 21 Cliff:\nEPSDT ends completely when your child turns 21. After 21, only services in the regular Georgia Medicaid plan are covered. Many services that were available under EPSDT will no longer be covered.\n\nPrepare for this transition by:\n1. Identifying which services your child receives under EPSDT\n2. Determining which will continue under adult Medicaid\n3. Finding alternative funding sources for services that won't continue\n4. Ensuring waiver applications are in progress well before age 21",
    "source_url": "https://www.medicaid.gov/medicaid/benefits/early-and-periodic-screening-diagnostic-and-treatment/index.html",
    "source_name": "Centers for Medicare & Medicaid Services",
    "is_published": true
  },
  {
    "slug": "gapp",
    "title": "GAPP (Georgia Pediatric Program)",
    "body": "GAPP provides skilled nursing and personal care services for medically fragile children on Medicaid who require ongoing medical care at home.\n\nEligibility:\n- Child must be on Medicaid\n- Child must be medically fragile (technology-dependent, requiring skilled nursing)\n- Physician must document medical necessity\n- Must be more cost-effective to provide care at home than in a facility\n\nServices Provided:\n- Skilled nursing (RN and LPN)\n- Personal care services\n- Medical equipment management\n- Caregiver training\n- Care coordination\n\nHow to Apply:\n1. Must already have Medicaid\n2. Need physician orders documenting medical fragility\n3. Choose a GAPP-enrolled home health agency\n4. Agency handles the enrollment process\n\nGAPP ends when:\n- The child no longer meets medical necessity criteria\n- The child loses Medicaid eligibility\n- The child turns 21 (transitions to adult home health services)\n\nImportant: GAPP is separate from waiver services. A child can receive GAPP AND be on the NOW/COMP Planning List.",
    "source_url": "https://medicaid.georgia.gov",
    "source_name": "Georgia Department of Community Health",
    "is_published": true
  },
  {
    "slug": "guardianship",
    "title": "Guardianship & Alternatives at Age 18",
    "body": "When your child turns 18, they become a legal adult with full decision-making rights — regardless of their disability. If your child cannot make informed decisions about their health, finances, or safety, you need to take legal action BEFORE their 18th birthday.\n\nOptions (from most to least restrictive):\n\n1. Full Guardianship:\n- You make ALL decisions for your adult child\n- Requires probate court petition, medical evaluation, and hearing\n- Most restrictive — courts increasingly prefer less restrictive alternatives\n- Cost: $1,500-3,500+ in attorney fees\n- File in the county where your child resides\n\n2. Limited Guardianship:\n- You make decisions only in specific areas (medical, financial, etc.)\n- Your child retains rights in areas not covered\n- Preferred by courts when appropriate\n\n3. Conservatorship:\n- Financial decisions only\n- Does not cover medical or personal decisions\n\n4. Power of Attorney (POA):\n- Your child voluntarily grants you decision-making authority\n- Requires your child to have capacity to understand what they're signing\n- Can be revoked by your child at any time\n- Much cheaper than guardianship ($200-500)\n\n5. Healthcare Proxy / Advance Directive:\n- Medical decisions only\n- Your child must have capacity to sign\n\n6. Supported Decision-Making Agreement:\n- Newest and least restrictive option\n- Your child makes their own decisions with your help\n- Georgia passed SB 107 in 2015 authorizing these agreements\n- No court involvement required\n\nTimeline: Start the guardianship process 6-12 months before your child turns 18.\n\nFree/Low-Cost Legal Help:\n- Georgia Legal Services: 1-800-498-9469\n- Atlanta Legal Aid: (404) 524-5811\n- Georgia Advocacy Office: (404) 885-1234",
    "source_url": "https://georgiacourts.gov/probate",
    "source_name": "Georgia Courts",
    "is_published": true
  },
  {
    "slug": "able-accounts",
    "title": "Georgia ABLE Accounts",
    "body": "ABLE (Achieving a Better Life Experience) accounts allow individuals with disabilities to save money without losing SSI or Medicaid benefits.\n\nKey Features:\n- Save up to $18,000/year (2026 limit, adjusts annually)\n- Total account balance up to $100,000 without affecting SSI cash benefits\n- Medicaid is not affected regardless of balance\n- Tax-free growth and tax-free withdrawals for qualified expenses\n- One ABLE account per person\n\nEligibility:\n- Disability onset before age 26 (expanded from 46 starting 2026 under ABLE Age Adjustment Act)\n- Must be receiving SSI or SSDI, OR\n- Must have a physician certify that they meet SSA disability criteria\n\nQualified Disability Expenses:\n- Education and tutoring\n- Housing (rent, mortgage, utilities)\n- Transportation (vehicle, gas, bus passes)\n- Employment support and training\n- Health and wellness\n- Assistive technology\n- Personal support services\n- Financial management\n- Legal fees\n- Funeral and burial expenses\n\nImportant Rules:\n- If balance exceeds $100,000, SSI cash payments are suspended (not terminated) until balance drops below\n- Medicaid is NEVER affected by ABLE balance\n- Upon death, Medicaid may file a claim against remaining ABLE funds (Medicaid payback provision)\n\nHow to Open:\nVisit georgiaable.com or call 1-800-439-1653\nMinimum opening deposit: $25",
    "source_url": "https://georgiaable.com",
    "source_name": "Georgia ABLE",
    "is_published": true
  },
  {
    "slug": "special-needs-trusts",
    "title": "Special Needs Trusts",
    "body": "Special Needs Trusts (SNTs) allow families to set aside money for a person with a disability without affecting their SSI or Medicaid eligibility.\n\nTypes of Trusts:\n\n1. First-Party (Self-Settled) SNT (d4A Trust):\n- Funded with the disabled person's own money (inheritance, lawsuit settlement, back pay)\n- Must be established before age 65\n- Must have Medicaid payback provision (remaining funds go to Medicaid at death)\n- Must be established by parent, grandparent, guardian, or court\n\n2. Third-Party SNT:\n- Funded with other people's money (parents, family, friends)\n- No age restriction\n- NO Medicaid payback required\n- Remaining funds pass to other beneficiaries at death\n- Can be set up in a will or as a standalone trust\n\n3. Pooled Trust (d4C Trust):\n- Managed by nonprofit organization\n- Good option for smaller amounts\n- Available at any age\n- Funds pooled for investment, but separate accounts\n- Remaining funds may go to Medicaid payback or stay with the nonprofit\n\nWhat Trust Funds Can Pay For:\n- Supplemental needs not covered by government benefits\n- Vacations and entertainment\n- Electronics and personal items\n- Vehicle and transportation costs\n- Home furnishings\n- Clothing beyond basic needs\n- Education and training\n\nWhat Trust Funds CANNOT Pay For (without reducing SSI):\n- Food and shelter (these are counted as In-Kind Support and Maintenance)\n- Exception: An ABLE account CAN pay for housing without affecting SSI up to $100K\n\nCost to Establish:\n- Third-party SNT: $2,000-5,000 (attorney fees)\n- First-party SNT: $2,500-7,000\n- Pooled trust: Usually minimal enrollment fee\n\nGeorgia Resources:\n- Georgia Community Trust (pooled trust): (404) 883-2018\n- Georgia Legal Services: 1-800-498-9469",
    "source_url": "https://specialneedsalliance.org",
    "source_name": "Special Needs Alliance",
    "is_published": true
  },
  {
    "slug": "transition-18",
    "title": "The Age 18 Transition",
    "body": "When your child turns 18, they become a legal adult. This triggers major changes in benefits, legal rights, and services.\n\nWhat Changes at 18:\n\n1. SSI Redetermination:\n- Only your child's own income and resources count (not parents')\n- Many children who were denied SSI as minors can now qualify\n- Apply 3 months BEFORE the 18th birthday\n- If already receiving SSI, benefits may increase because parental income no longer counts\n\n2. Legal Rights:\n- Your child gains full legal decision-making rights\n- You can no longer access their medical records without consent\n- You cannot make medical decisions for them\n- You need guardianship, POA, or supported decision-making agreement\n\n3. Katie Beckett Ends:\n- If your child was on Katie Beckett Medicaid, it ends at 18\n- Transition to adult Medicaid pathway (SSI-linked or ABD category)\n\n4. IEP Transition Planning:\n- School must include transition goals by age 16 (best practice: start at 14)\n- Goals should cover employment, independent living, community participation\n- School should connect family with adult service agencies\n\n5. Voting, Selective Service, and Other Adult Obligations:\n- Your child can vote (unless guardianship removes this right)\n- Males must register for Selective Service within 30 days of turning 18\n- Your child can enter contracts\n\nTimeline — Start 2 Years Before:\n- Age 16: Begin IEP transition planning, research guardianship options\n- Age 17: File guardianship petition (if needed), apply for adult services\n- Age 17.75: Apply for SSI (3 months before 18th birthday)\n- Age 18: SSI redetermination, guardianship hearing, Katie Beckett transition",
    "source_url": "https://www.ssa.gov/benefits/ssi",
    "source_name": "Social Security Administration",
    "is_published": true
  },
  {
    "slug": "transition-21",
    "title": "The Age 21 Transition",
    "body": "The age 21 transition is often called the 'second cliff' because several major benefits and services end simultaneously.\n\nWhat Ends at 21:\n\n1. EPSDT (Early and Periodic Screening, Diagnostic and Treatment):\n- The federal mandate requiring ALL medically necessary services ends\n- After 21, only services in Georgia's regular Medicaid plan are covered\n- Services that may be lost: certain therapies, specialized treatments, some DME\n\n2. IDEA School Services:\n- Special education services end when your child exits school or turns 22\n- Related services (speech, OT, PT through school) end\n- Transition services end\n\n3. Children's Mental Health Services:\n- Many children's behavioral health programs have age cutoffs at 21\n- Must transition to adult mental health system\n\nWhat to Do Before 21:\n\n1. Ensure Waiver Application is Active:\n- If not on the NOW/COMP Planning List, apply IMMEDIATELY\n- If on the list, check your position and estimated wait time\n- Call DBHDD Intake: (404) 657-2252\n\n2. Map Current Services to Adult Equivalents:\n- List every service your child currently receives\n- For each, identify: Does adult Medicaid cover this? Is there a waiver equivalent? Are there other funding sources?\n\n3. Connect with Adult Service Providers:\n- Bobby Dodd Institute (employment): https://bobbydodd.org\n- Vocational Rehabilitation (job training): Georgia DOL\n- DBHDD community providers\n\n4. Build a Support Network:\n- Parent to Parent of Georgia: https://p2pga.org\n- Cam and Madi's Promise: https://camandmadispromise.org\n- Local disability advocacy groups\n\n5. Financial Planning:\n- Ensure ABLE account is set up\n- Consider Special Needs Trust if not already in place\n- Review SSI amount and plan budget",
    "source_url": "https://dbhdd.georgia.gov",
    "source_name": "Georgia DBHDD",
    "is_published": true
  },
  {
    "slug": "vocational-rehab",
    "title": "Vocational Rehabilitation (VR)",
    "body": "Georgia Vocational Rehabilitation Agency (GVRA) helps individuals with disabilities prepare for, find, and maintain employment.\n\nServices Available:\n- Career counseling and assessment\n- Job search assistance\n- Resume writing and interview coaching\n- On-the-job training\n- Supported employment (job coach)\n- Assistive technology for the workplace\n- Vehicle modifications for work commute\n- College tuition assistance (in some cases)\n- Workplace accommodations\n\nEligibility:\n- Must have a physical or mental disability\n- Disability must be a barrier to employment\n- Must need VR services to prepare for, get, or keep a job\n- Must be able to benefit from VR services in terms of employment outcome\n\nHow to Apply:\n1. Contact GVRA: 1-844-367-4872\n2. Or visit gvs.georgia.gov\n3. Apply online or at your local VR office\n4. An intake interview will be scheduled\n5. A counselor will develop an Individualized Plan for Employment (IPE) with you\n\nBest Practice:\n- Apply during the last 2 years of high school\n- Coordinate with IEP transition planning\n- VR can work with your school's transition coordinator\n\nThe VR process typically takes 2-4 months from application to IPE development.",
    "source_url": "https://gvs.georgia.gov/vocational-rehabilitation",
    "source_name": "Georgia Vocational Rehabilitation Agency",
    "is_published": true
  },
  {
    "slug": "employment-services",
    "title": "Employment & Day Programs",
    "body": "Multiple employment pathways exist for adults with disabilities in Georgia.\n\nBobby Dodd Institute (BDI):\n- Comprehensive employment services in metro Atlanta\n- Job coaching and supported employment\n- Vocational training programs\n- Community-based work experiences\n- Career development and placement\n- Contact: https://bobbydodd.org\n\nDBHDD Day Programs:\n- Structured day activities for individuals with I/DD\n- Community access and integration\n- Skill building (daily living, social, vocational)\n- Available through NOW/COMP waiver or state-funded slots\n\nSupported Employment:\n- One-on-one job coaching at the workplace\n- Available through VR, waiver services, or BDI\n- Coach helps learn job tasks, workplace social skills, and employer communication\n- Gradually fades support as individual becomes independent\n\nCustomized Employment:\n- Job is created or modified to match individual's strengths\n- Discovery process identifies interests, skills, and ideal conditions\n- Employer negotiation to create the position\n- Growing model in Georgia\n\nPre-Employment Transition Services (Pre-ETS):\n- For students ages 14-22 with disabilities\n- Job exploration counseling\n- Work-based learning experiences\n- Counseling on postsecondary education\n- Workplace readiness training\n- Self-advocacy instruction\n- Available through VR and school coordination",
    "source_url": "https://bobbydodd.org",
    "source_name": "Bobby Dodd Institute",
    "is_published": true
  },
  {
    "slug": "idea-special-education",
    "title": "IDEA & Special Education Services",
    "body": "The Individuals with Disabilities Education Act (IDEA) guarantees a Free Appropriate Public Education (FAPE) for children with disabilities through age 21 (or until they graduate with a regular diploma).\n\nKey Components:\n\n1. Individualized Education Program (IEP):\n- Written plan developed annually by the IEP team\n- Includes present levels, goals, services, accommodations\n- Parent is an equal member of the IEP team\n- You can request an IEP meeting at any time\n\n2. Related Services:\n- Speech-language therapy\n- Occupational therapy\n- Physical therapy\n- Counseling services\n- Transportation\n- Assistive technology\n\n3. Transition Planning (must begin by age 16):\n- Post-secondary goals for education, employment, independent living\n- Transition services and activities to reach those goals\n- Agency connections (VR, DBHDD, etc.)\n- Student should participate in their own IEP meeting\n\nWhen IDEA Ends:\n- When student graduates with a regular diploma, OR\n- At the end of the school year in which they turn 22\n- Whichever comes first\n\nAfter IDEA:\n- No more guaranteed services\n- Adult services are eligibility-based, not entitlement-based\n- Must actively apply for each service\n\nGeorgia Resources:\n- GA DOE Special Education: gadoe.org/Special-Education-Services\n- Parent Mentor Program: available in every school district\n- Georgia Advocacy Office: (404) 885-1234\n- Parent to Parent of Georgia: p2pga.org",
    "source_url": "https://www.gadoe.org/Curriculum-Instruction-and-Assessment/Special-Education-Services",
    "source_name": "Georgia Department of Education",
    "is_published": true
  },
  {
    "slug": "advocacy-resources",
    "title": "Advocacy & Support Organizations",
    "body": "Georgia has several organizations dedicated to helping families of individuals with disabilities.\n\nParent to Parent of Georgia (P2P GA):\n- Free peer support — connects you with a trained Support Parent who has similar experiences\n- Information and referral services\n- Workshops and trainings throughout the year\n- Available statewide\n- Website: p2pga.org\n- Helps navigate the system, find resources, and provides emotional support\n\nCam & Madi's Promise:\n- Founded by a Georgia family navigating the disability system\n- Advocacy, resources, and community connection\n- Focus on families of children with disabilities in Georgia\n- Website: camandmadispromise.org\n\nGeorgia Advocacy Office (GAO):\n- Independent, federally-funded Protection & Advocacy organization\n- Legal advocacy for people with disabilities\n- Can investigate abuse, neglect, and rights violations\n- Can represent individuals in hearings\n- Phone: (404) 885-1234 or 1-800-537-2329\n\nGeorgia Legal Services (GLSP):\n- Free legal help for low-income Georgians\n- SSI/SSDI appeals\n- Guardianship assistance\n- Medicaid and benefit issues\n- Phone: 1-800-498-9469\n\nAtlanta Legal Aid:\n- Free civil legal services in metro Atlanta\n- Disability benefits appeals\n- Housing and public benefits\n- Phone: (404) 524-5811\n\nGeorgia Council on Developmental Disabilities (GCDD):\n- Policy advocacy and systems change\n- Funds innovative projects\n- Publishes Making a Difference magazine\n- Website: gcdd.org",
    "source_url": "https://p2pga.org",
    "source_name": "Parent to Parent of Georgia",
    "is_published": true
  },
  {
    "slug": "county-dfcs-contacts",
    "title": "County DFCS & Regional Contacts",
    "body": "Georgia Medicaid applications and renewals are processed through your local Division of Family and Children Services (DFCS) office.\n\nApply for Medicaid Online:\ngateway.ga.gov — Georgia Gateway is the online portal for applying for and managing Medicaid, SNAP, TANF, and other benefits.\n\nGeorgia Gateway Help: 1-877-423-4746\n\nKey DFCS Contacts by Region:\n\nMetro Atlanta:\n- Fulton County DFCS: (404) 206-5600\n- DeKalb County DFCS: (404) 370-5000\n- Cobb County DFCS: (770) 528-5000\n- Gwinnett County DFCS: (678) 518-5600\n- Clayton County DFCS: (770) 603-4600\n\nDBHDD Regional Offices:\n- Region 1 (Northwest GA): (706) 802-5364\n- Region 2 (Northeast GA): (706) 369-5730\n- Region 3 (Metro Atlanta): (404) 463-3800\n- Region 4 (East Central GA): (478) 751-6046\n- Region 5 (South GA): (229) 225-5099\n- Region 6 (Southwest GA): (229) 430-4004\n\nDBHDD Central Office:\n- Intake for NOW/COMP Planning List: (404) 657-2252\n- General Information: (404) 657-2252\n\nSocial Security Field Offices:\n- Find your local office: ssa.gov/locator\n- National line: 1-800-772-1213\n- TTY: 1-800-325-0778",
    "source_url": "https://dfcs.georgia.gov",
    "source_name": "Georgia DFCS",
    "is_published": true
  }
]
EOF

echo "Content blocks: $?"

echo ""
echo "=== Done ==="
