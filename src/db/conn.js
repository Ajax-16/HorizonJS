import { createPool } from "mysql2/promise";
import { HorizonConfig } from "../shared/config.js";

let conn;

export const getSqlConnection = () => {
    if (!conn) {
        const { dbConfig } = HorizonConfig.getInstance();
        conn = createPool(dbConfig);
    }
    return conn;
};