import { createPool } from "mysql2/promise"
import { HorizonConfig } from "../shared/config.js";

const { dbConfig } = HorizonConfig.getInstance();

const conn = createPool(dbConfig);

export { conn };