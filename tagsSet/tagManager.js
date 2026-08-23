/**
 * 登录获取 JWT Token
 * @param {string} baseUrl - 服务器地址，如 'http://192.168.50.188:7000'
 * @param {string} name - 用户名
 * @param {string} pass - 密码
 * @returns {Promise<string>} token
 */
async function login(baseUrl, name, pass) {
    const url = `${baseUrl}/api/v2/login`;
    const payload = {
        name: name,
        pass: pass
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Login successful, token:', data.token);
        return data.token;
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
}

/**
 * 查询 Tag 列表
 * @param {string} baseUrl - 服务器地址
 * @param {string} token - JWT Token
 * @param {string} node - 节点名称
 * @param {string} group - 组名称
 * @returns {Promise<Object>} tags 数据
 */
async function fetchTags(baseUrl, token, node, group) {
    const url = `${baseUrl}/api/v2/tags?node=${encodeURIComponent(node)}&group=${encodeURIComponent(group)}`;

    try {
        if (!token) {
            throw new Error('未提供身份验证 token');
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP 错误! 状态码: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('获取 Tags 失败:', error);
        throw error;
    }
}

/**
 * 插入 Tag 数据
 * @param {string} baseUrl - 服务器地址
 * @param {string} token - JWT Token
 * @param {string} node - 节点名称
 * @param {string} groupName - 组名称
 * @param {Array} tagsList - Tag 列表
 * @returns {Promise<Object>} 插入结果
 */
async function insertTags(baseUrl, token, node, groupName, tagsList) {
    const url = `${baseUrl}/api/v2/gtags`;

    const payload = {
        node: node,
        groups: [
            {
                group: groupName,
                interval: 3000,
                tags: tagsList
            }
        ]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
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

export { login, fetchTags, insertTags };