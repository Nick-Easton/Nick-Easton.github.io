(function setupAdminLogin() {
    const form = document.querySelector('#admin-login-form');
    const message = document.querySelector('#login-message');
    if (!form || !message) return;
    const submitButton = form.querySelector('button[type="submit"]');

    function setMessage(text, type = '') {
        message.textContent = text;
        message.className = `admin-form-message ${type}`.trim();
    }

    function getAuthErrorMessage(error) {
        const candidates = [
            error && error.message,
            error && error.error_description,
            error && error.error && error.error.message,
            error && error.error,
            error && error.code
        ];
        return candidates.find((value) => typeof value === 'string' && value.trim()) || '';
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (submitButton.disabled) return;
        const formData = new FormData(form);
        const email = String(formData.get('email') || '').trim();
        const password = String(formData.get('password') || '');
        const config = window.BlogCloudBase.config;

        submitButton.disabled = true;
        setMessage('正在验证身份……');

        try {
            if (config.adminEmail
                && email.toLowerCase() !== String(config.adminEmail).toLowerCase()) {
                throw new Error('这个邮箱不是本博客配置的管理员账号。');
            }

            const loginResult = await window.BlogCloudBase.signInWithPassword(
                config.adminLoginName || email,
                password
            );
            if (loginResult && loginResult.error) throw loginResult.error;

            const user = await window.BlogCloudBase.getCurrentUser();
            if (!window.BlogCloudBase.isAuthenticatedAccount(user)) {
                throw new Error('登录成功，但没有读取到有效的账号身份。');
            }

            if (window.BlogCloudBase.isAdminConfigured() && !window.BlogCloudBase.isAdmin(user)) {
                await window.BlogCloudBase.auth.signOut();
                throw new Error('这个账号不是本博客配置的管理员。');
            }

            setMessage('验证成功，正在进入管理后台……', 'success');
            window.location.replace('index.html');
        } catch (error) {
            const detail = getAuthErrorMessage(error);
            console.error('管理员登录失败', {
                code: error && error.code,
                message: detail || 'CloudBase 未返回具体错误'
            });
            const text = detail
                ? `登录失败：${detail}`
                : '登录失败：CloudBase 未返回具体错误，请检查账号配置。';
            setMessage(text, 'error');
            submitButton.disabled = false;
            submitButton.textContent = '登录管理员模式';
        }
    });

    submitButton.disabled = false;
    submitButton.textContent = '登录管理员模式';

    (async function checkExistingSession() {
        try {
            const existingUser = await window.BlogCloudBase.getCurrentUser();
            if (window.BlogCloudBase.isAuthenticatedAccount(existingUser)
                && (window.BlogCloudBase.isAdmin(existingUser) || !window.BlogCloudBase.isAdminConfigured())) {
                window.location.replace('index.html');
            }
        } catch (error) {
            console.info('当前没有可用的管理员会话。');
        }
    })();
})();
