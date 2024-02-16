import { firebase } from "../configs/firebase.configs";
import path from "path";
const tempDirectory = path.resolve(__dirname, "../tmp/");
export const uploadFileToFirebase = async (
  filename: string,
  folder: string = "profiles"
) => {
  const bucket = firebase.storage().bucket();
  await bucket.upload(path.resolve(tempDirectory, filename), {
    destination: folder + "/" + filename,
  });
  const fileRef = bucket.file(folder + "/" + filename);
  await fileRef.makePublic();
  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileRef.name}`;
  return publicUrl;
};
