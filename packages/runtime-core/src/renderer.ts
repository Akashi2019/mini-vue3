import { createAppAPI } from './apiCreateApp';

export function createRenderer(renderOptions) {
  const render = (vnode, container) => {};

  return {
    createApp: createAppAPI(render)
  };
}
