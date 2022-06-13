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
exports.yaml_update = exports.update = exports.init = exports.persist_data = exports.configuration = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const YAML = __importStar(require("yaml"));
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
exports.persist_data = {
    pastimgs: new Array(),
};
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
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
                        console.log(`[INITIALIZATION WARN] Configuration file ${path.join(process.cwd(), "./settings.conf")} missing. Writing default configurations in place of config file.`);
                        fs.writeFileSync(`./settings.conf`, JSON.stringify(exports.configuration));
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
                        return;
                    }
                    Object.keys(exports.configuration).forEach(key => {
                        if (filecontents[key] === undefined) {
                            console.log(`[INITIALIZATION INFO]: Config file missing ${key}. Using default value: ${exports.configuration[key]}`);
                            filecontents[key] = exports.configuration[key];
                        }
                        else {
                            exports.configuration[key] = filecontents[key];
                        }
                    });
                    fs.writeFileSync('./settings.conf', JSON.stringify(filecontents));
                    console.log(`[INITIALIZATION SUCCESS]: Settings file loaded successfully.`);
                }));
            }
            catch (e) {
                console.log(`Failed to access current directory. Settings configuration unreachable.\nExiting at code 5.`);
                process.exit(5);
            }
            try {
                fs.access('./persist_data.yml', (err) => __awaiter(this, void 0, void 0, function* () {
                    if (err) {
                        console.log(`[INITIALIZATION WARN] Data Persistence file ${path.join(process.cwd(), "./persist_data.yml")} missing. Writing default configurations.`);
                        fs.writeFileSync(`./persist_data.yml`, YAML.stringify(exports.persist_data));
                        return;
                    }
                    ;
                    console.log(`[INITIALIZATION INFO] Persistence file exists. Reading data from file.`);
                    let ymlcontents = {};
                    try {
                        ymlcontents = YAML.parse(fs.readFileSync(`./persist_data.yml`, `utf8`));
                    }
                    catch (e) {
                        console.log(`[INITIALIZATION ERROR] Unable to parse YAML from persistence file. Overwriting file with default configurations.`);
                        fs.writeFileSync(`./persist_data.yml`, YAML.stringify(exports.persist_data));
                        return;
                    }
                    Object.keys(exports.persist_data).forEach(key => {
                        if (ymlcontents[key] === undefined) {
                            console.log(`[INITIALIZATION INFO]: Config file missing ${key}. Using default value: ${exports.persist_data[key]}`);
                            ymlcontents[key] = exports.persist_data[key];
                        }
                        else {
                            exports.persist_data[key] = ymlcontents[key];
                        }
                        ;
                    });
                    pruneimgs();
                    fs.writeFileSync('./persist_data.yml', YAML.stringify(exports.persist_data));
                    console.log(`[INITIALIZATION SUCCESS]: Loaded persist_data.yml file.\n`);
                }));
            }
            catch (e) {
                console.log(`Failed to access persistence file. Assuming unreachable.\nExiting at code 5.`);
                process.exit(5);
            }
            resolve(exports.configuration);
        }));
    });
}
exports.init = init;
;
function update(configs) {
    return __awaiter(this, void 0, void 0, function* () {
        Object.keys(exports.configuration).forEach(key => { if (configs[key] !== undefined) {
            exports.configuration[key] = configs[key];
        } ; });
        fs.writeFileSync(`./settings.conf`, JSON.stringify(exports.configuration), `utf8`);
    });
}
exports.update = update;
function yaml_update(newvars) {
    return __awaiter(this, void 0, void 0, function* () {
        // Update persist_data with new data only if persist_data already contains key.
        Object.keys(exports.persist_data).forEach(key => { if (newvars[key] !== undefined) {
            exports.persist_data[key] = newvars[key];
        } ; });
        // Shift past image array until length <= 5 if length > 5
        pruneimgs();
        fs.writeFileSync(`persist_data.yml`, YAML.stringify(exports.persist_data), `utf8`);
    });
}
exports.yaml_update = yaml_update;
function pruneimgs() {
    if (exports.persist_data.pastimgs.length > 5) {
        for (let i = 0; i < exports.persist_data.pastimgs.length - 5; i++) {
            let targetname = exports.persist_data.pastimgs[i];
            fs.unlinkSync(`./public/uploads/${targetname}`);
            console.log(`Deleting ${targetname} from public/uploads folder`);
        }
        ;
    }
    ;
    for (let i = 0; i < 5; i++) {
        exports.persist_data.pastimgs.unshift(exports.persist_data.pastimgs.shift());
    }
    ;
    let lastfive = [];
    for (let i = 0; i < Math.min(5, exports.persist_data.pastimgs.length); i++) {
        let targetimg = exports.persist_data.pastimgs[exports.persist_data.pastimgs.length - 5 + i];
        if (targetimg !== null)
            lastfive.push(targetimg);
    }
    ;
    exports.persist_data.pastimgs = lastfive;
}
