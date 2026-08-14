import { db } from './db.js';

/**
 * 获取特定键的值
 * @param {string} tableName - 表名 (例如 'System1')
 * @param {string} name - 组件名 (例如 'valve1')
 * @param {string} key - 具体的键 (例如 'windSet')
 * @returns {any} 返回对应的值，未找到则返回 null
 */
function getValue(tableName, name, key) {
    try {
        const row = db.prepare(`SELECT value FROM ${tableName} WHERE name = ?`).get(name);
        if (row) {
            const data = JSON.parse(row.value);
            return data[key] !== undefined ? data[key] : null;
        }
        return null;
    } catch (err) {
        console.error(`读取失败 [${tableName} -> ${name} -> ${key}]:`, err);
        return null;
    }
}

export { getValue }

// 测试用例:
// console.log(getValue('System1', 'valve1', 'windSet')); 