import { prisma } from "@/lib/prisma";

async function main() {
  await prisma.product.createMany({
    data: [
      {
        name: "iPhone 15",
        description: "Latest Apple iPhone",
        price: 999.99,
        image: "https://example.com/iphone.jpg",
        category: "Electronics",
      },
      {
        name: "Adidas Sneakers",
        description: "Running shoes",
        price: 120,
        image: "https://example.com/adidas.jpg",
        category: "Fashion",
      },
    ],
  });
}

main().then(() => {
  console.log("Data seeded.");
  process.exit();
});
