// uploadRoutes.js
const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const mysql = require("mysql2/promise");

const router = express.Router();

// Ensure cookie-parser middleware is applied in your main Express app
// e.g., app.use(cookieParser());

// Set up Multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// AWS S3 configuration from environment variables
const bucketName = process.env.BUCKET_NAME;
const region = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: region,
});

// Set up a MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,      // e.g., "localhost"
  user: process.env.DB_USER,      // your database user
  password: process.env.DB_PASS,  // your database password
  database: process.env.DB_NAME,  // your database name
});

router.post("/api/uploadProfilePhoto", upload.single("profilePhoto"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    // Retrieve the user ID from the cookie named "userId"
    const userId = req.cookies && req.cookies.userId;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Generate a unique filename to avoid overwrites
    const fileExtension = req.file.originalname.split(".").pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;

    // Resize the image (e.g., to 300x300 pixels)
    const resizedImageBuffer = await sharp(req.file.buffer)
      .resize(300, 300, { fit: "cover" })
      .toBuffer();

    // Upload the resized image to S3
    const params = {
      Bucket: bucketName,
      Key: uniqueFileName,
      Body: resizedImageBuffer,
      ContentType: req.file.mimetype,
    };

    await s3.send(new PutObjectCommand(params));

    // Save the file key in the database for this user.
    await pool.query("UPDATE users SET profilePhoto = ? WHERE id = ?", [uniqueFileName, userId]);

    // Create a signed URL valid for 1 hour so the image can be displayed immediately
    const getObjectParams = {
      Bucket: bucketName,
      Key: uniqueFileName,
    };

    const signedUrl = await getSignedUrl(
      s3,
      new GetObjectCommand(getObjectParams),
      { expiresIn: 3600 }
    );

    res.json({ imageUrl: signedUrl, key: uniqueFileName });
  } catch (error) {
    console.error("Error uploading profile photo:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET endpoint to retrieve the user's profile photo
router.get("/api/getProfilePhoto", async (req, res) => {
    try {
      // Retrieve the user ID from the cookie named "userId"
      const userId = req.cookies && req.cookies.userId;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
  
      // Query the database for the user's profilePhoto key
      const [rows] = await pool.query("SELECT profilePhoto FROM users WHERE id = ?", [userId]);
      if (rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const profilePhotoKey = rows[0].profilePhoto;
      if (!profilePhotoKey) {
        // No photo uploaded, return a default image URL (or null)
        return res.json({ imageUrl: '/default-profile.png' });
      }
  
      // Generate a signed URL for the stored S3 key
      const getObjectParams = {
        Bucket: bucketName,
        Key: profilePhotoKey,
      };
  
      const signedUrl = await getSignedUrl(
        s3,
        new GetObjectCommand(getObjectParams),
        { expiresIn: 3600 }
      );
  
      res.json({ imageUrl: signedUrl });
    } catch (error) {
      console.error("Error retrieving profile photo:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // --- In uploadRoutes.js ---
router.post("/api/uploadCoverPhoto", upload.single("coverPhoto"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    // Retrieve the user ID from the cookie named "userId"
    const userId = req.cookies && req.cookies.userId;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Generate a unique filename
    const fileExtension = req.file.originalname.split(".").pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;

    // Resize the image to typical cover dimensions (e.g., 1200x300)
    const resizedImageBuffer = await sharp(req.file.buffer)
      .resize(1200, 300, { fit: "cover" })
      .toBuffer();

    // Upload to S3
    const params = {
      Bucket: bucketName,
      Key: uniqueFileName,
      Body: resizedImageBuffer,
      ContentType: req.file.mimetype,
    };

    await s3.send(new PutObjectCommand(params));

    // Save the file key in the database for the cover photo
    await pool.query("UPDATE users SET coverPhoto = ? WHERE id = ?", [uniqueFileName, userId]);

    // Generate a signed URL valid for 1 hour
    const getObjectParams = { Bucket: bucketName, Key: uniqueFileName };
    const signedUrl = await getSignedUrl(
      s3,
      new GetObjectCommand(getObjectParams),
      { expiresIn: 3600 }
    );

    res.json({ imageUrl: signedUrl, key: uniqueFileName });
  } catch (error) {
    console.error("Error uploading cover photo:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/api/getCoverPhoto", async (req, res) => {
  try {
    // Retrieve the user ID from the cookie named "userId"
    const userId = req.cookies && req.cookies.userId;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Query the database for the user's coverPhoto key
    const [rows] = await pool.query("SELECT coverPhoto FROM users WHERE id = ?", [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const coverPhotoKey = rows[0].coverPhoto;
    if (!coverPhotoKey) {
      // No cover photo uploaded; return a default URL (or null)
      return res.json({ imageUrl: '/default-cover.png' });
    }

    // Generate a signed URL
    const getObjectParams = { Bucket: bucketName, Key: coverPhotoKey };
    const signedUrl = await getSignedUrl(
      s3,
      new GetObjectCommand(getObjectParams),
      { expiresIn: 3600 }
    );

    res.json({ imageUrl: signedUrl });
  } catch (error) {
    console.error("Error retrieving cover photo:", error);
    res.status(500).json({ message: "Server error" });
  }
});

  

module.exports = router;
