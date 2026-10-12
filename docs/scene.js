// Presentación y reproducción. El recorrido del negocio vive en simulation.js.
(async () => {
  const $=id=>document.getElementById(id);
  const components=[
    {title:'Navegador',role:'Cliente',file:'CLIENTE WEB',color:'#91b9ec',description:'El cliente lleva el formulario a recepción y espera la respuesta. Representa al navegador: envía nombre y turno por HTTP y muestra el HTML que devuelve Flask.'},
    {title:'Controlador',role:'Recepcionista',file:'app.py · rutas + PAGINA',color:'#b5a0ea',description:'La recepcionista recibe la solicitud, la entrega a la encargada y prepara la respuesta para el cliente. Representa las rutas Flask y la presentación; no decide si hay cupos.'},
    {title:'Servicio',role:'Encargada',file:'servicio.py · ServicioReservas',color:'#b7db6a',description:'La encargada revisa nombre, turno y cupos, y decide si se permite reservar. Representa el caso de uso: solicita las consultas al archivista y devuelve un resultado de negocio, sin HTTP.'},
    {title:'Repositorio',role:'Archivista',file:'repositorio.py · acceso a datos',color:'#e3ae70',description:'El archivista consulta el archivo y registra una reserva cuando la encargada lo solicita. Representa el repositorio: lee los cupos, reduce uno y agrega la reserva; no decide la regla.'},
    {title:'Memoria',role:'Archivo',file:'app.config · CUPOS + RESERVAS',color:'#77bda6',description:'El archivador contiene las tarjetas de cupos y las reservas. Representa el diccionario y la lista en memoria del proceso Flask. Es almacenamiento pasivo, no otro personaje ni una base de datos.'},
  ];
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  let view=null,scenario,current=-1,playing=false,remaining=0,selected=0;
  function selectComponent(i){selected=i;$('detail-file').textContent=components[i].file;$('detail-title').textContent=`${components[i].role} · ${components[i].title}`;$('detail-description').textContent=components[i].description;[...$('component-tabs').children].forEach((n,j)=>n.setAttribute('aria-pressed',String(j===i)));view?.highlight(i);}
  components.forEach((c,i)=>{const b=document.createElement('button');b.innerHTML=`<i style="--color:${c.color}"></i>${c.role}`;b.title=`${c.role} representa ${c.title}`;b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>selectComponent(i));$('component-tabs').append(b);});
  function stop(){playing=false;view?.pause();$('play').textContent=current===scenario.steps.length-1?'▶ Repetir':'▶ Reproducir';}
  function reset(){playing=false;remaining=0;current=-1;view?.reset();scenario=window.ReservaSimulation.buildScenario($('scenario').value);$('request-data').textContent=`nombre: "${scenario.name}"\nturno: "${scenario.turn}"`;$('cups').textContent=scenario.cups;$('reservations').textContent='0';$('http').textContent='—';view?.setData(scenario.cups,0);$('step-count').textContent='LISTO PARA EXPLORAR';$('step-title').textContent='El cliente llega con su solicitud';$('step-description').textContent='Pulsa Reproducir para ver cómo los personajes trabajan, o recorre la historia paso a paso.';$('play').textContent='▶ Reproducir';$('next').disabled=false;$('timeline').replaceChildren(...scenario.steps.map((s,i)=>{const li=document.createElement('li');const n=document.createElement('span');n.textContent=i+1;li.append(n,document.createTextNode(s.title));return li;}));}
  function dialogue(s){
    if(current===0)return 'Quiero reservar un almuerzo.';
    if(s.response)return scenario.message;
    if(s.write)return 'Registro a Ana. Queda 1 cupo.';
    if(s.from===s.to)return scenario.name.length<2?'Este nombre es demasiado corto.':'Reviso el nombre. ¡Es válido!';
    if(s.to===4)return s.title.includes('actualiza')?'Guardo la reserva.':'Busco el dato en el archivo.';
    if(s.from===4)return s.title.includes('actualización')?'Reserva guardada.':scenario.turn==='noche'&&current<8?'Ese turno no existe.':`${$('cups').textContent} cupos para almuerzo.`;
    if(s.to===2&&s.title.includes('decisión'))return scenario.outcome==='SIN_CUPOS'?'No quedan cupos.':scenario.outcome==='TURNO_INEXISTENTE'?'Este turno no existe.':'Hay cupos. Podemos reservar.';
    if(s.to===1&&s.title.includes('traduce'))return `Preparo la respuesta ${scenario.status}.`;
    if(s.to===1)return 'Preparo la página para el cliente.';
    if(s.to===3)return s.title.includes('guardar')?'Por favor, registra esta reserva.':'Consulta los cupos, por favor.';
    if(s.title.includes('contador'))return 'Este es el contador actualizado.';
    return s.title.includes('vista')?'Necesito el contador para la página.':'¿Puedes revisar esta solicitud?';
  }
  function advance(){
    if(current>=scenario.steps.length-1){stop();return;}current++;const s=scenario.steps[current];
    $('step-count').textContent=`PASO ${current+1} DE ${scenario.steps.length}`;$('step-title').textContent=s.title;$('step-description').textContent=s.description;
    if(s.write){$('cups').textContent='1';$('reservations').textContent='1';view?.setData(1,1);}if(s.response)$('http').textContent=scenario.status;
    selectComponent(s.to);[...$('timeline').children].forEach((li,i)=>{li.classList.toggle('current',i===current);li.classList.toggle('done',i<current);});
    const entry=$('timeline').children[current];$('timeline').scrollTop=Math.max(0,entry.offsetTop-$('timeline').offsetTop-45);
    const speaker=s.response?0:s.to===4||s.from===4?3:s.title.includes('decisión')?2:s.to===1?1:s.from;
    view?.action(s,{speed:Number($('speed').value),text:dialogue(s),role:components[speaker].role,speaker});
    $('next').disabled=current===scenario.steps.length-1;remaining=3.4/Number($('speed').value);
  }
  // La pausa congela tanto la historia como el movimiento de los personajes.
  let last=0;
  function tick(time){const dt=Math.min(.1,(time-last)/1000||0);last=time;if(playing){remaining-=dt;if(remaining<=0){if(current===scenario.steps.length-1)stop();else advance();}}requestAnimationFrame(tick);}
  requestAnimationFrame(tick);
  $('play').addEventListener('click',()=>{if(playing){stop();return;}if(current===scenario.steps.length-1)reset();playing=true;$('play').textContent='Ⅱ Pausar';if(current<0)advance();else view?.resume();});
  $('next').addEventListener('click',()=>{stop();advance();});$('restart').addEventListener('click',reset);$('scenario').addEventListener('change',reset);
  let oldSpeed=1;$('speed').addEventListener('input',()=>{const speed=Number($('speed').value);$('speed-value').textContent=`${speed}×`;remaining*=oldSpeed/speed;view?.setSpeed(speed);oldSpeed=speed;});
  $('rotate-left').addEventListener('click',()=>view?.rotate(-.18));$('rotate-right').addEventListener('click',()=>view?.rotate(.18));$('zoom-in').addEventListener('click',()=>view?.zoom(.12));$('zoom-out').addEventListener('click',()=>view?.zoom(-.12));$('reset-view').addEventListener('click',()=>view?.resetCamera());
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});reset();selectComponent(selected);
  try{const {createOffice}=await import('./office.js');view=createOffice($('office'),{onSelect:selectComponent,reducedMotion});view.setData(scenario.cups,0);$('scene-loading').hidden=true;selectComponent(selected);}
  catch(error){$('scene-loading').textContent='No se pudo iniciar la vista 3D. Comprueba que tu navegador permita WebGL; puedes seguir usando la explicación por pasos.';console.warn('Escena 3D no disponible:',error.message);document.querySelectorAll('.view-controls button').forEach(b=>{b.disabled=true;});}
})();
