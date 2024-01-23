import Replicate from "replicate";
require("dotenv").config();
const replicate = new Replicate({
  auth: process.env.REPLICATE_AUTH || "",
});

export { replicate };
