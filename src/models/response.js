export class Response {

    constructor({body = null, status = 200, userId = null}) {
        this.body = body;
        this.status = status;
        this.userId = userId
    }
    getBody() {
        return this.body;
    }
    getStatus() {
        return this.status;
    }
    getUserId() {
        return this.userId;
    }
    setBody(body) {
        this.body = body;
    }
    setStatus(status) {
        this.status = status;
    }
    setUserId(userId) {
        this.userId = userId;
    }

}