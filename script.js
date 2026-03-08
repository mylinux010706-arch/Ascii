const video=document.getElementById("video")
const canvas=document.getElementById("canvas")
const ctx=canvas.getContext("2d")
const ascii=document.getElementById("ascii")

const colorBtn=document.getElementById("colorBtn")
const monoBtn=document.getElementById("monoBtn")

let colorMode=true

const chars=" .:-=+*#%@"

navigator.mediaDevices.getUserMedia({video:true})
.then(stream=>{
video.srcObject=stream
video.play()
})

colorBtn.onclick=()=>{
colorMode=true
}

monoBtn.onclick=()=>{
colorMode=false
}

video.addEventListener("play",()=>{
canvas.width=160
canvas.height=120
draw()
})

function draw(){

ctx.drawImage(video,0,0,canvas.width,canvas.height)

let frame=ctx.getImageData(0,0,canvas.width,canvas.height)
let data=frame.data

let text=""

for(let y=0;y<canvas.height;y+=2){

for(let x=0;x<canvas.width;x++){

let i=(y*canvas.width+x)*4

let r=data[i]
let g=data[i+1]
let b=data[i+2]

let brightness=(r+g+b)/3

let charIndex=Math.floor(brightness/255*(chars.length-1))

let char=chars[charIndex]

if(colorMode){

text+="<span style='color:rgb("+r+","+g+","+b+")'>"+char+"</span>"

}else{

text+=char

}

}

text+="\n"

}

ascii.innerHTML=text

requestAnimationFrame(draw)

}