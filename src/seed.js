const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = require("./config/db.js");
const User = require("./models/User");
const Product = require("./models/Product");
const Category = require("./models/Category");  

const seed = async () => {
    console.log("Seeding database...");
  try {
    await connectDB().then(() => {
        console.log("Connected to MongoDB");
    });

    const users = [
      {
        name: "John Doe",
        email: "john@example.com",
        passwordHash: "$2a$10$2b2cU8CPhOTaGrs1HRQuAueS7JTT5ZHsHSzYiFPm1leZck7Mc8T4W",
        role: "customer",
        addresses: [
          {
            fullName: "John Doe",
            phone: "555-555-5555",
            addressLine: "123 Main St",
            city: "Anytown",
            state: "CA",
            postalCode: "12345",
            country: "USA"
          }
        ]
      },
      {
        name: "Jane Doe",
        email: "jane@example.com",
        passwordHash: "$2a$10$2b2cU8CPhOTaGrs1HRQuAueS7JTT5ZHsHSzYiFPm1leZck7Mc8T4W",
        role: "customer",
        addresses: [
          {
            fullName: "Jane Doe",
            phone: "555-555-5555",
            addressLine: "456 Oak St",
            city: "Anytown",
            state: "CA",
            postalCode: "67890",
            country: "USA"
          }
        ]
      },
      {
        name: "Admin User",
        email: "admin@example.com",
        passwordHash: "$2a$10$2b2cU8CPhOTaGrs1HRQuAueS7JTT5ZHsHSzYiFPm1leZck7Mc8T4W",
        role: "admin",
        addresses: [
          {
            fullName: "Admin User",
            phone: "555-555-5555",
            addressLine: "789 Oak St",
            city: "Anytown",
            state: "CA",
            postalCode: "67890",
            country: "USA"
          }
        ]
      }
    ];

    const categories = [
      {
        name: "Electronics",
        slug: "electronics"
      },
      {
        name: "Clothing",
        slug: "clothing"    
      },
      {
        name: "Home",
        slug: "home"
      },
      {
        name: "Toys",
        slug: "toys"
      }
    ];

    const products = [
      {
        name: "Product 1",
        slug: "product-1",
        description: "This is a product description",
        price: 9,
        imageUrl: "https://via.placeholder.com/150",
        category: "6ab99988186df518b7aba853",
        stock: 10
      },
      {
        name: "Product 2",
        slug: "product-2",
        description: "This is a product description",
        price: 19,
        imageUrl: "https://via.placeholder.com/150",
        category: "6ab99988186df518b7aba853",
        stock: 10
      },
      {
        name: "Product 3",
        slug: "product-3",
        description: "This is a product description",
        price: 29,
        imageUrl: "https://via.placeholder.com/150",
        category: "6ab99988186df518b7aba853",
        stock: 10
      },
      {
        name: "Product 4",
        slug: "product-4",
        description: "This is a product description",
        price: 39,
        imageUrl: "https://via.placeholder.com/150",
        category: "6ab99988186df518b7aba853",
        stock: 10
      },
      {
        name: "Product 5",
        slug: "product-5",
        description: "This is a product description",
        price: 49,
        imageUrl: "https://via.placeholder.com/150",
        category: "6ab99988186df518b7aba853",
        stock: 10
      },
      {
        name: "Product 6",
        slug: "product-6",
        description: "This is a product description",
        price: 59,
        imageUrl: "https://via.placeholder.com/150",
        category: "6ab99988186df518b7aba853",
        stock: 10
      },
      {
        name: "Product 7",
        slug: "product-7",
        description: "This is a product description",
        price: 69,
        imageUrl: "https://via.placeholder.com/150",
        category: "6ab99988186df518b7aba853",
        stock: 10
      },
      {
        name: "Product 8",
        slug: "product-8",
        description: "This is a product description",
        price: 79,
        imageUrl: "https://via.placeholder.com/150",
        category: "6ab99988186df518b7aba853",
        stock: 10
      },
      {
        name: "Product 9",
        slug: "product-9",
        description: "This is a product description",
        price: 89,
        imageUrl: "https://via.placeholder.com/150",
        category: "6ab99988186df518b7aba853",
        stock: 10
      },
      {
        name: "Product 10",
        slug: "product-10",
        description: "This is a product description",
        price: 99,
        imageUrl: "https://via.placeholder.com/150",
        category: "6ab99988186df518b7aba853",
        stock: 10
      }
    ];
    
    const seedUsers = async (users) => {
      try {
        for (let i = 0; i < users.length; i++) {
          const user = new User(users[i]);
          await user.save().then(() => {
            console.log(`User ${user.name} seeded successfully`);
          });
        }
      } catch (error) {
        console.error("Failed to seed users:", error.message);
      }
    };

    const seedCategories = async (categories) => {
      try {
        for (let i = 0; i < categories.length; i++) {
          const category = new Category(categories[i]);
          await category.save().then(() => {
            console.log(`Category ${category.name} seeded successfully`);
          });
        }
      } catch (error) {
        console.error("Failed to seed categories:", error.message);
      }
    };

    const seedProducts = async (products) => {
      try {
        for (let i = 0; i < products.length; i++) {
          const product = new Product(products[i]);
          await product.save().then(() => {
            console.log(`Product ${product.name} seeded successfully`);
          });
        }
      } catch (error) {
        console.error("Failed to seed products:", error.message);
      }
    };
    await seedUsers(users);
    await seedCategories(categories);
    await seedProducts(products);

    console.log("Database seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed database:", error.message);
    process.exit(1);
  }
};
seed();