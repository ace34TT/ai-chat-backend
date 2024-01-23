import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import upload from "./middlewares/multer.middleware";
import { genAI, text_model, vision_model } from "./configs/gemini.configs";
import path from "path";
import { fileToGenerativePart } from "./helpers/gemini.helpers";
import { deleteFile } from "./helpers/file.helpers";

const tmpDirectory = path.resolve(__dirname, "tmp/");
const app = express();
app.use(
  cors({
    origin: true,
  })
);
app.use(bodyParser.json());

app.post(
  "/api/chat",
  upload.single("file"),
  async (req: Request, res: Response) => {
    const [prompt, file] = [req.body.prompt, req.file];
    try {
      let result;
      if (file) {
        const imageParts = [
          fileToGenerativePart(
            path.resolve(tmpDirectory, file.filename),
            "image/jpeg"
          ),
        ];
        result = await vision_model.generateContent([prompt, ...imageParts]);
      } else {
        result = await text_model.generateContent(prompt);
      }
      const response = result.response;
      const text = response.text();
      if (file) deleteFile(file!.filename);
      return res.status(200).json({ answer: text });
    } catch (error) {
      console.log(error);
    }
  }
);

export { app };
