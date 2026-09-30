/**
 * Organization text normalization and slug generation utilities.
 */

export function normalizeOrganization(text?: string | null): string {
  if (!text) return "";

  let norm = text.trim().toLowerCase();
  if (!norm) return "";

  // Replace smart quotes and special hyphens
  norm = norm
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-");

  // Collapse consecutive whitespace
  norm = norm.replace(/\s+/g, " ");

  // Strip trailing punctuation
  norm = norm.replace(/[,.;]+$/, "").trim();

  return norm;
}

export function slugifyOrganization(text: string): string {
  const norm = normalizeOrganization(text);
  if (!norm) return "unknown";

  return norm
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "org";
}

export function tokenizeQuery(query?: string | null): string[] {
  if (!query) return [];
  const normalized = normalizeOrganization(query);
  return normalized
    .split(/[\s,./()_-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

export const COLLEGE_ACRONYMS: Record<string, string[]> = {
  iit: ["indian institute of technology", "iit"],
  nit: ["national institute of technology", "nit"],
  iiit: ["indian institute of information technology", "international institute of information technology", "iiit"],
  bits: ["birla institute of technology and science", "birla institute of technology", "bits"],
  vit: ["vellore institute of technology", "vit"],
  dtu: ["delhi technological university", "delhi college of engineering", "dtu"],
  nsut: ["netaji subhas university of technology", "netaji subhas institute of technology", "nsut"],
  lpu: ["lovely professional university", "lpu"],
  srm: ["srm institute of science and technology", "srmist", "srm"],
  srmist: ["srm institute of science and technology", "srmist", "srm"],
  tiet: ["thapar institute of engineering", "thapar university", "tiet", "thapar"],
  thapar: ["thapar institute of engineering", "thapar university", "tiet", "thapar"],
  mit: ["manipal institute of technology", "maharashtra institute of technology", "mit"],
  kiit: ["kalinga institute of industrial technology", "kiit"],
  pes: ["pes university", "pes institute of technology", "pes"],
  pesit: ["pes institute of technology", "pes university"],
  rvce: ["r.v. college of engineering", "rv college of engineering", "rvce"],
  bmsce: ["bms college of engineering", "b.m.s. college of engineering", "bmsce"],
  msrit: ["m.s. ramaiah institute of technology", "ramaiah institute of technology", "msrit"],
  coep: ["college of engineering, pune", "college of engineering pune", "coep"],
  vjti: ["veermata jijabai technological institute", "vjti"],
  ict: ["institute of chemical technology", "ict"],
  lnmiit: ["lnm institute of information technology", "lnmiit"],
  daiict: ["dhirubhai ambani institute of information and communication technology", "daiict"],
  mait: ["maharaja agrasen institute of technology", "mait"],
  msit: ["maharaja surajmal institute of technology", "msit"],
  cgc: ["chandigarh group of colleges", "cgc"],
  cu: ["chandigarh university", "cu"],
  soa: ["siksha 'o' anusandhan", "soa"],
  amity: ["amity university", "amity"],
  manipal: ["manipal institute of technology", "manipal university", "manipal"],
  iitb: ["indian institute of technology bombay", "iit bombay", "iit, bombay"],
  iitd: ["indian institute of technology delhi", "iit delhi", "iit, delhi"],
  iitm: ["indian institute of technology madras", "iit madras", "iit, madras"],
  iitk: ["indian institute of technology kanpur", "iit kanpur", "iit, kanpur"],
  iitkgp: ["indian institute of technology kharagpur", "iit kharagpur", "iit, kharagpur"],
  iitr: ["indian institute of technology roorkee", "iit roorkee", "iit, roorkee"],
  iitg: ["indian institute of technology guwahati", "iit guwahati", "iit, guwahati"],
  iith: ["indian institute of technology hyderabad", "iit hyderabad", "iit, hyderabad"],
  iitbhu: ["indian institute of technology (bhu) varanasi", "iit bhu", "iit (bhu)", "iit, bhu"],
  iitism: ["indian institute of technology (ism) dhanbad", "iit dhanbad", "iit (ism)", "iit, dhanbad"],
  iitrpr: ["indian institute of technology ropar", "iit ropar"],
  iitj: ["indian institute of technology jodhpur", "iit jodhpur"],
  iitp: ["indian institute of technology patna", "iit patna"],
  iitgn: ["indian institute of technology gandhinagar", "iit gandhinagar"],
  iitbbs: ["indian institute of technology bhubaneswar", "iit bhubaneswar"],
  iitmandi: ["indian institute of technology mandi", "iit mandi"],
  iittp: ["indian institute of technology tirupati", "iit tirupati"],
  iitpkd: ["indian institute of technology palakkad", "iit palakkad"],
  iitgoa: ["indian institute of technology goa", "iit goa"],
  iitbh: ["indian institute of technology bhilai", "iit bhilai"],
  iitdh: ["indian institute of technology dharwad", "iit dharwad"],
  iitjammu: ["indian institute of technology jammu", "iit jammu"],
  nitk: ["national institute of technology karnataka", "nit surathkal", "nitk"],
  nitt: ["national institute of technology, tiruchirappalli", "nit trichy", "nitt", "nit tiruchirappalli"],
  nitw: ["national institute of technology, warangal", "nit warangal", "nitw"],
  nitr: ["national institute of technology rourkela", "nit rourkela", "nitr"],
  mnnit: ["motilal nehru national institute of technology", "mnnit", "nit allahabad"],
  mnit: ["malaviya national institute of technology", "mnit", "nit jaipur"],
  vnit: ["visvesvaraya national institute of technology", "vnit", "nit nagpur"],
  svnit: ["sardar vallabhbhai national institute of technology", "svnit", "nit surat"],
};

export function matchesCollegeName(
  normOrgName?: string | null,
  rawQuery?: string | null,
  exact: boolean = false
): boolean {
  if (!normOrgName || !rawQuery) return false;
  const target = normalizeOrganization(normOrgName);
  const normQuery = normalizeOrganization(rawQuery);
  if (!target || !normQuery) return false;

  if (exact) {
    return target === normQuery;
  }

  // Direct substring match
  if (target.includes(normQuery)) {
    return true;
  }

  const tokens = tokenizeQuery(rawQuery);
  if (tokens.length === 0) return false;

  // Check token-by-token with acronym expansion
  const allTokensMatch = tokens.every((tok) => {
    if (target.includes(tok)) return true;
    const aliases = COLLEGE_ACRONYMS[tok];
    if (aliases && aliases.some((alias) => target.includes(alias))) {
      return true;
    }
    return false;
  });

  if (allTokensMatch) return true;

  // Check if query itself is an acronym in our dictionary
  const directAliases = COLLEGE_ACRONYMS[normQuery];
  if (directAliases && directAliases.some((alias) => target.includes(alias))) {
    return true;
  }

  return false;
}
