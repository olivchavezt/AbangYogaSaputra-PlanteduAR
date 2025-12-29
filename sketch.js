let cam;
let modelHouse, modelPalm;
let selectedModel = null;

let objects = [];
let defaultScale = 1.1;

let bgm, clickSfx;
let bgmStarted = false;

let bottomBarHeight = 0;
let sizeSlider;

const IS_MOBILE = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const COLORS = {
  houseplant:{r:133,g:203,b:51},
  datepalm:{r:96,g:108,b:56},
  active:{r:255,g:127,b:116}
};

function preload(){
  modelHouse = loadModel('Houseplant.obj', true);
  modelPalm = loadModel('DatePalmTree.obj', true);
  bgm = loadSound('bgm.mp3');
  clickSfx = loadSound('click.mp3');
}

function setup(){
  createCanvas(windowWidth, windowHeight, WEBGL);

  cam = createCapture(VIDEO);
  cam.size(windowWidth, windowHeight);
  cam.hide();

  const canvas = document.querySelector('canvas');
  canvas.style.pointerEvents = 'none';

  const bar = document.querySelector('.bottom-bar');
  bar.style.pointerEvents = 'auto';
  bottomBarHeight = bar.offsetHeight + 40;

  sizeSlider = document.querySelector('input[type="range"]');
  sizeSlider.value = defaultScale;

  document.body.style.touchAction = 'manipulation';
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
  cam.size(windowWidth, windowHeight);
}

function draw(){
  push();
  translate(-width/2,-height/2);
  push();
  translate(width,0);
  scale(-1,1);
  image(cam,0,0,width,height);
  pop();
  pop();

  ambientLight(130);
  directionalLight(160,160,160,0,0,-1);

  for(let o of objects){
    push();
    o.float+=0.03;
    o.rot+=0.004;

    translate(o.pos.x,o.pos.y+sin(o.float)*6,o.pos.z);
    rotateX(PI);
    rotateY(o.rot);
    scale(o.scale);

    let c=o.active?COLORS.active:o.defaultColor;
    ambientMaterial(c.r,c.g,c.b);
    noStroke();
    model(o.model);
    pop();
  }
}

function handlePointer(px,py){
  if(getAudioContext().state!=='running'){
    userStartAudio();
  }

  if(py>height-bottomBarHeight)return;

  let hit=IS_MOBILE?100:60;
  let idx=-1;

  for(let i=0;i<objects.length;i++){
    let o=objects[i];
    let sx=o.pos.x+width/2;
    let sy=o.pos.y+height/2;
    if(dist(px,py,sx,sy)<hit){
      idx=i;
      break;
    }
  }

  if(idx!==-1){
    objects.forEach((o,i)=>o.active=i===idx);
    sizeSlider.value=objects[idx].scale;
    clickSfx.play();
    return;
  }

  if(!selectedModel)return;

  let type=selectedModel===modelHouse?'houseplant':'datepalm';
  objects.forEach(o=>o.active=false);

  objects.push({
    model:selectedModel,
    type:type,
    pos:createVector(px-width/2,py-height/2,120),
    rot:random(TWO_PI),
    float:random(10),
    scale:defaultScale,
    defaultColor:COLORS[type],
    active:true
  });

  sizeSlider.value=defaultScale;
  clickSfx.play();
  startBgm();
}

function mousePressed(){
  handlePointer(mouseX,mouseY);
}

function touchStarted(){
  if(touches.length>0){
    handlePointer(touches[0].x,touches[0].y);
  }
}

function startBgm(){
  if(!bgmStarted){
    bgmStarted=true;
    bgm.setLoop(true);
    bgm.setVolume(0.4);
    bgm.play();
  }
}

function selectModel(name,btn){
  if(name==='houseplant')selectedModel=modelHouse;
  if(name==='datepalm')selectedModel=modelPalm;

  document.querySelectorAll('.btn').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
}

function updateScale(val){
  let s=parseFloat(val);
  let active=objects.find(o=>o.active);
  if(active)active.scale=s;
  else defaultScale=s;
}

function removeOne(){
  let idx = objects.findIndex(o=>o.active);
  if(idx === -1) return;

  objects.splice(idx,1);

  if(objects.length>0){
    objects[objects.length-1].active=true;
    sizeSlider.value=objects[objects.length-1].scale;
  }else{
    sizeSlider.value=defaultScale;
  }
}
