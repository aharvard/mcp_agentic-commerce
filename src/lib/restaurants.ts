// Local JSON database only; no external API calls

export type Restaurant = {
    id: string;
    name: string;
    rating?: number;
    price?: string;
    categories?: { alias: string; title: string }[];
    location?: { address1?: string; city?: string };
    website?: string;
    review_count?: number;
    latitude?: number;
    longitude?: number;
    phone?: string;
    hours?: string[];
};

import db from "../data/restaurants.json" assert { type: "json" };
const DB_RESTAURANTS: Restaurant[] = db as any as Restaurant[];

// Synonyms for better matching across sources
const TERM_SYNONYMS: Record<string, string[]> = {
    bbq: [
        "bbq",
        "barbecue",
        "bar-b-q",
        "bar-b-que",
        "bar b q",
        "smokehouse",
        "smoked",
    ],
    mexican: ["mexican", "tex-mex", "tacos"],
    tacos: ["tacos", "taco", "mexican"],
    sushi: ["sushi", "japanese"],
    pizza: ["pizza", "pizzeria"],
    breakfast: ["breakfast", "brunch"],
};

function expandTerms(raw: string): Set<string> {
    const needle = (raw || "").toLowerCase().trim();
    const expanded = new Set<string>([needle]);
    for (const list of Object.values(TERM_SYNONYMS)) {
        if (needle && list.some((t) => needle.includes(t))) {
            list.forEach((t) => expanded.add(t));
        }
    }
    return expanded;
}

// Haversine to filter by proximity
function haversineKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export async function searchRestaurants(
    term: string | undefined,
    latitude: number,
    longitude: number,
    limit = 10
) {
    const normalizedTerm = (term || "").trim();
    const needle = normalizedTerm.toLowerCase();
    const expandedTerms = expandTerms(needle);

    const byText = (b: Restaurant) =>
        Array.from(expandedTerms).some((t) =>
            !t
                ? true
                : [
                      b.name,
                      ...(b.categories || []).map((c) => c.title),
                      b.location?.city || "",
                  ]
                      .join(" ")
                      .toLowerCase()
                      .includes(t)
        );

    // Proximity pool within ~30km when lat/lon supplied, otherwise whole DB
    const candidates = DB_RESTAURANTS.map((r) => ({
        r,
        d:
            typeof r.latitude === "number" && typeof r.longitude === "number"
                ? haversineKm(latitude, longitude, r.latitude, r.longitude)
                : Infinity,
    }));
    const nearby = candidates
        .filter((x) => x.d <= 30 || !isFinite(x.d))
        .sort((a, b) => a.d - b.d)
        .map((x) => x.r);
    const pool = nearby.length ? nearby : DB_RESTAURANTS;

    const filtered = pool.filter((b) => (needle ? byText(b) : true));
    const deduped = new Map<string, Restaurant>();
    for (const b of filtered) deduped.set(b.id, b);

    const finalList = Array.from(deduped.values()).slice(0, limit);
    return {
        businesses: finalList,
        meta: { source: "local-db", total: finalList.length },
        suggestions: [
            "Try specifying a cuisine like 'bbq', 'tacos', 'sushi', or 'pizza'",
            "Include a neighborhood or district (e.g., 'downtown', 'city center', or a postal code)",
            "Add a price hint like '$$' or a rating target like '4.5+' in the query",
        ],
    } as any;
}

export async function getRestaurant(id: string) {
    const found = DB_RESTAURANTS.find((b) => b.id === id);
    return found ?? {};
}
