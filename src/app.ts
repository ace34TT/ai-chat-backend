import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import upload from "./middlewares/multer.middleware";
import { genAI, text_model, vision_model } from "./configs/gemini.configs";
import path from "path";
import { fileToGenerativePart } from "./helpers/gemini.helpers";
import { deleteFile } from "./helpers/file.helpers";
import {
  generateBotProfile,
  generateImage,
  isImageGenerationPrompt,
  speechToText,
} from "./services/chat.services";

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
    let [prompt, file, vocal, botDescription] = [
      req.body.prompt,
      req.file,
      req.body.vocal,
      req.body.bot_description,
    ];
    try {
      botDescription = JSON.parse(botDescription);
      const data = {
        answer: "",
        image: "",
      };
      if (vocal) {
        console.log("processing vocal");
        const _prompt = await speechToText(vocal);
        prompt = _prompt;
      }
      if (file) {
        // image processing
        const imageParts = [
          fileToGenerativePart(
            path.resolve(tmpDirectory, file.filename),
            "image/jpeg"
          ),
        ];
        prompt = `
          user prompt = ${prompt}
          answer to the user 
          - as if you my partner by describing the image and relate it to my life
          - well structured you answer 
          - don't be poetic
          - talk as normal partner don't exaggerate with your emotion
          - do not use any variable
          - do not greet the user on every message 
        `;
        const result = await vision_model.generateContent([
          prompt,
          ...imageParts,
        ]);
        data.answer = result.response.text();
      } else {
        const generatingImage =
          (await isImageGenerationPrompt(prompt)) === "true";
        console.log("image generation " + generatingImage);
        if (generatingImage && botDescription) {
          const descriptivePrompt = await text_model.generateContent(
            `user prompt : ${prompt}
             generate a short description according to this prompt`
          );
          const result = await text_model.generateContent(
            ` user prompt : ${prompt}
              description : ${descriptivePrompt.response.text()}
             - don't be poetic
             - talk as normal partner don't exaggerate with your emotion
             - answer to the user question 
             - use lovely and charming tone  
             - answer as if you are a partner not a chat bot , 
             - don't be too emotional , 
             - do not use any variable , 
             - do not tell the tone of the message
             - kindly answer as if you are telling the user "here is a photo of me ...." , 
             - do not include caption , 
             - be briefe , don\' give too much description , 
             - do not greet the user on every message 
             - focus more and on the user question 
             `
          );
          data.answer = result.response.text();
          data.image = await generateImage(
            botDescription,
            descriptivePrompt.response.text()
          );
          console.log(data);
        } else {
          const result = await text_model.generateContent(
            ` user prompt = ${prompt}
               - answer as if you are my partner not a chat bot ,
               - don't be poetic
               - use lovely and charming tone  
               - talk as normal partner don't exaggerate
               - don't be too emotional
               - do not use any variable  
               - do not tell the tone of the message
               - talk as normal partner don't exaggerate with your emotion
               - do not greet the user on every message 
               `
          );
          data.answer = result.response.text();
        }
      }
      if (file) deleteFile(file!.filename);
      return res.status(200).json(data);
    } catch (error: any) {
      console.log(error);
      console.trace(error);

      return res.status(500).send("internal error: " + error.message);
    }
  }
);

app.post("/api/generate-profile", async (req: Request, res: Response) => {
  const [description] = [req.body.description];
  if (!description) return res.status(400).send("Invalid request body");
  const result = await text_model.generateContent(
    "give a name for this character : " + description
  );
  console.log({ name: result.response.text() });
  try {
    const profile = await generateBotProfile(description);
    return res.status(200).json({ url: profile, name: result.response.text() });
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
