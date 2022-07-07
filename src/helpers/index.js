"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTwoHourOldJWT = exports.verifyJWT = exports.createJWT = exports.request = void 0;
const http_1 = __importDefault(require("http"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const request = (method, url, postBody = {}, headers = {}) => {
    console.log(`called request(${method}, ${url}, ${JSON.stringify(postBody)})`);
    return new Promise((resolve, reject) => {
        var _a;
        const parsedURL = new URL(url);
        const options = {
            hostname: parsedURL.hostname,
            port: (_a = parsedURL.port) !== null && _a !== void 0 ? _a : 80,
            path: parsedURL.pathname + parsedURL.search,
            method: method,
        };
        if (Object.keys(headers)) {
            //@ts-ignore
            options['headers'] = headers;
        }
        const req = http_1.default.request(options, res => {
            let data = '';
            res.on('data', chunk => {
                data += chunk;
            });
            res.on('end', () => {
                const status = res.statusCode;
                const message = res.statusMessage;
                console.log(`status: ${status} message: ${message}`);
                resolve({ data, headers: res.headers, status });
            });
        });
        req.on('error', reject);
        method === 'POST' ? req.write(JSON.stringify(postBody)) : null;
        req.end();
    });
};
exports.request = request;
const verifyJWT = (token) => {
    var _a;
    let verified;
    try {
        verified = jsonwebtoken_1.default.verify(token, (_a = process.env.JWT_SECRET) !== null && _a !== void 0 ? _a : 'a secret', {
            clockTolerance: 20
        });
    }
    catch (e) {
        console.log('invalid token supplied');
        return false;
    }
    return verified;
};
exports.verifyJWT = verifyJWT;
const createTwoHourOldJWT = () => {
    var _a;
    const oneHourInSeconds = 60 * 60;
    const offset = oneHourInSeconds * 2;
    const nowInSeconds = Math.floor(Date.now() / 1000) - offset;
    const payload = {
        authorised: true,
        iat: nowInSeconds,
        exp: nowInSeconds + oneHourInSeconds, // expires in one hour
    };
    return {
        token: jsonwebtoken_1.default.sign(payload, (_a = process.env.JWT_SECRET) !== null && _a !== void 0 ? _a : 'a secret'),
        expiresIn: oneHourInSeconds,
        expiresAt: payload.exp,
        issuedAt: payload.iat,
    };
};
exports.createTwoHourOldJWT = createTwoHourOldJWT;
const createJWT = () => {
    var _a;
    const oneHourInSeconds = 60 * 60;
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const payload = {
        authorised: true,
        iat: nowInSeconds,
        exp: nowInSeconds + oneHourInSeconds, // expires in one hour
    };
    return {
        token: jsonwebtoken_1.default.sign(payload, (_a = process.env.JWT_SECRET) !== null && _a !== void 0 ? _a : 'a secret'),
        expiresIn: oneHourInSeconds,
        expiresAt: payload.exp,
        issuedAt: payload.iat,
    };
};
exports.createJWT = createJWT;
