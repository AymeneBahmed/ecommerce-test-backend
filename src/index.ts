import express from "express";
import { PrismaClient } from "./generated/prisma/index.js";
import { faker } from "@faker-js/faker";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

const app = express();
const prisma = new PrismaClient();

app.use(express.json(), cors());
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup({
    openapi: "3.0.0",
    info: {
      title: "Product API",
      description: "API for managing products with CRUD operations",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    paths: {
      "/products": {
        get: {
          summary: "Get all products",
          description:
            "Retrieve a list of products, optionally filtered by category",
          parameters: [
            {
              in: "query",
              name: "category",
              schema: {
                type: "string",
              },
              required: false,
              description: "Filter products by category",
            },
          ],
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/Product",
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          summary: "Create a new product",
          description: "Add a new product to the database",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ProductCreate",
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Product created successfully",
            },
            "500": {
              description: "Internal server error",
            },
          },
        },
      },
      "/products/{id}": {
        get: {
          summary: "Get product by ID",
          description: "Retrieve a single product by its ID",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              description: "ID of the product to retrieve",
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Product",
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Product: {
          type: "object",
          properties: {
            id: {
              type: "string",
            },
            img: {
              type: "string",
              format: "uri",
            },
            name: {
              type: "string",
            },
            description: {
              type: "string",
            },
            price: {
              type: "integer",
              minimum: 5,
              maximum: 500,
            },
            quantity: {
              type: "integer",
            },
            category: {
              type: "string",
            },
          },
        },
        ProductCreate: {
          type: "object",
          required: [
            "img",
            "name",
            "description",
            "price",
            "initialQuantity",
            "category",
          ],
          properties: {
            img: {
              type: "string",
              format: "uri",
              description: "URL of the product image",
            },
            name: {
              type: "string",
              description: "Name of the product",
            },
            description: {
              type: "string",
              description: "Detailed description of the product",
            },
            price: {
              type: "integer",
              minimum: 5,
              maximum: 500,
              description: "Price of the product in whole units",
            },
            initialQuantity: {
              type: "integer",
              description: "Initial stock quantity",
            },
            category: {
              type: "string",
              description: "Product category",
            },
          },
        },
      },
    },
  })
);

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

app.post("/products", async (req, res) => {
  const newProductDetails: {
    img: string;
    name: string;
    description: string;
    price: number;
    initialQuantity: number;
    category: string;
  } = req.body;
  const { img, name, description, category, price, initialQuantity } =
    newProductDetails;

  try {
    await prisma.product.create({
      data: {
        img,
        name,
        description,
        price,
        category: category.toLowerCase(),
        quantity: initialQuantity,
      },
    });

    res.status(201).send("Added a product successfully!");
  } catch {
    res.send(500).send("Something went wrong! Please trya again");
  }
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
