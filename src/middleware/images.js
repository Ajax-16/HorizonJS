import multer from "multer";
import sharp from "sharp";
import fs from "fs";
import { Response } from "../models/response.js";
import { HorizonConfig } from "../shared/config.js";

const API_PROTOCOL = HorizonConfig.getInstance().apiProtocol;
const API_HOST = HorizonConfig.getInstance().apiHost;
const API_PORT = HorizonConfig.getInstance().apiPort;

sharp.cache(false);

const RAW_DIR = "./src/storage/images/raw";
const OPTIMIZED_DIR = "./src/storage/images/optimized";

// Asegurar que los directorios existen
[RAW_DIR, OPTIMIZED_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const processImage = async (fileName, description, size = 900) => {
    try {
        const sourceFilePath = `${RAW_DIR}/${fileName}`;
        const destFilePath = `${OPTIMIZED_DIR}/${fileName.split(".").shift()}.png`;
        const portPart = API_PORT ? `:${API_PORT}` : "";
        const imageUrl = `${API_PROTOCOL}://${API_HOST}${portPart}/api/images/${fileName.split(".").shift()}.png`;

        await sharp(sourceFilePath)
            .png({ compressionLevel: 9, adaptiveFiltering: true, force: true })
            .withMetadata()
            .resize(size)
            .toFile(destFilePath);

        await insertImageUrl({ url: imageUrl, description });

        // Eliminar imagen original después de procesarla
        fs.unlink(sourceFilePath, (err) => {
            if (err) console.error("Error eliminando archivo original:", err);
        });

        return imageUrl;
    } catch (err) {
        console.error("Error procesando imagen:", err);
        throw err;
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, RAW_DIR),
    filename: (req, file, cb) => cb(null, `${file.originalname}`)
});

const upload = multer({ storage });

const uploadImage = async (req, res) => {
    try {
        const description = req.body.description || "";
        await Promise.all(req.files.map(file => processImage(file.filename, description)));

        res.send(new Response({
            body: "Imágenes subidas y procesadas con éxito",
            status: 200,
            userId: req.user
        }));
    } catch (err) {
        res.status(500).send(new Response({
            body: "Error al procesar las imágenes",
            status: 500,
            userId: req.user
        }));
    }
};

const deleteImage = async (req, res) => {
    try {
        const { url } = req.params;

        const fileName = url.split("/").pop();
        const filePath = `${OPTIMIZED_DIR}/${fileName}`;

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

    } catch (err) {
        console.error("Error eliminando imagen:", err);
        res.status(500).send(new Response({
            body: "Error al eliminar la imagen",
            status: 500,
            userId: req.user
        }));
    }
};


export { getAllImages, getImagesCount, deleteImage, upload, uploadImage, getElementImages, associateImage, deleteAssociateImage };
