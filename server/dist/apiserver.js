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
exports.start = exports.ioserver = exports.httpserver = void 0;
const cfg_mngr_1 = require("./cfg_mngr");
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const socketio = __importStar(require("socket.io"));
const http = __importStar(require("http"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const fileUpload = require("express-fileupload");
const apiserver = (0, express_1.default)();
exports.httpserver = http.createServer(apiserver);
apiserver.use((0, helmet_1.default)({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
}));
apiserver.use((0, cors_1.default)({
    origin: "*"
}));
apiserver.use(fileUpload());
apiserver.use(express_1.default.static(path.join(__dirname, '../public')));
apiserver.use(express_1.default.static(path.join(process.cwd(), './public')));
apiserver.post('/upload', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.files) {
        let file = req.files.File;
        if (!fs.existsSync(path.join(process.cwd(), './public/uploads'))) {
            console.log(`\x1b[33m[API WARN]\x1b[0m: Uploads folder doesn't exists. Creating new directory.`);
            fs.mkdir(path.join(process.cwd(), './public/uploads'), (err) => {
                if (err)
                    console.log(`\x1b[31m[API ERROR]\x1b[0m: There was a problem creating Uploads directory. If this problem persists, try making one yourself or check permissions.`);
                else
                    console.log(`\x1b[36m[API SERVER]\x1b[0m: Created Uploads directory.`);
            });
        }
        fs.access(path.join(process.cwd(), `./public/uploads/${file.name}`), (err) => {
            if (err) {
                console.log(`\x1b[32m[API UPLOAD]\x1b[0m: \x1b[36m${file.name}\x1b[0m \x1b[33m${file.size}\x1b[0m`);
                fs.writeFile(path.join(process.cwd(), `./public/uploads/${file.name}`), file.data, () => {
                    console.log(`\x1b[32mFile Upload Complete.\x1b[0m`);
                    (0, cfg_mngr_1.update)({ bgImage: file.name, bgImageLocal: true, bgUseImage: true });
                    exports.ioserver.emit(`background`, `true true ${cfg_mngr_1.configuration.bgHorizontal} ${file.name}`);
                    res.write(`File Upload Complete`);
                    res.end();
                });
                return;
            }
            exports.ioserver.emit(`background`, `true true ${cfg_mngr_1.configuration.bgHorizontal} ${file.name}`);
            (0, cfg_mngr_1.update)({ bgImage: file.name, bgImageLocal: true, bgUseImage: true });
            res.write(`File already exists in server directory with requested file name.`);
            res.end();
            return;
        });
        return;
    }
    res.write(`Upload did not contain files.`);
    res.end();
}));
exports.ioserver = new socketio.Server(exports.httpserver, { cors: { origin: "*" } });
exports.ioserver.on(`connection`, (socket) => {
    let currentTime = new Date();
    let timeString = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}:${currentTime.getSeconds().toString().padStart(2, '0')}.${currentTime.getMilliseconds().toString().padEnd(2, '0')}`;
    console.log(`\x1b[1m\x1b[32m[SOCKET CONNECT]\x1b[0m: New Connection from \x1b[33m${socket.conn.remoteAddress.replace("::ffff:", "")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m`);
    socket.on(`updatetimer`, (data) => { require("./socketevents/updatetimer").updatetimer(data, socket); });
    socket.on(`ping`, () => { socket.emit(`ping`, Date.now()); });
    socket.on(`background`, (data) => { require('./socketevents/background').background(data, socket); });
    socket.on(`debug`, (data) => { require(`./socketevents/debug`).debug(data); });
    socket.on(`updatedisp`, (data) => { require('./socketevents/updatedisp').updatedisp(data, socket); });
    socket.on(`title`, (data) => { require('./socketevents/title').title(data, socket); });
    socket.on(`disconnect`, () => {
        currentTime = new Date();
        timeString = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}:${currentTime.getSeconds().toString().padStart(2, '0')}.${currentTime.getMilliseconds().toString().padEnd(2, '0')}`;
        console.log(`\x1b[1m\x1b[31m[SOCKET DISCONNECT]\x1b[0m: Disconnection from \x1b[33m${socket.conn.remoteAddress.replace("::ffff:", "")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m`);
    });
});
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                exports.httpserver.listen(cfg_mngr_1.configuration.serverPort, () => {
                    console.log(`[API Server] Online.`);
                    resolve(true);
                });
            }
            catch (e) {
                console.log(`[API Server] Failed to start.`);
                reject(e);
            }
        }));
    });
}
exports.start = start;
