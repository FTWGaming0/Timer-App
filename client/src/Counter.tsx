import React, { useState, useEffect, useContext, useCallback } from "react";
import { socketContext } from "./contexts/socket";
import './styles/Counter.css';

export default function Counter(props: any) {
    const socket = useContext(socketContext);

    const globalState: any = props.globalState;
    const updateGlobal: (props: any) => void = props.updateGlobal;

    const [fontSize,setFontSize] = useState(globalState.size);
    
    // Initialize Ping-Based Synchronisation Variables

    const [systemTimeOffset,setOffset] = useState(0); // Overall delay
    const [pingSent,setSent] = useState({ time: 0, ping: 0 }); // Ping Sent time.
    const [pingRec,setRec] = useState({ time: 0, ping: 0 }); // Ping Recieved time

    // Initialize Time Variables

    const targetTime = globalState.targetTime;
    const [timer,setTimer] = useState(0);
    const [seconds,setSeconds] = useState(0);
    const [minutes,setMinutes] = useState(0);
    const [hours,setHours] = useState(0);
    const [days,setDays] = useState(0);

    // Socket Listener Functions

    const handleSocketConnect = useCallback(() => {
        console.log(`Socket Connected.`);
        socket.emit(`updatetimer`,`query`);
        socket.emit(`updatedisp`,`query`);
        socket.emit(`ping`,``);
        setSent(old => { return { time: Date.now(), ping: old.ping+1 } });
    },[socket])

    const handleSocketPing = useCallback(() => { setRec(old => { return { time: Date.now(), ping: old.ping+1 } }) },[]);

    const handleSocketTimer = useCallback((data: any) => {
        console.log(`[TIMER EVENT]: ${data}`);
        let args = data.toString().toLowerCase().split(" ");
        let newtime: number = Date.now(); // Time to count down to
        let newsystime: number = Date.now(); // Current Time on the server
        try {
          newtime = Number(args[0]);
          newsystime = Number(args[1]);
        } catch(e) {
          console.log(`Failed to convert \`${data}\` to Numbers`);
        }
        updateGlobal({ targetTime: newtime });
        setOffset(Date.now()-newsystime); // Correct for offset in UTC between devices
    },[setOffset])

    const handleSocketDisplay = useCallback((data: any) => {
        console.log(`Display Information: ${data}`);
        let args = data.split(" ");
        try {
          Number(args[1]);
        } catch(e) {
          console.log(`Couldn't interpet display information from server command: ${data}`);
          return;
        }
        args[0] = args[0].replace('#','');
        if(!((args[0].length === 3) || (args[0].length === 4) || (args[0].length === 6) || (args[0].length === 8))) {
          console.log(`Couldn't get colour information from server command: ${data}`);
          return;
        }
        args[2] = args[2].replace('#','');
        if(!((args[2].length === 3) || (args[2].length === 4) || (args[2].length === 6) || (args[2].length === 8))) {
          console.log(`Couldn't get colour information from server command: ${data}`);
          return;
        }
        let colr = args.shift();
        let size = Number(args.shift());
        let ecol = args.shift();
        let etxt = args.join(" ");
        updateGlobal({ color: colr, size: size, endColor: ecol, endTxt: etxt });
    },[])

    // Handle Ping

    useEffect(() => {
        if(pingSent.ping === pingRec.ping) {
            // Subtract ping from time difference. Hypothetically giving exact difference between client and server UTC
            // to be subtracted from countdown time, allowing near perfect synchronisation across devices.
            setOffset(current => current-((pingRec.time-pingSent.time)/2));
            console.log(`Round Trip Ping: ${pingRec.time - pingSent.time}ms`);
        }
    },[pingSent,pingRec])

    // Initialize Socket Listeners

    useEffect(() => {
        socket.on(`connect`, handleSocketConnect);
        socket.on(`ping`, handleSocketPing);
        socket.on(`timer`, handleSocketTimer);
        socket.on(`display`, handleSocketDisplay);
        return () => {
            socket.off('connect', handleSocketConnect);
            socket.off('ping', handleSocketPing);
            socket.off('timer', handleSocketTimer);
            socket.off(`display`, handleSocketDisplay);
        }
    },[socket,handleSocketConnect,handleSocketPing,handleSocketTimer,handleSocketDisplay]);

    // Counting

    const [clock,setClock] = useState(false);
    useEffect(() => {
        let thetime = Date.now()+0.5-systemTimeOffset;
        let unclamped = 1000-(thetime/1000-(Math.floor(thetime/1000)))*1000;
        let maxclamp = Math.max(unclamped, 300);
        let minclamp = Math.min(maxclamp, 1500); // 1000ms - offset from last second
        setTimeout(()=>{
            setClock(!clock);
            setTimer(Math.floor((targetTime-thetime)/1000));
        },minclamp);
    },[clock,targetTime,systemTimeOffset,setClock,setTimer])

    useEffect(() => {
        let thetime = Date.now()+0.5-systemTimeOffset;
        setTimer(Math.floor((targetTime-thetime)/1000));
    },[systemTimeOffset,targetTime])

    // Update counters on timer change.

    useEffect(() => {
      setDays(Math.floor(timer/(3600*24)));
      setHours(Math.floor(timer/3600)-(Math.floor(timer/(3600*24))*24));
      setMinutes(Math.floor(timer/60)-(Math.floor(timer/3600)*60));
      setSeconds(timer%60);
    },[setDays,setHours,setMinutes,setSeconds,timer])

    // Update size on width change

    const widthUpdateSize = useCallback(() => {
        let newFontSize: number = (window.innerWidth/96)*globalState.size;
        setFontSize(newFontSize);
    },[setFontSize,globalState])

    window.addEventListener('resize',widthUpdateSize)

    // Global State Change Effect

    useEffect(() => { widthUpdateSize(); },[globalState,widthUpdateSize])

    // Rendering The Component

    if(timer >= 0) {
        return (
            <div className="counter">
                <span id="timer" style={{ fontSize: `${fontSize}px`, color: `#${globalState.color}` }}>
                    {(days > 0)?(days.toString().padStart(2,"0")+":"):""}
                    {((days > 0) || (hours > 0))?(hours.toString().padStart(2,"0")+":"):""}
                    {((days > 0) || (hours > 0) || (minutes > 0))?(minutes.toString().padStart(2,"0")+":"):""}
                    {((days > 0) || (hours > 0) || (minutes > 0))?(seconds.toString().padStart(2,"0")):(seconds.toString())}
                </span>
            </div>
        );
    } else {
        return (
            <div className="counter">
                <span id="timer" style={{ fontSize: `${fontSize}px`, color: `#${globalState.endColor}` }}>{globalState.endTxt}</span>
            </div>
        );
    }
}