export class HorizonConfig {

    constructor({logLevel, dbConfig, apiConfig, jwtSecret, emailConfig} = {}) {
        if (HorizonConfig.instance) return HorizonConfig.instance;

        this.logLevel = logLevel || 'ERROR';
        this.dbConfig = dbConfig || {
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: '',
            database: ''
        };
        this.apiProtocol = apiConfig.protocol || 'http';
        this.apiHost =  apiConfig.host || 'localhost';
        this.apiPort =  apiConfig.port || 3000;
        this.jwtSecret = jwtSecret || 'secret_jwt_key';
        this.emailConfig = emailConfig || {
            user: '',
            password: ''
        };

        HorizonConfig.instance = this;
    }

    static getInstance() {
        if (!HorizonConfig.instance) {
            // Si nadie creó config aún, inicializa con valores por defecto
            new HorizonConfig();
        }
        return HorizonConfig.instance;
    }
}