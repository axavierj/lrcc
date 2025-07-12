import Router from "koa-router";
import prisma from "../../prisma/prismaClient.js";
import { authRequired } from "./../../middleware/auth.js";

const recipesRouter = new Router({
  prefix: "/recipes",
});

recipesRouter.get("/", authRequired, async (ctx) => {
  const userId = ctx.user.id;

  const recipes = await prisma.recipe.findMany({
    where: { userId },
  });
  ctx.body = recipes;
});

recipesRouter.post("/", authRequired, async (ctx) => {
  const { title, instructions, tags, ingredients } = ctx.request.body;
  const userId = ctx.user.id;
  const recipe = await prisma.recipe.create({
    data: {
      title,
      instructions,
      tags,
      ingredients: {
        create: ingredients,
      },
      user: {
        connect: { id: userId }, // Associate recipe with the authenticated user
      },
    },
  });

  ctx.body = recipe;
});

recipesRouter.get("/:id", authRequired, async (ctx) => {
  const { id } = ctx.params;

  const recipe = await prisma.recipe.findUnique({
    where: { id: parseInt(id) },
    include: {
      ingredients: true,
    },
  });

  if (!recipe) {
    ctx.throw(404, "Recipe not found");
  }

  ctx.body = recipe;
});

recipesRouter.delete("/:id", authRequired, async (ctx) => {
  const { id } = ctx.params;
  const recipeId = parseInt(id);

  if (isNaN(recipeId)) {
    ctx.throw(400, "Invalid recipe ID");
  }

  // Optional: check if recipe exists first
  const exists = await prisma.recipe.findUnique({ where: { id: recipeId } });

  if (!exists) {
    ctx.throw(404, "Recipe not found");
  }

  if (exists.userId !== ctx.user.id) ctx.throw(403, "Forbidden");

  // Delete recipe (ingredients are removed via cascade)
  const deleted = await prisma.recipe.delete({
    where: { id: recipeId },
  });

  ctx.body = { message: "Recipe deleted", id: deleted.id };
});

recipesRouter.put("/:id", authRequired, async (ctx) => {
  const { id } = ctx.params;
  const recipeId = parseInt(id);

  if (isNaN(recipeId)) {
    ctx.throw(400, "Invalid recipe ID");
  }

  const { title, instructions, tags = [], ingredients = [] } = ctx.request.body;

  const cleanedIngredients = ingredients.map(({ name, qty, unit }) => ({
    name,
    qty,
    unit,
  }));

  await prisma.ingredient.deleteMany({ where: { recipeId } });

  const updated = await prisma.recipe.update({
    where: { id: recipeId },
    data: {
      title,
      instructions,
      tags,
      ingredients: {
        create: cleanedIngredients,
      },
    },
    include: {
      ingredients: true,
    },
  });

  ctx.body = updated;
});

export default recipesRouter;
