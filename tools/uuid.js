/**
 * 生成一个UUID (Universally Unique Identifier)
 * @returns {string} 返回一个随机生成的UUID字符串
 */
function getUUID() {
    let uuid = crypto.randomUUID(); // 使用Web Crypto API生成随机UUID
    return uuid; // 返回生成的UUID
}

// console.log(getUUID());

export { getUUID }