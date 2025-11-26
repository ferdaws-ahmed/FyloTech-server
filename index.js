const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const { ObjectId } = require("mongodb");

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
    // Connect to DB
    await client.connect();
    const db = client.db("FyloTechDB");

    // Collections
    const productsCollection = db.collection("products");
    const usersCollection = db.collection("users");

    console.log("🔥 Database Connected Successfully");

    // ===== Default Route =====
    app.get("/", (req, res) => {
      res.send("FyloTech Server Running ✔ DB Connected");
    });

    // =====  Get All Products =====
     app.get("/products", async (req, res) => {
      try {
        const result = await productsCollection.find().toArray();
        res.status(200).send(result);
      } catch (error) {
        res.status(500).send({ message: "Error fetching products", error });
      }
    });


// 3. Get Single Product By ID 
        app.get("/products/:id", async (req, res) => {
            const id = req.params.id;

           
            if (!ObjectId.isValid(id)) {
              
                console.warn(`Invalid ID format received: ${id}`);
                return res.status(400).send({ message: "Invalid product ID format" });
            }

            try {
                const product = await productsCollection.findOne({
                    _id: new ObjectId(id)
                });

                if (!product) {
                    
                    return res.status(404).send({ message: "Product not found" });
                }

                res.status(200).send(product);
            } catch (err) {
                console.error("Error fetching single product:", err);
                res.status(500).send({ message: "Error fetching product", error: err.message });
            }
        });

    // ===== Add User =====

app.post("/users", async (req, res) => {
  try {
    const userData = req.body;
    const existingUser = await usersCollection.findOne({ uid: userData.uid });
    if (!existingUser) {
      const result = await usersCollection.insertOne(userData);
      res.send({ success: true, insertedId: result.insertedId });
    } else {
      res.send({ success: true, message: "User already exists" });
    }
  } catch (error) {
    res.status(500).send({ success: false, error });
  }
});




// ===== Hero Data Route =====
app.get("/hero", async (req, res) => {
  try {
    const heroCollection = client.db("FyloTechDB").collection("herodata");
    const slides = await heroCollection.find().toArray();
    res.status(200).json(slides);
  } catch (err) {
    console.error("Error fetching hero data:", err);
    res.status(500).json({ message: "Failed to fetch hero data", error: err });
  }
});


//======= review data ======
app.get("/reviews", async (req, res) => {
  try {
    const reviewsCollection = client.db("FyloTechDB").collection("reviews");
    const result = await reviewsCollection.find().toArray();
    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ message: "Failed to fetch reviews", error: err });
  }
});

  

    // Start Server
    app.listen(port, () => {
      console.log(`🚀 Server Running at: http://localhost:${port}`);
    });
  } catch (error) {
    console.log("❌ MongoDB Connection Error:", error);
  }
}

run().catch(console.dir);
