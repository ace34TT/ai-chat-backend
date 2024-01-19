import { GoogleGenerativeAI, TaskType } from "@google/generative-ai";
require("dotenv").config();

const GOOGLE_API_KEY = process.env["GOOGLE_API_KEY"];

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: "models/gemini-pro" });
const embedModel = genAI.getGenerativeModel({ model: "models/embedding-001" });

export { embedModel, model, genAI };
