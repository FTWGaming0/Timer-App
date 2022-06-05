"use strict";
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
exports.background = void 0;
const cfg_mngr_1 = require("../cfg_mngr");
const apiserver_1 = require("../apiserver");
function background(data, socket) {
    return __awaiter(this, void 0, void 0, function* () {
        let currentTime = new Date();
        let timeString = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}:${currentTime.getSeconds().toString().padStart(2, '0')}.${currentTime.getMilliseconds().toString().padEnd(2, '0')}`;
        let args = data.toString().toLowerCase().split(" ");
        switch (args[0]) {
            case "get":
                socket.emit(`background`, `${cfg_mngr_1.configuration.bgUseImage}${(cfg_mngr_1.configuration.bgUseImage) ? (" " + cfg_mngr_1.configuration.bgImageLocal) : ("")}${(cfg_mngr_1.configuration.bgUseImage) ? (" " + cfg_mngr_1.configuration.bgHorizontal) : ("")} ${(cfg_mngr_1.configuration.bgUseImage) ? (cfg_mngr_1.configuration.bgImage) : (cfg_mngr_1.configuration.bgSolid)}`);
                socket.emit(`bgHU`, cfg_mngr_1.configuration.bgHorizontal);
                console.log(`\x1b[36m[BACKGROUND QUERY]\x1b[0m: IP: \x1b[33m${socket.client.conn.remoteAddress.replace("::ffff:", "")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m`);
                break;
            case "set":
                switch (args[1]) {
                    case "bgi":
                        if (args.length < 4) {
                            socket.emit(`error`, `Not enough arguments for background set.`);
                            console.log(`\x1b[31m[BACKGROUND SET FAIL]\x1b[0m: IP: \x1b[33m${socket.client.conn.remoteAddress.replace("::ffff:", "")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m REQ: \x1b[33m${data}\x1b[0m`);
                            return;
                        }
                        let _BGUI = false;
                        let _BGO2 = "";
                        try {
                            _BGUI = (args[2] == "true");
                            _BGO2 = String(args[3]);
                        }
                        catch (e) {
                            socket.emit(`error`, `Could not cast to boolean and string types with given parameters.`);
                            console.log(`\x1b[31m[BACKGROUND SET FAIL]\x1b[0m: IP: \x1b[33m${socket.client.conn.remoteAddress.replace("::ffff:", "")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m REQ: \x1b[33m${data}\x1b[0m`);
                            return;
                        }
                        if (_BGUI == true) {
                            console.log(`\x1b[32m[BACKGROUND SET SUCCESS]\x1b[0m: IP: \x1b[33m${socket.client.conn.remoteAddress.replace("::ffff:", "")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m REQ: \x1b[33m${data}\x1b[0m`);
                            apiserver_1.ioserver.emit(`background`, `${_BGUI} false ${cfg_mngr_1.configuration.bgHorizontal} ${_BGO2}`);
                            (0, cfg_mngr_1.update)({ bgUseImage: true, bgImage: _BGO2, bgImageLocal: false });
                        }
                        else {
                            console.log(`\x1b[32m[BACKGROUND SET SUCCESS]\x1b[0m: IP: \x1b[33m${socket.client.conn.remoteAddress.replace("::ffff:", "")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m REQ: \x1b[33m${data}\x1b[0m`);
                            apiserver_1.ioserver.emit(`background`, `${_BGUI} #${_BGO2}`);
                            (0, cfg_mngr_1.update)({ bgUseImage: false, bgSolid: `#${_BGO2}`, bgImageLocal: false });
                        }
                        break;
                    case "bgh":
                        if (args.length < 3) {
                            socket.emit(`error`, `Not enough arguments for background set.`);
                            console.log(`\x1b[31m[BACKGROUND-HORIZONTAL FAIL]\x1b[0m: IP: \x1b[33m${socket.client.conn.remoteAddress.replace("::ffff:", "")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m REQ: \x1b[33m${data}\x1b[0m`);
                            return;
                        }
                        let _BGH = (args[2] == "true");
                        console.log(`\x1b[32m[BACKGROUND-HORIZONTAL SUCCESS]\x1b[0m: IP: \x1b[33m${socket.client.conn.remoteAddress.replace("::ffff:", "")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m REQ: \x1b[33m${data}\x1b[0m`);
                        (0, cfg_mngr_1.update)({ bgHorizontal: _BGH });
                        apiserver_1.ioserver.emit(`bgHU`, _BGH);
                        break;
                }
                break;
        }
    });
}
exports.background = background;
