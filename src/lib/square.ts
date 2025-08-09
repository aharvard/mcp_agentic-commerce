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
