/* @flow */
/*Github:https://github.com/answershuto*/
import { hasSymbol } from "core/util/env";
import { warn } from "../util/index";
import { defineReactive } from "../observer/index";
/*Github:https://github.com/answershuto*/
export function initProvide(vm: Component) {
	const provide = vm.$options.provide;
	if (provide) {
		vm._provided = typeof provide === "function" ? provide.call(vm) : provide;
	}
}

export function initInjections(vm: Component) {
	// vm.$options.inject = {foo: {from: "foo"}}
	const result = resolveInject(vm.$options.inject, vm);
	if (result) {
		Object.keys(result).forEach((key) => {
			/* istanbul ignore else */
			/*为对象defineProperty上在变化时通知的属性*/
			// 添加数据响应式
			defineReactive(vm, key, result[key]);
		});
	}
}

// 向上级查找对应的provided，找到每个inject里面的值，然后返回
export function resolveInject(inject: any, vm: Component): ?Object {
	if (inject) {
		// inject is :any because flow is not smart enough to figure out cached
		// isArray here
		const isArray = Array.isArray(inject);
		const result = Object.create(null);
		
		// 浏览器是否支持原生Symbol方法，代表支持es6原生
		const objectKey = hasSymbol ? Reflect.ownKeys(inject) : Object.keys(inject);

		const keys = isArray ? inject : objectKey;
		
		// 循环keys，一层层的向上查找，直到找到所有的inject里面的key
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			const provideKey = isArray ? key : inject[key];
			let source = vm;

			// 向上级查找对应的provided
			while (source) {
				if (source._provided && provideKey in source._provided) {
					result[key] = source._provided[provideKey];
					break;
				}
				source = source.$parent;
			}
		}
		return result;
	}
}
