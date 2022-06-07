import React from "react";
import { useContext, useState, useEffect, useCallback } from "react";
import { socketContext } from "./contexts/socket";
import './styles/Background.css';

function Background(props: any) {
    const socket = useContext(socketContext);
    const [bgUseImage,setUI] = useState(false);
    const [bgHorizontal,setHorizontal] = useState(false);
    const [bgImage,setImage] = useState("");
    const [bgSolid,setSolid] = useState("");

    const updateGlobal: (props: any) => void = props.updateGlobal;

    const handleSConnect = useCallback(() => { socket.emit(`background`,`get`); },[socket])
    const handleSBGChange = useCallback((data: string) => {
        console.log(`[BACKGROUND CHANGE]: ${data}`);
        let args: string[] = data.toLowerCase().split(" ");
        switch(args[0]) {
            case "true":
                if(args[1] === "true") {
                    setUI(true);
                    setHorizontal(args[2] === "true");
                    args.shift(); args.shift(); args.shift();
                    setImage(`http://${window.location.hostname}:3002/uploads/${args.join(" ")}`);
                    //setImage(`http://${window.location.hostname}:${window.location.port}/uploads/${args.join(" ")}`);
                } else if (args[1] === "false") {
                    setUI(true);
                    setHorizontal(args[2] === "true");
                    args.shift(); args.shift(); args.shift();
                    setImage(args.join(" "));
                }
                break;
            case "false":
                setUI(false);
                setSolid(args[1]);
                break;
        }
    },[setImage,setSolid,setUI])

    const handleSBGHU = useCallback((data: any)=>{
        let isTrue: boolean = (data === true);
        setHorizontal(isTrue);
        updateGlobal({bgHorizontal: isTrue});
    },[setHorizontal]);

    useEffect(() => {
        socket.on(`connect`, handleSConnect);
        socket.on(`background`, handleSBGChange);
        socket.on(`bgHU`, handleSBGHU);
        return () => {
            socket.off(`connect`, handleSConnect);
            socket.off(`background`, handleSBGChange);
            socket.off(`bgHU`, handleSBGHU);
        }
    },[socket, handleSConnect, handleSBGChange, handleSBGHU])

    return (
        <div className="background">
            {(bgUseImage)
                ?(<img src={bgImage} className={"background_image-"+((bgHorizontal)?("horizontal"):("vertical"))} alt={"Background"}/>)
                :(<div style={{
                    backgroundColor: `${bgSolid}`,
                    width: "100%",
                    height: "100%"
                }}></div>)
            }
        </div>
    )
}

export default Background;