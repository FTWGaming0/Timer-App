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
exports.updatedisp = void 0;
const cfg_mngr_1 = require("../cfg_mngr");
const apiserver_1 = require("../apiserver");
function updatedisp(data, socket) {
    return __awaiter(this, void 0, void 0, function* () {
        let currentTime = new Date();
        let timeString = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}:${currentTime.getSeconds().toString().padStart(2, '0')}.${currentTime.getMilliseconds().toString().padEnd(2, '0')}`;
        let args = data.toString().split(" ");
        switch (args.shift()) {
            case "query":
                socket.emit(`display`, `${cfg_mngr_1.configuration.timerColor} ${cfg_mngr_1.configuration.timerSize} ${cfg_mngr_1.configuration.endCol} ${cfg_mngr_1.configuration.endTxt}`);
                console.log(`\x1b[36m[DISPLAY QUERY]\x1b[0m: IP: \x1b[33m${socket.client.conn.remoteAddress.replace("::ffff:", "")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m`);
                break;
            case "set":
                if (args.length < 3) {
                    socket.emit(`error`, `Not enough arguments (Requires 3)`);
                    console.log(`\x1b[31m[DISPLAY SET FAIL]\x1b[0m: IP: \x1b[33m${socket.client.conn.remoteAddress.replace("::ffff:", "")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m REQ: \x1b[33m${data}\x1b[0m`);
                    return;
                }
                try {
                    Number(args[1]);
                }
                catch (e) {
                    socket.emit(`error`, `Couldn't convert ${args[1]} to Number`);
                    console.log(`\x1b[31m[DISPLAY SET FAIL]\x1b[0m: IP: \x1b[33m${socket.client.conn.remoteAddress.replace("::ffff:", "")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m REQ: \x1b[33m${data}\x1b[0m`);
                    return;
                }
                args[0] = args[0].replace('#', '');
                if (!((args[0].length === 3) || (args[0].length === 4) || (args[0].length === 6) || (args[0].length === 8))) {
                    socket.emit(`error`, `Colour option not valid`);
                    console.log(`\x1b[31m[DISPLAY SET FAIL]\x1b[0m: IP: \x1b[33m${socket.client.conn.remoteAddress.replace("::ffff:", "")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m REQ: \x1b[33m${data}\x1b[0m`);
                    return;
                }
                args[2] = args[2].replace('#', '');
                if (!((args[2].length === 3) || (args[2].length === 4) || (args[2].length === 6) || (args[2].length === 8))) {
                    socket.emit(`error`, `Colour option not valid`);
                    console.log(`\x1b[31m[DISPLAY SET FAIL]\x1b[0m: IP: \x1b[33m${socket.client.conn.remoteAddress.replace("::ffff:", "")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m REQ: \x1b[33m${data}\x1b[0m`);
                    return;
                }
                console.log(`\x1b[32m[BACKGROUND SET SUCCESS]\x1b[0m: IP: \x1b[33m${socket.client.conn.remoteAddress.replace("::ffff:", "")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m REQ: \x1b[33m${data}\x1b[0m`);
                let colr = args.shift();
                let size = Number(args.shift());
                let ecol = args.shift();
                let etxt = args.join(" ");
                (0, cfg_mngr_1.update)({
                    timerColor: colr,
                    timerSize: size,
                    endCol: ecol,
                    endTxt: etxt
                });
                apiserver_1.ioserver.emit(`display`, `${colr} ${size} ${ecol} ${etxt}`);
                break;
        }
    });
}
exports.updatedisp = updatedisp;
