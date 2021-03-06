import { extend } from '@vue/shared';
import { nodeOps } from './nodeOps';
import { patchProp } from './patchProp';
import { createRenderer } from '@vue/runtime-core';

const renderOptions = extend({ patchProp }, nodeOps);

export function createApp(rootComponent, rootProps = null) {
  const app = createRenderer(renderOptions).createApp(rootComponent, rootProps);
  let { mount } = app;
  app.mount = (container: any) => {
    container = nodeOps.querySelector(container);
    container.innerHTML = '';
    mount(container);
  };
  return app;
}

export * from '@vue/runtime-core';
