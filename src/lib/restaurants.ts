// Using native fetch; no external HTTP client needed

export type Restaurant = {
    id: string;
    name: string;
    rating?: number;
    price?: string;
    categories?: { alias: string; title: string }[];
    location?: { address1?: string; city?: string };
    website?: string;
    review_count?: number;
};

const MOCK_RESTAURANTS: Restaurant[] = [
    {
        id: "mock-1",
        name: "Sample Pizza Place",
        rating: 4.5,
        price: "$$",
        categories: [{ alias: "pizza", title: "Pizza" }],
        location: { address1: "123 Main St", city: "Anytown" },
        website: "https://example.com/pizza",
        review_count: 128,
    },
    {
        id: "mock-2",
        name: "Noodle House",
        rating: 4.2,
        price: "$$",
        categories: [{ alias: "noodles", title: "Noodles" }],
        location: { address1: "456 Elm Ave", city: "Anytown" },
        website: "https://example.com/noodles",
        review_count: 87,
    },
    {
        id: "mock-3",
        name: "Taco Spot",
        rating: 4.0,
        price: "$",
        categories: [{ alias: "mexican", title: "Mexican" }],
        location: { address1: "789 Oak Blvd", city: "Anytown" },
        website: "https://example.com/tacos",
        review_count: 203,
    },
];

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

// OpenStreetMap Overpass — free, global POI data without API keys
async function searchOSMRestaurants(
    term: string | undefined,
    latitude: number,
    longitude: number,
    limit: number
): Promise<Restaurant[]> {
    const radiusMeters = 5000; // 5km
    const filter = '"amenity"~"restaurant|cafe|fast_food"';
    const query = `
      [out:json][timeout:25];
      (
        node[${filter}](around:${radiusMeters},${latitude},${longitude});
        way[${filter}](around:${radiusMeters},${latitude},${longitude});
        relation[${filter}](around:${radiusMeters},${latitude},${longitude});
      );
      out center ${Math.max(10, Math.min(limit * 3, 300))};
    `;

    const resp = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: query,
    });
    if (!resp.ok) {
        throw new Error(`Overpass error ${resp.status}`);
    }
    const data = await resp.json();
    const elements = data?.elements || [];
    const list: Restaurant[] = elements
        .map((el: any) => {
            const tags = el.tags || {};
            const name: string | undefined = tags.name;
            if (!name) return null;
            const cuisine = String(tags.cuisine || "")
                .split(";")
                .map((s) => s.trim())
                .filter(Boolean)
                .map((c) => ({ alias: c.toLowerCase(), title: c }))
                .slice(0, 3);
            const address1 = [tags["addr:housenumber"], tags["addr:street"]]
                .filter(Boolean)
                .join(" ");
            return {
                id: String(el.id),
                name,
                rating: undefined,
                price: undefined,
                categories: cuisine.length ? cuisine : undefined,
                location: {
                    address1: address1 || undefined,
                    city: tags["addr:city"] || undefined,
                },
                website: tags.website || tags.url || undefined,
                review_count: undefined,
            } as Restaurant;
        })
        .filter(Boolean) as Restaurant[];

    const needle = (term || "").trim().toLowerCase();
    if (!needle) return list.slice(0, limit);

    const expanded = expandTerms(needle);
    const matches = (r: Restaurant) => {
        const cuisineTokens = (r.categories || []).map((c) => c.alias);
        const haystack = `${r.name} ${cuisineTokens.join(" ")}`.toLowerCase();
        for (const t of expanded) {
            if (t && haystack.includes(t)) return true;
        }
        return false;
    };

    const filtered = list.filter(matches);
    return (filtered.length ? filtered : list).slice(0, limit);
}

export async function searchRestaurants(
    term: string | undefined,
    _latitude: number,
    _longitude: number,
    limit = 10
) {
    const normalizedTerm = (term || "").trim();

    // Primary: OpenStreetMap Overpass (free, global, no key)
    try {
        const osm = await searchOSMRestaurants(
            normalizedTerm,
            _latitude,
            _longitude,
            limit
        );
        if (osm.length > 0) {
            return { businesses: osm, meta: { source: "osm" } } as any;
        }
    } catch (err) {
        console.warn("[restaurants] OSM Overpass failed, falling back:", err);
    }

    // Secondary: local mock dataset (global, not city-specific)
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

    const filtered = MOCK_RESTAURANTS.filter((b) =>
        needle ? byText(b) : true
    );
    const deduped = new Map<string, Restaurant>();
    for (const b of filtered) deduped.set(b.id, b);

    const finalList = Array.from(deduped.values()).slice(0, limit);
    return {
        businesses: finalList,
        meta: { source: "local-fallback", total: finalList.length },
        suggestions: [
            "Try specifying a cuisine like 'bbq', 'tacos', 'sushi', or 'pizza'",
            "Include a neighborhood or district (e.g., 'downtown', 'city center', or a postal code)",
            "Add a price hint like '$$' or a rating target like '4.5+' in the query",
        ],
    } as any;
}

export async function getRestaurant(id: string) {
    const found = MOCK_RESTAURANTS.find((b) => b.id === id);
    return found ?? {};
}
