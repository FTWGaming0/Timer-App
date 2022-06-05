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
exports.updatetimer = void 0;
const apiserver_1 = require("../apiserver");
const cfg_mngr_1 = require("../cfg_mngr");
function updatetimer(data, socket) {
    return __awaiter(this, void 0, void 0, function* () {
        let currentTime = new Date();
        let timeString = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}:${currentTime.getSeconds().toString().padStart(2, '0')}.${currentTime.getMilliseconds().toString().padEnd(2, '0')}`;
        let args = data.split(" ");
        switch (args[0]) {
            default:
                socket.emit(`error`, `Unknown Command`);
                console.log(`\x1b[31m[COMMAND UNKNOWN]\x1b[0m: IP: \x1b[33m${socket.conn.remoteAddress.replace("::ffff:", "")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m REQ: \x1b[33m${data}\x1b[0m`);
                break;
            case "query":
                socket.emit(`timer`, `${cfg_mngr_1.configuration.targetTime} ${Date.now()}`);
                console.log(`\x1b[36m[TIMER QUERY]\x1b[0m: IP: \x1b[33m${socket.client.conn.remoteAddress.replace("::ffff:", "")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m`);
                break;
            case "set":
                let setTime = 0;
                try {
                    setTime = Number(args[1]);
                }
                catch (e) {
                    console.log(`\x1b[31m[TIMER SET FAIL]\x1b[0m: IP: \x1b[33m${socket.client.conn.remoteAddress.replace("::ffff:", "")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m REQ: \x1b[33m${data}\x1b[0m`);
                    break;
                }
                let targetTime = setTime;
                console.log(`\x1b[36m[TIMER SET SUCCESS]\x1b[0m: IP: \x1b[33m${socket.client.conn.remoteAddress.replace("::ffff:", "")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m TIME: \x1b[36m${new Date(targetTime)}\x1b[0m REQ: \x1b[33m${data}\x1b[0m`);
                (0, cfg_mngr_1.update)({ targetTime: setTime });
                apiserver_1.ioserver.emit(`timer`, `${targetTime} ${Date.now()}`);
                break;
        }
        ;
    });
}
exports.updatetimer = updatetimer;
