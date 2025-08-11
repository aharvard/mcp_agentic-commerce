// Local JSON database; geocoding via OpenStreetMap Nominatim for city/state → lat/lon

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
    brandColor?: string;
};

import db from "../data/restaurants.json" assert { type: "json" };
const DB_RESTAURANTS: Restaurant[] = db as any as Restaurant[];

// Synonyms for better matching across sources and to resolve category intent
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
    coffee: ["coffee", "espresso", "cafe", "café", "cafeteria"],
    mexican: ["mexican", "tex-mex", "tacos"],
    tacos: ["tacos", "taco", "mexican"],
    sushi: ["sushi", "japanese", "omakase", "izakaya"],
    pizza: ["pizza", "pizzeria", "slice"],
    breakfast: ["breakfast", "brunch", "waffle", "pancake"],
    italian: ["italian", "pasta", "trattoria", "osteria"],
    seafood: ["seafood", "oyster", "lobster", "fish"],
    burgers: ["burgers", "burger", "smash"],
    bakery: ["bakery", "boulangerie", "patisserie", "bakeshop"],
};

const KNOWN_CATEGORY_ALIASES = new Set(Object.keys(TERM_SYNONYMS));

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

function resolveCanonicalCategoryAlias(raw: string): string | null {
    const needle = (raw || "").toLowerCase().trim();
    if (!needle) return null;
    // Check each alias and its synonyms to see if the query implies that category
    for (const [alias, synonyms] of Object.entries(TERM_SYNONYMS)) {
        if (alias === needle || synonyms.some((t) => needle.includes(t))) {
            return alias;
        }
    }
    return null;
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

type SearchParams = {
    term?: string;
    city?: string;
    state?: string;
    latitude?: number;
    longitude?: number;
    limit?: number;
};

async function geocodeCityState(
    city?: string,
    state?: string
): Promise<{ lat: number; lon: number } | null> {
    const input = [city?.trim(), state?.trim()].filter(Boolean).join(", ");
    if (!input) return null;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        input
    )}`;
    try {
        const resp = await fetch(url, {
            headers: {
                "User-Agent":
                    process.env.MCP_GEOCODE_USERAGENT ||
                    "mcp-agentic-commerce/1.0 (+https://squareup.com)",
            },
        } as any);
        if (!resp.ok) return null;
        const json = (await resp.json()) as Array<{
            lat: string;
            lon: string;
        }>;
        if (!json?.length) return null;
        const first = json[0];
        const lat = Number(first.lat);
        const lon = Number(first.lon);
        if (Number.isFinite(lat) && Number.isFinite(lon)) return { lat, lon };
        return null;
    } catch {
        return null;
    }
}

export async function searchRestaurants(params: SearchParams) {
    const { term, city, state } = params || {};
    let { latitude, longitude } = params || {};
    const limit = typeof params?.limit === "number" ? params.limit : 10;
    // Resolve coordinates if not provided
    if (
        (typeof latitude !== "number" || typeof longitude !== "number") &&
        (city || state)
    ) {
        const geo = await geocodeCityState(city, state);
        if (geo) {
            latitude = geo.lat;
            longitude = geo.lon;
        } else {
            const err: any = new Error(
                `Unable to resolve location from city/state: ${
                    [city, state].filter(Boolean).join(", ") || "<missing>"
                }`
            );
            err.code = "GEOCODE_NOT_FOUND";
            throw err;
        }
    }
    // If still no coordinates (and no city/state provided), throw
    if (typeof latitude !== "number" || typeof longitude !== "number") {
        const err: any = new Error(
            "Location is required (provide city/state or latitude/longitude)."
        );
        err.code = "LOCATION_REQUIRED";
        throw err;
    }
    const normalizedTerm = (term || "").trim();
    const needle = normalizedTerm.toLowerCase();
    const primaryCategoryAlias = resolveCanonicalCategoryAlias(needle);
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
    // Only use nearby results; if none found, return an empty set so the UI
    // can communicate no local results instead of showing another city.
    const pool = nearby;

    const filtered = pool.filter((b) => {
        if (
            primaryCategoryAlias &&
            KNOWN_CATEGORY_ALIASES.has(primaryCategoryAlias)
        ) {
            const primary = (b.categories || [])[0];
            const primaryAlias = (primary?.alias || "").toLowerCase();
            const primaryTitle = (primary?.title || "").toLowerCase();
            // Enforce primary category match only
            return (
                primaryAlias === primaryCategoryAlias ||
                primaryTitle.includes(primaryCategoryAlias)
            );
        }
        return needle ? byText(b) : true;
    });
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
