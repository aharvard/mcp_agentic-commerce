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

const caTop25: City[] = [
    { city: "Los Angeles", state: "CA", lat: 34.0522, lon: -118.2437 },
    { city: "San Diego", state: "CA", lat: 32.7157, lon: -117.1611 },
    { city: "San Jose", state: "CA", lat: 37.3382, lon: -121.8863 },
    { city: "San Francisco", state: "CA", lat: 37.7749, lon: -122.4194 },
    { city: "Fresno", state: "CA", lat: 36.7378, lon: -119.7871 },
    { city: "Sacramento", state: "CA", lat: 38.5816, lon: -121.4944 },
    { city: "Long Beach", state: "CA", lat: 33.7701, lon: -118.1937 },
    { city: "Oakland", state: "CA", lat: 37.8044, lon: -122.2711 },
    { city: "Bakersfield", state: "CA", lat: 35.3733, lon: -119.0187 },
    { city: "Anaheim", state: "CA", lat: 33.8366, lon: -117.9143 },
    { city: "Santa Ana", state: "CA", lat: 33.7455, lon: -117.8677 },
    { city: "Riverside", state: "CA", lat: 33.9806, lon: -117.3755 },
    { city: "Stockton", state: "CA", lat: 37.9577, lon: -121.2908 },
    { city: "Irvine", state: "CA", lat: 33.6846, lon: -117.8265 },
    { city: "Chula Vista", state: "CA", lat: 32.6401, lon: -117.0842 },
    { city: "Fremont", state: "CA", lat: 37.5483, lon: -121.9886 },
    { city: "San Bernardino", state: "CA", lat: 34.1083, lon: -117.2898 },
    { city: "Modesto", state: "CA", lat: 37.6391, lon: -120.9969 },
    { city: "Oxnard", state: "CA", lat: 34.1975, lon: -119.1771 },
    { city: "Fontana", state: "CA", lat: 34.0922, lon: -117.435 },
    { city: "Moreno Valley", state: "CA", lat: 33.9425, lon: -117.2297 },
    { city: "Glendale", state: "CA", lat: 34.1425, lon: -118.2551 },
    { city: "Huntington Beach", state: "CA", lat: 33.6595, lon: -117.9988 },
    { city: "Santa Clarita", state: "CA", lat: 34.3917, lon: -118.5426 },
    { city: "Garden Grove", state: "CA", lat: 33.7739, lon: -117.9414 },
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
};

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

function makeRestaurantsForCity(c: City, count = 5): Restaurant[] {
    const citySlug = slugify(c.city);
    const out: Restaurant[] = [];
    for (let i = 1; i <= count; i++) {
        const seed = `${c.city}-${c.state}-${i}`;
        const rand = seededRandom(seed);
        const latOffset = (rand() - 0.5) * 0.06; // ~ up to ~3-4 km
        const lonOffset = (rand() - 0.5) * 0.06;
        const primary = pick(rand, CATEGORY_POOL);
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
        const id = `${citySlug}-${slugify(name)}-${c.state}-${String(
            i
        ).padStart(3, "0")}`;
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
                address1: `${addressNum} ${street} ${pick(rand, streetTypes)}`,
                city: c.city,
            },
            website: `https://eat.example.com/${citySlug}/${slugify(name)}`,
            review_count: reviews,
            latitude: c.lat + latOffset,
            longitude: c.lon + lonOffset,
            phone: `+1-555-${Math.floor(rand() * 9000 + 1000)}`,
            hours: ["Daily 07:00-21:00"],
        });
    }
    return out;
}

async function main() {
    const root = process.cwd();
    const dataPath = path.join(root, "src", "data", "restaurants.json");

    // Build combined unique city list and generate fresh dataset (overwrite)
    const cityMap = new Map<string, City>();
    [...usTop25, ...caTop25].forEach((c) => {
        cityMap.set(`${c.city.toLowerCase()},${c.state.toLowerCase()}`, c);
    });
    const cities = Array.from(cityMap.values());
    const final = cities.flatMap((c) => makeRestaurantsForCity(c, 5));

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
