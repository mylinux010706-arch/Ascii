const video=document.getElementById("video")
const asciiCanvas=document.getElementById("asciiCanvas")
const processCanvas=document.getElementById("processCanvas")

const asciiCtx=asciiCanvas.getContext("2d")
const processCtx=processCanvas.getContext("2d")

const colorBtn=document.getElementById("colorMode")
const greenBtn=document.getElementById("greenMode")
const whiteBtn=document.getElementById("whiteMode")

const startBtn=document.getElementById("startRecord")
const stopBtn=document.getElementById("stopRecord")
const downloadLink=document.getElementById("downloadLink")

let mode="color"

const chars="@$#%&BWM*oahkbdpqwmZ0OQLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,^`'. "

let recorder
let chunks=[]

navigator.mediaDevices.getUserMedia({
video:{
facingMode:"user",
width:{ideal:1280},
height:{ideal:720}
}
}).then(stream=>{
video.srcObject=stream
video.play()
})

colorBtn.onclick=()=>mode="color"
greenBtn.onclick=()=>mode="green"
whiteBtn.onclick=()=>mode="white"

video.addEventListener("play",()=>{

asciiCanvas.width=420
asciiCanvas.height=520

processCanvas.width=120
processCanvas.height=150

draw()

})

function randomChar(brightness){

let index=Math.floor(Math.random()*chars.length)

if(brightness<50) index=Math.floor(Math.random()*10)
if(brightness<100) index=Math.floor(Math.random()*20)
if(brightness<150) index=Math.floor(Math.random()*30)

return chars[index]

}

function draw(){

processCtx.drawImage(video,0,0,processCanvas.width,processCanvas.height)

let frame=processCtx.getImageData(0,0,processCanvas.width,processCanvas.height)

let data=frame.data

asciiCtx.fillStyle="black"
asciiCtx.fillRect(0,0,asciiCanvas.width,asciiCanvas.height)

let cellW=asciiCanvas.width/processCanvas.width
let cellH=asciiCanvas.height/processCanvas.height

asciiCtx.font=cellH+"px monospace"

for(let y=0;y<processCanvas.height;y++){

for(let x=0;x<processCanvas.width;x++){

let i=(y*processCanvas.width+x)*4

let r=data[i]
let g=data[i+1]
let b=data[i+2]

let brightness=(r+g+b)/3

let char=randomChar(brightness)

if(mode==="color"){
asciiCtx.fillStyle="rgb("+r+","+g+","+b+")"
}

if(mode==="green"){
asciiCtx.fillStyle="#00ff88"
}

if(mode==="white"){
asciiCtx.fillStyle="white"
}

asciiCtx.fillText(char,x*cellW,y*cellH)

}

}

requestAnimationFrame(draw)

}

startBtn.onclick=()=>{

let stream=asciiCanvas.captureStream(30)

recorder=new MediaRecorder(stream)

chunks=[]

recorder.ondataavailable=e=>{
chunks.push(e.data)
}

recorder.onstop=()=>{

let blob=new Blob(chunks,{type:"video/webm"})

let url=URL.createObjectURL(blob)

downloadLink.href=url
downloadLink.download="ascii-video.webm"

}

recorder.start()

}

stopBtn.onclick=()=>{

if(recorder){
recorder.stop()
}

}
