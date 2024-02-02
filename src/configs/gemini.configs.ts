import { GoogleGenerativeAI, TaskType } from "@google/generative-ai";
require("dotenv").config();

const GOOGLE_API_KEY = process.env["GOOGLE_API_KEY"];

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY!);
const text_model = genAI.getGenerativeModel({ model: "models/gemini-pro" });
const vision_model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
const embedModel = genAI.getGenerativeModel({ model: "models/embedding-001" });

export { genAI, text_model, vision_model, embedModel };
