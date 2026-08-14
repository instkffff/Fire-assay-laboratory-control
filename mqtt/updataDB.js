import { updateValue } from '../sqlite/insert.js';

/* 
示例接收格式
{
  "node": "system2",
  "group": "heater",
  "timestamp": 1786717794735,
  "values": {
    "tag1": 30,
    "tag2": 30,
    "tag3": 12
  },
  "errors": {},
  "metas": {}
} 

updateValue(node, group, tag, value)
*/

function updateDB(data) {
    try {
        const { node, group, values } = data;

        if (!node || !group || !values) {
            console.error('接收到的数据格式不正确，缺失必要字段');
            return false;
        }

        // better-sqlite3 是同步执行的，直接使用 for...of 或 forEach 即可
        for (const [tag, value] of Object.entries(values)) {
            updateValue(node, group, tag, value);
        }

        return true;
    } catch (error) {
        console.error('更新数据库时出错:', error);
        return false;
    }
}

export { updateDB };