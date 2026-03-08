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

ascii.width=640
ascii.height=480

draw()

}

bwBtn.onclick=()=>mode="bw"
colorBtn.onclick=()=>mode="color"

function draw(){

let gridX
let gridY

if(mode==="color"){
gridX=28
gridY=21
}else{
gridX=60
gridY=45
}

process.width=gridX
process.height=gridY

pctx.drawImage(video,0,0,gridX,gridY)

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

faces.forEach(face=>{

let box=face.boundingBox

let fx=box.x/video.videoWidth*ascii.width
let fy=box.y/video.videoHeight*ascii.height

let fw=box.width/video.videoWidth*ascii.width
let fh=box.height/video.videoHeight*ascii.height

ctx.fillStyle="black"
ctx.fillRect(fx,fy,fw,fh)

ctx.fillStyle="white"
ctx.font="bold 50px monospace"

for(let y=fy;y<fy+fh;y+=50){
for(let x=fx;x<fx+fw;x+=50){
ctx.fillText("X",x,y)
}
}

})

requestAnimationFrame(draw)

}
