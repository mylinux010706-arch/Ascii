const video=document.getElementById("video")

const ascii=document.getElementById("ascii")
const process=document.getElementById("process")

const ctx=ascii.getContext("2d")
const pctx=process.getContext("2d")

const bwBtn=document.getElementById("bw")
const colorBtn=document.getElementById("color")

const ratio43=document.getElementById("ratio43")
const ratio916=document.getElementById("ratio916")

let mode="bw"
let ratio="43"

const chars="█▓▒@#MWB8&%$+=-:. "

let faces=[]
let faceDetector=null

navigator.mediaDevices.getUserMedia({
video:{facingMode:"user"}
}).then(stream=>{
video.srcObject=stream
})

if("FaceDetector" in window){
faceDetector=new FaceDetector({fastMode:true,maxDetectedFaces:5})
}

async function detectFaces(){

if(!faceDetector)return

try{
faces=await faceDetector.detect(video)
}catch(e){}

requestAnimationFrame(detectFaces)

}

video.onloadeddata=()=>{

setResolution()

detectFaces()

draw()

}

function setResolution(){

if(ratio==="43"){

ascii.width=800
ascii.height=600

process.width=80
process.height=60

}

if(ratio==="916"){

ascii.width=450
ascii.height=800

process.width=50
process.height=90

}

}

bwBtn.onclick=()=>mode="bw"
colorBtn.onclick=()=>mode="color"

ratio43.onclick=()=>{
ratio="43"
setResolution()
}

ratio916.onclick=()=>{
ratio="916"
setResolution()
}

function insideFace(x,y){

for(let f of faces){

let box=f.boundingBox

let fx=box.x/video.videoWidth*process.width
let fy=box.y/video.videoHeight*process.height
let fw=box.width/video.videoWidth*process.width
let fh=box.height/video.videoHeight*process.height

fw*=1.4
fh*=1.4

if(x>fx && x<fx+fw && y>fy && y<fy+fh){
return true
}

}

return false
}

function draw(){

let vw=video.videoWidth
let vh=video.videoHeight

let targetRatio=ratio==="43"?4/3:9/16
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

for(let y=0;y<process.height;y++){

for(let x=0;x<process.width;x++){

let i=(y*process.width+x)*4

let r=data[i]
let g=data[i+1]
let b=data[i+2]

let brightness=(r*0.299+g*0.587+b*0.114)

let char=chars[Math.floor(brightness/255*(chars.length-1))]

let px=x*cw
let py=y*ch

let face=insideFace(x,y)

if(face){

ctx.font="bold "+(ch*3)+"px monospace"

ctx.fillStyle="white"

char="X"

ctx.fillText(char,px,py)

}else{

ctx.font="bold "+ch+"px monospace"

if(mode==="bw"){

if(brightness>140){
ctx.fillStyle="white"
char="."
}else{
ctx.fillStyle="white"
char="█"
}

}else{

ctx.fillStyle="rgb("+r+","+g+","+b+")"

}

ctx.fillText(char,px,py)

}

}

}

requestAnimationFrame(draw)

}
