const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const { syncUserId } = require("./syncUserId");

// Import routes
const accountRoutes = require("./accountRoutes");
const authRoutes = require("./authRoutes");
const passwordResetRoutes = require("./passwordResetRoutes");
const userRoutes = require("./userRoutes");

// CommonJS for multer and AWS SDK
const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

dotenv.config();
const app = express();

// Set up Multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Example route using multer & S3 (adjust as needed)
app.post("/api/posts", upload.single("userProfileCoverPhoto"), async (req, res) => {
  console.log("req.body", req.body);
  console.log("req.file", req.file);

  const bucketName = process.env.BUCKET_NAME;
  const BucketRegion = process.env.BUCKET_REGION;
  const accessKey = process.env.ACCESS_KEY;
  const secretAccessKey = process.env.SECRET_ACCESS_KEY;

  const s3 = new S3Client({
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretAccessKey,
    },
    region: BucketRegion,
  });

  const params = {
    Bucket: bucketName,
    Key: req.file.originalname, // Consider generating a unique filename here too.
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  };

  const command = new PutObjectCommand(params);

  try {
    await s3.send(command);
    res.send({ message: "Upload successful" });
  } catch (error) {
    console.error("Error uploading to S3:", error);
    res.status(500).send({ error: "Upload failed" });
  }
});

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(syncUserId);

// Routes
app.use("/", accountRoutes);
app.use("/", authRoutes);
app.use("/", passwordResetRoutes);
app.use("/", userRoutes);

// Import and use upload routes
const uploadRoutes = require("./uploadRoutes");
app.use(uploadRoutes);

const port = process.env.PORT || 8081;
app.listen(port, () => console.log(`Server running on port ${port}`));
