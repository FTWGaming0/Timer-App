import React, { useState, useCallback, useEffect } from "react";
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import Counter from './Counter';
import Overlay from './controls/Overlay';
import Background from './Background';
import NeverSleep from './NeverSleep/NeverSleep';
import Title from './Title';
import {
  socket, socketContext
} from "./contexts/socket";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <Container />
);

function Container() {
  const [globalState,setGlobalState] = useState({
    color: "fff",
    size: 16,
    endTxt: "END",
    title: "TITLE",
    endColor: "fff",
    titleColor: "fff",
    typing: false,
    bgHorizontal: false,
    targetTime: (Date.now()-10000)
  });
  const [newChanges,setNC] = useState(new Array<any>());
  const [changing,setChanging] = useState(false);

  function changeGlobal(props: any) {
    let anyGlobal: any = globalState;
    let temp: any = {}
    Object.keys(globalState).forEach(key => { temp[key] = (anyGlobal)[key]; });
    Object.keys(globalState).forEach(key => { if(props[key] !== undefined) temp[key] = props[key]; });
    setGlobalState(temp);
    // console.log(`Last Global State\n`,globalState,`\nInput Values\n`,props,`\nUpdated State\n`,temp);
  }

  const updateGlobal = useCallback((props: any) => {
    setNC(old => [...old, props])
  },[setGlobalState,globalState])

  useEffect(() => {
    // console.log(`[GLOBAL STATE]: Update:\n`,globalState);
    setChanging(false);
  },[globalState])

  useEffect(() => {
    if(newChanges.length > 0) {
      if(changing) {
        console.log(`[GLOBAL STATE]: Changes to make, but state is currently changing.`);
      } else {
        console.log(`[GLOBAL STATE]: Changes to make, State is not changing. Updating.`);
        setChanging(true);
        changeGlobal(newChanges[0]);
        setNC(old => {
          old.shift();
          return old;
        });
      }
    } else {
      console.log(`[GLOBAL STATE]: No more changes to make.`);
    }
  },[newChanges,changing])

  return (
    <socketContext.Provider value={socket}>
      <NeverSleep />
      <Background globalState={globalState} updateGlobal={updateGlobal}/>
      <Title globalState={globalState} updateGlobal={updateGlobal}/>
      {/* <App globalState={globalState} updateGlobal={updateGlobal}/> */}
      <Counter globalState={globalState} updateGlobal={updateGlobal}/>
      <Overlay globalState={globalState} updateGlobal={updateGlobal}/>
    </socketContext.Provider>
  )
}