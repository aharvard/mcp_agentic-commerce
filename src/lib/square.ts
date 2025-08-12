export type SellerPlatformInfo = {
    usesSquare: boolean;
    reason: string;
    merchantToken?: string;
    merchantId?: string;
    locationId?: string;
};

export type CatalogItem = {
    id: string;
    name: string;
    description?: string;
    price: number; // USD for mock/demo
    imageUrl?: string;
};

// Simple demo mapping so the agent can deterministically know some sellers use Square
// In a real system, this might be a DB table keyed by seller/business IDs
const SQUARE_SELLERS: Record<string, Partial<SellerPlatformInfo>> = {
    // "Sample Pizza Place"
    "mock-1": {
        usesSquare: true,
        reason: "known-mapping",
        merchantToken: "merchant_token_mock_1",
        locationId: "location_mock_1",
    },
    // "Noodle House" — not a Square seller in our demo
    "mock-2": {
        usesSquare: false,
        reason: "known-mapping",
    },
    // "Taco Spot"
    "mock-3": {
        usesSquare: true,
        reason: "known-mapping",
        merchantToken: "merchant_token_mock_3",
        locationId: "location_mock_3",
    },
    // Realistic demo IDs from local DB
    "atx-franklin": {
        usesSquare: true,
        reason: "known-mapping",
        merchantToken: "merchant_token_atx_franklin",
        locationId: "location_atx_franklin",
    },
    // Coffee demo sellers used in scenarios
    "bluebird-coffee-ATL-001": {
        usesSquare: true,
        reason: "known-mapping",
        merchantToken: "merchant_token_bluebird_atl",
        locationId: "location_bluebird_atl",
    },
    "midtown-bean-ATL-102": {
        usesSquare: true,
        reason: "known-mapping",
        merchantToken: "merchant_token_midtownbean_atl",
        locationId: "location_midtownbean_atl",
    },
    "gpg-ATL-877": {
        usesSquare: true,
        reason: "known-mapping",
        merchantToken: "merchant_token_gpg_atl",
        locationId: "location_gpg_atl",
    },
    "peachtree-roasters-ATL-009": {
        usesSquare: false,
        reason: "known-mapping",
    },
    "nyc-katz": {
        usesSquare: false,
        reason: "known-mapping",
    },
};

// Very small mock catalog per seller to satisfy 1a-1c with images/pricing
const MOCK_CATALOGS: Record<string, CatalogItem[]> = {
    "mock-1": [
        {
            id: "p1",
            name: "Margherita Pizza",
            description: "Fresh mozzarella, basil, San Marzano tomatoes",
            price: 14.5,
            imageUrl:
                "https://images.unsplash.com/photo-1548365328-9f547fb0953c?w=800&q=80&auto=format&fit=crop",
        },
        {
            id: "p2",
            name: "Pepperoni Pizza",
            description: "Classic pepperoni with a crispy crust",
            price: 16,
            imageUrl:
                "https://images.unsplash.com/photo-1593560708920-9ec9a9dfd0bc?w=800&q=80&auto=format&fit=crop",
        },
    ],
    "mock-3": [
        {
            id: "t1",
            name: "Carne Asada Taco",
            description: "Grilled steak, onions, cilantro, lime",
            price: 4.25,
            imageUrl:
                "https://images.unsplash.com/photo-1541753866388-0b3c701627d3?w=800&q=80&auto=format&fit=crop",
        },
        {
            id: "t2",
            name: "Fish Taco",
            description: "Battered cod, cabbage slaw, chipotle mayo",
            price: 4.75,
            imageUrl:
                "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=800&q=80&auto=format&fit=crop",
        },
    ],
    "atx-franklin": [
        {
            id: "bbq1",
            name: "Brisket Plate",
            description: "Smoked brisket with pickles and onions",
            price: 19.5,
            imageUrl:
                "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80&auto=format&fit=crop",
        },
        {
            id: "bbq2",
            name: "Pulled Pork Sandwich",
            description: "House sauce, buttered bun",
            price: 12.0,
            imageUrl:
                "https://images.unsplash.com/photo-1604908554226-0466b0f3f0f9?w=800&q=80&auto=format&fit=crop",
        },
    ],
    "bluebird-coffee-ATL-001": [
        {
            id: "bb1",
            name: "Latte",
            description: "Silky espresso with steamed milk",
            price: 4.25,
            imageUrl:
                "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=800&q=80&auto=format&fit=crop",
        },
        {
            id: "bb2",
            name: "Cold Brew",
            description: "18-hr steep, chocolatey notes",
            price: 4.75,
            imageUrl:
                "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&q=80&auto=format&fit=crop",
        },
        {
            id: "bb3",
            name: "Blueberry Muffin",
            description: "Baked daily",
            price: 3.5,
            imageUrl:
                "https://images.unsplash.com/photo-1604908551470-6f9ab0d5f0d8?w=800&q=80&auto=format&fit=crop",
        },
    ],
    "midtown-bean-ATL-102": [
        {
            id: "mb1",
            name: "Flat White",
            description: "Velvety microfoam",
            price: 4.5,
            imageUrl:
                "https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=800&q=80&auto=format&fit=crop",
        },
        {
            id: "mb2",
            name: "Nitro Cold Brew",
            description: "Creamy, cascading",
            price: 5.25,
            imageUrl:
                "https://images.unsplash.com/photo-1503481766315-7a586b20f66f?w=800&q=80&auto=format&fit=crop",
        },
        {
            id: "mb3",
            name: "Almond Croissant",
            description: "Buttery, toasted almonds",
            price: 4.25,
            imageUrl:
                "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&q=80&auto=format&fit=crop",
        },
    ],
    "gpg-ATL-877": [
        {
            id: "gpg1",
            name: "Drip Coffee",
            description: "Freshly brewed",
            price: 2.85,
            imageUrl:
                "https://images.unsplash.com/photo-1498804103079-a6351b050096?w=800&q=80&auto=format&fit=crop",
        },
        {
            id: "gpg2",
            name: "Oat Milk Latte",
            description: "Smooth and dairy-free",
            price: 4.95,
            imageUrl:
                "https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=800&q=80&auto=format&fit=crop",
        },
        {
            id: "gpg3",
            name: "Seasonal Scone",
            description: "House-made",
            price: 3.75,
            imageUrl:
                "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=800&q=80&auto=format&fit=crop",
        },
    ],
    // Generic menus for types
    "generic-coffee": [
        { id: "c1", name: "Espresso", price: 3.0 },
        { id: "c2", name: "Latte", price: 4.25 },
        { id: "c3", name: "Cold Brew", price: 4.5 },
        { id: "c4", name: "Blueberry Muffin", price: 3.25 },
    ],
    "generic-bbq": [
        { id: "q1", name: "Brisket Plate", price: 18.5 },
        { id: "q2", name: "Pulled Pork Sandwich", price: 11.0 },
        { id: "q3", name: "Mac and Cheese", price: 4.5 },
    ],
    "generic-pizza": [
        { id: "pz1", name: "Margherita", price: 14.0 },
        { id: "pz2", name: "Pepperoni", price: 15.5 },
        { id: "pz3", name: "Veggie", price: 15.0 },
    ],
};

export function detectSquareForBusinessId(
    businessId: string,
    websiteUrl?: string
): SellerPlatformInfo {
    // Priority 1: explicit mapping
    const mapped = SQUARE_SELLERS[businessId];
    if (mapped) {
        return {
            usesSquare: Boolean(mapped.usesSquare),
            reason: mapped.reason ?? "known-mapping",
            merchantToken: mapped.merchantToken,
            merchantId: mapped.merchantId,
            locationId: mapped.locationId,
        };
    }

    // Priority 2: heuristic from website URL
    const url = (websiteUrl || "").toLowerCase();
    const heuristicMatch =
        url.includes("square.site") || url.includes("squareup.com");
    if (heuristicMatch) {
        return {
            usesSquare: true,
            reason: "heuristic-website",
        };
    }

    return { usesSquare: false, reason: "unknown" };
}

export async function getCatalogForBusinessId(
    businessId: string
): Promise<CatalogItem[]> {
    // If we had a Square Access Token we could query the live API here.
    // For now, return a deterministic mock catalog for sellers we know use Square.
    return MOCK_CATALOGS[businessId] ?? [];
}

export async function getCatalogByMerchantToken(
    merchantToken: string
): Promise<CatalogItem[]> {
    const entry = Object.entries(SQUARE_SELLERS).find(
        ([, info]) => info.merchantToken === merchantToken
    );
    const businessId = entry?.[0];
    if (!businessId) return [];
    return MOCK_CATALOGS[businessId] ?? [];
}

// Fallback: local generic menus by primary category
import menus from "../data/menus.json" with { type: "json" };
export function getGenericMenuByCategory(categoryAlias: string): CatalogItem[] {
    const key = (categoryAlias || "").toLowerCase();
    const items = (menus as any)[key] || [];
    return items as CatalogItem[];
}
