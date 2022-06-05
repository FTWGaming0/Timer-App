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
exports.title = void 0;
const cfg_mngr_1 = require("../cfg_mngr");
const apiserver_1 = require("../apiserver");
function title(data, socket) {
    return __awaiter(this, void 0, void 0, function* () {
        let currentTime = new Date();
        let timeString = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}:${currentTime.getSeconds().toString().padStart(2, '0')}.${currentTime.getMilliseconds().toString().padEnd(2, '0')}`;
        let args = data.split(" ");
        switch (args.shift()) {
            case "get":
                socket.emit(`title`, `${cfg_mngr_1.configuration.titleCol} ${cfg_mngr_1.configuration.title}`);
                console.log(`\x1b[36m[TITLE QUERY]\x1b[0m: IP: \x1b[33m${socket.client.conn.remoteAddress.replace("::ffff:", "")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m`);
                break;
            case "set":
                args[0] = args[0].replace('#', '');
                if (!((args[0].length === 3) || (args[0].length === 4) || (args[0].length === 6) || (args[0].length === 8))) {
                    socket.emit(`error`, `Colour option not valid`);
                    console.log(`\x1b[31m[DISPLAY SET FAIL]\x1b[0m: IP: \x1b[33m${socket.client.conn.remoteAddress.replace("::ffff:", "")}\x1b[0m @ \x1b[32m${timeString}\x1b[0m REQ: \x1b[33m${data}\x1b[0m`);
                    return;
                }
                let col = args.shift();
                apiserver_1.ioserver.emit(`title`, `${col} ${args.join(" ")}`);
                (0, cfg_mngr_1.update)({ titleCol: col, title: args.join(" ") });
                break;
        }
    });
}
exports.title = title;
