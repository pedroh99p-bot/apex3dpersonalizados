const definitions = [
  ['product','Produto'],['size','Tamanho'],['photos','Fotos'],['personalization','Roupa e pose'],
  ['extras','Adicionais'],['packaging','Embalagem'],['delivery','Data'],['review','Revisão']
];
export function createJourney({validate, showErrors, price}) {
  const form=document.querySelector('#configurator'),nav=document.querySelector('#journey-stepper'),progress=document.querySelector('#journey-progress');
  const next=document.querySelector('#journey-next'),back=document.querySelector('#journey-back'),mobile=document.querySelector('#mobile-order-bar');
  const completed=new Set(); let current=0;
  const buttons=definitions.map(([key,label],i)=>{
    const button=document.createElement('button');button.type='button';button.dataset.journeyStep=key;
    button.innerHTML='<span class="step-circle">'+(i+1)+'</span><span>'+label+'<small class="step-status">Próximo</small></span>';
    button.addEventListener('click',()=>goTo(i));nav.append(button);return button;
  });
  function panel(key){return form.querySelector('[data-step="'+key+'"]');}
  function stepForField(field){
    const input=[...form.querySelectorAll('[data-field]')].find(n=>n.dataset.field===field);
    if(input)return definitions.findIndex(([key])=>key===input.closest('[data-step]')?.dataset.step);
    if(field==='uploads')return 2;
    if(field==='figures'||field==='mf_pets_option')return 4;
    if(field==='product')return 0;
    if(field==='size')return 1;
    return 7;
  }
  function errorsFor(index){return validate().errors.filter(e=>stepForField(e.field)===index);}
  function refresh(){
    definitions.forEach(([key,label],i)=>{
      if(panel(key))panel(key).hidden=i!==current;
      const done=completed.has(i)&&errorsFor(i).length===0;
      buttons[i].setAttribute('aria-current',i===current?'step':'false');
      buttons[i].dataset.complete=String(done);
      buttons[i].querySelector('.step-status').textContent=i===current?'Atual':done?'Concluído':completed.has(i)?'Revisar':'Próximo';
    });
    nav.dataset.currentStep=definitions[current][0]; progress.textContent='Etapa '+(current+1)+' de 8 · '+definitions[current][1];
    back.disabled=current===0;next.hidden=current===7;
    document.querySelector('#mobile-total').textContent=price();
    for(const id of ['summary-continue','mobile-continue'])document.getElementById(id).textContent=current===7?'Revisar pedido':'Continuar →';
  }
  function goTo(index,{focus=true}={}){
    current=Math.max(0,Math.min(7,index));refresh();
    if(focus){const target=panel(definitions[current][0]);target.tabIndex=-1;target.focus({preventScroll:true});document.querySelector('#journey-stepper').scrollIntoView({block:'start',behavior:'instant'});}
  }
  function advance(){
    if(current===7){form.requestSubmit();return;}
    const errors=errorsFor(current);showErrors(errors);
    if(errors.length)return;
    completed.add(current);goTo(current+1);
  }
  next.addEventListener('click',advance);back.addEventListener('click',()=>goTo(current-1));
  for(const id of ['summary-continue','mobile-continue'])document.getElementById(id).addEventListener('click',advance);
  const observer=new IntersectionObserver(entries=>{mobile.hidden=!entries[0].isIntersecting;},{threshold:0});
  observer.observe(document.querySelector('#personalize'));
  refresh();
  return {refresh,goTo,revealField:field=>goTo(Math.max(0,stepForField(field)),{focus:false}),reset:()=>{completed.clear();goTo(0,{focus:false});}};
}
