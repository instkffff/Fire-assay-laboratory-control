import { System1, System2, Switch, Scada1, Scada2 } from '../config.js';
import Database from 'better-sqlite3';

const db = new Database('control_system.db');

const tablesToInit = { System1, System2, Switch, Scada1, Scada2 };

function initDatabase() {
    const initTransaction = db.transaction(() => {
        for (const [tableName, tableContent] of Object.entries(tablesToInit)) {
            // 1. 创建表：只有 name 和 value 两列
            // name 为主键，确保每个组件只有一条记录
            const createTableSql = `CREATE TABLE IF NOT EXISTS ${tableName} (
                name TEXT PRIMARY KEY,
                value TEXT
            )`;
            db.prepare(createTableSql).run();
            
            for (const [key, columns] of Object.entries(tableContent)) {
                // 2. 初始化值：将所有列名对应的值设为 0，并存为 JSON 字符串
                const initialData = {};
                columns.forEach(col => {
                    initialData[col] = 0;
                });
                
                const valueJson = JSON.stringify(initialData);
                
                // 使用 INSERT OR IGNORE 防止重复运行导致报错，或用 REPLACE 更新
                const insertSql = `INSERT OR IGNORE INTO ${tableName} (name, value) VALUES (?, ?)`;
                db.prepare(insertSql).run(key, valueJson);
            }
        }
    });

    try {
        initTransaction();
        console.log("数据库初始化完成（KV 结构）");
    } catch (err) {
        console.error("初始化失败:", err);
    }
}

initDatabase();