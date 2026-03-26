// js/auth.js
import { SUPABASE_URL, SUPABASE_KEY } from './config.js';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 检查登录状态
export function checkAuth() {
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    
    if (isLoggedIn !== 'true') {
        showLoginModal();
        return false;
    }
    
    hideLoginModal();
    const mainContent = document.getElementById('mainContent');
    if(mainContent) mainContent.style.display = 'block';
    
    return true;
}

// 显示登录模态框
function showLoginModal() {
    let modal = document.getElementById('loginModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'loginModal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.6); z-index: 9999; 
            display: flex; justify-content: center; align-items: center;
            backdrop-filter: blur(5px);
        `;
        
        modal.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 12px; 
                        box-shadow: 0 10px 25px rgba(0,0,0,0.2); width: 320px; text-align: center;">
                <h2 style="margin: 0 0 20px 0; color: #2c3e50;">🔐 管理员登录</h2>
                <input type="text" id="loginUser" placeholder="用户名" 
                       style="width: 100%; padding: 10px; margin-bottom: 15px; 
                              border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box;">
                <input type="password" id="loginPass" placeholder="密码" 
                       style="width: 100%; padding: 10px; margin-bottom: 20px; 
                              border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box;">
                <button id="btnLoginSubmit"
                        style="width: 100%; padding: 10px; background: #2c3e50; color: white; 
                               border: none; border-radius: 6px; font-size: 16px; cursor: pointer;">
                    登 录
                </button>
                <p id="loginError" style="color: #e74c3c; margin-top: 15px; font-size: 14px; display: none;">
                    用户名或密码错误
                </p>
                <p style="margin-top: 20px; font-size: 12px; color: #95a5a6;">
                    添加账号请联系管理员
                </p>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('btnLoginSubmit').addEventListener('click', handleLoginSubmit);
        document.getElementById('loginPass').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLoginSubmit();
        });
    } else {
        modal.style.display = 'flex';
    }
    
    const main = document.getElementById('mainContent');
    if(main) main.style.display = 'none';
}

function hideLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.style.display = 'none';
}

// 处理登录提交
async function handleLoginSubmit() {
    const userIn = document.getElementById('loginUser').value.trim();
    const passIn = document.getElementById('loginPass').value.trim();
    const errorMsg = document.getElementById('loginError');
    const btn = document.getElementById('btnLoginSubmit');

    if (!userIn || !passIn) {
        errorMsg.innerText = "请输入用户名和密码";
        errorMsg.style.display = 'block';
        return;
    }

    btn.disabled = true;
    btn.innerText = "验证中...";
    errorMsg.style.display = 'none';

    try {
        const { data, error } = await supabase
            .from('admin_users')
            .select('username')
            .eq('username', userIn)
            .eq('password', passIn)
            .single();

        if (error || !data) {
            throw new Error("Invalid credentials");
        }

        // ✅ 登录成功：保存状态
        localStorage.setItem('isAdminLoggedIn', 'true');
        localStorage.setItem('currentAdminUser', data.username);
        
        hideLoginModal();
        
        // ✅ 关键修改：登录成功后直接刷新页面
        // 这样会触发 admin.html 的 DOMContentLoaded，自动加载数据和退出按钮
        location.reload(); 

    } catch (err) {
        console.error(err);
        errorMsg.innerText = "用户名或密码错误";
        errorMsg.style.display = 'block';
        
        const box = document.querySelector('#loginModal div');
        box.style.animation = 'shake 0.3s';
        setTimeout(() => box.style.animation = '', 300);
    } finally {
        btn.disabled = false;
        btn.innerText = "登 录";
    }
}

// 退出登录
export function logout() {
    if(confirm('确定要退出登录吗？')) {
        localStorage.removeItem('isAdminLoggedIn');
        localStorage.removeItem('currentAdminUser');
        location.reload();
    }
}

// 添加震动动画样式
if (!document.getElementById('auth-styles')) {
    const style = document.createElement('style');
    style.id = 'auth-styles';
    style.textContent = `
        @keyframes shake {
            0% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            50% { transform: translateX(10px); }
            75% { transform: translateX(-10px); }
            100% { transform: translateX(0); }
        }
    `;
    document.head.appendChild(style);
}