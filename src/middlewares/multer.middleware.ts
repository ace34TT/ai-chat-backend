import multer from "multer";
import path from "path";
import { folderGuard } from "../helpers/file.helpers";
const tempDirectory = path.resolve(__dirname, "../tmp/");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    folderGuard();
    cb(null, tempDirectory);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const originalExtension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + originalExtension);
  },
});

const upload = multer({ storage: storage });

export default upload;
