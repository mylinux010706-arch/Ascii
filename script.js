const video=document.getElementById("video")

const ascii=document.getElementById("ascii")
const process=document.getElementById("process")

const ctx=ascii.getContext("2d")
const pctx=process.getContext("2d")

const bwBtn=document.getElementById("bw")
const colorBtn=document.getElementById("color")

const recordBtn=document.getElementById("recordBtn")
const downloadBtn=document.getElementById("downloadBtn")

const timer=document.getElementById("timer")

let mode="bw"

const chars="█▓▒@#MWB8&%$Xxo+=-:. "

let faceDetector
let faces=[]

let recorder
let chunks=[]

let recording=false

let seconds=0

let timerInterval



if("FaceDetector" in window){

faceDetector=new FaceDetector({fastMode:true,maxDetectedFaces:5})

}



navigator.mediaDevices.getUserMedia({

video:{facingMode:"user"}

}).then(stream=>{

video.srcObject=stream
video.play()

})



video.onloadeddata=()=>{

ascii.width=640
ascii.height=480

process.width=64
process.height=48

detectFaces()

draw()

}



bwBtn.onclick=()=>mode="bw"
colorBtn.onclick=()=>mode="color"



async function detectFaces(){

if(!faceDetector)return

try{

faces=await faceDetector.detect(video)

}catch(e){}

requestAnimationFrame(detectFaces)

}



function getChar(brightness){

let index=Math.floor(brightness/255*(chars.length-1))

return chars[index]

}



function insideFace(x,y){

for(let f of faces){

let box=f.boundingBox

let fx=box.x/video.videoWidth*process.width
let fy=box.y/video.videoHeight*process.height
let fw=box.width/video.videoWidth*process.width
let fh=box.height/video.videoHeight*process.height

if(x>fx && x<fx+fw && y>fy && y<fy+fh){

return true

}

}

return false

}



function draw(){

let vw=video.videoWidth
let vh=video.videoHeight

let targetRatio=4/3
let videoRatio=vw/vh

let sx=0
let sy=0
let sw=vw
let sh=vh

if(videoRatio>targetRatio){

sw=vh*targetRatio
sx=(vw-sw)/2

}else{

sh=vw/targetRatio
sy=(vh-sh)/2

}



pctx.drawImage(video,sx,sy,sw,sh,0,0,process.width,process.height)

let frame=pctx.getImageData(0,0,process.width,process.height)

let data=frame.data



ctx.fillStyle="black"
ctx.fillRect(0,0,ascii.width,ascii.height)



let cw=ascii.width/process.width
let ch=ascii.height/process.height

ctx.font="bold "+(ch*1.2)+"px monospace"



for(let y=0;y<process.height;y++){

for(let x=0;x<process.width;x++){

let i=(y*process.width+x)*4

let r=data[i]
let g=data[i+1]
let b=data[i+2]

let brightness=(r+g+b)/3

let char=getChar(brightness)

let face=insideFace(x,y)



if(face){

char="X"
ctx.fillStyle="white"

}else{

if(mode==="color"){

ctx.fillStyle="rgb("+r+","+g+","+b+")"

}else{

ctx.fillStyle="white"

}

}



let px=x*cw
let py=y*ch

ctx.strokeStyle="black"
ctx.lineWidth=2

ctx.strokeText(char,px,py)
ctx.fillText(char,px,py)

}

}



requestAnimationFrame(draw)

}



recordBtn.onclick=()=>{

if(!recording){

startRecording()

}else{

stopRecording()

}

}



function startRecording(){

let stream=ascii.captureStream(30)

recorder=new MediaRecorder(stream)

chunks=[]

recorder.ondataavailable=e=>chunks.push(e.data)

recorder.onstop=()=>{

let blob=new Blob(chunks,{type:"video/webm"})

let url=URL.createObjectURL(blob)

downloadBtn.href=url
downloadBtn.download="ascii-video.webm"

downloadBtn.style.display="inline-block"

}



recorder.start()

recording=true

recordBtn.textContent="Stop Recording"

downloadBtn.style.display="none"

seconds=0

timerInterval=setInterval(updateTimer,1000)

}



function stopRecording(){

recorder.stop()

recording=false

recordBtn.textContent="Start Recording"

clearInterval(timerInterval)

}



function updateTimer(){

seconds++

let m=Math.floor(seconds/60)
let s=seconds%60

if(m<10)m="0"+m
if(s<10)s="0"+s

timer.textContent=m+":"+s

}
