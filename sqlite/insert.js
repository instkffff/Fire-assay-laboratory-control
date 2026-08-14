import { db } from './db.js';

/**
 * 根据路径精准修改键值
 * @param {string} tableName - 表名 (例如 'System1')
 * @param {string} name - 组件名 (例如 'valve1')
 * @param {string} key - 具体的键 (例如 'windSet')
 * @param {number|string} value - 要设置的新值
 */
function updateValue(tableName, name, key, value) {
    try {
        // 1. 先读取当前的 JSON 字符串
        const row = db.prepare(`SELECT value FROM ${tableName} WHERE name = ?`).get(name);
        
        if (!row) {
            throw new Error(`未找到表 ${tableName} 中 name 为 ${name} 的记录`);
        }

        // 2. 解析 JSON 并修改具体键值
        const data = JSON.parse(row.value);
        if (!(key in data)) {
            console.warn(`警告: 键 ${key} 不在 ${name} 的定义中，将创建新键`);
        }
        data[key] = value;

        // 3. 将修改后的对象写回数据库
        const updateSql = `UPDATE ${tableName} SET value = ? WHERE name = ?`;
        db.prepare(updateSql).run(JSON.stringify(data), name);
        
        return true;
    } catch (err) {
        console.error(`更新失败 [${tableName} -> ${name} -> ${key}]:`, err);
        return false;
    }
}

export { updateValue }

// 测试用例: 
// updateValue('System1', 'valve1', 'windSet', 0);