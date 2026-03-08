const video=document.getElementById("video")
const ascii=document.getElementById("ascii")
const process=document.getElementById("process")

const ctx=ascii.getContext("2d")
const pctx=process.getContext("2d")

const bwBtn=document.getElementById("bw")
const colorBtn=document.getElementById("color")

let mode="bw"

const chars="█▓▒@#MW8B&%$+=-:. "

let faceDetector
let faces=[]



/* camera */

navigator.mediaDevices.getUserMedia({

video:{facingMode:"user"}

}).then(stream=>{

video.srcObject=stream

})



/* face detector */

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



/* setup */

video.onloadeddata=()=>{

ascii.width=640
ascii.height=480

process.width=80
process.height=60

detectFaces()

draw()

}



bwBtn.onclick=()=>mode="bw"
colorBtn.onclick=()=>mode="color"



function draw(){

/* crop video supaya tidak gepeng */

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

ctx.font="bold "+ch+"px monospace"



/* ascii render */

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



if(mode==="bw"){

if(brightness<90){

char="█"

}else if(brightness<160){

char="▓"

}else{

char="."

}

ctx.fillStyle="white"

}else{

ctx.fillStyle=`rgb(${r},${g},${b})`

}



ctx.fillText(char,px,py)

}

}



/* FACE MASK (menutup wajah total) */

faces.forEach(face=>{

let box=face.boundingBox



let fx=box.x/video.videoWidth*ascii.width
let fy=box.y/video.videoHeight*ascii.height

let fw=box.width/video.videoWidth*ascii.width
let fh=box.height/video.videoHeight*ascii.height



/* background hitam */

ctx.fillStyle="black"

ctx.fillRect(fx,fy,fw,fh)



/* isi X */

ctx.fillStyle="white"

let size=20

ctx.font="bold "+size+"px monospace"



for(let y=fy;y<fy+fh;y+=size){

for(let x=fx;x<fx+fw;x+=size){

ctx.fillText("X",x,y)

}

}

})



requestAnimationFrame(draw)

}
