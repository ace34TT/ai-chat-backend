import expressListRoutes from "express-list-routes";
import { app } from "./app";
import cron from "node-cron";
import { Query, FieldValue } from "@google-cloud/firestore";
import { firebase } from "./configs/firebase.configs";
import { text_model } from "./configs/gemini.configs";
const firestore = firebase.firestore();
const port = process.env.PORT || 3000;
// cron.schedule("*/30 * * * *", async () => {
//   const oneMinuteAgo = new Date(Date.now() - 7200 * 1000); // 1 minute ago
//   const result = await text_model.generateContent(
//     "generate a message to kindly as the user if he/she still there , act like if you are his / her partner, give directly the message do not use any variable and do not take part fo the answer , do not use quotes"
//   );
//   const response = result.response;
//   const text = response.text();
//   firestore
//     .collection("chats")
//     .where("last_update", "<", oneMinuteAgo)
//     .get()
//     .then((snapshot) => {
//       if (snapshot.empty) {
//         console.log("No matching documents.");
//         return;
//       }
//       snapshot.forEach((doc) => {
//         console.log(doc.id, "=>", doc.data());

//         firestore
//           .collection("chats")
//           .doc(doc.id)
//           .update({
//             conversations: FieldValue.arrayUnion({
//               content: text,
//               type: "assistant",
//               created_at: new Date(),
//             }),
//           });
//       });
//     })
//     .catch((err) => {
//       console.log("Error getting documents", err);
//     });

//   console.log("running a task every minute");
// });
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  expressListRoutes(app);
});
