/* import { dataLink } from './dataflow.js'; */

/**
 * 根据输入的源节点、组、标签，1对1查找对应的目标 { node, group, tag }
 * @param {Object} rules - dataLink 规则配置对象
 * @param {string} inputNode - 输入的节点 (如 'System1')
 * @param {string} inputGroup - 输入的组 (如 'valve1')
 * @param {string} inputTag - 输入的标签 (如 'windSet')
 * @returns {Object|null} 匹配的目标对象 { node, group, tag } 或 null
 */
const nodeConvert = (rules, inputNode, inputGroup, inputTag) => {
    for (const [source, target] of Object.values(rules)) {
        const [sourceNodes, sourceGroups, sourceTags] = source;
        const [targetNodes, targetGroups, targetTags] = target;

        // 1. 获取当前输入在源数组中的精确位置索引
        const nodeIndex = sourceNodes.indexOf(inputNode);
        const groupIndex = sourceGroups.indexOf(inputGroup);
        const tagIndex = sourceTags.indexOf(inputTag);

        // 2. 检查是否全部命中且索引匹配（或支持规则内单一维度的对齐）
        // 这里由于是 1 对 1，我们可以直接通过统一的索引或各自独立的索引来取值
        // 最严谨的做法是确保它们在同一条链路规则中对应
        const isMatched = nodeIndex !== -1 && groupIndex !== -1 && tagIndex !== -1;

        if (isMatched) {
            // 3. 严格按相同的位置索引从目标数组中取出对应的值
            return {
                node: targetNodes[nodeIndex] || targetNodes[0],
                group: targetGroups[groupIndex] || targetGroups[0],
                tag: targetTags[tagIndex] || targetTags[0]
            };
        }
    }

    return null; // 未找到匹配的规则则返回 null
};

/* console.log(nodeConvert(dataLink, 'System1', 'heater', 'tempPV'));

console.log(nodeConvert(dataLink, 'Switch', 'kset', 'K7'));

console.log(nodeConvert(dataLink, 'System1', 'valve1', 'windNeed'));

console.log(nodeConvert(dataLink, 'System1', 'valve1', 'windH'));
 */
export { nodeConvert };