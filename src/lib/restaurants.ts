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

export async function searchRestaurants(
    term: string | undefined,
    _latitude: number,
    _longitude: number,
    limit = 10
) {
    const filtered = MOCK_RESTAURANTS.filter((b) =>
        term ? b.name.toLowerCase().includes(term.toLowerCase()) : true
    ).slice(0, limit);
    return { businesses: filtered };
}

export async function getRestaurant(id: string) {
    const found = MOCK_RESTAURANTS.find((b) => b.id === id);
    return found ?? {};
}
