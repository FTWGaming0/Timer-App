import React, { useState, useEffect, useContext, useCallback } from 'react';
import { socketContext } from "./contexts/socket";
import './styles/App.css';

function App(props: any) {
  const [keepAlive,bKA] = useState(false);

  const [targetTime,setTarget] = useState(Date.now());
  const [timer,setTimer] = useState((targetTime-Date.now())/1000);
  const socket = useContext(socketContext);

  const [seconds,setSeconds] = useState(0);
  const [minutes,setMinutes] = useState(0);
  const [hours,setHours] = useState(0);
  const [days,setDays] = useState(0);

  const [systemTimeOffset,setOffset] = useState(0);
  const [pingSent,setSent] = useState(0);
  const [pingRec,setRec] = useState(0);
  const [RTT,setRTT] = useState(0);

  const [fontSize,setFontSize] = useState(16);
  const [endTxt,setEndTxt] = useState("END");

  const globalState: { color: string, size: number, endTxt: string, title: string, endColor: string, titleColor: string } = props.globalState;
  const updateGlobal: (props: any) => void = props.updateGlobal;

  const handlePing = useCallback((PHASE: number) => {
    if(PHASE === 1) {
      console.log(`Sent UTC: ${Date.now()}`);
      setSent(Date.now());
    }
    if(PHASE === 2) {
      console.log(`Recieved UTC: ${Date.now()}`);
      setRec(Date.now());
    }
  },[setSent,setRec]);

  useEffect(() => {
    if(pingSent !== 0 && pingRec !== 0) {
      setRTT((pingRec-pingSent)/2);
      console.log(`UTC-Offset: ${systemTimeOffset}`);
      console.log(`S: ${pingSent}\nR: ${pingRec}`);
      console.log(`Round Trip Time: ${pingRec-pingSent}`);
      setOffset(systemTimeOffset-RTT);
      console.log(`Offset: ${systemTimeOffset-RTT}`);

      setRec(0);
      setSent(0);
    }
  },[RTT,systemTimeOffset,pingSent,pingRec,setRec,setSent])

  const handleSDisplay = useCallback((data: any) => {
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
  },[updateGlobal])

  // Change timer every second. + Sync to system time to avoid skipping numbers.

  useEffect(() => {
    let thetime = Date.now()+0.5-systemTimeOffset;
    let unclamped = 1000-(thetime/1000-(Math.floor(thetime/1000)))*1000;
    let maxclamp = Math.max(unclamped, 700);
    let minclamp = Math.min(maxclamp, 1300); // 1000ms - offset from last second

    setTimeout(()=>{
      bKA(!keepAlive);
      setTimer(Math.floor((targetTime-thetime)/1000));
    },minclamp);
  },[setTimer,bKA,keepAlive,targetTime,systemTimeOffset,timer]);

  // Update counters on timer change.

  useEffect(() => {
    setDays(Math.floor(timer/(3600*24)));
    setHours(Math.floor(timer/3600)-(Math.floor(timer/(3600*24))*24));
    setMinutes(Math.floor(timer/60)-(Math.floor(timer/3600)*60));
    setSeconds(timer%60);
  },[setDays,setHours,setMinutes,setSeconds,timer])

  // Socket Connect Event

  const handleSConnect = useCallback(() => {
    console.log(`Socket Connected.`);
    socket.emit(`updatetimer`,`query`);
    socket.emit(`updatedisp`,`query`);
    socket.emit(`ping`,``);
    handlePing(1);
  },[socket,handlePing])

  // Socket Disconnect Event

  const handleSDisconnect = useCallback((reason: any) => {
    console.log(`Socket Disconnect. [${reason}]`);
  },[])

  // Socket Ping Event

  const handleSPing = useCallback(() => {
    handlePing(2); // Correct UTC Difference further with adjustment for Ping based on Round-Trip Delay
  },[handlePing])

  // Socket Timer event

  const handleSTimer = useCallback((data: any) => {
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
    setTarget(newtime);
    setOffset(Date.now()-newsystime); // Correct for offset in UTC between devices
  },[setTarget,setOffset])

  // Adding Socket Listeners

  useEffect(() => {
    socket.on(`connect`, handleSConnect);
    socket.on(`disconnect`, handleSDisconnect);
    socket.on(`ping`, handleSPing);
    socket.on(`timer`, handleSTimer);
    socket.on(`display`, handleSDisplay);
    return () => {
      socket.off('connect', handleSConnect);
      socket.off('disconnect', handleSDisconnect);
      socket.off('ping', handleSPing);
      socket.off('timer', handleSTimer);
      socket.off(`display`, handleSDisplay);
    }
  },[socket,handleSConnect,handleSDisconnect,handleSPing,handleSTimer,handleSDisplay]);

  window.addEventListener('resize', () => { changeFontSize(); })

  const changeFontSize = useCallback(() => {
    let newFontSize: number = (window.innerWidth/96)*globalState.size;
    setFontSize(newFontSize)
    setEndTxt(globalState.endTxt);
  },[globalState])

  useEffect(()=>{ changeFontSize(); },[timer,globalState,changeFontSize])

  if(timer >= 0) {
    return (
      <div className="App">
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
      <div className="App">
        <span id="timer" style={{ fontSize: `${fontSize}px`, color: `#${globalState.endColor}` }}>{endTxt}</span>
      </div>
    );
  }
}

export default App;
