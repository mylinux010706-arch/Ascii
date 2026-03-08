const video=document.getElementById("video")
const ascii=document.getElementById("ascii")
const buffer=document.getElementById("buffer")

const ctx=ascii.getContext("2d")
const bctx=buffer.getContext("2d")

let mode="bw"

const chars="█▓▒@#MWB8&%$+=-:. "

document.getElementById("bw").onclick=()=>mode="bw"
document.getElementById("color").onclick=()=>mode="color"

navigator.mediaDevices.getUserMedia({
video:{facingMode:"user"}
}).then(stream=>{
video.srcObject=stream
})

video.onloadeddata=()=>{

ascii.width=360
ascii.height=640

buffer.width=60
buffer.height=100

draw()

}

function draw(){

bctx.drawImage(video,0,0,buffer.width,buffer.height)

let frame=bctx.getImageData(0,0,buffer.width,buffer.height)
let data=frame.data

ctx.fillStyle="black"
ctx.fillRect(0,0,ascii.width,ascii.height)

let cw=ascii.width/buffer.width
let ch=ascii.height/buffer.height

ctx.font=ch+"px monospace"

for(let y=0;y<buffer.height;y++){

for(let x=0;x<buffer.width;x++){

let i=(y*buffer.width+x)*4

let r=data[i]
let g=data[i+1]
let b=data[i+2]

let brightness=(r+g+b)/3

let char

if(mode==="bw"){

char=brightness>130?" ":"█"
ctx.fillStyle="white"

}else{

let index=Math.floor(brightness/255*(chars.length-1))
char=chars[index]
ctx.fillStyle="rgb("+r+","+g+","+b+")"

}

ctx.fillText(char,x*cw,y*ch)

}

}

requestAnimationFrame(draw)

}
