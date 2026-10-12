/* CSS perspective + transform-style: preserve-3d. Sin librerías ni compilación. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const icons = [
    '<rect x="3" y="5" width="30" height="24" rx="3"/><path d="M3 11h30M7 8h1m3 0h1M12 19l-4 3 4 3m12-6 4 3-4 3"/>',
    '<path d="M6 10h24M6 26h24M12 6v8m12 8v8M18 10v16"/><circle cx="18" cy="18" r="4"/>',
    '<path d="M18 3l12 7v16l-12 7-12-7V10zM6 10l12 7 12-7M18 17v16"/>',
    '<rect x="6" y="5" width="24" height="9" rx="2"/><rect x="6" y="22" width="24" height="9" rx="2"/><path d="M18 14v8M10 9h2m-2 17h2"/>',
    '<rect x="7" y="9" width="22" height="18" rx="2"/><path d="M11 4v5m7-5v5m7-5v5M11 27v5m7-5v5m7-5v5M3 13h4m-4 9h4m22-9h4m-4 9h4M13 15h10v6H13z"/>',
  ];
  const components = [
    { title:'Navegador', file:'CLIENTE WEB', color:'#a9c5ec', description:'Envía nombre y turno mediante el formulario. Muestra el HTML y el mensaje de respuesta; la decisión de reservar ocurre en el servidor.' },
    { title:'Controlador', file:'app.py · rutas + PAGINA', color:'#baa9ee', description:'Recibe POST /reservar, llama al servicio y traduce el resultado de negocio a HTTP. Consulta el contador y renderiza el HTML. La vista está en el mismo archivo.' },
    { title:'Servicio', file:'servicio.py · ServicioReservas', color:'#c5f26e', description:'Limpia y valida el nombre, verifica el turno y aplica la regla de cupos. Devuelve un resultado de negocio independiente de Flask y de HTTP.' },
    { title:'Repositorio', file:'repositorio.py · acceso a datos', color:'#efbd8a', description:'Lee los cupos y guarda una reserva: reduce el cupo y agrega nombre y turno. Accede a las colecciones en memoria y no conoce Flask.' },
    { title:'Memoria', file:'app.config · CUPOS + RESERVAS', color:'#81ccbc', description:'Un diccionario guarda los cupos y una lista guarda las reservas. Viven en el proceso Flask; no son una base de datos y se reinician con crear_app().' },
  ];
  const positions = components.map((_, i) => ({ x:70 + i * 180, y:165 }));
  let scenario, current = -1, playing = false, timer = null, packetAnimation = null;
  let rotation = -22, tilt = 52, zoom = 1, selected = 0;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  components.forEach((c, i) => {
    const node = document.createElement('div');
    node.className = 'node'; node.dataset.index = i;
    node.style.cssText = `left:${positions[i].x}px;top:${positions[i].y}px;--color:${c.color}`;
    node.innerHTML = `<div class="face top"><span class="node-number">0${i+1}</span><svg viewBox="0 0 36 36" aria-hidden="true">${icons[i]}</svg></div><div class="face front"></div><div class="face side"></div><div class="node-label">${c.title}<span>${i === 0 ? 'HTTP · formulario' : c.file.split(' · ')[0]}</span></div>`;
    node.addEventListener('click', () => selectComponent(i));
    $('nodes').append(node);
    const button = document.createElement('button');
    button.innerHTML = `<i style="--color:${c.color}"></i>${c.title}`;
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => selectComponent(i));
    $('component-tabs').append(button);
    if (i < 4) {
      const link = document.createElement('div');link.className = 'link';
      link.style.cssText = `left:${positions[i].x+112}px;top:210px;width:68px`;
      $('connections').append(link);
    }
  });
  function selectComponent(i) {
    selected = i;
    $('detail-file').textContent = components[i].file;
    $('detail-title').textContent = components[i].title;
    $('detail-description').textContent = components[i].description;
    document.querySelectorAll('.node').forEach((n, j) => n.classList.toggle('selected', j === i));
    [...$('component-tabs').children].forEach((n, j) => n.setAttribute('aria-pressed', String(j === i)));
  }
  function stop() {
    playing = false; clearTimeout(timer); timer = null;
    $('play').textContent = current === scenario.steps.length - 1 ? '▶ Repetir' : '▶ Reproducir';
  }
  function reset() {
    if (timer) clearTimeout(timer);
    playing = false; current = -1;
    if (packetAnimation) packetAnimation.cancel();
    scenario = window.ReservaSimulation.buildScenario($('scenario').value);
    $('request-data').textContent = `nombre: "${scenario.name}"\nturno: "${scenario.turn}"`;
    $('cups').textContent = scenario.cups; $('reservations').textContent = '0'; $('http').textContent = '—';
    $('step-count').textContent = 'LISTO PARA EXPLORAR';
    $('step-title').textContent = 'Todo empieza en el navegador';
    $('step-description').textContent = 'Pulsa Reproducir o avanza paso a paso para seguir una solicitud.';
    $('play').textContent = '▶ Reproducir'; $('next').disabled = false; $('packet').hidden = true;
    document.querySelectorAll('.node').forEach(n => n.classList.remove('active'));
    $('timeline').replaceChildren(...scenario.steps.map((s, i) => {
      const li = document.createElement('li'); const number = document.createElement('span');
      number.textContent = i+1; li.append(number, document.createTextNode(s.title));return li;
    }));
  }
  function transformFor(i) { return `translate3d(${positions[i].x+48}px,${positions[i].y+37}px,76px)`; }
  function advance() {
    if (current >= scenario.steps.length - 1) { stop(); return; }
    current++; const s = scenario.steps[current];
    $('step-count').textContent = `PASO ${current+1} DE ${scenario.steps.length}`;
    $('step-title').textContent = s.title; $('step-description').textContent = s.description;
    if (s.write) { $('cups').textContent = '1'; $('reservations').textContent = '1'; }
    if (s.response) $('http').textContent = scenario.status;
    document.querySelectorAll('.node').forEach((n,i) => n.classList.toggle('active', i === s.to));
    selectComponent(s.to);
    [...$('timeline').children].forEach((li,i) => {li.classList.toggle('current',i===current);li.classList.toggle('done',i<current);});
    const entry = $('timeline').children[current];
    $('timeline').scrollTop = Math.max(0, entry.offsetTop - $('timeline').offsetTop - 45);
    const packet = $('packet'); packet.hidden = false;
    if (packetAnimation) packetAnimation.cancel();
    packet.style.transform = transformFor(s.to);
    if (!reducedMotion.matches) {
      packetAnimation = packet.animate([{transform:transformFor(s.from)},{transform:transformFor(s.to)}], {duration:850/Number($('speed').value), easing:'ease-in-out'});
    }
    $('next').disabled = current === scenario.steps.length - 1;
    if (current === scenario.steps.length - 1) stop();
  }
  function schedule() {
    timer = setTimeout(() => { if (!playing) return; advance(); if(playing) schedule(); }, 2200/Number($('speed').value));
  }
  $('play').addEventListener('click', () => {
    if (playing) {stop();return;}
    if (current === scenario.steps.length - 1) reset();
    playing = true; $('play').textContent = 'Ⅱ Pausar'; advance(); if (playing) schedule();
  });
  $('next').addEventListener('click', () => {stop();advance();});
  $('restart').addEventListener('click', reset);
  $('scenario').addEventListener('change', reset);
  $('speed').addEventListener('input', () => { $('speed-value').textContent = `${$('speed').value}×`; if(playing){clearTimeout(timer);schedule();} });
  function updateCamera() {
    const fit = Math.min(1, $('stage').clientWidth/1040);
    const world = $('world');
    world.style.setProperty('--rx',`${tilt}deg`);world.style.setProperty('--rz',`${rotation}deg`);
    world.style.setProperty('--inverse-rx',`${-tilt}deg`);world.style.setProperty('--inverse-rz',`${-rotation}deg`);
    world.style.setProperty('--zoom', String(fit*zoom));
    world.style.setProperty('--label-scale', String(Math.min(1.7, 1/fit)));
  }
  $('rotate-left').addEventListener('click',()=>{rotation-=12;updateCamera();});
  $('rotate-right').addEventListener('click',()=>{rotation+=12;updateCamera();});
  $('zoom-in').addEventListener('click',()=>{zoom=Math.min(1.6,zoom+.1);updateCamera();});
  $('zoom-out').addEventListener('click',()=>{zoom=Math.max(.65,zoom-.1);updateCamera();});
  $('reset-view').addEventListener('click',()=>{rotation=-22;tilt=52;zoom=1;updateCamera();});
  let drag = null;
  $('stage').addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;
    drag = {x:e.clientX,y:e.clientY,rotation,tilt}; $('stage').setPointerCapture(e.pointerId);
  });
  $('stage').addEventListener('pointermove',e=>{
    if(!drag)return;
    rotation=drag.rotation+(e.clientX-drag.x)*.2;
    tilt=Math.max(15,Math.min(70,drag.tilt-(e.clientY-drag.y)*.2)); updateCamera();
  });
  $('stage').addEventListener('pointerup',()=>{drag=null;});
  $('stage').addEventListener('pointercancel',()=>{drag=null;});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  new ResizeObserver(updateCamera).observe($('stage'));
  reset();selectComponent(selected);updateCamera();
})();
