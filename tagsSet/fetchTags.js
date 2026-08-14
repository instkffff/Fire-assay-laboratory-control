let Key = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJuZXVyb24iLCJib2R5RW5jb2RlIjowLCJleHAiOjE3ODY3MTEyNDQsImlhdCI6MTc4NjcwNzY0NCwiaXNzIjoibmV1cm9uIn0.B6sZ1NGT0FcBBWGTyCR6QWD5H9_it-tLbfKNjOEelA8gMTEussSwMtC7ssFRuNa7UCvPlgfO4aoE7goW4lcPflKXfri9hrc6gBN78oAeCgE042vQYtnDv9tbhQMrRvzpHbVppqnJ-XA-0RuWnq1LKD0Le1Bgef4IimsjPTHLKzgdQibQVHCpddh-ybdGGs2eQeS7BnC2WpqIGeFbBtkj0mk_GKiium7daD8St7V0-yBu-S9SE4814bc3cVDLgP8RBPOW2lzTPXdG3SZuawxP2mmb7eLqu_iiKWR5QNX7XdkTUvc6-VNvQyoXmBhPYApzqi4J4PsCXmIkEDl-JhWASg';

const BASE_URL = 'http://192.168.50.188:7000';

async function fetchTags(node, group) {
    // 1. 构造带有查询参数的 URL
    // 结果类似于: /api/v2/tags?node=modbus-node&group=group_1
    const url = `${BASE_URL}/api/v2/tags?node=${encodeURIComponent(node)}&group=${encodeURIComponent(group)}`;

    try {
        // 2. 从本地存储获取登录时保存的 token
        const token = Key;
        if (!token) {
            throw new Error('未找到身份验证 token，请先登录');
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // 通常 JWT Token 放在 Authorization 头中
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP 错误! 状态码: ${response.status}`);
        }

        const data = await response.json();
        
        // 3. 将结果打印在控制台
        // console.log('成功获取 Tags 数据:', data);
        return data;

    } catch (error) {
        console.error('获取 Tags 失败:', error);
        throw error;
    }
}


// --- 调用示例 ---
// 传入要求的 node 和 group
fetchTags('Scada1', 'valve1')
    .then(data => {
        // 这里可以进一步处理返回的数据
        let output = JSON.stringify(data.tags);
        console.log(output);
    })
    .catch(err => {
        // 错误处理
        console.error('获取 Tags 失败:', err);
    });