import { text_model } from "../configs/gemini.configs";
import { replicate } from "../configs/replicate.configs";

export const isImageGenerationPrompt = async (prompt: string) => {
  const isImageGeneration = await text_model.generateContent(
    `answer by true for the following case :
      - user asks for photo
      - user send a description
      - user ask for preference or something I like
          EJ : "do you like car ?" answer with true , our system will generate an image of a car 
      - user ask something in the past
          EJ : "Have you ever ride a horse" answer with true , 
    answer by false for any other case 
    user prompt : '${prompt} '`
  );
  return isImageGeneration.response.text();
};

export const generateBotProfile = async (description: string) => {
  const primaryImage: any = await replicate.run(
    "stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
    {
      input: {
        width: 768,
        height: 768,
        prompt:
          description +
          ", bright environment , simple background , face focused",
        scheduler: "K_EULER",
        num_outputs: 1,
        guidance_scale: 7.5,
        num_inference_steps: 50,
      },
    }
  );
  console.log(primaryImage);
  const output: any = await replicate.run(
    "tencentarc/photomaker:ddfc2b08d209f9fa8c1eca692712918bd449f695dabb4a958da31802a9570fe4",
    {
      input: {
        prompt: "a photo img " + description,
        num_steps: 50,
        style_name: "Photographic (Default)",
        input_image: primaryImage[0],
        num_outputs: 1,
        guidance_scale: 5,
        negative_prompt:
          "nsfw, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry",
        style_strength_ratio: 20,
      },
    }
  );
  console.log(output);
  return output[0];
};
export const generateImage = async (description: any, prompt: any) => {
  const output: any = await replicate.run(
    "tencentarc/photomaker:ddfc2b08d209f9fa8c1eca692712918bd449f695dabb4a958da31802a9570fe4",
    {
      input: {
        prompt: "A photo " + description.gender + " img " + prompt,
        num_steps: 50,
        style_name: "Photographic (Default)",
        input_image: description.image,
        num_outputs: 1,
        guidance_scale: 5,
        negative_prompt:
          "nsfw, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry",
        style_strength_ratio: 30,
      },
    }
  );
  console.log(output);
  return output[0];
};
export const speechToText = async (audio: any) => {
  const output: any = await replicate.run(
    "openai/whisper:4d50797290df275329f202e48c76360b3f22b08d28c196cbc54600319435f8d2",
    {
      input: {
        audio: audio,
        model: "large-v3",
        translate: false,
        temperature: 0,
        transcription: "plain text",
        suppress_tokens: "-1",
        logprob_threshold: -1,
        no_speech_threshold: 0.6,
        condition_on_previous_text: true,
        compression_ratio_threshold: 2.4,
        temperature_increment_on_fallback: 0.2,
      },
    }
  );
  console.log(output);
  return output.transcription;
};
