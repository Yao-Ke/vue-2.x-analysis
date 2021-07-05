/* @flow */

/**
 * Runtime helper for resolving raw children VNodes into a slot object.
 */
export function resolveSlots(children: ?Array<VNode>, context: ?Component): { [key: string]: Array<VNode> } {
	const slots = {};
	if (!children) {
		return slots;
	}
	const defaultSlot = [];

	// 循环传入的slot，根据带有或不带slot属性，区分成对应的slot储存
	for (let i = 0, l = children.length; i < l; i++) {
		const child = children[i];
		// named slots should only be respected if the vnode was rendered in the
		// same context.

		if ((child.context === context || child.functionalContext === context) && child.data && child.data.slot != null) {
			// 如果是在父节点插入的slot并且有slot值
			const name = child.data.slot;

			// slots.传入的slot名称
			const slot = slots[name] || (slots[name] = []);

			if (child.tag === "template") {
				// 忽略template标签
				slot.push.apply(slot, child.children);
			} else {

				slot.push(child);
			}
		} else {
			// 没有当做默认slot defaultSlot
			defaultSlot.push(child);
		}
	}

	// 不是一个注释或者只有一个空格的文本节点
	if (!defaultSlot.every(isWhitespace)) {
		slots.default = defaultSlot;
	}
	return slots;
}

// 是否为注释或者只有一个空格的文本节点
function isWhitespace(node: VNode): boolean {
	return node.isComment || node.text === " ";
}

/*处理ScopedSlots*/
export function resolveScopedSlots(fns: Array<[string, Function]>): { [key: string]: Function } {
	const res = {};
	for (let i = 0; i < fns.length; i++) {
		res[fns[i][0]] = fns[i][1];
	}
	return res;
}
