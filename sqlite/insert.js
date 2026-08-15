import { db } from './db.js';

/**
 * 根据路径精准修改键值（使用 SQLite 原生 JSON 函数，安全且高效）
 * @param {string} tableName - 表名 (例如 'System1')
 * @param {string} name - 组件名 (例如 'valve1')
 * @param {string} key - 具体的键 (例如 'windSet')
 * @param {number|string} value - 要设置的新值
 */
function updateValue(tableName, name, key, value) {
    try {
        // 使用 SQLite 的 json_set 函数直接在数据库内部修改对应的键值
        // $."key" 表示根路径下的键
        const updateSql = `UPDATE ${tableName} SET value = json_set(value, '$.' || ?, ?) WHERE name = ?`;
        
        const info = db.prepare(updateSql).run(key, value, name);
        
        if (info.changes === 0) {
            console.warn(`警告: 未找到表 ${tableName} 中 name 为 ${name} 的记录进行更新`);
            return false;
        }
        
        return true;
    } catch (err) {
        console.error(`更新失败 [${tableName} -> ${name} -> ${key}]:`, err);
        return false;
    }
}

export { updateValue }

// 测试用例: 
// updateValue('System1', 'valve1', 'windSet', 0);