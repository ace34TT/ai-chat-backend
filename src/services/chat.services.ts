import { text_model } from "../configs/gemini.configs";
import openai from "../configs/openai.configs";
import { replicate } from "../configs/replicate.configs";

export const isImageGenerationPrompt = async (
  messages: any,
  _prompt: string
) => {
  console.log(
    "===========================Image gen check=================================="
  );
  const isImageGeneration = await text_model.generateContent(
    `
      check if this user prompt explicitly ask for photo or image , if so ignore the chat and answer with true
      user prompt : ${_prompt}
      if yes answer with this
      {
        response : true, 
        reason : reason to say yes or no ,
        _true : reason to say yes in % ,
        _false : reason to say no in %
      }
      if not , analyze the the following chat :
      chat : ${JSON.stringify(messages).replace("assistant", "partner")}
      check if it is good or not to append an image with the next partner answer according to the user last message/prompt?
      our goal is to make the user feel like if he/she is talking to real partner and the partner can send photo 
      also make sure to not send photo on every message 
      focus more on the user prompt instead of the previous chat 
      answer with json file as : 
      {
        response : true or false , 
        reason : reason to say yes or no ,
        _true : reason to say yes in % ,
        _false : reason to say no in %
      }
    `
  );
  let ans: any = "";
  try {
    ans = JSON.parse(isImageGeneration.response.text());
    console.log("===>", ans);
  } catch (error) {
    console.log("could not parse");
    ans = { response: "false" };
  }
  const validResponses = ["TRUE", "true", "0", "True", true];
  ans = "response" in ans && validResponses.includes(ans.response);
  console.log("final result " + ans);

  return ans;
};
export const isSensitiveContent = async (content: string) => {
  console.log(
    "===========================Sensitive check=================================="
  );
  const _isSensitiveContent = await text_model.generateContent(
    ` Tell me if the following content is about sexual content or not
      content : ${content}
      answer with json file as  : 
      {
        response : true or false , 
        reason : reason to say yes or no ,
        _true : reason to say yes in % ,
        _false : reason to say no in %
      }
    `
  );
  let ans: any = "";
  try {
    ans = JSON.parse(_isSensitiveContent.response.text());
    console.log("===>" + ans.response);
  } catch (error) {
    console.log("could not parse");
    ans = { response: "false" };
  }
  console.log(ans);
  const validResponses = ["TRUE", "true", "0", "True", true];
  ans = "response" in ans && validResponses.includes(ans.response);
  console.log("final result " + ans);
  return ans;
};
export const generateBotProfile = async (description: string) => {
  const primaryImage: any = await replicate.run(
    "fofr/realvisxl-v3:33279060bbbb8858700eb2146350a98d96ef334fcf817f37eb05915e1534aa1c",
    {
      input: {
        width: 1024,
        height: 1024,
        prompt: description,
        refine: "no_refiner",
        scheduler: "K_EULER",
        lora_scale: 0.6,
        num_outputs: 1,
        guidance_scale: 7.5,
        apply_watermark: false,
        high_noise_frac: 0.8,
        negative_prompt:
          "worst quality, low quality, illustration, 3d, 2d, painting, cartoons, sketch , bad anatomy",
        prompt_strength: 0.8,
        num_inference_steps: 25,
      },
    }
    // "stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
    // {
    //   input: {
    //     width: 768,
    //     height: 768,
    //     prompt:
    //       description +
    //       ", bright environment , simple background , face focused",
    //     scheduler: "K_EULER",
    //     num_outputs: 1,
    //     guidance_scale: 7.5,
    //     num_inference_steps: 50,
    //   },
    // }
  );
  console.log(primaryImage);
  // const output: any = await replicate.run(
  //   "tencentarc/photomaker:ddfc2b08d209f9fa8c1eca692712918bd449f695dabb4a958da31802a9570fe4",
  //   {
  //     input: {
  //       prompt: "a photo img " + description,
  //       num_steps: 50,
  //       style_name: "Photographic (Default)",
  //       input_image: primaryImage[0],
  //       num_outputs: 1,
  //       guidance_scale: 5,
  //       negative_prompt:
  //         "nsfw, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry",
  //       style_strength_ratio: 20,
  //     },
  //   }
  // );
  // console.log(output);
  return primaryImage[0];
};
export const generateImage = async (description: any, prompt: any) => {
  const output: any = await replicate.run(
    "tencentarc/photomaker:ddfc2b08d209f9fa8c1eca692712918bd449f695dabb4a958da31802a9570fe4",
    {
      input: {
        prompt:
          "A photo " +
          description.gender +
          " img " +
          prompt +
          " , generate only 1 person",
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
