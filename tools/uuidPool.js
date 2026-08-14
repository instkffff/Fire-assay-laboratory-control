// 使用 Set 来存储 UUID，保证唯一且查询效率高
const pool = new Set();

/**
 * 将 UUID 添加到池中
 * @param {string} uuid 
 */
function uuidAdd(uuid) {
    if (!uuid) return false;
    pool.add(uuid);
    return true;
}

/**
 * 获取当前池中所有的 UUID 列表
 * @returns {string[]}
 */
function uuidList() {
    return Array.from(pool);
}

/**
 * 从池中移除指定的 UUID
 * @param {string} uuid 
 * @returns {boolean} 是否删除成功
 */
function uuidRemove(uuid) {
    return pool.delete(uuid);
}

export { uuidAdd, uuidList, uuidRemove }