/* @flow */

import config from "../config";
import VNode, { createEmptyVNode } from "./vnode";
import { createComponent } from "./create-component";

import { warn, isDef, isUndef, isTrue, isPrimitive, resolveAsset } from "../util/index";

import { normalizeChildren, simpleNormalizeChildren } from "./helpers/index";

const SIMPLE_NORMALIZE = 1;
const ALWAYS_NORMALIZE = 2;

// wrapper function for providing a more flexible interface
// without getting yelled at by flow
export function createElement(context: Component, tag: any, data: any, children: any, normalizationType: any, alwaysNormalize: boolean): VNode {
	/*兼容不传data的情况*/
	if (Array.isArray(data) || isPrimitive(data)) {
		normalizationType = children;
		children = data;
		data = undefined;
	}
	/*如果alwaysNormalize为true，则normalizationType标记为ALWAYS_NORMALIZE*/
	if (isTrue(alwaysNormalize)) {
		normalizationType = ALWAYS_NORMALIZE;
	}
	/*创建虚拟节点*/
	return _createElement(context, tag, data, children, normalizationType);
}

/*创建VNode节点*/
export function _createElement(context: Component, tag?: string | Class<Component> | Function | Object, data?: VNodeData, children?: any, normalizationType?: number): VNode {
	/*
    如果data未定义（undefined或者null）或者是data的__ob__已经定义（代表已经被observed，上面绑定了Oberver对象），
    https://cn.vuejs.org/v2/guide/render-function.html#约束
    那么创建一个空节点
  */
	if (isDef(data) && isDef((data: any).__ob__)) {
		process.env.NODE_ENV !== "production" && warn(`Avoid using observed data object as vnode data: ${JSON.stringify(data)}\n` + "Always create fresh vnode data objects in each render!", context);
		return createEmptyVNode();
	}
	/*如果tag不存在也是创建一个空节点*/
	if (!tag) {
		// in case of component :is set to falsy value
		return createEmptyVNode();
	}
	// support single function children as default scoped slot
	/*默认默认作用域插槽*/
	if (Array.isArray(children) && typeof children[0] === "function") {
		data = data || {};
		data.scopedSlots = { default: children[0] };
		children.length = 0;
	}
	if (normalizationType === ALWAYS_NORMALIZE) {
		children = normalizeChildren(children);
	} else if (normalizationType === SIMPLE_NORMALIZE) {
		children = simpleNormalizeChildren(children);
	}
	let vnode, ns;
	if (typeof tag === "string") {
		let Ctor;
		/*获取tag的名字空间*/
		ns = config.getTagNamespace(tag);
		/*判断是否是保留的标签*/
		if (config.isReservedTag(tag)) {
			// platform built-in elements
			/*如果是保留的标签则创建一个相应节点*/
			vnode = new VNode(config.parsePlatformTagName(tag), data, children, undefined, undefined, context);
		} else if (isDef((Ctor = resolveAsset(context.$options, "components", tag)))) {
			// component
			/*从vm实例的option的components中寻找该tag，存在则就是一个组件，创建相应节点，Ctor为组件的构造类*/
			vnode = createComponent(Ctor, data, context, children, tag);
		} else {
			// unknown or unlisted namespaced elements
			// check at runtime because it may get assigned a namespace when its
			// parent normalizes children
			/*未知的元素，在运行时检查，因为父组件可能在序列化子组件的时候分配一个名字空间*/
			vnode = new VNode(tag, data, children, undefined, undefined, context);
		}
	} else {
		// direct component options / constructor
		/*tag不是字符串的时候则是组件的构造类*/
		vnode = createComponent(tag, data, context, children);
	}
	if (isDef(vnode)) {
		/*如果有名字空间，则递归所有子节点应用该名字空间*/
		if (ns) applyNS(vnode, ns);
		return vnode;
	} else {
		/*如果vnode没有成功创建则创建空节点*/
		return createEmptyVNode();
	}
}
/*Github:https://github.com/answershuto*/
function applyNS(vnode, ns) {
	vnode.ns = ns;
	if (vnode.tag === "foreignObject") {
		// use default namespace inside foreignObject
		return;
	}
	if (isDef(vnode.children)) {
		for (let i = 0, l = vnode.children.length; i < l; i++) {
			const child = vnode.children[i];
			if (isDef(child.tag) && isUndef(child.ns)) {
				applyNS(child, ns);
			}
		}
	}
}
