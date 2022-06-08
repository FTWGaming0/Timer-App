import React, { useContext, useCallback, useEffect, useState, SetStateAction, Dispatch } from "react";
import { socketContext } from "../contexts/socket";

function UploadBGI(props: any) {
    const socket = useContext(socketContext);
    
    const globalState: any = props.globalState;
    const updateGlobal: () => void = props.updateGlobal;

    const [selectedFile, setSelected]: [(string | Blob | undefined), Dispatch<SetStateAction<(string | Blob | undefined)>>] = useState();

    const [fileName,setFileName] = useState("");
    const [fileSize,setFileSize] = useState(0);
    const [fileType,setFileType] = useState("");

    const [times,setTimes] = useState(0);

    const [fitHorizontal,setHorizontal] = useState(props.horiz);
    const updatePersist: (state: boolean) => void = props.update;

    const handleSConnect = useCallback(() => {
        console.log(`[Background Uploader] Connected to server.`);
    },[])

    const handleSDisconnect = useCallback((reason: any) => {
        console.log(`[Background Uploader] Disconnected from server. [${reason}]`);
    },[])

    useEffect(() => {
        socket.on('connect',handleSConnect);
        socket.on('disconnect',handleSDisconnect);
        return () => {
            socket.off('connect',handleSConnect);
            socket.off('disconnect',handleSDisconnect);
        };
    },[socket,handleSConnect,handleSDisconnect])

    const fileSelectionChange = useCallback((event: any) => {
        setTimes(t => t+1);
        if(event.target.files.length === 0) return;
        let file = event.target.files[0];
        setSelected(file);
        setFileName(file.name);
        setFileSize(file.size);
        setFileType(file.type);
    },[])

    const handleSubmission = useCallback((event: any) => {
        event.preventDefault();
        if(selectedFile === undefined) return;
        const formData = new FormData();
        formData.append('File',selectedFile);
        fetch(
            `http://${window.location.hostname}:${window.location.port}/upload/`,
            // `http://${window.location.hostname}:3002/upload/`,
            {
                method: 'POST',
                body: formData,
            }
        )
            .then((result) => {
                console.log(`${(result.ok)?("File Uploaded Successfully."):("File failed to upload.")}`);
            })
            .catch((error) => {
                console.log(`There was an Error: ${error}`);
            });
    },[selectedFile])

    const fitHorizChange = useCallback((event: any) => {
        socket.emit(`background`,`set bgh ${event.target.checked}`);
        setHorizontal(event.target.checked);
        updatePersist(event.target.checked);
    },[updatePersist, socket])

    return (
        <div className="newbgi">
            <div className="control-titlebox">
                <span>Background Upload</span>
            </div>
            <div className="TS-opt">
                <div className="newbgi-container">
                    <input type="file" name={`file_${times}`} onChange={fileSelectionChange} accept=".jpg,.jpeg,.png"/>
                    <div className="newbgi-fileinfo newbgi-item">
                        <span>{"File Name: "+fileName}</span>
                        <span>{"File Size: "+fileSize}</span>
                        <span>{"File Type: "+fileType}</span>
                    </div>
                    <div className="newbgi-fithoriz">
                        <input type="checkbox" name="ts-opt-3-2" onChange={fitHorizChange} defaultChecked={fitHorizontal}></input>
                        <label htmlFor="ts-opt-3-2">Fit Horizontal</label>
                    </div>
                    <button onClick={handleSubmission} className="newbgi-upload">Upload Image</button>
                </div>
            </div>
        </div>
    )
}

export default UploadBGI;