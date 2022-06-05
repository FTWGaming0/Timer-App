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
exports.update = exports.init = exports.configuration = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
exports.configuration = {
    targetTime: Date.now() + 3600000,
    bgUseImage: false,
    bgImage: "",
    bgHorizontal: true,
    bgImageLocal: false,
    bgSolid: "3333ff",
    serverPort: 3002,
    timerColor: "ffffff",
    timerSize: 16,
    endTxt: "END",
    title: "TIMER TITLE",
    titleCol: "fff",
    endCol: "fff",
};
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(path.join(process.cwd(), './public'))) {
                console.log(`[INITIALIZATION WARN]: Public folder missing. Creating new directory.`);
                fs.mkdir(path.join(process.cwd(), './public'), (err) => {
                    if (err)
                        console.log(`[INITIALIZATION ERROR] Creating public folder failed with code [${err.code}]. Application can continue but background uploads will fail.`);
                    else {
                        console.log(`[INITIALIZATION INFO]: Public folder created successfully, Creating Uploads folder.`);
                        fs.mkdir(path.join(process.cwd(), './public/uploads'), (err) => {
                            if (err)
                                console.log(`\x1b[33m[INITIALIZATION ERROR] Creating uploads folder failed with code [${err.code}]. Application can continue but background uploads will fail.`);
                            else
                                console.log(`[INITIALIZATION INFO]: Uploads folder created successfully.`);
                        });
                    }
                    ;
                });
            }
            try {
                fs.access('./settings.conf', (err) => __awaiter(this, void 0, void 0, function* () {
                    if (err) {
                        console.log(`[INITIALIZATION WARN] Configuration file ${path.join(__dirname, "./settings.conf")} missing. Writing default configurations in place of config file.`);
                        fs.writeFileSync(`./settings.conf`, JSON.stringify(exports.configuration));
                        resolve(exports.configuration);
                        return;
                    }
                    ;
                    console.log(`[INITIALIZATION INFO] Configuration file exists. Reading settings from file.`);
                    let filecontents = {};
                    try {
                        filecontents = JSON.parse(fs.readFileSync(`./settings.conf`, `utf8`));
                    }
                    catch (e) {
                        console.log(`[INITIALIZATION ERROR] Unable to parse JSON from settings config. Overwriting file with default configurations.`);
                        fs.writeFileSync(`./settings.conf`, JSON.stringify(exports.configuration));
                        resolve(exports.configuration);
                        return;
                    }
                    Object.keys(exports.configuration).forEach(key => {
                        if (filecontents[key] === undefined) {
                            console.log(`[INITIALIZATION INFO] Config file missing ${key}. Using default value: ${exports.configuration[key]}`);
                            filecontents[key] = exports.configuration[key];
                        }
                        else {
                            exports.configuration[key] = filecontents[key];
                        }
                    });
                    fs.writeFileSync('./settings.conf', JSON.stringify(filecontents));
                    console.log(`[INITIALIZATION SUCCESS]: Current Configuraitons\n\n`, exports.configuration, `\n`);
                    resolve(exports.configuration);
                }));
            }
            catch (e) {
                console.log(`Failed to access current directory. Settings configuration unreachable.\nExiting at code 5.`);
                reject(e);
            }
        });
    });
}
exports.init = init;
;
function update(configs) {
    return __awaiter(this, void 0, void 0, function* () {
        Object.keys(exports.configuration).forEach(key => { if (configs[key] !== undefined) {
            exports.configuration[key] = configs[key];
        } ; });
        fs.writeFileSync(`./settings.conf`, JSON.stringify(exports.configuration));
    });
}
exports.update = update;
