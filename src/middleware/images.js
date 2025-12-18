import multer from "multer";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { HorizonConfig } from "../shared/config.js";
import { getValue, setValue } from "../utils.js";

sharp.cache(false);

const getStoragePaths = () => {
    const cfg = HorizonConfig.getInstance();

    return {
        RAW_DIR: cfg.files.rawDir ?? "./src/storage/files/raw",
        OPTIMIZED_DIR: cfg.files.optimizedDir ?? "./src/storage/files/optimized"
    };
};

const ensureDirs = () => {
    const { RAW_DIR, OPTIMIZED_DIR } = getStoragePaths();

    [RAW_DIR, OPTIMIZED_DIR].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });

    return { RAW_DIR, OPTIMIZED_DIR };
};

const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        const { RAW_DIR } = ensureDirs();
        cb(null, RAW_DIR);
    },
    filename: (_, file, cb) => {
        cb(
            null,
            `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`
        );
    }
});

export const upload = multer({ storage }).any();

export const processImage = async (filename, size = 900) => {
    const { RAW_DIR, OPTIMIZED_DIR } = ensureDirs();

    const src = path.join(RAW_DIR, filename);
    const name = path.parse(filename).name;
    const dest = path.join(OPTIMIZED_DIR, `${name}.png`);

    await sharp(src)
        .resize(size)
        .png({ compressionLevel: 9, force: true })
        .toFile(dest);

    fs.unlink(src, () => {});

    const cfg = HorizonConfig.getInstance();
    const port = cfg.apiPort ? `:${cfg.apiPort}` : "";

    return `${cfg.apiProtocol}://${cfg.apiHost}${port}/api/images/${name}.png`;
};

export const bindFilesToBody = (bindings = []) => async (req, res, next) => {
    try {

        if (req.body?.data) {
            try {
                req.body = JSON.parse(req.body.data);
            } catch (err) {
                return res.status(400).send({
                    body: "JSON inválido en campo 'data'",
                    error: err.message
                });
            }
        }

        if (!req.files?.length) return next();

        const filesByField = {};
        for (const file of req.files) {
            filesByField[file.fieldname] = file;
        }

        for (const rule of bindings) {

            // Campo simple
            if (!rule.multiple) {
                const file = filesByField[rule.file];
                if (file) {
                    setValue(
                        req.body,
                        rule.field,
                        await processImage(file.filename)
                    );
                }
                continue;
            }

            // Campo array
            const [arrayPath, prop] = rule.field.split("[].");
            const items = getValue(req.body, arrayPath);

            if (!Array.isArray(items)) continue;

            for (let i = 0; i < items.length; i++) {
                const key = rule.file.replace("*", i);
                const file = filesByField[key];

                if (file) {
                    items[i][prop] = await processImage(file.filename);
                }
            }
        }

        next();

    } catch (err) {
        res.status(500).send({
            body: "Error procesando archivos",
            error: err.message
        });
    }
};
