const video=document.getElementById("video")
const ascii=document.getElementById("ascii")
const process=document.getElementById("process")

const ctx=ascii.getContext("2d")
const pctx=process.getContext("2d")

const bwBtn=document.getElementById("bw")
const colorBtn=document.getElementById("color")

const recordBtn=document.getElementById("record")
const stopBtn=document.getElementById("stop")
const download=document.getElementById("download")

let mode="bw"

const chars="@$#%&*+=-:. "

let recorder
let chunks=[]

navigator.mediaDevices.getUserMedia({video:true})
.then(stream=>{
video.srcObject=stream
video.play()
})

video.onloadeddata=()=>{

ascii.width=400
ascii.height=400

process.width=80
process.height=80

draw()

}

bwBtn.onclick=()=>mode="bw"
colorBtn.onclick=()=>mode="color"

function randomChar(){
return chars[Math.floor(Math.random()*chars.length)]
}

function draw(){

pctx.drawImage(video,0,0,process.width,process.height)

let frame=pctx.getImageData(0,0,process.width,process.height)
let data=frame.data

ctx.fillStyle="black"
ctx.fillRect(0,0,ascii.width,ascii.height)

let cw=ascii.width/process.width
let ch=ascii.height/process.height

ctx.font=ch+"px monospace"

for(let y=0;y<process.height;y++){

for(let x=0;x<process.width;x++){

let i=(y*process.width+x)*4

let r=data[i]
let g=data[i+1]
let b=data[i+2]

let bright=(r+g+b)/3

let char=randomChar()

if(mode==="color"){
ctx.fillStyle="rgb("+r+","+g+","+b+")"
}else{
ctx.fillStyle=bright>120?"white":"black"
}

ctx.fillText(char,x*cw,y*ch)

}

}

requestAnimationFrame(draw)

}

recordBtn.onclick=()=>{

let stream=ascii.captureStream(30)

recorder=new MediaRecorder(stream)

chunks=[]

recorder.ondataavailable=e=>{
chunks.push(e.data)
}

recorder.onstop=()=>{

let blob=new Blob(chunks,{type:"video/webm"})
let url=URL.createObjectURL(blob)

download.href=url
download.download="ascii-video.webm"

}

recorder.start()

}

stopBtn.onclick=()=>{
if(recorder) recorder.stop()
}
