/**
 * Maps any raw country string (from DB, scraper, or user input) to a
 * proper-case display name.
 *
 * Usage:
 *   getCountryDisplay("usa")        → "USA"
 *   getCountryDisplay("australia")  → "Australia"
 *   getCountrySlug("USA")           → "usa"
 *   getCountrySlug("United States") → "usa"
 */

export const COUNTRY_SLUG_MAP: Record<string, string> = {
  // ─── North America ────────────────────────────────────────────────────────
  "usa":                        "USA",
  "us":                         "USA",
  "united states":              "USA",
  "united states of america":   "USA",
  "america":                    "USA",
  "canada":                     "Canada",
  "mexico":                     "Mexico",

  // ─── Europe ───────────────────────────────────────────────────────────────
  "uk":                         "UK",
  "gb":                         "UK",
  "great britain":              "UK",
  "united kingdom":             "UK",
  "england":                    "UK",
  "scotland":                   "UK",
  "wales":                      "UK",
  "northern ireland":           "UK",
  "ireland":                    "Ireland",
  "germany":                    "Germany",
  "france":                     "France",
  "netherlands":                "Netherlands",
  "holland":                    "Netherlands",
  "spain":                      "Spain",
  "italy":                      "Italy",
  "portugal":                   "Portugal",
  "belgium":                    "Belgium",
  "switzerland":                "Switzerland",
  "austria":                    "Austria",
  "sweden":                     "Sweden",
  "norway":                     "Norway",
  "denmark":                    "Denmark",
  "finland":                    "Finland",
  "poland":                     "Poland",
  "czech republic":             "Czech Republic",
  "czechia":                    "Czech Republic",
  "hungary":                    "Hungary",
  "romania":                    "Romania",
  "bulgaria":                   "Bulgaria",
  "greece":                     "Greece",
  "turkey":                     "Turkey",
  "ukraine":                    "Ukraine",
  "russia":                     "Russia",
  "luxembourg":                 "Luxembourg",
  "malta":                      "Malta",
  "cyprus":                     "Cyprus",
  "croatia":                    "Croatia",
  "serbia":                     "Serbia",
  "slovakia":                   "Slovakia",
  "slovenia":                   "Slovenia",
  "estonia":                    "Estonia",
  "latvia":                     "Latvia",
  "lithuania":                  "Lithuania",
  "iceland":                    "Iceland",

  // ─── Middle East ──────────────────────────────────────────────────────────
  "uae":                        "UAE",
  "united arab emirates":       "UAE",
  "dubai":                      "UAE",
  "abu dhabi":                  "UAE",
  "saudi arabia":               "Saudi Arabia",
  "ksa":                        "Saudi Arabia",
  "qatar":                      "Qatar",
  "kuwait":                     "Kuwait",
  "bahrain":                    "Bahrain",
  "oman":                       "Oman",
  "jordan":                     "Jordan",
  "israel":                     "Israel",
  "lebanon":                    "Lebanon",
  "iraq":                       "Iraq",
  "iran":                       "Iran",
  "yemen":                      "Yemen",

  // ─── Asia ─────────────────────────────────────────────────────────────────
  "india":                      "India",
  "china":                      "China",
  "japan":                      "Japan",
  "south korea":                "South Korea",
  "korea":                      "South Korea",
  "indonesia":                  "Indonesia",
  "malaysia":                   "Malaysia",
  "singapore":                  "Singapore",
  "thailand":                   "Thailand",
  "vietnam":                    "Vietnam",
  "philippines":                "Philippines",
  "pakistan":                   "Pakistan",
  "bangladesh":                 "Bangladesh",
  "sri lanka":                  "Sri Lanka",
  "nepal":                      "Nepal",
  "myanmar":                    "Myanmar",
  "cambodia":                   "Cambodia",
  "hong kong":                  "Hong Kong",
  "taiwan":                     "Taiwan",
  "kazakhstan":                 "Kazakhstan",

  // ─── Oceania ──────────────────────────────────────────────────────────────
  "australia":                  "Australia",
  "new zealand":                "New Zealand",
  "papua new guinea":           "Papua New Guinea",
  "fiji":                       "Fiji",

  // ─── Africa ───────────────────────────────────────────────────────────────
  "nigeria":                    "Nigeria",
  "ghana":                      "Ghana",
  "kenya":                      "Kenya",
  "south africa":               "South Africa",
  "ethiopia":                   "Ethiopia",
  "tanzania":                   "Tanzania",
  "uganda":                     "Uganda",
  "rwanda":                     "Rwanda",
  "senegal":                    "Senegal",
  "ivory coast":                "Ivory Coast",
  "côte d'ivoire":              "Ivory Coast",
  "cameroon":                   "Cameroon",
  "egypt":                      "Egypt",
  "morocco":                    "Morocco",
  "zambia":                     "Zambia",
  "zimbabwe":                   "Zimbabwe",
  "mozambique":                 "Mozambique",
  "angola":                     "Angola",
  "namibia":                    "Namibia",
  "botswana":                   "Botswana",
  "malawi":                     "Malawi",
  "madagascar":                 "Madagascar",
  "mauritius":                  "Mauritius",
  "seychelles":                 "Seychelles",
  "somalia":                    "Somalia",
  "sudan":                      "Sudan",
  "south sudan":                "South Sudan",
  "libya":                      "Libya",
  "tunisia":                    "Tunisia",
  "algeria":                    "Algeria",
  "mali":                       "Mali",
  "niger":                      "Niger",
  "chad":                       "Chad",
  "burkina faso":               "Burkina Faso",
  "guinea":                     "Guinea",
  "sierra leone":               "Sierra Leone",
  "liberia":                    "Liberia",
  "togo":                       "Togo",
  "benin":                      "Benin",
  "gabon":                      "Gabon",
  "congo":                      "Congo",
  "democratic republic of congo": "DR Congo",
  "dr congo":                   "DR Congo",
  "drc":                        "DR Congo",
  "eritrea":                    "Eritrea",
  "djibouti":                   "Djibouti",
  "gambia":                     "Gambia",
  "guinea-bissau":              "Guinea-Bissau",
  "equatorial guinea":          "Equatorial Guinea",
  "cape verde":                 "Cape Verde",
  "sao tome and principe":      "São Tomé and Príncipe",
  "lesotho":                    "Lesotho",
  "eswatini":                   "Eswatini",
  "swaziland":                  "Eswatini",
  "comoros":                    "Comoros",
  "burundi":                    "Burundi",
  "central african republic":   "CAR",

  // ─── South & Central America ──────────────────────────────────────────────
  "brazil":                     "Brazil",
  "brasil":                     "Brazil",
  "argentina":                  "Argentina",
  "colombia":                   "Colombia",
  "chile":                      "Chile",
  "peru":                       "Peru",
  "venezuela":                  "Venezuela",
  "ecuador":                    "Ecuador",
  "bolivia":                    "Bolivia",
  "paraguay":                   "Paraguay",
  "uruguay":                    "Uruguay",
  "costa rica":                 "Costa Rica",
  "panama":                     "Panama",
  "jamaica":                    "Jamaica",
  "trinidad and tobago":        "Trinidad and Tobago",
  "trinidad":                   "Trinidad and Tobago",
  "barbados":                   "Barbados",

  // ─── Fallback ─────────────────────────────────────────────────────────────
  "global":                     "Global",
  "remote":                     "Global",
  "worldwide":                  "Global",
  "international":              "Global",
};

/**
 * Returns the proper-case display name for a country.
 * e.g. "united states" → "USA", "australia" → "Australia"
 * Falls back to title-casing the raw input if no match found.
 */
export function getCountryDisplay(raw: string): string {
  const key = raw.trim().toLowerCase();
  return (
    COUNTRY_SLUG_MAP[key] ??
    raw.trim().replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

/**
 * Returns a URL-safe lowercase slug for a country.
 * e.g. "United States" → "usa", "Australia" → "australia"
 * Falls back to lowercased, hyphenated raw input if no match found.
 */
export function getCountrySlug(raw: string): string {
  const display = getCountryDisplay(raw);
  return display
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}