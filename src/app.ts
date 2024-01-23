import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import upload from "./middlewares/multer.middleware";
import { genAI, text_model, vision_model } from "./configs/gemini.configs";
import path from "path";
import { fileToGenerativePart } from "./helpers/gemini.helpers";
import { deleteFile } from "./helpers/file.helpers";
import { generateBotProfile, generateImage } from "./services/chat.services";

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
    const [prompt, file, botImage] = [
      req.body.prompt,
      req.file,
      req.body.botImage,
    ];
    try {
      const data = {
        answer: "",
        image: "",
      };
      if (file) {
        const imageParts = [
          fileToGenerativePart(
            path.resolve(tmpDirectory, file.filename),
            "image/jpeg"
          ),
        ];
        const result = await vision_model.generateContent([
          prompt,
          ...imageParts,
        ]);
        data.answer = result.response.text();
      } else {
        const isImageGeneration = await text_model.generateContent(
          "answer by true if the following sentences refers to an image generation and false if not : " +
            prompt
        );
        if (isImageGeneration.response.text() === "true" || botImage) {
          data.image = await generateImage(botImage, prompt);
        } else {
          const result = await text_model.generateContent(prompt);
          data.answer = result.response.text();
        }
      }

      if (file) deleteFile(file!.filename);
      return res.status(200).json(data);
    } catch (error) {
      console.log(error);
    }
  }
);

app.post("/api/generate-profile", async (req: Request, res: Response) => {
  const [description] = [req.body.description];
  if (!description) return res.status(400).send("Invalid request body");
  try {
    const profile = await generateBotProfile(description);
    return res.status(200).json({ url: profile });
  } catch (error) {
    console.log(error);
  }
});
app.post("/api/generate-image", async (req: Request, res: Response) => {
  const [prompt, image] = [req.body.prompt, req.body.image];
  console.log(prompt, image);
  if (!prompt || !image) return res.status(400).send("Invalid request body");
  try {
    const _image = await generateImage(image, prompt);
    return res.status(200).json({ url: _image });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
});
export { app };
