import { isObject } from '@vue/shared';
import {
  mutableHandlers,
  shallowReactiveHandlers,
  readonlyHandlers,
  shallowReadonlyHandlers
} from './baseHandlers';

export function reactive(target) {
  return createReactiveObject(target, false, mutableHandlers);
}

export function shallowReactive(target) {
  return createReactiveObject(target, false, shallowReactiveHandlers);
}

export function readonly(target) {
  return createReactiveObject(target, true, readonlyHandlers);
}

export function shallowReadonly(target) {
  return createReactiveObject(target, true, shallowReadonlyHandlers);
}

const reactiveMap = new WeakMap();
const readonlyMap = new WeakMap();

export function createReactiveObject(target, isReadonly, baseHandlers) {
  if (!isObject(target)) {
    return target;
  }

  const proxyMap = isReadonly ? readonlyMap : reactiveMap;
  const exisitProxy = proxyMap.get(target);
  if (exisitProxy) {
    return exisitProxy;
  }

  const proxy = new Proxy(target, baseHandlers);
  proxyMap.set(target, proxy);
  return proxy;
}
