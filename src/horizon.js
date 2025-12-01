import { HorizonConfig } from './shared/config.js';
import express from "express";
import cors from "cors";
import bodyParser from "body-parser"

export const HorizonJS = (config) => {
    new HorizonConfig(config);
    const app = express();
    
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ extended: true, limit: '50mb', parameterLimit: 100000 }));
    app.use(cors());
    app.use(express.json());

    return app;
};
