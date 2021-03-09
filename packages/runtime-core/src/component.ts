import { ShapeFlags } from '@vue/shared';
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
  let { setup, render } = instance.type;
  let setupContext = createSetupContext(instance);

  setup(instance.props, setupContext);
  render(instance.proxy);
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
