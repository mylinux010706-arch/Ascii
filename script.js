const video=document.getElementById("video")
const ascii=document.getElementById("ascii")
const process=document.getElementById("process")

const ctx=ascii.getContext("2d")
const pctx=process.getContext("2d")

const bwBtn=document.getElementById("bw")
const colorBtn=document.getElementById("color")

let mode="bw"

const chars="█▓▒@#MWB8&%$+=-:. "

let faces=[]
let faceDetector

navigator.mediaDevices.getUserMedia({
video:{facingMode:"user"}
}).then(stream=>{
video.srcObject=stream
})

if("FaceDetector" in window){
faceDetector=new FaceDetector({fastMode:true,maxDetectedFaces:2})
}

async function detectFaces(){
if(!faceDetector)return
try{
faces=await faceDetector.detect(video)
}catch(e){}
}

setInterval(detectFaces,500)

video.onloadeddata=()=>{

ascii.width=360
ascii.height=640

draw()

}

bwBtn.onclick=()=>mode="bw"
colorBtn.onclick=()=>mode="color"

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

let gridX
let gridY

if(mode==="color"){
gridX=26
gridY=46
}else{
gridX=40
gridY=72
}

process.width=gridX
process.height=gridY

let vw=video.videoWidth
let vh=video.videoHeight

let targetRatio=9/16
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

pctx.drawImage(video,sx,sy,sw,sh,0,0,gridX,gridY)

let frame=pctx.getImageData(0,0,gridX,gridY)
let data=frame.data

ctx.fillStyle="black"
ctx.fillRect(0,0,ascii.width,ascii.height)

let cw=ascii.width/gridX
let ch=ascii.height/gridY

ctx.font="bold "+ch+"px monospace"

for(let y=0;y<gridY;y++){

for(let x=0;x<gridX;x++){

let i=(y*gridX+x)*4

let r=data[i]
let g=data[i+1]
let b=data[i+2]

let brightness=(r*0.299+g*0.587+b*0.114)

let char=chars[Math.floor(brightness/255*(chars.length-1))]

if(insideFace(x,y)){
char="0"
}

let px=x*cw
let py=y*ch

if(mode==="bw"){

if(brightness>150){
char="."
}else{
char="█"
}

ctx.fillStyle="white"

}else{

ctx.fillStyle="rgb("+r+","+g+","+b+")"

}

ctx.fillText(char,px,py)

}

}

requestAnimationFrame(draw)

}
