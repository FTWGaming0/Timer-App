import React, { useState, useContext, useEffect } from "react";
import { socketContext } from "../contexts/socket";

function NewBG(props: any) {
    const persisted: { useImg: boolean, imageaddr: string, solidColor: string, fitHorizontal: boolean } = props.persistState;
    const globalState: any = props.globalState;
    const updateGlobal: (props: any) => void = props.updateGlobal;

    const [useImg,setUI] = useState(persisted.useImg);
    const [imageaddr,setIMGA] = useState(persisted.imageaddr);
    const [solidColor,setColor] = useState(persisted.solidColor);
    const [fitHorizontal,setHorizontal] = useState(globalState.bgHorizontal);
    const socket = useContext(socketContext);

    const changePersist: ( useImg: boolean, imageaddr: string, solidColor: string, fitHorizontal: boolean ) => void = props.changeState;

    useEffect(() => {
        changePersist(useImg, imageaddr, solidColor, fitHorizontal);
    },[changePersist,useImg,imageaddr,solidColor,fitHorizontal]);

    function ToggleImage(event: any) { setUI(event.target.checked); }
    function IMGAC(event: any) { setIMGA(event.target.value); }
    function SOLIDCC(event: any) {
        let newVal: string = "";
        let inVal: string = event.target.value;
        if(inVal.length > 8) { inVal = `${inVal.substring(0,8)}${inVal[inVal.length-1]}`; }
        newVal = inVal.replace(/[^0-9a-f]+/gi,'');
        setColor(newVal);
    }

    function submission(event: any) {
        event.preventDefault();
        if(!useImg) {
            if(solidColor !== "") {
                console.log(`Requesting Solid Colour Background.`);
                socket.emit(`background`,`set bgi ${useImg} ${solidColor}`);
            }
        } else {
            console.log(`Requesting Image Background.`);
            socket.emit(`background`,`set bgi ${useImg} ${imageaddr}`);
        }
    }

    function HorizontalFit(event: any) {
        socket.emit(`background`,`set bgh ${event.target.checked}`);
        setHorizontal(event.target.checked);
        updateGlobal({ bgHorizontal: event.target.checked });
    }

    return (
        <div className="newbg">
            <div className="control-titlebox">
                <span>Background Controls</span>
            </div>
            <form className="TS-opt" onSubmit={submission}>
                {(useImg)?(
                    <div>
                        <input type="checkbox" name={"Use Images"} id={"ts-opt-2-1"} onChange={ToggleImage} defaultChecked={useImg} />
                        <label htmlFor={"ts-opt-2-1"}>Use Image</label><br/>
                        <input type="checkbox" name={"Horizontal"} id={"ts-opt-2-2"} onChange={HorizontalFit} defaultChecked={fitHorizontal} />
                        <label htmlFor={"ts-opt-2-2"}>Fit Horizontal</label>
                    </div>
                ):(
                    <div>
                        <input type="checkbox" name={"Use Images"} id={"ts-opt-2-1"} onChange={ToggleImage} defaultChecked={useImg}/>
                        <label htmlFor={"ts-opt-2-1"}>Use Image</label><br/>
                    </div>
                )}
                {((useImg)?(
                    <div className="newbg_image_select">
                        <div className="newbg_image_textbox_container">
                            <input type="text" value={imageaddr} onChange={IMGAC} className="newbg_image_textbox" />
                        </div>
                        <div className="newbg_image_container">
                            <img src={imageaddr} className="newbg_image_preview" alt={"Background"}/>
                        </div>
                    </div>
                ):(
                    <div className="newbg_solid_select">
                        <div><span>#</span><input type="text" className="newbg_solid_textbox" value={solidColor} onChange={SOLIDCC}></input></div>
                        {(solidColor.length === 3 || solidColor.length === 4 || solidColor.length === 6 || solidColor.length === 8)?(
                            <div className="newbg_solid_indicator" style={{ backgroundColor: `#${solidColor}` }}>00:00:00</div>
                        ):(
                            <div className="newbg_indicator_fail">
                                <span className="redtext">INVALID HEX</span>
                                <span className="newbg_indicator_explain">Hex should be 3,4,6 or 8 character long hexadecimal digits. [0-9 and a-f]</span>
                                <span className="newbg_indicator_explain">e.g. 0f0fff, 12ab34cd</span>
                            </div>
                        )}
                    </div>
                ))}
                <input type="submit" className="newbg-submit" value={"Set Background"}/>
            </form>
        </div>
    )
}

export default NewBG;