import fs from "fs/promises";
import path from "path";

type MenuItem = {
    id: string;
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
};

type MenusByCategory = Record<string, MenuItem[]>;

// One canonical menu per category alias matching CATEGORY_POOL in generateMockRestaurants.ts
const MENUS: MenusByCategory = {
    coffee: [
        {
            id: "coffee-espresso",
            name: "Espresso",
            description: "Double shot",
            price: 3.0,
        },
        {
            id: "coffee-latte",
            name: "Latte",
            description: "Espresso + steamed milk",
            price: 4.25,
        },
        {
            id: "coffee-capp",
            name: "Cappuccino",
            description: "Foamy classic",
            price: 4.0,
        },
        {
            id: "coffee-coldbrew",
            name: "Cold Brew",
            description: "Slow steeped",
            price: 4.5,
        },
        {
            id: "coffee-muffin",
            name: "Blueberry Muffin",
            description: "Baked daily",
            price: 3.25,
        },
    ],
    bbq: [
        {
            id: "bbq-brisket",
            name: "Brisket Plate",
            description: "Smoked 12 hours",
            price: 19.5,
        },
        {
            id: "bbq-pork",
            name: "Pulled Pork Sandwich",
            description: "House sauce, toasted bun",
            price: 12.0,
        },
        {
            id: "bbq-ribs",
            name: "St. Louis Ribs (1/2 rack)",
            description: "Dry rub, applewood",
            price: 18.0,
        },
        {
            id: "bbq-mac",
            name: "Mac & Cheese",
            description: "Three-cheese bake",
            price: 5.0,
        },
    ],
    sushi: [
        {
            id: "sushi-nigiri",
            name: "Chef's Nigiri (6 pc)",
            description: "Daily selection",
            price: 18.0,
        },
        {
            id: "sushi-roll",
            name: "Spicy Tuna Roll",
            description: "Ahi, chili mayo",
            price: 9.5,
        },
        {
            id: "sushi-salmon",
            name: "Salmon Sashimi (6 pc)",
            description: "Fresh cut",
            price: 16.0,
        },
        {
            id: "sushi-miso",
            name: "Miso Soup",
            description: "Tofu, scallion",
            price: 3.0,
        },
    ],
    pizza: [
        {
            id: "pizza-margherita",
            name: "Margherita",
            description: "San Marzano, basil, mozz",
            price: 14.0,
        },
        {
            id: "pizza-pepperoni",
            name: "Pepperoni",
            description: "Cup & char",
            price: 15.5,
        },
        {
            id: "pizza-veg",
            name: "Garden Veg",
            description: "Seasonal veg, pesto",
            price: 15.0,
        },
        {
            id: "pizza-garlic",
            name: "Garlic Knots",
            description: "Parmesan + herbs",
            price: 6.0,
        },
    ],
    mexican: [
        {
            id: "mex-taco-carnitas",
            name: "Carnitas Tacos (2)",
            description: "Cilantro, onion, salsa verde",
            price: 8.5,
        },
        {
            id: "mex-burrito",
            name: "Mission Burrito",
            description: "Rice, beans, pico, choice of protein",
            price: 10.5,
        },
        {
            id: "mex-queso",
            name: "Queso & Chips",
            description: "Warm, creamy",
            price: 6.0,
        },
    ],
    italian: [
        {
            id: "it-spaghetti",
            name: "Spaghetti Pomodoro",
            description: "Tomato, basil",
            price: 13.0,
        },
        {
            id: "it-lasagna",
            name: "Beef Lasagna",
            description: "Baked, ricotta, mozz",
            price: 16.0,
        },
        {
            id: "it-salad",
            name: "Caesar Salad",
            description: "Romaine, croutons",
            price: 9.0,
        },
    ],
    seafood: [
        {
            id: "sf-fish",
            name: "Grilled Salmon",
            description: "Lemon, herbs",
            price: 19.0,
        },
        {
            id: "sf-oyster",
            name: "Oysters (6)",
            description: "On the half shell",
            price: 17.0,
        },
        {
            id: "sf-chowder",
            name: "Clam Chowder",
            description: "New England style",
            price: 7.5,
        },
    ],
    burgers: [
        {
            id: "bg-classic",
            name: "Classic Burger",
            description: "American, lettuce, tomato",
            price: 11.0,
        },
        {
            id: "bg-cheese",
            name: "Double Cheeseburger",
            description: "Two patties, cheddar",
            price: 13.5,
        },
        {
            id: "bg-fries",
            name: "Shoestring Fries",
            description: "Crispy",
            price: 4.0,
        },
        {
            id: "bg-shake",
            name: "Vanilla Shake",
            description: "Thick, creamy",
            price: 5.0,
        },
    ],
    tacos: [
        {
            id: "tc-alpastor",
            name: "Al Pastor (2)",
            description: "Pineapple, onion, cilantro",
            price: 8.0,
        },
        {
            id: "tc-baja",
            name: "Baja Fish (2)",
            description: "Cabbage slaw, crema",
            price: 8.5,
        },
        {
            id: "tc-elote",
            name: "Street Corn",
            description: "Cotija, chili, lime",
            price: 5.0,
        },
    ],
    breakfast: [
        {
            id: "bf-pancakes",
            name: "Buttermilk Pancakes",
            description: "Maple syrup, butter",
            price: 9.0,
        },
        {
            id: "bf-avotoast",
            name: "Avocado Toast",
            description: "Sourdough, chili flakes",
            price: 8.5,
        },
        {
            id: "bf-benedict",
            name: "Eggs Benedict",
            description: "Hollandaise",
            price: 12.0,
        },
    ],
    bakery: [
        {
            id: "bk-croissant",
            name: "Butter Croissant",
            description: "Flaky layers",
            price: 3.75,
        },
        {
            id: "bk-sourdough",
            name: "Sourdough Loaf",
            description: "Crusty, tangy",
            price: 6.0,
        },
        {
            id: "bk-cookie",
            name: "Chocolate Chip Cookie",
            description: "Sea salt",
            price: 2.5,
        },
    ],
};

// Deterministically expand each category to around 12 items
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

const FILLER_NAME_POOLS: Record<string, string[]> = {
    coffee: [
        "Americano",
        "Mocha",
        "Flat White",
        "Cortado",
        "Macchiato",
        "Drip Coffee",
        "Iced Latte",
        "Chai Latte",
        "Hot Chocolate",
        "Bagel",
        "Almond Croissant",
    ],
    bbq: [
        "Sausage Link",
        "Turkey Plate",
        "Burnt Ends",
        "Coleslaw",
        "Potato Salad",
        "Jalapeño Cornbread",
        "Pickles",
        "Pork Ribs",
    ],
    sushi: [
        "California Roll",
        "Tempura Shrimp Roll",
        "Dragon Roll",
        "Edamame",
        "Seaweed Salad",
        "Gyoza",
    ],
    pizza: [
        "Meat Lovers",
        "White Pie",
        "Prosciutto Arugula",
        "Four Cheese",
        "Garlic Bread",
        "Caesar Salad",
    ],
    mexican: [
        "Barbacoa Tacos (2)",
        "Pollo Asado Tacos (2)",
        "Chicken Quesadilla",
        "Street Nachos",
        "Guacamole & Chips",
        "Churros",
        "Horchata",
    ],
    italian: [
        "Fettuccine Alfredo",
        "Chicken Parmesan",
        "Meatballs",
        "Bruschetta",
        "Tiramisu",
    ],
    seafood: [
        "Fish & Chips",
        "Lobster Roll",
        "Calamari",
        "Shrimp Cocktail",
        "Coleslaw",
    ],
    burgers: [
        "Bacon Burger",
        "Veggie Burger",
        "Crispy Chicken Sandwich",
        "Onion Rings",
        "Sweet Potato Fries",
        "Chocolate Shake",
    ],
    tacos: [
        "Carne Asada (2)",
        "Chicken Tinga (2)",
        "Quesadilla",
        "Chips & Salsa",
        "Agua Fresca",
    ],
    breakfast: [
        "French Toast",
        "Breakfast Burrito",
        "Three-Egg Omelette",
        "Hash Browns",
        "Fruit Cup",
        "House Coffee",
    ],
    bakery: [
        "Almond Croissant",
        "Baguette",
        "Cinnamon Roll",
        "Lemon Tart",
        "Brownie",
        "Cupcake",
        "Scone",
    ],
};

function ensureTwelve(alias: string, list: MenuItem[]): MenuItem[] {
    const target = 12;
    if (list.length >= target) return list.slice(0, target);
    const rand = seededRandom(alias);
    const pool = FILLER_NAME_POOLS[alias] || [];
    const out = [...list];
    let idx = 1;
    while (out.length < target && pool.length) {
        const name = pick(rand, pool);
        const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const id = `${alias}-extra-${base}-${String(idx).padStart(2, "0")}`;
        const priceBase =
            alias === "coffee"
                ? 3 + Math.round(rand() * 350) / 100
                : alias === "bakery"
                ? 2.5 + Math.round(rand() * 450) / 100
                : alias === "breakfast"
                ? 7 + Math.round(rand() * 700) / 100
                : 9 + Math.round(rand() * 1200) / 100;
        out.push({ id, name, price: Number(priceBase.toFixed(2)) });
        idx++;
    }
    while (out.length < target) {
        const name = `${alias} Special ${idx}`;
        const id = `${alias}-special-${idx}`;
        out.push({ id, name, price: 9 + idx });
        idx++;
    }
    return out;
}

async function main() {
    const root = process.cwd();
    const dataPath = path.join(root, "src", "data", "menus.json");
    const expanded: MenusByCategory = {};
    for (const [alias, items] of Object.entries(MENUS)) {
        expanded[alias] = ensureTwelve(alias, items);
    }
    await fs.writeFile(
        dataPath,
        JSON.stringify(expanded, null, 2) + "\n",
        "utf-8"
    );
    console.log(
        `Wrote menus for ${Object.keys(MENUS).length} categories to ${dataPath}`
    );
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
