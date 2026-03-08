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

const chars="@#$%&MWB8*oahkbdpqwmZ0OQLCJUYXzcvunxrjft/|(){}[]<>?-_+~!;:,.^`"

let recorder
let chunks=[]

let recording=false

let seconds=0

let timerInterval



navigator.mediaDevices.getUserMedia({

video:true

}).then(stream=>{

video.srcObject=stream
video.play()

})



video.onloadeddata=()=>{

ascii.width=360
ascii.height=640

process.width=45
process.height=80

draw()

}



bwBtn.onclick=()=>mode="bw"
colorBtn.onclick=()=>mode="color"



function getChar(brightness){

let index=Math.floor(brightness/255*(chars.length-1))

return chars[index]

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

let brightness=(r+g+b)/3

let char=getChar(brightness)



if(mode==="color"){

ctx.fillStyle="rgb("+r+","+g+","+b+")"

}else{

ctx.fillStyle="white"

}



ctx.fillText(char,x*cw,y*ch)

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



recorder.ondataavailable=e=>{

chunks.push(e.data)

}



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
