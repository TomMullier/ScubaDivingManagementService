const config = {
  view: document.querySelector('.app'),
  preload: true,
  native: true,
  autoUpdate:true,
  touch: true,
  mouse: true

  
};

const r = window.rolly(config);
r.init();