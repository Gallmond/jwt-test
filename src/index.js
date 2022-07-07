"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importStar(require("./server"));
const helpers_1 = require("./helpers");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
setTimeout(() => {
    server_1.default.close();
}, 1000);
server_1.default.addListener('listening', () => {
    console.log('Server is listening');
    tests();
});
server_1.default.addListener('close', () => { console.log('Server is closing'); });
const getJson = (res) => {
    let body = res.data;
    if (res.headers['content-type'] === 'application/json') {
        body = JSON.parse(res.data);
    }
    return body;
};
const helloTest = () => __awaiter(void 0, void 0, void 0, function* () {
    const url = `http://${server_1.hostname}:${server_1.port}/hello`;
    const res = yield (0, helpers_1.request)('GET', url);
    console.log(`Got response from ${url}`);
    console.log({
        'data': res.data,
        'headers': res.headers
    });
    if (res.data !== 'hello world')
        throw new Error('Unexpected data');
});
const echoTest = () => __awaiter(void 0, void 0, void 0, function* () {
    const url = `http://${server_1.hostname}:${server_1.port}/echo`;
    const res = yield (0, helpers_1.request)('GET', url);
    console.log(`Got response from ${url}`);
    console.log({
        'data': res.data,
        'headers': res.headers
    });
    if (res.headers['content-type'] !== 'application/json')
        throw new Error('Unexpected header');
});
const postTest = () => __awaiter(void 0, void 0, void 0, function* () {
    const url = `http://${server_1.hostname}:${server_1.port}/echo`;
    const body = { foo: 'bar' };
    const res = yield (0, helpers_1.request)('POST', url, body);
    console.log(`Got response from ${url}`);
    console.log({
        'data': res.data,
        'headers': res.headers
    });
    if (JSON.parse(res.data).data !== JSON.stringify(body))
        throw new Error('Unexpected data');
});
const getTokenTest = () => __awaiter(void 0, void 0, void 0, function* () {
    const url = `http://${server_1.hostname}:${server_1.port}/login`;
    const body = {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
    };
    const res = yield (0, helpers_1.request)('POST', url, body);
    console.log(`Got response from ${url}`);
    console.log({
        'data': res.data,
        'headers': res.headers
    });
    return JSON.parse(res.data);
});
const verifyTokenTest = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `http://${server_1.hostname}:${server_1.port}/verifyToken`;
    const res = yield (0, helpers_1.request)('GET', url, {}, {
        'Authorization': `Bearer ${token}`
    });
    console.log(`Got response from ${url}`);
    console.log({
        'status': res.status,
        'data': res.data,
        'headers': res.headers
    });
    return res;
});
const tests = () => __awaiter(void 0, void 0, void 0, function* () {
    // check the hello world works
    yield helloTest();
    // check the echo works
    yield echoTest();
    // check a post with a body works
    yield postTest();
    // "log in" request a token, using the client_id and client_secret
    const token = yield getTokenTest();
    console.log({ token });
    // verify the token
    const verifyResponse = yield verifyTokenTest(token.token);
    const parsed = JSON.parse(verifyResponse.data);
    if (parsed.verifiedToken.authorised !== true)
        throw new Error('Token failed');
    /**
     * create a token that is 2 hours old. The tokens are only valid for an hour
     * so this should fail.
     */
    const oldToken = (0, helpers_1.createTwoHourOldJWT)();
    const failedVerifyResponse = yield verifyTokenTest(oldToken.token);
    if (failedVerifyResponse.status !== 401)
        throw new Error('Should have failed');
});
