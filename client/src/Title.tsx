import React, { useState, useEffect, useContext, useCallback } from "react";
import { socketContext } from "./contexts/socket";
import './styles/title.css';

export default function Title(props: any) {

    // Set Essential Variables.

    const globalState: { color: string, size: number, endTxt: string, title: string, endColor: string, titleColor: string } = props.globalState;
    const socket = useContext(socketContext);
    const updateGlobal: (props: any) => void = props.updateGlobal;

    // Socket Handlers

    const handleSTitle = useCallback((data: string) => {
        let args = data.split(" ");
        let color = args.shift();
        let newtxt = args.join(" ");
        console.log(`Title Update`,color,newtxt);
        updateGlobal({ titleColor: color, title: newtxt });
    },[updateGlobal]);

    const handleSConnect = useCallback(() => { socket.emit(`title`,`get`); },[socket])

    // Socket Listeners

    useEffect(() => {
        socket.on(`connect`, handleSConnect);
        socket.on(`title`, handleSTitle);
        return () => {
            socket.off('connect', handleSConnect);
            socket.off('title', handleSTitle);
        }
    },[socket,handleSConnect,handleSTitle])

    // Elements

    return (
        <div className="title_cont">
            <span className="title_text" style={{ color: `#${globalState.titleColor}` }}>{globalState.title}</span>
        </div>
    )
}