import React, { useEffect, useState, useCallback } from "react";
import NewTime from "./NewTime";
import NewBG from "./NewBG";
import NewBGI from "./UploadBGI";
import TimerDisplay from "./TimerDisplay";
import '../styles/Overlay.css';

function Overlay(props: any) {
    const [toggle,setToggle] = useState(false);
    const [created,setCreated] = useState(toggle);
    const [cooldown,setCooldown] = useState(true);
    const [useShortWidth,setUSW] = useState(true);

    const [panelNum,setPN] = useState(0);
    const panelAmt = 4;

    const globalState: { color: string, size: number, endTxt: string, title: string, endColor: string, titleColor: string, typing: boolean } = props.globalState;
    const [bInFullScreen,setBIF] = useState(window.innerHeight < 310);

    const [newTimeState,setTimeState] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, timeOpt: 0 });
    const [newBGState,setBGState] = useState({ useImg: false, imageaddr: "", solidColor: "", fitHorizontal: false });
    const [newTimerDisp,setTimerDisp] = useState({ fontColor: globalState.color, fontSize: globalState.size, endTxt: globalState.endTxt, title: globalState.title });

    const clickevent = useCallback((event: any) => {
        if(!cooldown) {
            if(globalState.typing === false) {
                if(event.key === " ") {
                    setToggle(t => !t);
                    setCooldown(true);
                    setTimeout(() => {
                        setCooldown(false);
                    },500)
                };
            };
        };
    },[cooldown,globalState]);

    useEffect(() => {
        document.addEventListener('keypress', clickevent);
        return () => document.removeEventListener('keypress', clickevent);
    },[clickevent])

    function closeOverlay() {
        if(!cooldown) {
            if(bInFullScreen) { document.exitFullscreen(); setBIF(false); }
            setToggle(false);
            setCooldown(true);
            setTimeout(() => {
                setCooldown(false);
            },500)
        }
    }

    function handleClick() {
        if(!toggle && !cooldown) {
            if(window.innerHeight < 310) { document.body.requestFullscreen(); setBIF(true); }
            setToggle(true);
            setCooldown(true);
            setTimeout(() => {
                setCooldown(false);
            },500)
        }
    }

    const getToggle = useCallback(() => {
        return toggle;
    },[toggle]);

    useEffect(()=>{
        if(!toggle) {
            setTimeout(()=>{
                setCreated(getToggle());
            },500)
        } else {
            setCreated(getToggle());
        }
    },[toggle,getToggle])

    const updateTimePersist = useCallback((days: number, hours: number, minutes: number, seconds: number, timeOpt: number) => {
        setTimeState({days: days, hours: hours, minutes: minutes, seconds: seconds, timeOpt: timeOpt});
    },[]);

    const updateBGPersist = useCallback(( useImg: boolean, imageaddr: string, solidColor: string, fitHorizontal: boolean ) => {
        setBGState({ useImg: useImg, imageaddr: imageaddr, solidColor: solidColor, fitHorizontal: fitHorizontal });
    },[]);

    const updateBGUPersist = useCallback(( fitHorizontal: boolean ) => {
        updateBGPersist(newBGState.useImg, newBGState.imageaddr, newBGState.solidColor, fitHorizontal);
    },[updateBGPersist, newBGState])

    const updateTimerDisp = useCallback(( fontColor: string, fontCol: number, endTxt: string, title: string ) => {
        setTimerDisp({fontColor: fontColor, fontSize: fontCol, endTxt: endTxt, title: title});
    },[setTimerDisp])

    const handlePanelRight = useCallback(() => {
        if(panelNum !== panelAmt-1)
            setPN(panelNum+1);
    },[panelNum]);

    const handlePanelLeft = useCallback(() => {
        if(panelNum !== 0)
            setPN(panelNum-1);
    },[panelNum]);

    useEffect(()=>{
        setUSW(window.innerWidth < 600);
        window.addEventListener('resize', () => {
            setUSW(window.innerWidth < 600)
        });
        setTimeout(() => {
            setCooldown(false);
        },500)
    },[]);

    return (
        <div id="overlay" className={"overlay"+((toggle)?(" overlay_visible"):(" overlay_hidden"))} onClick={handleClick}>
            {created?(
                <div className="overlay-container">
                    <div className="overlay-closespace" onClick={closeOverlay}></div>
                    <div className="overlay-controls-container">
                        <div className="overlay-closespace" onClick={closeOverlay}></div>
                        <div className={"controls-"+(useShortWidth?"tall":"norm")}>
                            {useShortWidth?(
                                ""
                            ):(
                                <div className="controls-arrow arrow-margin-left" onClick={handlePanelLeft}>
                                    <div className={"controls-LA-"+((panelNum !== 0)?("active"):("inactive"))}></div>
                                </div>
                            )}
                            {useShortWidth?(
                                <div className="panel-controls-short">
                                    <div className="panel-controls-short-arrowspace-L" onClick={handlePanelLeft}>
                                        <div className={"panel-controls-short-arrow-L-"+((panelNum !== 0)?("active"):("inactive"))}></div>
                                        <div className={"panel-controls-short-arrow-L-"+((panelNum !== 0)?("active"):("inactive"))}></div>
                                    </div>
                                    <div className="panel-controls-short-arrowspace-R" onClick={handlePanelRight}>
                                        <div className={"panel-controls-short-arrow-R-"+((panelNum !== panelAmt-1)?("active"):("inactive"))}></div>
                                        <div className={"panel-controls-short-arrow-R-"+((panelNum !== panelAmt-1)?("active"):("inactive"))}></div>
                                    </div>
                                </div>
                            ):(
                                ""
                            )}
                            <div className="controls-mid">
                                {(panelNum === 0)?(<NewTime persistState={newTimeState} closeOverlay={closeOverlay} changeState={updateTimePersist} />):("")}
                                {(panelNum === 1)?(<NewBG persistState={newBGState} changeState={updateBGPersist} globalState={props.globalState} updateGlobal={props.updateGlobal}/>):("")}
                                {(panelNum === 2)?(<NewBGI horiz={newBGState.fitHorizontal} update={updateBGUPersist} globalState={props.globalState} updateGlobal={props.updateGlobal}/>):("")}
                                {(panelNum === 3)?(<TimerDisplay persistState={newTimerDisp} changeState={updateTimerDisp} globalState={props.globalState} updateGlobal={props.updateGlobal}/>):("")}
                            </div>
                            {(useShortWidth)?(
                                ""
                            ):(
                                <div className="controls-arrow arrow-margin-right" onClick={handlePanelRight}>
                                    <div className={"controls-RA-"+((panelNum !== panelAmt-1)?("active"):("inactive"))}></div>
                                </div>
                            )}
                        </div>
                        <div className="overlay-closespace" onClick={closeOverlay}></div>
                    </div>
                    <div className="overlay-closespace" onClick={closeOverlay}></div>
                </div>
            ):""}
        </div>
    )
}

export default Overlay;