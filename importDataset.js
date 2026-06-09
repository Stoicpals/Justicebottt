import mongoose from "mongoose";
import fs from "fs";
import csv from "csv-parser"; // For .csv import
import dotenv from "dotenv";

dotenv.config();

mongoose
  .connect("mongodb://127.0.0.1:27017/justicebot")
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ Connection Error:", err));

const legalSchema = new mongoose.Schema({
  description: String,
  offense: String,
  punishment: String,
  section: String,
});

const Legal = mongoose.model("Legal", legalSchema);


const filePath = "./dataset.csv"; // or ./dataset.xlsx.csv depending on your file name


const results = [];
fs.createReadStream(filePath)
  .pipe(csv())
  .on("data", (data) => results.push(data))
  .on("end", async () => {
    try {
      await Legal.insertMany(results);
      console.log(`✅ Successfully imported ${results.length} records.`);
      mongoose.connection.close();
    } catch (error) {
      console.error("❌ Error importing data:", error);
      mongoose.connection.close();
    }
  });
