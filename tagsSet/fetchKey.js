const BASE_URL = 'http://192.168.50.188:7000'; // 替换为你的服务器实际 IP 和端口

async function login() {
    const url = `${BASE_URL}/api/v2/login`; // 使用模板字符串拼接
    const payload = {
        "name": "admin",
        "pass": "0000"
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
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


// 调用示例
login().then(token => {
    // 在这里处理获取到的 token，例如存储在 localStorage 中
    console.log('token:', token);
}); 


export { login };