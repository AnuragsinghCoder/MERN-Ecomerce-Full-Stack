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
        name: "Electronics"
      },
      {
        name: "Clothing"
      },
      {
        name: "Home"
      },
      {
        name: "Toys"
      }
    ];

    const products = [
      {
        name: "Product 1",
        description: "This is a product description",
        price: 9.99,
        imageUrl: "https://via.placeholder.com/150",
        category: "electronics"
      },
      {
        name: "Product 2",
        description: "This is a product description",
        price: 19.99,
        imageUrl: "https://via.placeholder.com/150",
        category: "electronics"
      },
      {
        name: "Product 3",
        description: "This is a product description",
        price: 29.99,
        imageUrl: "https://via.placeholder.com/150",
        category: "electronics"
      },
      {
        name: "Product 4",
        description: "This is a product description",
        price: 39.99,
        imageUrl: "https://via.placeholder.com/150",
        category: "electronics"
      },
      {
        name: "Product 5",
        description: "This is a product description",
        price: 49.99,
        imageUrl: "https://via.placeholder.com/150",
        category: "electronics"
      },
      {
        name: "Product 6",
        description: "This is a product description",
        price: 59.99,
        imageUrl: "https://via.placeholder.com/150",
        category: "electronics"
      },
      {
        name: "Product 7",
        description: "This is a product description",
        price: 69.99,
        imageUrl: "https://via.placeholder.com/150",
        category: "electronics"
      },
      {
        name: "Product 8",
        description: "This is a product description",
        price: 79.99,
        imageUrl: "https://via.placeholder.com/150",
        category: "electronics"
      },
      {
        name: "Product 9",
        description: "This is a product description",
        price: 89.99,
        imageUrl: "https://via.placeholder.com/150",
        category: "electronics"
      },
      {
        name: "Product 10",
        description: "This is a product description",
        price: 99.99,
        imageUrl: "https://via.placeholder.com/150",
        category: "electronics"
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
    seedUsers(users);
    seedCategories(categories);
    seedProducts(products);

    console.log("Database seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed database:", error.message);
    process.exit(1);
  }
};
seed();