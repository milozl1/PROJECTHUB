// ui/toast.js - modular toast system
(function(global){
  function ensureContainer(){
    let c = document.querySelector('.toast-container');
    if(!c){
      c = document.createElement('div');
      c.className='toast-container';
      document.body.appendChild(c);
    }
    return c;
  }
  function pushToast(message, type='info', timeout=4000, actionText, actionCallback){
    const container = ensureContainer();
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    let inner = `<span>${message}</span>`;
    if(actionText && typeof actionCallback === 'function'){
      inner += `<button class="toast-action">${actionText}</button>`;
    }
  const closeLabel = (window.projectHub && typeof window.projectHub.t === 'function') ? window.projectHub.t('btn.close') : 'Close';
  inner += `<button class="toast-close" aria-label="${closeLabel}">×</button>`;
    el.innerHTML = inner;
    container.appendChild(el);
    const remove = ()=>{ if(el.parentNode) el.parentNode.removeChild(el); };
    el.querySelector('.toast-close').addEventListener('click', remove);
    if(actionText && typeof actionCallback === 'function'){
      const act = el.querySelector('.toast-action');
      act.addEventListener('click', ()=>{ try{ actionCallback(); }catch(e){} remove(); });
    }
    if(timeout) setTimeout(remove, timeout);
  }
  global.Toast = { push: pushToast };
})(window);
