import { replicate } from "../configs/replicate.configs";

export const generateBotProfile = async (description: string) => {
  const primaryImage: any = await replicate.run(
    "stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
    {
      input: {
        width: 768,
        height: 768,
        prompt: description + ", bright environment , simple background",
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
        prompt: description + " img in future neon light world",
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
export const generateImage = async (base_image: any, prompt: any) => {
  const output: any = await replicate.run(
    "stability-ai/stable-diffusion-img2img:15a3689ee13b0d2616e98820eca31d4c3abcd36672df6afce5cb6feb1d66087d",
    {
      input: {
        image: base_image,
        prompt: prompt,
        scheduler: "DPMSolverMultistep",
        num_outputs: 1,
        guidance_scale: 7.5,
        prompt_strength: 0.8,
        num_inference_steps: 25,
      },
    }
  );
  return output[0];
};
