import express from "express";
import { PrismaClient } from "./generated/prisma/index.js";
import { faker } from "@faker-js/faker";
import cors from "cors";

const app = express();
const prisma = new PrismaClient();

app.use(express.json(), cors());

app.get("/products", async (req, res) => {
  const { category } = req.query;

  res.send(
    await prisma.product.findMany(
      typeof category === "string"
        ? { where: { category: category.toLowerCase() } }
        : undefined
    )
  );
});

app.get("/products/:id", async (req, res) => {
  res.send(
    await prisma.product.findUnique({
      where: { id: req.params.id },
    })
  );
});

app.listen(3000, async () => {
  await prisma.product.deleteMany();

  const categories = ["electronics", "clothing", "books", "home", "sports"];
  const fakeProducts = Array.from({ length: 50 }, () => ({
    img: faker.helpers.arrayElement([
      "https://png.pngtree.com/png-clipart/20190516/original/pngtree-cleaning-products-on-transparent-background-png-image_4017269.jpg",
      "https://png.pngtree.com/png-clipart/20250429/original/pngtree-3d-melting-cheese-pizza-slice-on-png-image_20899183.png",
      "https://png.pngtree.com/png-clipart/20250819/original/pngtree-black-unisex-t-shirt-front-and-back-mockup-png-image_22104229.png",
    ]), // Valid image URL
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    quantity: Math.random() > 0.5 ? 0 : faker.number.int({ min: 10, max: 100 }),
    price: faker.number.int({ min: 5, max: 500 }), // Price in integer units (e.g., dollars)
    category: faker.helpers.arrayElement(categories), // Randomly select a category
  }));

  // Use createMany for efficient insertion
  await prisma.product.createMany({
    data: fakeProducts,
  });

  console.log("Server is running at http://localhost:3000");
});
