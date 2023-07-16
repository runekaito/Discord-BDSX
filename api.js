"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.playerLeft = exports.playerJoin = exports.postMessageToMinecraft = exports.postMessageToDiscord = void 0;
const event = require("events");
const dbchatApi = new event.EventEmitter;
exports.postMessageToDiscord = {
    on: (callback) => {
        dbchatApi.on("postMessageToDiscord", callback);
    },
    emit: (packet, payload, sendChannelId, cancel) => {
        dbchatApi.emit("postMessageToDiscord", packet, payload, sendChannelId, cancel);
    }
};
exports.postMessageToMinecraft = {
    on: (callback) => {
        dbchatApi.on("postMinecraft", callback);
    },
    emit: (payload, cancel) => {
        dbchatApi.emit("postMinecraft", payload, cancel);
    }
};
exports.playerJoin = {
    on: (callback) => {
        dbchatApi.on("playerJoin", callback);
    },
    emit: (player, payload, cancel) => {
        dbchatApi.emit("playerJoin", player, payload, cancel);
    }
};
exports.playerLeft = {
    on: (callback) => {
        dbchatApi.on("playerLeft", callback);
    },
    emit: (player, payload, cancel) => {
        dbchatApi.emit("playerLeft", player, payload);
    }
};
