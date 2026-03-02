/**
 * Direct application links for Georgia disability programs.
 * Used by the dashboard ApplicationCard to link users to actual applications.
 */
export const APPLICATION_LINKS: Record<string, { url: string; label: string }> = {
  // SSI / Social Security
  'SSI': { url: 'https://www.ssa.gov/benefits/ssi', label: 'Apply at SSA.gov' },
  'Supplemental Security Income': { url: 'https://www.ssa.gov/benefits/ssi', label: 'Apply at SSA.gov' },
  'SSDI': { url: 'https://www.ssa.gov/benefits/disability', label: 'Apply at SSA.gov' },
  
  // Medicaid
  'Medicaid': { url: 'https://gateway.ga.gov/', label: 'Apply at Georgia Gateway' },
  'Georgia Medicaid': { url: 'https://gateway.ga.gov/', label: 'Apply at Georgia Gateway' },
  'PeachCare': { url: 'https://gateway.ga.gov/', label: 'Apply at Georgia Gateway' },
  
  // Waivers
  'NOW Waiver': { url: 'https://dbhdd.georgia.gov/now-comp-waivers', label: 'Apply at DBHDD' },
  'COMP Waiver': { url: 'https://dbhdd.georgia.gov/now-comp-waivers', label: 'Apply at DBHDD' },
  'NOW/COMP': { url: 'https://dbhdd.georgia.gov/now-comp-waivers', label: 'Apply at DBHDD' },
  'ICWP': { url: 'https://medicaid.georgia.gov/programs/all-programs/independent-care-waiver-program', label: 'Apply at Georgia Medicaid' },
  'CCSP': { url: 'https://aging.georgia.gov/programs/community-care-services-program', label: 'Apply through Area Agency on Aging' },
  'SOURCE': { url: 'https://aging.georgia.gov/programs/service-options-using-resources-community-environment', label: 'Apply through Area Agency on Aging' },
  'GAPP': { url: 'https://dbhdd.georgia.gov/georgia-pediatric-program', label: 'Apply at DBHDD' },
  
  // Katie Beckett
  'Katie Beckett': { url: 'https://medicaid.georgia.gov/programs/all-programs/katie-beckett', label: 'Request Application Packet' },
  'Deeming Waiver': { url: 'https://medicaid.georgia.gov/programs/all-programs/katie-beckett', label: 'Request Application Packet' },
  
  // Employment
  'Vocational Rehabilitation': { url: 'https://gvs.georgia.gov/vocational-rehabilitation', label: 'Apply at Georgia Vocational Rehab' },
  'VR': { url: 'https://gvs.georgia.gov/vocational-rehabilitation', label: 'Apply at Georgia Vocational Rehab' },
  'Ticket to Work': { url: 'https://choosework.ssa.gov/', label: 'Enroll at ChooseWork.SSA.gov' },
  
  // Financial
  'STABLE Account': { url: 'https://www.georgiastable.com', label: 'Open at GeorgiaSTABLE.com' },
  'Georgia STABLE': { url: 'https://www.georgiastable.com', label: 'Open at GeorgiaSTABLE.com' },
  
  // Housing  
  'Section 8': { url: 'https://www.dca.ga.gov/safe-affordable-housing/rental-housing/rental-assistance', label: 'Find Housing Assistance' },
  'Housing': { url: 'https://www.dca.ga.gov/safe-affordable-housing/rental-housing/rental-assistance', label: 'Find Housing Assistance' },
  
  // SNAP
  'SNAP': { url: 'https://gateway.ga.gov/', label: 'Apply at Georgia Gateway' },
  'Food Stamps': { url: 'https://gateway.ga.gov/', label: 'Apply at Georgia Gateway' },
  
  // IEP
  'IEP': { url: 'https://www.gadoe.org/Curriculum-Instruction-and-Assessment/Special-Education-Services/Pages/default.aspx', label: 'GA DOE Special Education' },
  'IEP Services': { url: 'https://www.gadoe.org/Curriculum-Instruction-and-Assessment/Special-Education-Services/Pages/default.aspx', label: 'GA DOE Special Education' },
}

/**
 * Look up application URL for a program name (fuzzy match).
 */
export function getApplicationLink(programName: string): { url: string; label: string } | null {
  // Exact match first
  if (APPLICATION_LINKS[programName]) return APPLICATION_LINKS[programName]
  
  // Case-insensitive match
  const lower = programName.toLowerCase()
  for (const [key, value] of Object.entries(APPLICATION_LINKS)) {
    if (key.toLowerCase() === lower) return value
  }
  
  // Partial match
  for (const [key, value] of Object.entries(APPLICATION_LINKS)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) return value
  }
  
  return null
}
