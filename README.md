# E-commerce Test Assessment Backend

This backend is built with Express.js + TypeScript + Prisma ORM.

to run the project, first install the packages using `npm install`, and then run `npm run dev` to start development server. The database will be automatically seeded with the logic inside the `app.listen` callback.

Here's an example of using `curl` to send an HTTP request on the local server:

`curl -X GET "http://localhost:3000/products"`

`curl -X GET "http://localhost:3000/products?category=electronics"`

`curl -X GET "http://localhost:3000/products/PRODUCT_ID"`

`curl -X POST "http://localhost:3000/products" \
  -H "Content-Type: application/json" \
  -d '{
    "img": "https://example.com/product.jpg",
    "name": "New Product",
    "description": "Product description",
    "price": 99,
    "initialQuantity": 50,
    "category": "electronics"
}'`
