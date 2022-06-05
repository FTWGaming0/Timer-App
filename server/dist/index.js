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
Object.defineProperty(exports, "__esModule", { value: true });
const os = __importStar(require("os"));
const cfg_mngr_1 = require("./cfg_mngr");
const apiserver_1 = require("./apiserver");
const open = require("open");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log(`[DEBUG]: Current Working Directory: ${process.cwd()}`);
        // console.log(`[DEBUG]: Directory Name: ${__dirname}`);
        // console.log(`[DEBUG]: Execution Path: ${process.execPath}`);
        console.log(`[MAIN_SCRIPT] Initializing configs.`);
        try {
            yield (0, cfg_mngr_1.init)();
        }
        catch (e) {
            process.exit(5);
        }
        console.log(`[MAIN_SCRIPT] Starting API Server.`);
        try {
            yield (0, apiserver_1.start)();
        }
        catch (e) {
            process.exit(5);
        }
        let nets = os.networkInterfaces();
        let results = Object.create(null);
        if (nets !== undefined) {
            for (const name of Object.keys(nets)) {
                for (const net of nets[name]) {
                    if (net.family === 'IPv4' && !net.internal) {
                        if (!results[name]) {
                            results[name] = [];
                        }
                        results[name].push(net.address);
                    }
                }
            }
        }
        let localips = "";
        let localamt = 0;
        Object.keys(results).forEach((netinterface) => {
            results[netinterface].forEach((localip) => {
                localamt += 1;
                localips += `\x1b[0m\n- \x1b[32mhttp://${localip}:${cfg_mngr_1.configuration.serverPort}\x1b[0m`;
            });
        });
        if (localamt === 1) {
            console.log(`\n\x1b[36mApplication is now being hosted at \x1b[32mhttp://${results[Object.keys(results)[0]][0]}:${cfg_mngr_1.configuration.serverPort}\x1b[0m\n`);
        }
        else if (localamt > 1) {
            console.log(`\n\x1b[33mThis computer has multiple Local IP addresses attributed to it.\n\x1b[36mApplication is now being hosted at port \x1b[32m3002\n\x1b[36m on the following addresses.${localips}\n`);
        }
        else {
            console.log(`\n\x1b[36mApplication is being hosted at port \x1b[32m${cfg_mngr_1.configuration.serverPort}\x1b[0m,\x1b[33m but the Local IP of this machine could not be determined.\x1b[0m\n`);
        }
        open(`http://localhost:${cfg_mngr_1.configuration.serverPort}`);
    });
}
run();
