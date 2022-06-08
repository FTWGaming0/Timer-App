import React, { useContext, useEffect, useState, useCallback } from "react";
import { socketContext } from "../contexts/socket";

function NewTime(props: any) {

    const persisted: { days: number, hours: number, minutes: number, seconds: number, timeOpt: number } = props.persistState;
    const globalState: any = props.globalState;
    const updateGlobal: (props: any) => void = props.updateGlobal;

    const [uDays,setDays] = useState(persisted.days);
    const [uHours,setHours] = useState(persisted.hours);
    const [uMinutes,setMinutes] = useState(persisted.minutes);
    const [uSeconds,setSeconds] = useState(persisted.seconds);
    const socket = useContext(socketContext);
    const [timeOption,setTO] = useState(persisted.timeOpt);
    const [targetTime,setTT] = useState(new Date(globalState.targetTime));

    const [sentPing,setSP] = useState({ time: 0, updated: false });
    const [recPing,setRP] = useState({ time: 0, updated: false, serv_time: 0 });

    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ]

    const changePersist: (days: number, hours: number, minutes: number, seconds: number, timeOpt: number) => void = props.changeState;

    const handleSPing = useCallback((servertime: number) => {
        setRP({ time: Date.now(), updated: true, serv_time: servertime });
    },[setRP]);

    useEffect(()=>{
        if(sentPing.updated && recPing.updated) {
            let newTime = Date.now()+((recPing.serv_time-Date.now())-(recPing.time-sentPing.time));

            newTime += uDays*1000*60*60*24;
            newTime += uHours*1000*60*60;
            newTime += uMinutes*1000*60;
            newTime += uSeconds*1000;

            socket.emit(`updatetimer`,`set ${newTime}`);

            setSP({ time: 0, updated: false });
            setRP({ time: 0, updated: false, serv_time: 0 });
        }
    },[sentPing,recPing,uDays,uHours,uMinutes,uSeconds,socket])

    function handleSubmit(e: any) {
        e.preventDefault();
        if(timeOption === 0) {
            socket.emit(`ping`,`ping`);
            setSP({ time: Date.now(), updated: true });
            props.closeOverlay();
        }
        if(timeOption === 1) {
            let time = new Date();
            let newTime: number = Date.now();
            
            newTime -= time.getHours()*1000*60*60;
            newTime -= time.getMinutes()*1000*60;
            newTime -= time.getSeconds()*1000;
            newTime -= time.getMilliseconds();

            newTime += uDays*1000*60*60*24;
            newTime += uHours*1000*60*60;
            newTime += uMinutes*1000*60;
            newTime += uSeconds*1000;

            if(newTime < Date.now()) {
                newTime += 1000*60*60*24;
            }

            socket.emit(`updatetimer`,`set ${newTime}`);
            updateGlobal({ targetTime: newTime });
            props.closeOverlay();
        }
    };

    function incH() { if(uHours+1 > 23) { setHours(0); } else setHours(uHours+1); };
    function incM() { if(uMinutes+1 > 59) { setMinutes(0); incH(); } else setMinutes(uMinutes+1); };
    function incS() { if(uSeconds+1 > 59) { setSeconds(0); incM(); } else setSeconds(uSeconds+1); };
    function decH() { if(uHours-1 < 0) { setHours(23); } else setHours(uHours-1); };
    function decM() { if(uMinutes-1 < 0) { setMinutes(59); decH(); } else setMinutes(uMinutes-1); };
    function decS() { if(uSeconds-1 < 0) { setSeconds(59); decM(); } else setSeconds(uSeconds-1); };

    const [bDayAdd,setbDA] = useState(false);

    const handlePersistState = useCallback((values: {"days": number, "hours": number, "minutes": number, "seconds": number, "timeOpt": number}) => {
        changePersist( values.days, values.hours, values.minutes, values.seconds, values.timeOpt )
    },[changePersist])

    const handleChangeSet = useCallback((event: any) => {
        if(event.target.checked) {
            let now = new Date();
            setHours(now.getHours());
            setMinutes(now.getMinutes())
            setSeconds(now.getSeconds());
            setTO(1);
        } else {
            setDays(0);
            setHours(0);
            setMinutes(0);
            setSeconds(0);
            setTO(0);
        }
    },[])

    useEffect(() => {
        socket.on(`ping`,handleSPing);
        return () => {
            socket.off(`ping`,handleSPing);
        }
    },[socket,handleSPing])

    const subDay = useCallback(() => {
        if(uDays > 0)
            setDays(uDays-1);
    },[setDays,uDays])

    const addDay = useCallback(() => {
        if(bDayAdd) setDays(d => d+2);
        else setDays(d => d+1);
    },[setDays,bDayAdd])

    useEffect(() => {
        handlePersistState({
            "days": uDays,
            "hours": uHours,
            "minutes": uMinutes,
            "seconds": uSeconds,
            "timeOpt": timeOption
        });

        let newDate = new Date();
        let newTime = Date.now();

        newTime -= (newDate.getHours()*1000*60*60);
        newTime -= (newDate.getMinutes()*1000*60);
        newTime -= (newDate.getSeconds()*1000);
        newTime -= (newDate.getMilliseconds());
        
        newTime += uDays*1000*60*60*24;
        newTime += uHours*1000*60*60;
        newTime += uMinutes*1000*60;
        newTime += uSeconds*1000;

        if(timeOption === 1 && ((newTime-Date.now()) < 0)) { setbDA(true); newTime += 1000*60*60*24; }
        else { setbDA(false); };

        setTT(new Date(newTime));
    },[uDays,uHours,uMinutes,uSeconds,timeOption,handlePersistState,setTT,setDays]);

    function addDayWheel(event: any) {
        if(event.deltaY > 0) subDay();
        else addDay();
    }

    function addHourWheel(event: any) {
        if(event.deltaY > 0) decH();
        else incH();
    }

    function addMinuteWheel(event: any) {
        if(event.deltaY > 0) decM();
        else incM();
    }

    function addSecondWheel(event: any) {
        if(event.deltaY > 0) decS();
        else incS();
    }

    const [startPos,setStartPos] = useState({ x: 0, y: 0 });
    const [difference,setDifference] = useState({ x: 0, y: 0 });
    const [dragTarget,setdT] = useState(0);
    
    const [dragSeconds,setDragSeconds] = useState({ current: 0, target: 0 });
    const [dragMinutes,setDragMinutes] = useState({ current: 0, target: 0 });
    const [dragHours,setDragHours] = useState({ current: 0, target: 0 });
    const [dragDays,setDragDays] = useState({ current: 0, target: 0 });

    function secondDragStart(event: any) {
        setStartPos({ x: event.touches[0].clientX, y: event.touches[0].clientY });
        setDragSeconds({ current: 0, target: 0 });
        setdT(1);
    }

    function minuteDragStart(event: any) {
        setStartPos({ x: event.touches[0].clientX, y: event.touches[0].clientY });
        setDragMinutes({ current: 0, target: 0 });
        setdT(2);
    }

    function hourDragStart(event: any) {
        setStartPos({ x: event.touches[0].clientX, y: event.touches[0].clientY });
        setDragHours({ current: 0, target: 0 });
        setdT(3);
    }

    function dayDragStart(event: any) {
        setStartPos({ x: event.touches[0].clientX, y: event.touches[0].clientY });
        setDragDays({ current: 0, target: 0 });
        setdT(4);
    }

    function dragMoveEvent(event: any) { setDifference({ x: (event.touches[0].clientX-startPos.x), y: (event.touches[0].clientY-startPos.y) }); };
    function dragEnd(event: any) { setdT(0); };

    useEffect(() => {
        let upTarget = Math.floor(difference.y/-20);
        let sideTarget = Math.floor(difference.x/20);
        switch(dragTarget) {
            case(1):
                for(let i = 0; i < Math.abs(dragSeconds.current-upTarget); i++) {
                    if(dragSeconds.current < upTarget) { incS(); }
                    else { decS(); }
                } setDragSeconds({ current: upTarget, target: upTarget });
                break;
            case(2):
                for(let i = 0; i < Math.abs(dragMinutes.current-upTarget); i++) {
                    if(dragMinutes.current < upTarget) { incM(); }
                    else { decM(); }
                } setDragMinutes({ current: upTarget, target: upTarget });
                break;
            case(3):
                for(let i = 0; i < Math.abs(dragHours.current-upTarget); i++) {
                    if(dragHours.current < upTarget) { incH(); }
                    else { decH(); }
                } setDragHours({ current: upTarget, target: upTarget });
                break;
            case(4):
                for(let i = 0; i < Math.abs(dragDays.current-sideTarget); i++) {
                    if(dragDays.current < sideTarget) { addDay(); }
                    else { subDay(); }
                } setDragDays({ current: sideTarget, target: sideTarget });
                break;
        }
        
    },[difference])

    return (
        <div className="timeSetter">
            <div className="control-titlebox"><span>Timer Controls</span></div>
            <form className="TS-opt" onSubmit={handleSubmit}>
                <div><input type="checkbox" id="ts-opt-1-1" name={"ts-opt-1"} value={"TFN"} onChange={handleChangeSet} defaultChecked={(timeOption === 1)}/><label htmlFor="ts-opt-1-1">Set Specific Time</label><br/></div>
                <div className="TS-day_select" onWheel={addDayWheel} onTouchStart={dayDragStart} onTouchMove={dragMoveEvent} onTouchEnd={dragEnd}>
                    <div className="TS-day_sub" onClick={subDay}><span>-</span></div>
                    <div className="TS-day_indicator">
                        {(timeOption === 1)?(<span>{months[targetTime.getMonth()]+" "+targetTime.getDate()}</span>):(<span>{uDays} Days</span>)}
                    </div>
                    <div className="TS-day_add" onClick={addDay}><span>+</span></div>
                </div>
                <div className="TS-timesel">
                    <div className="TS-sel" onWheel={addHourWheel} onTouchStart={hourDragStart} onTouchMove={dragMoveEvent} onTouchEnd={dragEnd}>
                        <div className="TS-uparrow" onClick={incH}></div>
                        <span className="TS-h">{uHours.toString().padStart(2,'0')}</span>
                        <div className="TS-downarrow" onClick={decH}></div>
                    </div>
                    <span className="TS-selsplitter">:</span>
                    <div className="TS-sel" onWheel={addMinuteWheel} onTouchStart={minuteDragStart} onTouchMove={dragMoveEvent} onTouchEnd={dragEnd}>
                        <div className="TS-uparrow" onClick={incM}></div>
                        <span className="TS-h">{uMinutes.toString().padStart(2,'0')}</span>
                        <div className="TS-downarrow" onClick={decM}></div>
                    </div>
                    <span className="TS-selsplitter">:</span>
                    <div className="TS-sel" onWheel={addSecondWheel} onTouchStart={secondDragStart} onTouchMove={dragMoveEvent} onTouchEnd={dragEnd}>
                        <div className="TS-uparrow" onClick={incS}></div>
                        <span className="TS-h">{uSeconds.toString().padStart(2,'0')}</span>
                        <div className="TS-downarrow" onClick={decS}></div>
                    </div>
                </div>

                <input type="submit" value={"Set Timer"} className={"TS-submit"}></input>
            </form>
        </div>
    )
}

export default NewTime;