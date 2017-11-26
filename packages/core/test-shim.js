global.requestAnimationFrame = callback => {
  setTimeout(callback, 0);
};

global.document.createRange = () => {
  return {
    setEnd: () => {},
    setStart: () => {},
    getBoundingClientRect: () => {}
  };
};
