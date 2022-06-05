import React from "react";
import video from "./BlankLoop.mp4";
import './NeverSleep.css';

export default function NeverSleep(props: any) {
    return (
        <div className="neversleep">
            <video src={video} autoPlay loop width="0" height="0" muted/>
        </div>
    )
}