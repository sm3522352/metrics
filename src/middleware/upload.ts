import multer from "multer"
import type { Request } from "express"
import { config } from "../config/app"

const storage = multer.memoryStorage()

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (config.upload.allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error("Invalid file type. Only CSV and Excel files are allowed."))
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
  },
})
