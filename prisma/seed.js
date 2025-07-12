import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

const seed = async () => {
  await prisma.ingredient.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("123456", 10); // or any default password

  const user = await prisma.user.create({
    data: {
      username: "alexanderjimenez29@gmail.com",
      password: hashedPassword,
    },
  });

  const recipes = [
    {
      title: "Simple Sourdough Bread",
      instructions:
        "1. Mix flour and water. Let rest.\n2. Add starter and salt. Fold.\n3. Shape and cold proof overnight.\n4. Bake at 475°F in Dutch oven.",
      tags: ["bread"],
      ingredients: {
        create: [
          { name: "bread flour", qty: 4, unit: "cup" },
          { name: "water", qty: 1.5, unit: "cup" },
          { name: "starter", qty: 0.5, unit: "cup" },
          { name: "salt", qty: 2, unit: "tsp" },
        ],
      },
    },
    {
      title: "Spaghetti Carbonara",
      instructions:
        "1. Cook spaghetti.\n2. Crisp pancetta.\n3. Mix egg and cheese.\n4. Toss everything quickly together.",
      tags: ["italian", "pasta"],
      ingredients: {
        create: [
          { name: "spaghetti", qty: 400, unit: "g" },
          { name: "pancetta", qty: 150, unit: "g" },
          { name: "egg", qty: 3, unit: "pcs" },
          { name: "Parmesan", qty: 50, unit: "g" },
        ],
      },
    },
    {
      title: "Vegetable Stir Fry",
      instructions:
        "1. Heat oil in wok.\n2. Add garlic and vegetables.\n3. Add sauce and stir-fry 3–5 mins.\n4. Serve hot.",
      tags: ["vegetarian", "quick"],
      ingredients: {
        create: [
          { name: "broccoli", qty: 1, unit: "cup" },
          { name: "carrot", qty: 1, unit: "pcs" },
          { name: "soy sauce", qty: 2, unit: "tbsp" },
          { name: "garlic", qty: 2, unit: "clove" },
        ],
      },
    },
    {
      title: "Chicken Tikka Masala",
      instructions:
        "1. Marinate chicken.\n2. Grill or sear.\n3. Simmer in masala sauce.\n4. Serve with rice or naan.",
      tags: ["indian", "spicy"],
      ingredients: {
        create: [
          { name: "chicken breast", qty: 500, unit: "g" },
          { name: "yogurt", qty: 1, unit: "cup" },
          { name: "garam masala", qty: 1, unit: "tbsp" },
          { name: "tomato puree", qty: 1, unit: "cup" },
        ],
      },
    },
    {
      title: "Classic Pancakes",
      instructions:
        "1. Mix dry and wet separately, then combine.\n2. Pour onto griddle.\n3. Flip when bubbles form.\n4. Serve with butter and syrup.",
      tags: ["breakfast"],
      ingredients: {
        create: [
          { name: "flour", qty: 1.5, unit: "cup" },
          { name: "milk", qty: 1.25, unit: "cup" },
          { name: "egg", qty: 1, unit: "pcs" },
          { name: "baking powder", qty: 2, unit: "tsp" },
        ],
      },
    },
    {
      title: "Oven-Baked Salmon",
      instructions:
        "1. Preheat oven to 400°F.\n2. Season fillets.\n3. Bake 12–15 mins.\n4. Serve with lemon.",
      tags: ["seafood", "healthy"],
      ingredients: {
        create: [
          { name: "salmon fillet", qty: 2, unit: "pcs" },
          { name: "olive oil", qty: 1, unit: "tbsp" },
          { name: "lemon", qty: 1, unit: "pcs" },
          { name: "salt", qty: 0.5, unit: "tsp" },
        ],
      },
    },
    {
      title: "Guacamole",
      instructions:
        "1. Mash avocado.\n2. Mix in lime juice, onion, tomato, cilantro.\n3. Season and serve.",
      tags: ["dip", "vegan"],
      ingredients: {
        create: [
          { name: "avocado", qty: 2, unit: "pcs" },
          { name: "lime juice", qty: 1, unit: "tbsp" },
          { name: "red onion", qty: 2, unit: "tbsp" },
          { name: "cilantro", qty: 1, unit: "tbsp" },
        ],
      },
    },
    {
      title: "Chocolate Chip Cookies",
      instructions:
        "1. Cream butter and sugar.\n2. Add egg and vanilla.\n3. Mix dry ingredients.\n4. Add chips. Scoop and bake.",
      tags: ["dessert", "cookies"],
      ingredients: {
        create: [
          { name: "flour", qty: 1.25, unit: "cup" },
          { name: "butter", qty: 0.5, unit: "cup" },
          { name: "sugar", qty: 0.5, unit: "cup" },
          { name: "chocolate chips", qty: 1, unit: "cup" },
        ],
      },
    },
    {
      title: "Tomato Basil Soup",
      instructions:
        "1. Sauté onion/garlic.\n2. Add tomatoes + broth.\n3. Simmer + blend.\n4. Stir in basil and cream.",
      tags: ["soup", "comfort"],
      ingredients: {
        create: [
          { name: "canned tomatoes", qty: 2, unit: "cup" },
          { name: "onion", qty: 1, unit: "pcs" },
          { name: "garlic", qty: 2, unit: "clove" },
          { name: "basil", qty: 1, unit: "tbsp" },
        ],
      },
    },
    {
      title: "Scrambled Eggs",
      instructions:
        "1. Beat eggs.\n2. Cook low/slow in butter.\n3. Stir until curds form.\n4. Serve warm.",
      tags: ["breakfast", "quick"],
      ingredients: {
        create: [
          { name: "egg", qty: 3, unit: "pcs" },
          { name: "butter", qty: 1, unit: "tbsp" },
          { name: "salt", qty: 0.25, unit: "tsp" },
          { name: "pepper", qty: 0.25, unit: "tsp" },
        ],
      },
    },
  ];
  console.log("Seeding data...");

  for (const recipe of recipes) {
    await prisma.recipe.create({
      data: {
        ...recipe,
        userId: user.id,
      },
    });
  }

  console.log("✅ Seed complete");
};

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
