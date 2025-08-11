import fs from "fs/promises";
import path from "path";

type City = { city: string; state: string; lat: number; lon: number };

const usTop25: City[] = [
    { city: "New York", state: "NY", lat: 40.7128, lon: -74.006 },
    { city: "Los Angeles", state: "CA", lat: 34.0522, lon: -118.2437 },
    { city: "Chicago", state: "IL", lat: 41.8781, lon: -87.6298 },
    { city: "Houston", state: "TX", lat: 29.7604, lon: -95.3698 },
    { city: "Phoenix", state: "AZ", lat: 33.4484, lon: -112.074 },
    { city: "Philadelphia", state: "PA", lat: 39.9526, lon: -75.1652 },
    { city: "San Antonio", state: "TX", lat: 29.4241, lon: -98.4936 },
    { city: "San Diego", state: "CA", lat: 32.7157, lon: -117.1611 },
    { city: "Dallas", state: "TX", lat: 32.7767, lon: -96.797 },
    { city: "San Jose", state: "CA", lat: 37.3382, lon: -121.8863 },
    { city: "Austin", state: "TX", lat: 30.2672, lon: -97.7431 },
    { city: "Jacksonville", state: "FL", lat: 30.3322, lon: -81.6557 },
    { city: "Fort Worth", state: "TX", lat: 32.7555, lon: -97.3308 },
    { city: "Columbus", state: "OH", lat: 39.9612, lon: -82.9988 },
    { city: "San Francisco", state: "CA", lat: 37.7749, lon: -122.4194 },
    { city: "Charlotte", state: "NC", lat: 35.2271, lon: -80.8431 },
    { city: "Indianapolis", state: "IN", lat: 39.7684, lon: -86.1581 },
    { city: "Seattle", state: "WA", lat: 47.6062, lon: -122.3321 },
    { city: "Denver", state: "CO", lat: 39.7392, lon: -104.9903 },
    { city: "Washington", state: "DC", lat: 38.9072, lon: -77.0369 },
    { city: "Boston", state: "MA", lat: 42.3601, lon: -71.0589 },
    { city: "Nashville", state: "TN", lat: 36.1627, lon: -86.7816 },
    { city: "El Paso", state: "TX", lat: 31.7619, lon: -106.485 },
    { city: "Detroit", state: "MI", lat: 42.3314, lon: -83.0458 },
    { city: "Oklahoma City", state: "OK", lat: 35.4676, lon: -97.5164 },
];

// Smaller US cities to broaden coverage (including Knoxville)
const usSmallerCities: City[] = [
    // Requested must-haves
    { city: "Atlanta", state: "GA", lat: 33.749, lon: -84.388 },
    { city: "Charlotte", state: "NC", lat: 35.2271, lon: -80.8431 },
    { city: "Nashville", state: "TN", lat: 36.1627, lon: -86.7816 },
    { city: "Memphis", state: "TN", lat: 35.1495, lon: -90.049 },
    { city: "Austin", state: "TX", lat: 30.2672, lon: -97.7431 },
    { city: "Dallas", state: "TX", lat: 32.7767, lon: -96.797 },
    { city: "Houston", state: "TX", lat: 29.7604, lon: -95.3698 },
    { city: "Birmingham", state: "AL", lat: 33.5186, lon: -86.8104 },
    { city: "Knoxville", state: "TN", lat: 35.9606, lon: -83.9207 },
    { city: "Boise", state: "ID", lat: 43.615, lon: -116.2023 },
    { city: "Madison", state: "WI", lat: 43.0731, lon: -89.4012 },
    { city: "Asheville", state: "NC", lat: 35.5951, lon: -82.5515 },
    { city: "Burlington", state: "VT", lat: 44.4759, lon: -73.2121 },
    { city: "Spokane", state: "WA", lat: 47.6588, lon: -117.426 },
    { city: "Eugene", state: "OR", lat: 44.0521, lon: -123.0868 },
    { city: "Santa Fe", state: "NM", lat: 35.687, lon: -105.9378 },
    { city: "Des Moines", state: "IA", lat: 41.5868, lon: -93.625 },
    { city: "Charleston", state: "SC", lat: 32.7765, lon: -79.9311 },
    { city: "Savannah", state: "GA", lat: 32.0809, lon: -81.0912 },
    { city: "Baton Rouge", state: "LA", lat: 30.4515, lon: -91.1871 },
    { city: "Providence", state: "RI", lat: 41.824, lon: -71.4128 },
    { city: "New Haven", state: "CT", lat: 41.3083, lon: -72.9279 },
    { city: "Hartford", state: "CT", lat: 41.7658, lon: -72.6734 },
    { city: "Pittsburgh", state: "PA", lat: 40.4406, lon: -79.9959 },
    { city: "Buffalo", state: "NY", lat: 42.8864, lon: -78.8784 },
    { city: "Rochester", state: "NY", lat: 43.1566, lon: -77.6088 },
    { city: "Albany", state: "NY", lat: 42.6526, lon: -73.7562 },
    { city: "Colorado Springs", state: "CO", lat: 38.8339, lon: -104.8214 },
    { city: "Fort Collins", state: "CO", lat: 40.5853, lon: -105.0844 },
    { city: "Boulder", state: "CO", lat: 40.01499, lon: -105.27055 },
    { city: "Tempe", state: "AZ", lat: 33.4255, lon: -111.94 },
    { city: "Tucson", state: "AZ", lat: 32.2226, lon: -110.9747 },
    { city: "Reno", state: "NV", lat: 39.5296, lon: -119.8138 },
    { city: "Salt Lake City", state: "UT", lat: 40.7608, lon: -111.891 },
    { city: "Provo", state: "UT", lat: 40.2338, lon: -111.6585 },
    { city: "Albuquerque", state: "NM", lat: 35.0844, lon: -106.6504 },
    { city: "Tulsa", state: "OK", lat: 36.15398, lon: -95.99277 },
    { city: "Omaha", state: "NE", lat: 41.2565, lon: -95.9345 },
    { city: "Lincoln", state: "NE", lat: 40.8136, lon: -96.7026 },
    { city: "Sioux Falls", state: "SD", lat: 43.5446, lon: -96.7311 },
    { city: "Fargo", state: "ND", lat: 46.8772, lon: -96.7898 },
    { city: "Grand Rapids", state: "MI", lat: 42.9634, lon: -85.6681 },
    { city: "Ann Arbor", state: "MI", lat: 42.2808, lon: -83.743 },
    { city: "Akron", state: "OH", lat: 41.0814, lon: -81.519 },
    { city: "Dayton", state: "OH", lat: 39.7589, lon: -84.1916 },
    { city: "Lexington", state: "KY", lat: 38.0406, lon: -84.5037 },
    { city: "Louisville", state: "KY", lat: 38.2527, lon: -85.7585 },
    { city: "Little Rock", state: "AR", lat: 34.7465, lon: -92.2896 },
    { city: "Huntsville", state: "AL", lat: 34.7304, lon: -86.5861 },
    { city: "Tallahassee", state: "FL", lat: 30.4383, lon: -84.2807 },
    { city: "Gainesville", state: "FL", lat: 29.6516, lon: -82.3248 },
    { city: "Sarasota", state: "FL", lat: 27.3364, lon: -82.5307 },
    { city: "Pensacola", state: "FL", lat: 30.4213, lon: -87.2169 },
    { city: "Waco", state: "TX", lat: 31.5493, lon: -97.1467 },
    { city: "Lubbock", state: "TX", lat: 33.5779, lon: -101.8552 },
    { city: "Amarillo", state: "TX", lat: 35.221997, lon: -101.8313 },
];

// Canada cities and regional centers (provinces in `state`)
const canadaCities: City[] = [
    { city: "Toronto", state: "ON", lat: 43.65107, lon: -79.347015 },
    { city: "Vancouver", state: "BC", lat: 49.2827, lon: -123.1207 },
    { city: "Montreal", state: "QC", lat: 45.5019, lon: -73.5674 },
    { city: "Calgary", state: "AB", lat: 51.0447, lon: -114.0719 },
    { city: "Ottawa", state: "ON", lat: 45.4215, lon: -75.6972 },
    { city: "Edmonton", state: "AB", lat: 53.5461, lon: -113.4938 },
    { city: "Winnipeg", state: "MB", lat: 49.8951, lon: -97.1384 },
    { city: "Quebec City", state: "QC", lat: 46.8139, lon: -71.208 },
    { city: "Hamilton", state: "ON", lat: 43.2557, lon: -79.8711 },
    { city: "Kitchener", state: "ON", lat: 43.4516, lon: -80.4925 },
    { city: "London", state: "ON", lat: 42.9849, lon: -81.2453 },
    { city: "Halifax", state: "NS", lat: 44.6488, lon: -63.5752 },
    { city: "Victoria", state: "BC", lat: 48.4284, lon: -123.3656 },
    { city: "Saskatoon", state: "SK", lat: 52.1332, lon: -106.67 },
    { city: "Regina", state: "SK", lat: 50.4452, lon: -104.6189 },
    { city: "St. John's", state: "NL", lat: 47.5615, lon: -52.7126 },
    { city: "Sherbrooke", state: "QC", lat: 45.4042, lon: -71.8929 },
    { city: "Laval", state: "QC", lat: 45.6066, lon: -73.7124 },
    { city: "Gatineau", state: "QC", lat: 45.4765, lon: -75.7013 },
    { city: "Kelowna", state: "BC", lat: 49.8876, lon: -119.496 },
    { city: "Kamloops", state: "BC", lat: 50.6745, lon: -120.3273 },
    { city: "Nanaimo", state: "BC", lat: 49.1659, lon: -123.9401 },
    { city: "Red Deer", state: "AB", lat: 52.2681, lon: -113.8112 },
    { city: "Lethbridge", state: "AB", lat: 49.6956, lon: -112.845 },
    { city: "Moncton", state: "NB", lat: 46.0878, lon: -64.7782 },
    { city: "Saint John", state: "NB", lat: 45.2733, lon: -66.0633 },
    { city: "Charlottetown", state: "PE", lat: 46.2382, lon: -63.1311 },
    { city: "Thunder Bay", state: "ON", lat: 48.3809, lon: -89.2477 },
    { city: "Sudbury", state: "ON", lat: 46.4917, lon: -80.993 },
    { city: "Barrie", state: "ON", lat: 44.3894, lon: -79.6903 },
    { city: "Guelph", state: "ON", lat: 43.5448, lon: -80.2482 },
    { city: "Oshawa", state: "ON", lat: 43.8971, lon: -78.8658 },
    // Additional smaller Canadian cities
    { city: "Mississauga", state: "ON", lat: 43.589, lon: -79.6441 },
    { city: "Brampton", state: "ON", lat: 43.7315, lon: -79.7624 },
    { city: "Markham", state: "ON", lat: 43.8561, lon: -79.337 },
    { city: "Vaughan", state: "ON", lat: 43.8372, lon: -79.5083 },
    { city: "Windsor", state: "ON", lat: 42.3149, lon: -83.0364 },
    { city: "Waterloo", state: "ON", lat: 43.4643, lon: -80.5204 },
    { city: "Kingston", state: "ON", lat: 44.2312, lon: -76.486 },
    { city: "Peterborough", state: "ON", lat: 44.3091, lon: -78.3197 },
    { city: "Niagara Falls", state: "ON", lat: 43.0896, lon: -79.0849 },
    { city: "St. Catharines", state: "ON", lat: 43.1594, lon: -79.2469 },
    { city: "Brossard", state: "QC", lat: 45.4612, lon: -73.4656 },
    { city: "Longueuil", state: "QC", lat: 45.5312, lon: -73.5181 },
    { city: "Trois-Rivières", state: "QC", lat: 46.343, lon: -72.549 },
    { city: "Saguenay", state: "QC", lat: 48.4289, lon: -71.0689 },
    { city: "Lévis", state: "QC", lat: 46.7383, lon: -71.2465 },
    { city: "Abbotsford", state: "BC", lat: 49.0504, lon: -122.3045 },
    { city: "Prince George", state: "BC", lat: 53.9171, lon: -122.7497 },
    { city: "Medicine Hat", state: "AB", lat: 50.0405, lon: -110.6766 },
    { city: "Grande Prairie", state: "AB", lat: 55.1707, lon: -118.7884 },
    { city: "Brandon", state: "MB", lat: 49.8485, lon: -99.9501 },
    { city: "Fredericton", state: "NB", lat: 45.9636, lon: -66.6431 },
    { city: "Sydney", state: "NS", lat: 46.1368, lon: -60.1942 },
    { city: "Corner Brook", state: "NL", lat: 48.9517, lon: -57.9484 },
    { city: "Summerside", state: "PE", lat: 46.3934, lon: -63.7902 },
    { city: "Whitehorse", state: "YT", lat: 60.7212, lon: -135.0568 },
    { city: "Yellowknife", state: "NT", lat: 62.454, lon: -114.3718 },
    { city: "Iqaluit", state: "NU", lat: 63.7467, lon: -68.517 },
];

type Restaurant = {
    id: string;
    name: string;
    rating: number;
    price: "$" | "$$" | "$$$";
    categories: { alias: string; title: string }[];
    location: { address1: string; city: string };
    website: string;
    review_count: number;
    latitude: number;
    longitude: number;
    phone: string;
    hours: string[];
    brandColor: string;
};

// Curated brand color palette (30 pleasant, vibrant hex colors)
const BRAND_COLORS: string[] = [
    "#ef4444", // red-500
    "#f43f5e", // rose-500
    "#ec4899", // pink-500
    "#d946ef", // fuchsia-500
    "#a855f7", // purple-500
    "#8b5cf6", // violet-500
    "#6366f1", // indigo-500
    "#2563eb", // blue-600
    "#3b82f6", // blue-500
    "#60a5fa", // blue-400
    "#38bdf8", // sky-400
    "#22d3ee", // cyan-400
    "#06b6d4", // cyan-500
    "#14b8a6", // teal-500
    "#2dd4bf", // teal-400
    "#10b981", // emerald-500
    "#22c55e", // green-500
    "#34d399", // green-400
    "#4ade80", // green-300
    "#84cc16", // lime-500
    "#a3e635", // lime-400
    "#65a30d", // lime-600
    "#eab308", // yellow-500
    "#f59e0b", // amber-500
    "#ea580c", // orange-600
    "#f97316", // orange-500
    "#fb923c", // orange-400
    "#facc15", // yellow-400
    "#fda4af", // rose-300
    "#fde047", // yellow-300
];

const CATEGORY_POOL = [
    { alias: "coffee", title: "Coffee" },
    { alias: "bbq", title: "BBQ" },
    { alias: "sushi", title: "Sushi" },
    { alias: "pizza", title: "Pizza" },
    { alias: "mexican", title: "Mexican" },
    { alias: "italian", title: "Italian" },
    { alias: "seafood", title: "Seafood" },
    { alias: "burgers", title: "Burgers" },
    { alias: "tacos", title: "Tacos" },
    { alias: "breakfast", title: "Breakfast" },
    { alias: "bakery", title: "Bakery" },
];

const ADJECTIVES = [
    "Copper",
    "Golden",
    "Velvet",
    "Rustic",
    "Urban",
    "Maple",
    "River",
    "Starlight",
    "Bluebird",
    "Juniper",
    "Amber",
    "Cinder",
    "Granite",
    "Cobalt",
    "Crimson",
    "Ivory",
    "Harvest",
    "Common",
    "Union",
    "Sunset",
];

const NOUNS_BY_CATEGORY: Record<string, string[]> = {
    coffee: [
        "Bean",
        "Roast",
        "Brew",
        "Cup",
        "Kettle",
        "Grind",
        "Espresso",
        "Steam",
        "Press",
    ],
    bbq: ["Smokehouse", "Pit", "Barrel", "Oak", "Embers", "Ranch", "Brisket"],
    sushi: [
        "Sushi",
        "Omakase",
        "Izakaya",
        "Nigiri",
        "Sashimi",
        "Toro",
        "Bamboo",
    ],
    pizza: ["Slice", "Pie", "Oven", "Crust", "Neapolitan", "Fire", "Dough"],
    mexican: [
        "Cantina",
        "Taqueria",
        "Casa",
        "Azul",
        "Verde",
        "Agave",
        "Cocina",
    ],
    italian: ["Trattoria", "Osteria", "Enoteca", "Pasta", "Forno"],
    seafood: ["Oyster", "Dock", "Harbor", "Catch", "Marina", "Lobster"],
    burgers: ["Burger", "Grill", "Shake", "Patty", "Smash", "Bun"],
    tacos: ["Taco", "Taqueria", "Al Pastor", "Asada", "Cantina"],
    breakfast: ["Brunch", "Eggs", "Skillet", "Pancake", "Waffle"],
    bakery: ["Bakery", "Boulangerie", "Patisserie", "Loaf", "Crumb"],
};

function seededRandom(seed: string): () => number {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < seed.length; i++) {
        h ^= seed.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return () => {
        h += 0x6d2b79f5;
        let t = Math.imul(h ^ (h >>> 15), 1 | h);
        t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function pick<T>(rand: () => number, arr: T[]): T {
    return arr[Math.floor(rand() * arr.length) % arr.length];
}

// Pick a color from the curated palette; with seeded RNG this is stable
function pickBrandColor(rand: () => number): string {
    return pick(rand, BRAND_COLORS);
}

function pickIntInclusive(
    rand: () => number,
    min: number,
    max: number
): number {
    const a = Math.floor(min);
    const b = Math.floor(max);
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    return lo + Math.floor(rand() * (hi - lo + 1));
}

function slugify(input: string): string {
    return input
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

function generateCreativeName(
    categoryAlias: string,
    city: string,
    rand: () => number
): string {
    const nouns = NOUNS_BY_CATEGORY[categoryAlias] || ["Kitchen"];
    const a = pick(rand, ADJECTIVES);
    const n1 = pick(rand, nouns);
    const n2 = pick(
        rand,
        nouns.filter((n) => n !== n1).concat([pick(rand, ADJECTIVES)])
    );
    const pattern = Math.floor(rand() * 5);
    switch (pattern) {
        case 0:
            return `${a} ${n1}`;
        case 1:
            return `${n1} & ${n2}`;
        case 2:
            return `${city} ${n1}`;
        case 3:
            return `${a} ${city} ${n1}`;
        default:
            return `${n1} House`;
    }
}

function makeRestaurantsForCity(
    c: City,
    perCategoryRange: [number, number] = [3, 7]
): Restaurant[] {
    const citySlug = slugify(c.city);
    const out: Restaurant[] = [];
    const [minPer, maxPer] = perCategoryRange;
    // Deterministic per-category generation to ensure stable data across runs
    for (const primary of CATEGORY_POOL) {
        const baseSeed = `${c.city}-${c.state}-${primary.alias}`;
        const seeded = seededRandom(baseSeed);
        const countForCategory = pickIntInclusive(seeded, minPer, maxPer);
        for (let i = 1; i <= countForCategory; i++) {
            const seed = `${baseSeed}-${i}`;
            const rand = seededRandom(seed);
            const latOffset = (rand() - 0.5) * 0.06; // ~ up to ~3-4 km
            const lonOffset = (rand() - 0.5) * 0.06;
            const secondary = pick(
                rand,
                CATEGORY_POOL.filter((x) => x.alias !== primary.alias)
            );
            const PRICE_POOL: Restaurant["price"][] = ["$", "$$", "$$$"];
            const price: Restaurant["price"] =
                PRICE_POOL[
                    Math.floor(rand() * PRICE_POOL.length) % PRICE_POOL.length
                ];
            const rating = Math.round((4 + rand() * 0.9) * 10) / 10; // 4.0..4.9
            const reviews = Math.floor(150 + rand() * 6000);
            const name = generateCreativeName(primary.alias, c.city, rand);
            const id = `${citySlug}-${slugify(name)}-${c.state}-${
                primary.alias
            }-${String(i).padStart(3, "0")}`;
            const addressNum = 100 + Math.floor(rand() * 900);
            const streetTypes = ["St", "Ave", "Blvd", "Rd", "Dr", "Way", "Ln"];
            const street = `${pick(rand, ADJECTIVES)} ${pick(rand, [
                "Oak",
                "Maple",
                "Cedar",
                "Pine",
                "River",
                "Lake",
                "Sunset",
                "Union",
                "Market",
                "Main",
            ])}`;
            out.push({
                id,
                name,
                rating,
                price,
                categories: [primary, secondary],
                location: {
                    address1: `${addressNum} ${street} ${pick(
                        rand,
                        streetTypes
                    )}`,
                    city: c.city,
                },
                website: `https://eat.example.com/${citySlug}/${slugify(name)}`,
                review_count: reviews,
                latitude: c.lat + latOffset,
                longitude: c.lon + lonOffset,
                phone: `+1-555-${Math.floor(rand() * 9000 + 1000)}`,
                hours: ["Daily 07:00-21:00"],
                brandColor: pickBrandColor(rand),
            });
        }
    }
    return out;
}

async function main() {
    const root = process.cwd();
    const dataPath = path.join(root, "src", "data", "restaurants.json");

    // Build combined unique city list and generate fresh dataset (overwrite)
    const cityMap = new Map<string, City>();
    // Merge large US metros, smaller US cities, and Canadian cities
    [...usTop25, ...usSmallerCities, ...canadaCities].forEach((c) => {
        cityMap.set(`${c.city.toLowerCase()},${c.state.toLowerCase()}`, c);
    });
    const cities = Array.from(cityMap.values());
    const minPer = Number(process.env.GEN_MIN_PER_CATEGORY ?? 3);
    const maxPer = Number(process.env.GEN_MAX_PER_CATEGORY ?? 7);
    const final = cities.flatMap((c) =>
        makeRestaurantsForCity(c, [minPer, maxPer])
    );

    await fs.writeFile(
        dataPath,
        JSON.stringify(final, null, 4) + "\n",
        "utf-8"
    );
    console.log(`Wrote ${final.length} restaurants to ${dataPath}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
