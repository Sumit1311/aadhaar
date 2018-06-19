module.exports = class errorHandler {
    constructor(msg) {
        this.message = msg;
        return this;
    }
    setData(data) {
        this.data = data;
        return this;
    }
}

