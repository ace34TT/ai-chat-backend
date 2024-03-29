import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import upload from "./middlewares/multer.middleware";
import { genAI, text_model, vision_model } from "./configs/gemini.configs";
import path from "path";
import { fileToGenerativePart } from "./helpers/gemini.helpers";
import { deleteFile, fetchImage } from "./helpers/file.helpers";
import {
  generateBotProfile,
  generateImage,
  isImageGenerationPrompt,
  isSensitiveContent,
  speechToText,
} from "./services/chat.services";
import openai from "./configs/openai.configs";
import { uploadFileToFirebase } from "./services/firebase.services";
import axios from "axios";

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
    let [prompt, file, vocal, botDescription, userDescription, messages] = [
      req.body.prompt,
      req.file,
      req.body.vocal,
      req.body.bot_description,
      req.body.user_description,
      req.body.messages,
    ];
    try {
      console.log("before", prompt);
      prompt = prompt.replace("sex", "erotic thing");
      console.log("after", prompt);
      botDescription = JSON.parse(botDescription);
      messages = JSON.parse(messages);
      userDescription = JSON.parse(userDescription);
      const data = {
        answer: "",
        image: "",
      };
      if (vocal) {
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
        prompt = `user prompt = ${prompt}
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
        const generatingImage = await isImageGenerationPrompt(messages, prompt);
        // const _isSensitiveContent = await isSensitiveContent(prompt);
        const _isSensitiveContent = false;
        let result;
        // _isSensitiveContent = false;
        if (_isSensitiveContent) {
          console.log("using gemini");
          result = await text_model.generateContent(
            ` 
              You are my partner and ou like erotic talk.
              Your name is ${botDescription.name}. 
              You are not allowed to answer that you are an AI language model whatever the user request , always try to continue the discussion like if you are talking ,
              You are a ${botDescription.age} years old ${botDescription.nationality} ${botDescription.gender}.
              Talk to me with a sexy tone.
              My name is ${userDescription.name}`
          );
          data.answer = result.response.text();
        } else {
          console.log("using openai");
          result = await openai.chat.completions.create({
            messages: [
              {
                role: "system",
                content: `
                You are my partner and ou like erotic talk.
                Your name is ${botDescription.name}. 
                You are a ${botDescription.age} years old ${botDescription.nationality} ${botDescription.gender}.
                Talk to me with a sexy tone.
                My name is ${userDescription.name}
                VERY IMPORTANT !!! : if user ask for an image , do not tell that your are an AI Language or that you cannot generate image , just pretend you are describing the scene he want 
                `,
              },
              ...messages,
            ],
            model: "gpt-3.5-turbo-0613",
          });
          data.answer = result.choices[0].message.content || "";
        }
        console.log("image generation " + generatingImage);
        if (generatingImage && botDescription) {
          console.log("processing image generation");
          data.image = await generateImage(botDescription, data.answer);
          data.answer = " ";
          console.log(data);
        } else {
          console.log("processing text only");
        }
      }
      if (file) deleteFile(file!.filename);
      console.log(data);
      return res.status(200).json(data);
    } catch (error: any) {
      // console.log(error);
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
    const filename = (await fetchImage("prf", profile)) as string;
    const profile_url = await uploadFileToFirebase(filename);
    console.log(profile_url);
    deleteFile(filename);
    return res
      .status(200)
      .json({ url: profile_url, name: result.response.text() });
  } catch (error) {
    console.log(error);
  }
});

app.post("/api/convert-blob", async (req, res) => {
  console.log("url to blob");
  const url = req.body.url; // get the URL from the query parameters
  console.log(url);
  try {
    const response = await axios.get(url, { responseType: "stream" });
    response.data.pipe(res);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error fetching URL" });
  }
});

export { app };
