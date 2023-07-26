import { Player } from "bdsx/bds/player";
import { RESTPostAPIChannelMessageJSONBody, GatewayMessageCreateDispatchData } from "discord-api-types/v10";
import { TextPacket } from "bdsx/bds/packets";
export declare const postMessageToDiscord: {
    on: (callback: (packet: TextPacket, payload: RESTPostAPIChannelMessageJSONBody, sendChannelId: string, cancel: {
        cancel: boolean;
    }) => any) => void;
    emit: (packet: TextPacket, payload: RESTPostAPIChannelMessageJSONBody, sendChannelId: string, cancel: {
        cancel: boolean;
    }) => void;
};
export declare const postMessageToMinecraft: {
    on: (callback: (payload: GatewayMessageCreateDispatchData, cancel: {
        cancel: boolean;
    }) => any) => void;
    emit: (payload: GatewayMessageCreateDispatchData, cancel: {
        cancel: boolean;
    }) => void;
};
export declare const playerJoin: {
    on: (callback: (player: Player, payload: RESTPostAPIChannelMessageJSONBody, cancel: {
        cancel: boolean;
    }) => any) => void;
    emit: (player: Player, payload: RESTPostAPIChannelMessageJSONBody, cancel: {
        cancel: boolean;
    }) => void;
};
export declare const playerLeft: {
    on: (callback: (player: Player, payload: RESTPostAPIChannelMessageJSONBody, cancel: {
        cancel: boolean;
    }) => any) => void;
    emit: (player: Player, payload: RESTPostAPIChannelMessageJSONBody, cancel: {
        cancel: boolean;
    }) => void;
};
export declare const runDiscordCommand: {
    on: (callback: (commandType: "eval" | "list" | "userinfo" | "ping" | "info", payload: RESTPostAPIChannelMessageJSONBody, cancel: {
        cancel: boolean;
    }) => any) => void;
    emit: (commandType: "eval" | "list" | "userinfo" | "ping" | "info", payload: RESTPostAPIChannelMessageJSONBody, cancel: {
        cancel: boolean;
    }) => void;
};
export declare const dbchatFormatter: {
    username: (userName: string) => string;
};
