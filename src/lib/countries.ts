// FlyOn — Country Name to ISO 3166 Alpha-2 Code Map v1.1.0 | 2026-02-06
// Used for airport search: when user types a country name, we search airports in that country.

interface CountryInfo {
  code: string;
  /** Major city keywords to search for top airports in this country */
  majorCities: string[];
}

const COUNTRIES: Record<string, CountryInfo> = {
  'afghanistan': { code: 'AF', majorCities: ['KABUL'] },
  'albania': { code: 'AL', majorCities: ['TIRANA'] },
  'algeria': { code: 'DZ', majorCities: ['ALGIERS', 'ORAN'] },
  'andorra': { code: 'AD', majorCities: ['ANDORRA'] },
  'angola': { code: 'AO', majorCities: ['LUANDA'] },
  'argentina': { code: 'AR', majorCities: ['BUENOS AIRES', 'CORDOBA'] },
  'armenia': { code: 'AM', majorCities: ['YEREVAN'] },
  'australia': { code: 'AU', majorCities: ['SYDNEY', 'MELBOURNE', 'BRISBANE'] },
  'austria': { code: 'AT', majorCities: ['VIENNA', 'SALZBURG'] },
  'azerbaijan': { code: 'AZ', majorCities: ['BAKU'] },
  'bahamas': { code: 'BS', majorCities: ['NASSAU'] },
  'bahrain': { code: 'BH', majorCities: ['BAHRAIN'] },
  'bangladesh': { code: 'BD', majorCities: ['DHAKA', 'CHITTAGONG'] },
  'barbados': { code: 'BB', majorCities: ['BRIDGETOWN'] },
  'belarus': { code: 'BY', majorCities: ['MINSK'] },
  'belgium': { code: 'BE', majorCities: ['BRUSSELS', 'ANTWERP'] },
  'belize': { code: 'BZ', majorCities: ['BELIZE'] },
  'bermuda': { code: 'BM', majorCities: ['BERMUDA'] },
  'bhutan': { code: 'BT', majorCities: ['PARO'] },
  'bolivia': { code: 'BO', majorCities: ['LA PAZ', 'SANTA CRUZ'] },
  'bosnia': { code: 'BA', majorCities: ['SARAJEVO'] },
  'botswana': { code: 'BW', majorCities: ['GABORONE'] },
  'brazil': { code: 'BR', majorCities: ['SAO PAULO', 'RIO DE JANEIRO', 'BRASILIA'] },
  'brunei': { code: 'BN', majorCities: ['BANDAR'] },
  'bulgaria': { code: 'BG', majorCities: ['SOFIA', 'VARNA'] },
  'cambodia': { code: 'KH', majorCities: ['PHNOM PENH', 'SIEM REAP'] },
  'cameroon': { code: 'CM', majorCities: ['DOUALA', 'YAOUNDE'] },
  'canada': { code: 'CA', majorCities: ['TORONTO', 'VANCOUVER', 'MONTREAL'] },
  'chile': { code: 'CL', majorCities: ['SANTIAGO'] },
  'china': { code: 'CN', majorCities: ['BEIJING', 'SHANGHAI', 'GUANGZHOU'] },
  'colombia': { code: 'CO', majorCities: ['BOGOTA', 'MEDELLIN'] },
  'costa rica': { code: 'CR', majorCities: ['SAN JOSE'] },
  'croatia': { code: 'HR', majorCities: ['ZAGREB', 'SPLIT', 'DUBROVNIK'] },
  'cuba': { code: 'CU', majorCities: ['HAVANA'] },
  'cyprus': { code: 'CY', majorCities: ['LARNACA', 'PAPHOS'] },
  'czech republic': { code: 'CZ', majorCities: ['PRAGUE'] },
  'czechia': { code: 'CZ', majorCities: ['PRAGUE'] },
  'denmark': { code: 'DK', majorCities: ['COPENHAGEN'] },
  'dominican republic': { code: 'DO', majorCities: ['SANTO DOMINGO', 'PUNTA CANA'] },
  'ecuador': { code: 'EC', majorCities: ['QUITO', 'GUAYAQUIL'] },
  'egypt': { code: 'EG', majorCities: ['CAIRO', 'HURGHADA', 'SHARM'] },
  'el salvador': { code: 'SV', majorCities: ['SAN SALVADOR'] },
  'estonia': { code: 'EE', majorCities: ['TALLINN'] },
  'ethiopia': { code: 'ET', majorCities: ['ADDIS ABABA'] },
  'fiji': { code: 'FJ', majorCities: ['NADI', 'SUVA'] },
  'finland': { code: 'FI', majorCities: ['HELSINKI'] },
  'france': { code: 'FR', majorCities: ['PARIS', 'NICE', 'LYON', 'MARSEILLE'] },
  'georgia': { code: 'GE', majorCities: ['TBILISI', 'BATUMI'] },
  'germany': { code: 'DE', majorCities: ['BERLIN', 'MUNICH', 'FRANKFURT'] },
  'ghana': { code: 'GH', majorCities: ['ACCRA'] },
  'greece': { code: 'GR', majorCities: ['ATHENS', 'THESSALONIKI', 'HERAKLION'] },
  'guatemala': { code: 'GT', majorCities: ['GUATEMALA'] },
  'honduras': { code: 'HN', majorCities: ['TEGUCIGALPA', 'SAN PEDRO'] },
  'hong kong': { code: 'HK', majorCities: ['HONG KONG'] },
  'hungary': { code: 'HU', majorCities: ['BUDAPEST'] },
  'iceland': { code: 'IS', majorCities: ['REYKJAVIK'] },
  'india': { code: 'IN', majorCities: ['DELHI', 'MUMBAI', 'BANGALORE'] },
  'indonesia': { code: 'ID', majorCities: ['JAKARTA', 'BALI', 'SURABAYA'] },
  'iran': { code: 'IR', majorCities: ['TEHRAN'] },
  'iraq': { code: 'IQ', majorCities: ['BAGHDAD', 'ERBIL'] },
  'ireland': { code: 'IE', majorCities: ['DUBLIN', 'CORK'] },
  'israel': { code: 'IL', majorCities: ['TEL AVIV', 'JERUSALEM'] },
  'italy': { code: 'IT', majorCities: ['ROME', 'MILAN', 'VENICE', 'NAPLES'] },
  'ivory coast': { code: 'CI', majorCities: ['ABIDJAN'] },
  'jamaica': { code: 'JM', majorCities: ['KINGSTON', 'MONTEGO BAY'] },
  'japan': { code: 'JP', majorCities: ['TOKYO', 'OSAKA', 'NAGOYA'] },
  'jordan': { code: 'JO', majorCities: ['AMMAN'] },
  'kazakhstan': { code: 'KZ', majorCities: ['ALMATY', 'ASTANA'] },
  'kenya': { code: 'KE', majorCities: ['NAIROBI', 'MOMBASA'] },
  'kuwait': { code: 'KW', majorCities: ['KUWAIT'] },
  'laos': { code: 'LA', majorCities: ['VIENTIANE'] },
  'latvia': { code: 'LV', majorCities: ['RIGA'] },
  'lebanon': { code: 'LB', majorCities: ['BEIRUT'] },
  'libya': { code: 'LY', majorCities: ['TRIPOLI'] },
  'lithuania': { code: 'LT', majorCities: ['VILNIUS'] },
  'luxembourg': { code: 'LU', majorCities: ['LUXEMBOURG'] },
  'macau': { code: 'MO', majorCities: ['MACAU'] },
  'madagascar': { code: 'MG', majorCities: ['ANTANANARIVO'] },
  'malaysia': { code: 'MY', majorCities: ['KUALA LUMPUR', 'PENANG', 'KOTA KINABALU'] },
  'maldives': { code: 'MV', majorCities: ['MALE'] },
  'mali': { code: 'ML', majorCities: ['BAMAKO'] },
  'malta': { code: 'MT', majorCities: ['MALTA'] },
  'mauritius': { code: 'MU', majorCities: ['MAURITIUS'] },
  'mexico': { code: 'MX', majorCities: ['MEXICO CITY', 'CANCUN', 'GUADALAJARA'] },
  'moldova': { code: 'MD', majorCities: ['CHISINAU'] },
  'monaco': { code: 'MC', majorCities: ['NICE'] },
  'mongolia': { code: 'MN', majorCities: ['ULAANBAATAR'] },
  'montenegro': { code: 'ME', majorCities: ['PODGORICA', 'TIVAT'] },
  'morocco': { code: 'MA', majorCities: ['CASABLANCA', 'MARRAKECH'] },
  'mozambique': { code: 'MZ', majorCities: ['MAPUTO'] },
  'myanmar': { code: 'MM', majorCities: ['YANGON', 'MANDALAY'] },
  'namibia': { code: 'NA', majorCities: ['WINDHOEK'] },
  'nepal': { code: 'NP', majorCities: ['KATHMANDU'] },
  'netherlands': { code: 'NL', majorCities: ['AMSTERDAM', 'ROTTERDAM'] },
  'new zealand': { code: 'NZ', majorCities: ['AUCKLAND', 'WELLINGTON', 'CHRISTCHURCH'] },
  'nicaragua': { code: 'NI', majorCities: ['MANAGUA'] },
  'nigeria': { code: 'NG', majorCities: ['LAGOS', 'ABUJA'] },
  'north korea': { code: 'KP', majorCities: ['PYONGYANG'] },
  'north macedonia': { code: 'MK', majorCities: ['SKOPJE'] },
  'norway': { code: 'NO', majorCities: ['OSLO', 'BERGEN'] },
  'oman': { code: 'OM', majorCities: ['MUSCAT'] },
  'pakistan': { code: 'PK', majorCities: ['KARACHI', 'LAHORE', 'ISLAMABAD'] },
  'panama': { code: 'PA', majorCities: ['PANAMA'] },
  'paraguay': { code: 'PY', majorCities: ['ASUNCION'] },
  'peru': { code: 'PE', majorCities: ['LIMA', 'CUSCO'] },
  'philippines': { code: 'PH', majorCities: ['MANILA', 'CEBU'] },
  'poland': { code: 'PL', majorCities: ['WARSAW', 'KRAKOW'] },
  'portugal': { code: 'PT', majorCities: ['LISBON', 'PORTO', 'FARO'] },
  'qatar': { code: 'QA', majorCities: ['DOHA'] },
  'romania': { code: 'RO', majorCities: ['BUCHAREST'] },
  'russia': { code: 'RU', majorCities: ['MOSCOW', 'SAINT PETERSBURG'] },
  'rwanda': { code: 'RW', majorCities: ['KIGALI'] },
  'saudi arabia': { code: 'SA', majorCities: ['RIYADH', 'JEDDAH'] },
  'senegal': { code: 'SN', majorCities: ['DAKAR'] },
  'serbia': { code: 'RS', majorCities: ['BELGRADE'] },
  'singapore': { code: 'SG', majorCities: ['SINGAPORE'] },
  'slovakia': { code: 'SK', majorCities: ['BRATISLAVA'] },
  'slovenia': { code: 'SI', majorCities: ['LJUBLJANA'] },
  'south africa': { code: 'ZA', majorCities: ['JOHANNESBURG', 'CAPE TOWN'] },
  'south korea': { code: 'KR', majorCities: ['SEOUL', 'BUSAN', 'JEJU'] },
  'spain': { code: 'ES', majorCities: ['MADRID', 'BARCELONA', 'MALAGA'] },
  'sri lanka': { code: 'LK', majorCities: ['COLOMBO'] },
  'sudan': { code: 'SD', majorCities: ['KHARTOUM'] },
  'sweden': { code: 'SE', majorCities: ['STOCKHOLM', 'GOTHENBURG'] },
  'switzerland': { code: 'CH', majorCities: ['ZURICH', 'GENEVA'] },
  'syria': { code: 'SY', majorCities: ['DAMASCUS'] },
  'taiwan': { code: 'TW', majorCities: ['TAIPEI'] },
  'tanzania': { code: 'TZ', majorCities: ['DAR ES SALAAM', 'KILIMANJARO'] },
  'thailand': { code: 'TH', majorCities: ['BANGKOK', 'PHUKET', 'CHIANG MAI'] },
  'tunisia': { code: 'TN', majorCities: ['TUNIS'] },
  'turkey': { code: 'TR', majorCities: ['ISTANBUL', 'ANKARA', 'ANTALYA'] },
  'turkiye': { code: 'TR', majorCities: ['ISTANBUL', 'ANKARA', 'ANTALYA'] },
  'uganda': { code: 'UG', majorCities: ['ENTEBBE'] },
  'ukraine': { code: 'UA', majorCities: ['KYIV', 'LVIV'] },
  'united arab emirates': { code: 'AE', majorCities: ['DUBAI', 'ABU DHABI'] },
  'uae': { code: 'AE', majorCities: ['DUBAI', 'ABU DHABI'] },
  'united kingdom': { code: 'GB', majorCities: ['LONDON', 'MANCHESTER', 'EDINBURGH'] },
  'uk': { code: 'GB', majorCities: ['LONDON', 'MANCHESTER', 'EDINBURGH'] },
  'england': { code: 'GB', majorCities: ['LONDON', 'MANCHESTER', 'BIRMINGHAM'] },
  'scotland': { code: 'GB', majorCities: ['EDINBURGH', 'GLASGOW'] },
  'wales': { code: 'GB', majorCities: ['CARDIFF'] },
  'united states': { code: 'US', majorCities: ['NEW YORK', 'LOS ANGELES', 'CHICAGO'] },
  'usa': { code: 'US', majorCities: ['NEW YORK', 'LOS ANGELES', 'CHICAGO'] },
  'us': { code: 'US', majorCities: ['NEW YORK', 'LOS ANGELES', 'CHICAGO'] },
  'uruguay': { code: 'UY', majorCities: ['MONTEVIDEO'] },
  'uzbekistan': { code: 'UZ', majorCities: ['TASHKENT'] },
  'venezuela': { code: 'VE', majorCities: ['CARACAS'] },
  'vietnam': { code: 'VN', majorCities: ['HO CHI MINH', 'HANOI', 'DA NANG'] },
  'yemen': { code: 'YE', majorCities: ['SANAA'] },
  'zambia': { code: 'ZM', majorCities: ['LUSAKA'] },
  'zimbabwe': { code: 'ZW', majorCities: ['HARARE'] },
};

export interface CountryMatch {
  code: string;
  majorCities: string[];
}

/**
 * Find a country from user input.
 * Matches full name or prefix (min 3 chars).
 * Returns the country code and major city keywords for airport search.
 */
export function findCountry(input: string): CountryMatch | null {
  const normalized = input.toLowerCase().trim();
  if (normalized.length < 2) return null;

  // Exact match (works for short aliases like "uk", "us", "uae")
  if (COUNTRIES[normalized]) return COUNTRIES[normalized];

  // Prefix match requires at least 4 chars to avoid false positives
  // (3-letter inputs are very likely IATA codes like MAD, CDG, JFK)
  if (normalized.length < 4) return null;
  for (const [name, info] of Object.entries(COUNTRIES)) {
    if (name.startsWith(normalized)) return info;
  }

  return null;
}
