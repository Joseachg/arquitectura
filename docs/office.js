import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';

// Oficina de juguete: cada actor conserva una responsabilidad del diagrama.
export function createOffice(container, { onSelect, reducedMotion }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#182c32');
  const camera = new THREE.OrthographicCamera(-10, 10, 7, -7, .1, 100);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.domElement.setAttribute('aria-label', 'Oficina 3D: cliente, recepción, encargada, archivista y archivo de datos.');
  renderer.domElement.setAttribute('role', 'img');
  container.append(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.enablePan = false;
  controls.minPolarAngle = .35; controls.maxPolarAngle = Math.PI / 2.25;
  controls.minZoom = .7; controls.maxZoom = 2.1;
  const colors = ['#91b9ec', '#b5a0ea', '#b7db6a', '#e3ae70', '#77bda6'];
  const homes = [new THREE.Vector3(-6,0,1.35),new THREE.Vector3(-3.25,0,.7),new THREE.Vector3(.05,0,.7),new THREE.Vector3(3.25,0,.7),new THREE.Vector3(6,0,.25)];
  const materialCache = new Map();
  const mat = color => {
    if(!materialCache.has(color)) materialCache.set(color, new THREE.MeshStandardMaterial({color,roughness:.8}));
    return materialCache.get(color);
  };
  function mesh(geometry, color, parent, x=0,y=0,z=0) {
    const m = new THREE.Mesh(geometry, mat(color));m.position.set(x,y,z);
    m.castShadow = true;m.receiveShadow = true;parent.add(m);return m;
  }
  const box = (parent,w,h,d,color,x=0,y=0,z=0) => mesh(new THREE.BoxGeometry(w,h,d),color,parent,x,y,z);
  const ball = (parent,r,color,x=0,y=0,z=0) => mesh(new THREE.SphereGeometry(r,16,12),color,parent,x,y,z);
  const cylinder = (parent,r1,r2,h,color,x=0,y=0,z=0) => mesh(new THREE.CylinderGeometry(r1,r2,h,20),color,parent,x,y,z);
  function textSprite(text, width=3, color='#203e39', background='#f3f1e8') {
    const canvas = document.createElement('canvas');canvas.width=768;canvas.height=160;
    const ctx=canvas.getContext('2d');ctx.fillStyle=background;ctx.fillRect(0,0,768,160);
    ctx.fillStyle=color;ctx.font='600 46px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,384,80,730);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
    const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false}));
    sprite.scale.set(width,width*160/768,1);return sprite;
  }
  scene.add(new THREE.HemisphereLight('#fff5dd','#4e7078',2.7));
  const sun=new THREE.DirectionalLight('#fff2d5',3.1);sun.position.set(-4,12,9);sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-12,right:12,top:9,bottom:-9,near:.5,far:35});
  sun.shadow.normalBias=.035;sun.shadow.bias=-.0002;scene.add(sun);
  const fill=new THREE.DirectionalLight('#bccde9',1.1);fill.position.set(8,5,-5);scene.add(fill);
  const building=new THREE.Group();scene.add(building);
  box(building,16.3,.45,7.6,'#435d57',0,-.29,-.25);
  box(building,16.05,.13,7.4,'#e6dfcc',0,-.04,-.25);
  for(let x=-7.8;x<8;x+=1.05)box(building,.012,.009,7.25,'#c9c3af',x,.032,-.25);
  for(let z=-3.7;z<3.4;z+=1.05)box(building,15.8,.009,.012,'#c9c3af',0,.033,z);
  box(building,13.6,2.45,.15,'#8eaf9e',1.1,1.2,-3.75);
  box(building,.15,1.15,7.25,'#aac4b0',8,.56,-.25);
  box(building,13.7,.15,.27,'#d8e3c8',1.1,2.43,-3.75);
  box(building,.19,.12,7.3,'#d8e3c8',8,1.17,-.25);
  for(const x of [-3.4,2.0]){
    box(building,2.4,1.35,.09,'#d7e6d9',x,1.5,-3.62);
    box(building,2.18,1.14,.06,'#648d8c',x,1.5,-3.55);
    box(building,.06,1.2,.08,'#d7e6d9',x,1.5,-3.49);
    box(building,2.2,.06,.08,'#d7e6d9',x,1.5,-3.49);
  }
  const processSign=textSprite('UN SOLO PROCESO FLASK',4.2,'#f1f6e8','#36534c');processSign.position.set(.2,2.8,-3.3);building.add(processSign);
  box(building,.04,.014,6.3,'#547762',-4.95,.045,-.1);
  const clientSign=textSprite('CLIENTE / HTTP',2.25,'#e9f2ed','#3a5360');clientSign.position.set(-6.2,.45,2.85);building.add(clientSign);
  const tickets=[],objects=[];
  function plant(x,z) {
    cylinder(building,.25,.19,.43,'#d3a27c',x,.23,z);cylinder(building,.21,.21,.05,'#504d38',x,.45,z);
    for(let i=0;i<5;i++){
      const leaf=mesh(new THREE.SphereGeometry(.18,8,6),'#557d50',building,x+Math.sin(i*1.3)*.2,.72+i*.07,z+Math.cos(i*1.3)*.15);
      leaf.scale.set(.8,2.2,.5);leaf.rotation.z=Math.sin(i)*.6;
    }
  }
  plant(-7.15,-2.8);plant(7.1,-2.8);plant(7,2.45);
  box(building,2,.025,2.05,'#8bb4bc',-6,.05,.95);
  box(building,1.8,.15,.58,'#ba8c65',-6,.55,-1.55);box(building,1.8,.45,.12,'#ba8c65',-6,.85,-1.85);
  for(const x of [-6.65,-5.35])box(building,.1,.5,.45,'#59696b',x,.27,-1.55);
  function station(i,x,role){
    const group=new THREE.Group();group.userData.component=i;scene.add(group);objects.push(group);
    box(group,2.1,.18,1.1,'#d8b993',x,.9,-1.0);
    for(const dx of [-.85,.85])for(const dz of [-.4,.4])box(group,.09,.84,.09,'#596764',x+dx,.43,-1+dz);
    box(group,1.6,.55,.05,colors[i],x,.59,-.43);
    const roleLabel=textSprite(role,2.1,'#30433d',colors[i]);roleLabel.position.set(x,.53,-.38);group.add(roleLabel);
    const label=textSprite(['','CONTROLADOR','SERVICIO','REPOSITORIO'][i],2.5,'#e9f2ed','#324c45');label.position.set(x,2.65,-1.55);group.add(label);
    return group;
  }
  const reception=station(1,-3.25,'RECEPCIÓN');
  const laptop=box(reception,.8,.52,.07,'#334958',-3.25,1.24,-1.12);laptop.rotation.x=-.13;
  box(reception,.68,.39,.018,'#82c7b4',-3.25,1.25,-1.067);box(reception,.87,.04,.45,'#425868',-3.25,1.015,-.82);
  box(reception,.22,.1,.22,'#dab464',-2.48,1.05,-1.02);
  const manager=station(2,.05,'REVISIÓN DE REGLAS');
  box(manager,.7,.045,.48,'#f5edcd',.05,1.02,-.95);
  for(let i=0;i<3;i++)box(manager,.42,.008,.02,'#86a77c',.05,1.047,-1.07+i*.1);
  const board=textSprite('NOMBRE · TURNO · CUPOS',3,'#31553e','#e0eaca');board.position.set(.1,1.8,-2.5);building.add(board);
  const repository=station(3,3.25,'CONSULTA Y GUARDADO');
  for(let i=0;i<3;i++)box(repository,.68,.08,.47,['#9dafb0','#d8b77e','#d8d3af'][i],3.25,1.04+i*.08,-.95);
  const archive=new THREE.Group();archive.userData.component=4;scene.add(archive);objects.push(archive);
  box(archive,1.55,2.3,.95,'#698d79',6,1.18,-.7);
  const drawers=[];
  for(let i=0;i<3;i++){
    const drawer=new THREE.Group();drawer.position.set(6,.53+i*.68,-.15);archive.add(drawer);
    box(drawer,1.38,.6,.13,'#98b49b');box(drawer,.32,.05,.08,'#425d50',0,.11,.1);box(drawer,.48,.13,.015,'#eee7d4',0,-.09,.09);drawers.push(drawer);
  }
  const archiveLabel=textSprite('MEMORIA',2.35,'#f1f6e8','#36534c');archiveLabel.position.set(6,2.7,-.65);archive.add(archiveLabel);
  const dataLabel=textSprite('CUPOS: 2   /   RESERVAS: 0',3.2);dataLabel.position.set(5.9,3.2,-.65);archive.add(dataLabel);
  for(let i=0;i<2;i++)tickets.push(box(archive,.28,.03,.35,'#c8eb82',5.67+i*.53,2.36,-.65));
  function makePerson(i,skin,hair){
    const person=new THREE.Group();person.position.copy(homes[i]);person.userData.component=i;scene.add(person);objects.push(person);
    const body=new THREE.Group();person.add(body);
    cylinder(body,.25,.28,.58,colors[i],0,1.02,0);ball(body,.27,skin,0,1.59,0);
    const hairMesh=ball(body,.279,hair,0,1.66,-.065);hairMesh.scale.set(1,.72,.9);
    ball(body,.052,skin,-.269,1.57,0);ball(body,.052,skin,.269,1.57,0);
    for(const x of [-.092,.092])ball(body,.025,'#253c38',x,1.62,.247);
    const smile=mesh(new THREE.TorusGeometry(.066,.012,5,12,Math.PI),'#955f47',body,0,1.49,.245);smile.rotation.z=Math.PI;
    cylinder(body,.065,.065,.14,skin,0,1.33,0);box(body,.13,.15,.026,'#f6f1da',.12,1.05,.255);
    const arms=[],legs=[];
    for(const direction of [-1,1]){
      const arm=new THREE.Group();arm.position.set(direction*.3,1.23,0);body.add(arm);
      cylinder(arm,.075,.064,.36,colors[i],0,-.15,0);ball(arm,.068,skin,0,-.36,0);arms.push(arm);
      const leg=new THREE.Group();leg.position.set(direction*.12,.72,0);body.add(leg);
      cylinder(leg,.087,.074,.55,'#415466',0,-.25,0);box(leg,.18,.12,.28,'#263d40',0,-.53,.035);legs.push(leg);
    }
    if(i===1){for(const x of [-.092,.092]){const frame=mesh(new THREE.TorusGeometry(.061,.012,5,12),'#354555',body,x,1.62,.259);frame.scale.y=.8;}box(body,.06,.012,.018,'#354555',0,1.62,.268);}
    if(i===2){const bun=ball(body,.15,hair,0,1.78,-.22);bun.scale.set(1,.8,1);}
    const ring=mesh(new THREE.TorusGeometry(.46,.025,6,32),colors[i],person,0,.057,0);ring.rotation.x=-Math.PI/2;
    const role=textSprite(['CLIENTE','RECEPCIÓN','ENCARGADA','ARCHIVISTA'][i],1.7,'#30433d',colors[i]);role.position.set(0,2.17,0);person.add(role);
    return {group:person,body,arms,legs,ring,role,home:homes[i].clone()};
  }
  const actors=[makePerson(0,'#dba981','#413d36'),makePerson(1,'#ebc3a1','#514037'),makePerson(2,'#a97551','#2d3530'),makePerson(3,'#e6b895','#665443')];
  actors[0].group.rotation.y=Math.PI/2;
  const documentGroup=new THREE.Group();scene.add(documentGroup);
  box(documentGroup,.35,.45,.025,'#fff4d0');
  for(let i=0;i<3;i++)box(documentGroup,.21,.018,.008,'#839b8a',0,.11-i*.09,.02);
  box(documentGroup,.09,.05,.008,'#7eaf84',.06,-.15,.02);documentGroup.visible=false;
  let activeMotion=null,speechIndex=-1,pauseMotion=false,selected=0,lastTime=0,idleTime=0,speechRole='',speechText='';
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let down=null;
  renderer.domElement.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};});
  renderer.domElement.addEventListener('pointerup',e=>{
    if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>6)return;
    const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
    raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(objects,true)[0];
    if(hit){let obj=hit.object;while(obj&&obj.userData.component===undefined)obj=obj.parent;if(obj)onSelect(obj.userData.component);}
  });
  function resetPose(){actors.forEach((a,i)=>{a.group.position.copy(a.home);a.group.rotation.y=i===0?Math.PI/2:0;a.body.position.y=0;a.arms.forEach(arm=>arm.rotation.set(0,0,0));a.legs.forEach(leg=>leg.rotation.set(0,0,0));});drawers.forEach(d=>d.position.z=-.15);}
  function setData(cups,reservations){
    const canvas=dataLabel.material.map.image;const ctx=canvas.getContext('2d');ctx.fillStyle='#f3f1e8';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#203e39';ctx.fillText(`CUPOS: ${cups}   /   RESERVAS: ${reservations}`,384,80,730);dataLabel.material.map.needsUpdate=true;tickets.forEach((t,i)=>{t.visible=i<cups;});
  }
  function reset(){activeMotion=null;pauseMotion=false;resetPose();documentGroup.visible=false;speechIndex=-1;document.getElementById('speech').hidden=true;}
  function lookAt(a,target){a.group.rotation.y=Math.atan2(target.x-a.group.position.x,target.z-a.group.position.z);}
  function paperAt(a){const offset=new THREE.Vector3(.27,1.08,.36).applyAxisAngle(new THREE.Vector3(0,1,0),a.group.rotation.y);documentGroup.position.copy(a.group.position).add(offset);documentGroup.rotation.set(-.1,a.group.rotation.y,0);}
  function settle(m){
    if(m.type==='cabinet'){m.actor.group.position.copy(m.end);lookAt(m.actor,homes[4]);drawers[1].position.z=.12;paperAt(m.actor);}
    else if(m.type==='retrieve'){m.actor.group.position.copy(m.end);m.actor.group.rotation.y=0;paperAt(m.actor);}
    else if(m.type==='handover'){m.actor.group.position.copy(m.actor.home);m.actor.group.rotation.y=m.index===0?Math.PI/2:0;const receiver=actors[m.to];receiver.arms[1].rotation.x=-.8;paperAt(receiver);}
    else paperAt(m.actor);
  }
  function action(step,{speed=1,text='',role='',speaker=step.to}={}){
    resetPose();documentGroup.visible=true;pauseMotion=false;
    const index=step.from===4?3:step.from,actor=actors[index];let type='handover',end;
    if(step.from===step.to){type='inspect';end=actor.home.clone();}
    else if(step.to===4){type='cabinet';end=new THREE.Vector3(5.75,0,.5);}
    else if(step.from===4){type='retrieve';actor.group.position.set(5.75,0,.5);end=actor.home.clone();}
    else{const target=actors[step.to].home;const direction=actor.home.clone().sub(target).normalize();end=target.clone().addScaledVector(direction,.86);lookAt(actors[step.to],actor.home);}
    activeMotion={type,index,to:step.to,actor,start:actor.group.position.clone(),end,elapsed:0,duration:2.5/speed,speed};
    speechIndex=speaker;speechRole=role;speechText=text;actor.arms[1].rotation.x=-.75;paperAt(actor);
    if(reducedMotion.matches){settle(activeMotion);activeMotion=null;}
  }
  function walk(a,p){a.legs[0].rotation.x=Math.sin(p*Math.PI*8)*.48;a.legs[1].rotation.x=-a.legs[0].rotation.x;a.arms[0].rotation.x=-a.legs[0].rotation.x*.5;a.body.position.y=Math.abs(Math.sin(p*Math.PI*8))*.04;}
  function updateMotion(dt){
    if(!activeMotion||pauseMotion)return;const m=activeMotion;m.elapsed+=dt;const p=Math.min(1,m.elapsed/m.duration),a=m.actor;
    if(m.type==='inspect'){a.arms[1].rotation.x=-1.05+Math.sin(p*Math.PI*4)*.18;a.group.rotation.y=0;paperAt(a);}
    else if(m.type==='handover'){
      if(p<.48){const progress=p/.48;a.group.position.lerpVectors(m.start,m.end,progress);lookAt(a,m.end);walk(a,progress);paperAt(a);}
      else if(p<.68){a.group.position.copy(m.end);a.legs.forEach(l=>l.rotation.x=0);a.arms[1].rotation.x=-1.3;const receiver=actors[m.to];receiver.arms[1].rotation.x=-1.1;paperAt(receiver);}
      else{const progress=(p-.68)/.32;a.group.position.lerpVectors(m.end,m.start,progress);lookAt(a,m.start);walk(a,progress);paperAt(actors[m.to]);}
    }else{
      const progress=Math.min(1,p/.78);a.group.position.lerpVectors(m.start,m.end,progress);lookAt(a,m.end);walk(a,progress);paperAt(a);
      if(m.type==='cabinet'&&p>.7){drawers[1].position.z=-.15+Math.min(1,(p-.7)/.25)*.45;a.arms[1].rotation.x=-1.2;}
    }
    if(p===1){a.legs.forEach(l=>l.rotation.x=0);a.body.position.y=0;settle(m);activeMotion=null;}
  }
  function highlight(i){selected=i;actors.forEach((a,j)=>{a.ring.material=mat(j===i?'#f2f4b5':colors[j]);a.ring.scale.setScalar(j===i?1.25:1);});}
  function resetCamera(){camera.position.set(10.5,11.5,17);controls.target.set(0,.6,-.25);camera.zoom=1;camera.updateProjectionMatrix();controls.update();}
  function resize(){const w=container.clientWidth,h=container.clientHeight;renderer.setSize(w,h);const aspect=w/h,horizontal=Math.max(18.3,14*aspect);camera.left=-horizontal/2;camera.right=horizontal/2;camera.top=horizontal/aspect/2;camera.bottom=-camera.top;camera.updateProjectionMatrix();}
  function rotate(angle){const offset=camera.position.clone().sub(controls.target).applyAxisAngle(new THREE.Vector3(0,1,0),angle);camera.position.copy(controls.target).add(offset);controls.update();}
  function zoom(delta){camera.zoom=THREE.MathUtils.clamp(camera.zoom+delta,.7,2.1);camera.updateProjectionMatrix();}
  function updateSpeech(){
    const bubble=document.getElementById('speech');if(speechIndex<0){bubble.hidden=true;return;}
    const position=speechIndex===4?new THREE.Vector3(6,2.55,.3):actors[speechIndex].group.position.clone().add(new THREE.Vector3(0,2.5,0));position.project(camera);bubble.hidden=position.z>1;
    const w=container.clientWidth,h=container.clientHeight,x=(position.x*.5+.5)*w,y=(-position.y*.5+.5)*h;
    bubble.style.left=`${Math.max(100,Math.min(w-100,x))}px`;bubble.style.top=`${Math.max(85,Math.min(h-95,y))}px`;document.getElementById('speech-role').textContent=speechRole;document.getElementById('speech-text').textContent=speechText;
  }
  renderer.setAnimationLoop(time=>{
    const dt=Math.min(.05,(time-lastTime)/1000||0);lastTime=time;
    if(!document.hidden){updateMotion(dt);if(!reducedMotion.matches&&!pauseMotion){idleTime+=dt;actors.forEach((a,i)=>{if(!activeMotion||activeMotion.index!==i)a.body.position.y=Math.sin(idleTime*2+i)*.013;});}controls.update();updateSpeech();renderer.render(scene,camera);}
  });
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();const notice=document.getElementById('scene-loading');notice.hidden=false;notice.textContent='La vista 3D se ha interrumpido. Puedes continuar con los pasos o recargar la página.';});
  renderer.domElement.addEventListener('webglcontextrestored',()=>{document.getElementById('scene-loading').hidden=true;});
  new ResizeObserver(resize).observe(container);resize();resetCamera();highlight(selected);
  function setSpeed(speed){if(activeMotion){const factor=activeMotion.speed/speed;activeMotion.duration*=factor;activeMotion.elapsed*=factor;activeMotion.speed=speed;}}
  return {action,reset,highlight,setData,rotate,zoom,resetCamera,setSpeed,pause:()=>{pauseMotion=true;},resume:()=>{pauseMotion=false;}};
}
