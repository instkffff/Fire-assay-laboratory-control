/* 
POST /api/v2/gtags 
*/

let Key = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJuZXVyb24iLCJib2R5RW5jb2RlIjowLCJleHAiOjE3ODY3MTEyNDQsImlhdCI6MTc4NjcwNzY0NCwiaXNzIjoibmV1cm9uIn0.B6sZ1NGT0FcBBWGTyCR6QWD5H9_it-tLbfKNjOEelA8gMTEussSwMtC7ssFRuNa7UCvPlgfO4aoE7goW4lcPflKXfri9hrc6gBN78oAeCgE042vQYtnDv9tbhQMrRvzpHbVppqnJ-XA-0RuWnq1LKD0Le1Bgef4IimsjPTHLKzgdQibQVHCpddh-ybdGGs2eQeS7BnC2WpqIGeFbBtkj0mk_GKiium7daD8St7V0-yBu-S9SE4814bc3cVDLgP8RBPOW2lzTPXdG3SZuawxP2mmb7eLqu_iiKWR5QNX7XdkTUvc6-VNvQyoXmBhPYApzqi4J4PsCXmIkEDl-JhWASg';
const BASE_URL = 'http://192.168.50.188:7000';

/**
 * 插入 Tag 数据
 * @param {string} node - 节点名称 (如 "modbus-node")
 * @param {string} groupName - 组名称 (如 "group_1")
 * @param {Array} tagsList - Tag 列表，格式为 [{name: "tag1", address: "1!400001", attribute: 3, type: 3}, ...]
 */
async function insertTags(node, groupName, tagsList) {
    const url = `${BASE_URL}/api/v2/gtags`;

    // 按照 API 要求的 payload 结构组装数据
    const payload = {
        "node": node,
        "groups": [
            {
                "group": groupName,
                "interval": 3000, // 默认间隔 3000ms
                "tags": tagsList
            }
        ]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Key}` // 使用定义好的 Key
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('插入成功:', result);
        return result;
    } catch (error) {
        console.error('插入失败:', error);
        throw error;
    }
}

// --- 调用示例 ---

// 1. 准备你要插入的 tags 数组
const myTags = [
{
    "type": 4,
    "name": "windH",
    "attribute": 6,
    "precision": 0,
    "decimal": 0,
    "bias": 0,
    "address": "10!40041",
    "description": "",
    "unit": ""
},
{
    "type": 4,
    "name": "windL",
    "attribute": 6,
    "precision": 0,
    "decimal": 0,
    "bias": 0,
    "address": "10!40042",
    "description": "",
    "unit": ""
},
{
    "type": 4,
    "name": "windNeed",
    "attribute": 6,
    "precision": 0,
    "decimal": 0,
    "bias": 0,
    "address": "10!40043",
    "description": "",
    "unit": ""
},
{
    "type": 4,
    "name": "windReal",
    "attribute": 6,
    "precision": 0,
    "decimal": 0,
    "bias": 0,
    "address": "10!40044",
    "description": "",
    "unit": ""
}
];

// 2. 执行函数：输入 node, groupName, tagsList
insertTags('Scada1', 'valve4', myTags)
    .then(res => {
        if (res.error === 0) {
            console.log(`成功插入，索引号: ${res.index}`);
        } else {
            console.log(`服务器返回错误码: ${res.error}`);
        }
    })
    .catch(err => console.error('请求异常:', err));

