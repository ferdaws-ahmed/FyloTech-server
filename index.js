const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");


// Express Setup
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());


// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.wtnhlvb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// MongoDB Client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Main Server Function
async function run() {
  try {
    await client.connect();
    const db = client.db("FyloTechDB");

    const productsCollection = db.collection("products");
    const myProductsCollection = db.collection("myproducts");
    const usersCollection = db.collection("users");

    console.log("🔥 Database Connected Successfully");

    // ===== Default Route =====
    app.get("/", (req, res) => {
      res.send("FyloTech Server Running ✔ DB Connected");
    });

    // ===== Get All Products =====
    app.get("/products", async (req, res) => {
      try {
        const result = await productsCollection.find().toArray();
        res.status(200).send(result);
      } catch (error) {
        res.status(500).send({ message: "Error fetching products", error });
      }
    });

    // ===== Get Single Product =====
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) return res.status(400).send({ message: "Invalid product ID format" });
      try {
        const product = await productsCollection.findOne({ _id: new ObjectId(id) });
        if (!product) return res.status(404).send({ message: "Product not found" });
        res.status(200).send(product);
      } catch (err) {
        res.status(500).send({ message: "Error fetching product", error: err.message });
      }
    });





    // ===== Add New Product =====
app.post("/products", async (req, res) => {
  try {
    const data = req.body;

    // insert into products
    const product = await productsCollection.insertOne(data);

    // insert same ID into myproducts
    const myProduct = {
      ...data,
      _id: product.insertedId  // same ID
    };

    await myProductsCollection.insertOne(myProduct);

    res.send({
      message: "Product added in both collections",
      id: product.insertedId
    });

  } catch (error) {
    res.status(500).send({ message: "Error adding product", error });
  }
});




// ===== Delete from products =====
app.delete("/products/:id", async (req, res) => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid ID format" });
  }

  try {
    const result = await productsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).send({ message: "Product not found in products collection" });
    }

    res.send({ message: "Deleted from products" });
  } catch (error) {
    res.status(500).send({ message: "Error deleting product", error });
  }
});





// ===== Delete from myproducts =====
app.delete("/myproducts/:id", async (req, res) => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid ID format" });
  }

  try {
    const result = await myProductsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).send({ message: "Product not found in myproducts collection" });
    }

    res.send({ message: "Deleted from myproducts" });
  } catch (error) {
    res.status(500).send({ message: "Error deleting product", error });
  }
});


   



// ===== Get My Products by Email =====
app.get("/myproducts/:email", async (req, res) => {
  const email = req.params.email;

  try {
    const result = await myProductsCollection.find({ sellerEmail: email }).toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Error fetching my products", error });
  }
});


    // ===== Hero & Reviews Routes (Optional) =====
    app.get("/hero", async (req, res) => {
      try {
        const heroCollection = db.collection("herodata");
        const slides = await heroCollection.find().toArray();
        res.status(200).json(slides);
      } catch (err) {
        res.status(500).json({ message: "Failed to fetch hero data", error: err });
      }
    });

    app.get("/reviews", async (req, res) => {
      try {
        const reviewsCollection = db.collection("reviews");
        const result = await reviewsCollection.find().toArray();
        res.status(200).json(result);
      } catch (err) {
        res.status(500).json({ message: "Failed to fetch reviews", error: err });
      }
    });

    // Start server
    app.listen(port, () => {
      console.log(`🚀 Server Running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
  }
}

run().catch(console.dir);
