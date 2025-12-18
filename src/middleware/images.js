import multer from "multer";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { HorizonConfig } from "../shared/config.js";
import { Response } from "../models/response.js";

const RAW_DIR = "./src/storage/images/raw";
const OPTIMIZED_DIR = "./src/storage/images/optimized";
[RAW_DIR, OPTIMIZED_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Multer storage genérico
export const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, RAW_DIR),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
export const upload = multer({ storage });

// Función que procesa la imagen y devuelve la URL
export const processImage = async (fileName, size = 900) => {
    const sourceFilePath = path.join(RAW_DIR, fileName);
    const destFilePath = path.join(OPTIMIZED_DIR, fileName.split(".")[0] + ".png");

    await sharp(sourceFilePath)
        .resize(size)
        .png({ compressionLevel: 9, force: true })
        .toFile(destFilePath);

    fs.unlink(sourceFilePath, err => { if (err) console.error("Error eliminando original:", err); });

    const API_PROTOCOL = HorizonConfig.getInstance().apiProtocol;
    const API_HOST = HorizonConfig.getInstance().apiHost;
    const API_PORT = HorizonConfig.getInstance().apiPort;
    const portPart = API_PORT ? `:${API_PORT}` : "";

    return `${API_PROTOCOL}://${API_HOST}${portPart}/api/images/${fileName.split(".")[0]}.png`;
};

export const addImageToBody = (fieldName = "imagen") => async (req, res, next) => {
    try {
        if (req.file) {
            const imageUrl = await processImage(req.file.filename);
            req.body.url_imagen = imageUrl;
        }
        next();
    } catch (err) {
        const errorResponse = new Response({
            body: err.message,
            status: 500,
            userId: req.user
        });
        res.status(errorResponse.getStatus()).send(errorResponse);
    }
};