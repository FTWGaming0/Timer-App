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

    const handleSConnect = useCallback(() => { socket.emit(`background`,`get`); },[socket]) // handle Socket Connect
    const handleSBGChange = useCallback((data: string) => { // handle Socket Back-Ground Change
        // `background`,`[Use Image :  true], [Local WebServer?], [Horizontal?], [Image Name/Link]
        // `background`,`[Use Color : false], [Hex Code]`
        console.log(`[BACKGROUND CHANGE]: ${data}`);
        let args: string[] = data.toLowerCase().split(" ");
        switch(args[0]) {
            case "true": // `background`,`[TRUE] bool bool str` => [Use Image]
                if(args[1] === "true") { // `background`,`true TRUE bool str` => [Image is on host webserver]
                    setUI(true);
                    setHorizontal(args[2] === "true"); // `background`,`true true [TRUE] str` => [Image should fit to screen horizontally]
                    args.shift(); args.shift(); args.shift();
                    // setImage(`http://${window.location.hostname}:3002/uploads/${args.join(" ")}`); // `background`,`true true bool [STR]` => [Image to use]
                    setImage(`http://${window.location.hostname}:${window.location.port}/uploads/${args.join(" ")}`); // `background`,`true true bool [STR]` => [Image to use]
                } else if (args[1] === "false") { // `background`,`true FALSE bool str` => [Image is hosted externally.]
                    setUI(true);
                    setHorizontal(args[2] === "true"); // `background`,`true false [TRUE] str` => [Image should fit to screen horizontally]
                    args.shift(); args.shift(); args.shift(); // Shifting first three entries from args for clear join.
                    setImage(args.join(" ")); // `background`,`true false bool [STR]` => [Image to use]
                }
                break;
            case "false": // `background`,`[FALSE] str` => [Use Solid Color]
                setUI(false);
                setSolid(args[1]); // `background`,`false [STR]` => [Color to use]
                break;
        }
    },[setImage,setSolid,setUI])

    const handleSBGHU = useCallback((data: any)=>{ // handle Socket Back-Ground Horizontal Update
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