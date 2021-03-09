import { ShapeFlags, isFunction, isObject } from '@vue/shared';
import { PublicInstanceProxyHandlers } from './PublicInstanceProxyHandlers';
export function createComponentInstance(vnode) {
  const instance = {
    vnode,
    type: vnode.type,
    props: {},
    attrs: {},
    slots: {},
    setupState: {},
    render: null,
    data: null,
    ctx: {},
    isMounted: false
  };

  instance.ctx = { _: instance };

  return instance;
}

export function setupComponent(instance) {
  const { props, children } = instance.vnode;
  instance.props = props;
  instance.children = children;

  let isStateful = instance.vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONMENT;
  if (isStateful) {
    setupStatefulComponent(instance);
  }
}

function setupStatefulComponent(instance) {
  instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers as any);
  let { setup } = instance.type;
  if (setup) {
    let setupContext = createSetupContext(instance);
    const setupResult = setup(instance.props, setupContext);
    handleSetupResult(instance, setupResult);
  } else {
    finishComponentSetup(instance);
  }
}

function handleSetupResult(instance, setupResult) {
  if (isFunction(setupResult)) {
    instance.render = setupResult;
  }else if(isObject(setupResult)){
    instance.setupState = setupResult;
  }
  finishComponentSetup(instance);
}

function finishComponentSetup(instance) {
  let { render, template } = instance.type;
  if (!instance.render) {
    if(!render && template){
      instance.render = render;
    }
  }
}

function createSetupContext(instance) {
  return {
    props: instance.props,
    attrs: instance.attrs,
    slots: instance.slots,
    emit: () => {},
    expose: () => {}
  };
}
