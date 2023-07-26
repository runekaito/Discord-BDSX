import * as event from "events"
import { Player } from "bdsx/bds/player"
import { RESTPostAPIChannelMessageJSONBody, GatewayMessageCreateDispatchData } from "discord-api-types/v10"
import { TextPacket } from "bdsx/bds/packets"
const dbchatApi = new event.EventEmitter


export const postMessageToDiscord = {
    on: (callback: { (packet: TextPacket, payload: RESTPostAPIChannelMessageJSONBody, sendChannelId: string, cancel: { cancel: boolean }): any }) => {
        dbchatApi.on("postMessageToDiscord", callback)
    },
    emit: (packet: TextPacket, payload: RESTPostAPIChannelMessageJSONBody, sendChannelId: string, cancel: { cancel: boolean }) => {
        dbchatApi.emit("postMessageToDiscord", packet, payload, sendChannelId, cancel)
    }
}

export const postMessageToMinecraft = {
    on: (callback: { (payload: GatewayMessageCreateDispatchData, cancel: { cancel: boolean }): any }) => {
        dbchatApi.on("postMinecraft", callback)
    },
    emit: (payload: GatewayMessageCreateDispatchData, cancel: { cancel: boolean }) => {
        dbchatApi.emit("postMinecraft", payload, cancel)
    }
}

export const playerJoin = {
    on: (callback: { (player: Player, payload: RESTPostAPIChannelMessageJSONBody, cancel: { cancel: boolean }): any }) => {
        dbchatApi.on("playerJoin", callback)
    },
    emit: (player: Player, payload: RESTPostAPIChannelMessageJSONBody, cancel: { cancel: boolean }) => {
        dbchatApi.emit("playerJoin", player, payload, cancel)
    }
}

export const playerLeft = {
    on: (callback: { (player: Player, payload: RESTPostAPIChannelMessageJSONBody, cancel: { cancel: boolean }): any }) => {
        dbchatApi.on("playerLeft", callback)
    },
    emit: (player: Player, payload: RESTPostAPIChannelMessageJSONBody, cancel: { cancel: boolean }) => {
        dbchatApi.emit("playerLeft", player, payload, cancel)
    }
}

export const runDiscordCommand = {
    on: (callback: { (commandType: "eval" | "list" | "userinfo" | "ping" | "info", payload: RESTPostAPIChannelMessageJSONBody, cancel: { cancel: boolean }): any }) => {
        dbchatApi.on("runDiscordCommand", callback)
    },
    emit: (commandType: "eval" | "list" | "userinfo" | "ping" | "info", payload: RESTPostAPIChannelMessageJSONBody, cancel: { cancel: boolean }) => {
        dbchatApi.emit("runDiscordCommand", commandType, payload, cancel)
    }
}

export const dbchatFormatter = {
    username: (userName: string): string => userName
}