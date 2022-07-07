"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.port = exports.hostname = void 0;
const http_1 = __importDefault(require("http"));
const helpers_1 = require("../helpers");
const hostname = '127.0.0.1';
exports.hostname = hostname;
const port = 3000;
exports.port = port;
const verifyToken = (req, res) => {
    if (!req.headers['authorization']) {
        res.writeHead(401);
        res.end('Missing authorization header');
        return;
    }
    const authHeader = req.headers['authorization'];
    const [, token] = authHeader.split(' ');
    const verified = (0, helpers_1.verifyJWT)(token);
    if (!verified) {
        res.writeHead(401);
        res.end('Invalid token');
        return;
    }
    const responseObject = {
        verifiedToken: verified
    };
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(responseObject));
};
const logIn = (req, res) => {
    let data = '';
    req.on('data', chunk => {
        data += chunk;
    });
    req.on('end', () => {
        const body = JSON.parse(data);
        const { client_id, client_secret } = body;
        if (client_id !== process.env.CLIENT_ID || client_secret !== process.env.CLIENT_SECRET) {
            res.writeHead(401);
            res.end('Unauthorized');
            return;
        }
        const tokenData = (0, helpers_1.createJWT)();
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(tokenData));
    });
};
const routes = {
    '/verifyToken': verifyToken,
    '/login': logIn,
    '/echo': (req, res) => {
        let data = '';
        req.on('data', chunk => {
            data += chunk;
        });
        req.on('end', () => {
            var _a;
            const parsedUrl = new URL((_a = req.url) !== null && _a !== void 0 ? _a : '', `http://${req.headers.host}`);
            const { href, origin, protocol, username, password, host, hostname, port, pathname, search, searchParams } = parsedUrl;
            const responseObject = {
                url: { href, origin, protocol, username, password, host, hostname, port, pathname, search, searchParams },
                data: data,
            };
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(responseObject));
        });
    },
    '/hello': (req, res) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('hello world');
    }
};
const server = http_1.default.createServer((req, res) => {
    var _a, _b, _c;
    const parsedUrl = new URL((_a = req.url) !== null && _a !== void 0 ? _a : '', `http://${req.headers.host}`);
    const handler = (_c = routes[(_b = parsedUrl.pathname) !== null && _b !== void 0 ? _b : '/hello']) !== null && _c !== void 0 ? _c : routes['/hello'];
    handler(req, res);
});
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
exports.default = server;
