import React, { useEffect, useState, useContext, useCallback } from "react";
import { socketContext } from "../contexts/socket";

function TimerDisplay(props: any) {
    const socket = useContext(socketContext);

    const global: { color: string, size: number, endTxt: string, title: string, endColor: string, titleColor: string, typing: boolean } = props.globalState;
    const updateGlobal: (props: any) => void = props.updateGlobal;

    const [textSize,setSize] = useState(global.size);
    const [textColor,setColor] = useState(global.color);
    const [endTxt,setETXT] = useState(global.endTxt);
    const [title,setTitle] = useState(global.title);
    const [endColor,setEColor] = useState(global.endColor);
    const [titleColor,setTColor] = useState(global.titleColor);
    const [submitComplete,setComplete] = useState(false);
    const [filled,setFilled] = useState(false);

    function handleColChange(event: any) {
        let newVal: string = "";
        let inVal: string = event.target.value;
        if(inVal.length > 8) { inVal = `${inVal.substring(0,8)}${inVal[inVal.length-1]}`; }
        newVal = inVal.replace(/[^0-9a-f]+/gi,'');
        setColor(newVal);
        updateGlobal({ color: newVal });
    }

    function handleSizChange(event: any) {
        setSize(event.target.value);
        updateGlobal({ size: event.target.value });
    }

    function handleEndChange(event: any) {
        setETXT(event.target.value);
        updateGlobal({ endTxt: event.target.value });
    }

    function handleTitleChange(event: any) {
        setTitle(event.target.value);
        updateGlobal({ title: event.target.value });
    }

    function handleEColor(event: any) {
        setEColor(event.target.value);
        updateGlobal({ endColor: event.target.value });
    }

    function handleTColor(event: any) {
        setTColor(event.target.value);
        updateGlobal({ titleColor: event.target.value });
    }

    useEffect(() => {
        updateGlobal({ color: textColor, size: textSize, endTxt: endTxt, title: title });
        if(textSize === 0 || textColor === "" || endTxt === "") { setFilled(false); }
        else { setFilled(true); }
    },[textSize,textColor,endTxt,title,setFilled])

    const submission = useCallback((event: any) => {
        event.preventDefault();
        socket.emit(`updatedisp`,`set ${textColor} ${textSize} ${endColor} ${endTxt}`);
        socket.emit(`title`,`set ${titleColor} ${title}`);
        updateGlobal({ typing: false });
        setComplete(true);
        setTimeout(() => {
            setComplete(false);
        },1000)
    },[socket,textColor,textSize,endTxt,endColor,titleColor,title,setComplete]);

    const handleSelected = useCallback((event: any) => {
        console.log(`Selected`);
        updateGlobal({ typing: true });
    },[updateGlobal])

    const handleDeselected = useCallback((event: any) => {
        console.log(`Deselected`);
        updateGlobal({ typing: false });
    },[updateGlobal])

    useEffect(() => {
        let textboxes = document.getElementsByClassName("tmrdsp-txt-nostyle")
        console.log(`Textbox listeners applied`);
        for (let i = 0; i < textboxes.length; i++) {
            let txtbox = textboxes.item(i);
            if(txtbox !== null) {
                txtbox.addEventListener("focusin", handleSelected);
                txtbox.addEventListener("focusout", handleDeselected);
            }
        };
    },[])

    return (
        <div className="tmrdsp">
            <div className="control-titlebox"><span>Text Options</span></div>
            <form className="TS-opt" onSubmit={submission}>
                <div className="tmrdsp_options">
                    <div className="tmrdsp_fsiz_cont">
                        <span>Font Size</span>
                        <div className="tmrdsp_filler"></div>
                        <input type="number" name="fontSize" className="tmrdsp_fsize" value={textSize} onChange={handleSizChange}></input>
                    </div>
                    <div className="tmrdsp_fcol_cont">
                        <span>Color</span>
                        <div className="tmrdsp_filler"></div>
                        <input type="text" name="color" onChange={handleColChange} value={textColor} className="tmrdsp_fcolr tmrdsp-txt-nostyle"></input>
                    </div>
                    <div className="tmrdsp_etxt_cont">
                        <div className="tmrdsp_span-color">
                            <span>End Text</span>
                            <div className="tmrdsp_filler"></div>
                            <input type="text" className="tmrdsp_etxt_colr tmrdsp-txt-nostyle" value={endColor} onChange={handleEColor}></input>
                        </div>
                        <input type="text" name="endText" onChange={handleEndChange} value={endTxt} className="tmrdsp_etxt tmrdsp-txt-nostyle"></input>
                    </div>
                    <div className="tmrdsp_ttxt_cont">
                        <div className="tmrdsp_span-color">
                            <span>Title</span>
                            <div className="tmrdsp_filler"></div>
                            <input type="text" className="tmrdsp_ttxt_colr tmrdsp-txt-nostyle" value={titleColor} onChange={handleTColor}></input>
                        </div>
                        <input type="text" name="titleText" onChange={handleTitleChange} value={title} className="tmrdsp_ttxt tmrdsp-txt-nostyle"></input>
                    </div>
                </div>
                <input type="submit" name="submit" value="Sync Settings" className={"tmrdsp_submit tmrdsp-s-"+(filled?((submitComplete)?"enabled-complete":"enabled"):("disabled"))} disabled={!filled || submitComplete}></input>
            </form>
        </div>
    )
}

export default TimerDisplay;