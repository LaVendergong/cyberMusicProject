// 主题管理系统
class ThemeManager {
    constructor() {
        this.themes = {
            default: {
                name: '默认赛博朋克',
                colors: {
                    primary: '#00F0FF',
                    secondary: '#FF00FF',
                    accent: '#9D00FF',
                    background: '#0A0A12',
                    surface: '#1a1a2e',
                    text: '#FFFFFF'
                }
            },
            neon: {
                name: '霓虹之夜',
                colors: {
                    primary: '#00FF00',
                    secondary: '#FF0066',
                    accent: '#FFFF00',
                    background: '#000000',
                    surface: '#111111',
                    text: '#FFFFFF'
                }
            },
            retrowave: {
                name: '复古波浪',
                colors: {
                    primary: '#FF0080',
                    secondary: '#8000FF',
                    accent: '#0080FF',
                    background: '#120029',
                    surface: '#1F0042',
                    text: '#FFE1FF'
                }
            }
        };
        
        this.customThemes = this.loadCustomThemes();
        this.currentTheme = localStorage.getItem('currentTheme') || 'default';
        this.initializeThemeUI();
        this.applyTheme(this.currentTheme);
    }

    // 初始化主题UI
    initializeThemeUI() {
        // 检查是否为移动端
        const isMobile = window.innerWidth <= 768;
        
        // 获取已存在的主题按钮
        const existingThemeBtn = document.querySelector('.theme-btn');
        
        if (isMobile) {
            // 移动端：确保按钮有mobile类
            if (existingThemeBtn && !existingThemeBtn.classList.contains('mobile')) {
                existingThemeBtn.classList.add('mobile');
            }
        } else {
            // 桌面端：移除mobile类
            if (existingThemeBtn && existingThemeBtn.classList.contains('mobile')) {
                existingThemeBtn.classList.remove('mobile');
            }
        }

        // 为按钮添加点击事件
        if (existingThemeBtn) {
            existingThemeBtn.addEventListener('click', () => {
                this.toggleThemePanel();
                if (isMobile) {
                    // 移动端时关闭菜单
                    document.querySelector('header').classList.remove('menu-open');
                }
            });
        }

        // 创建主题面板
        const themePanel = document.createElement('div');
        themePanel.className = 'theme-panel';
        themePanel.innerHTML = `
            <div class="theme-content">
                <h3>选择主题</h3>
                <div class="theme-list"></div>
                <div class="custom-theme">
                    <h4>自定义主题</h4>
                    <div class="color-inputs"></div>
                    <input type="text" class="theme-name" placeholder="主题名称">
                    <button class="save-theme">保存主题</button>
                </div>
                <button class="close-theme">关闭</button>
            </div>
        `;
        document.body.appendChild(themePanel);

        // 绑定事件
        document.querySelector('.close-theme').addEventListener('click', () => this.toggleThemePanel());
        document.querySelector('.save-theme').addEventListener('click', () => this.saveCustomTheme());

        // 渲染主题列表
        this.renderThemeList();
        this.renderColorInputs();

        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            const isMobile = window.innerWidth <= 768;
            const themeBtn = document.querySelector('.theme-btn');
            
            if (themeBtn) {
                if (isMobile) {
                    themeBtn.classList.add('mobile');
                } else {
                    themeBtn.classList.remove('mobile');
                }
            }
        });
    }

    // 渲染主题列表
    renderThemeList() {
        const themeList = document.querySelector('.theme-list');
        themeList.innerHTML = '';

        // 添加预设主题
        Object.entries({...this.themes, ...this.customThemes}).forEach(([key, theme]) => {
            const themeItem = document.createElement('div');
            themeItem.className = `theme-item ${key === this.currentTheme ? 'active' : ''}`;
            themeItem.innerHTML = `
                <div class="theme-preview">
                    <div class="color-preview" style="background: ${theme.colors.primary}"></div>
                    <div class="color-preview" style="background: ${theme.colors.secondary}"></div>
                    <div class="color-preview" style="background: ${theme.colors.accent}"></div>
                </div>
                <span>${theme.name}</span>
                ${this.customThemes[key] ? '<button class="delete-theme"><i class="fas fa-trash"></i></button>' : ''}
            `;
            themeItem.addEventListener('click', () => this.applyTheme(key));
            
            if (this.customThemes[key]) {
                const deleteBtn = themeItem.querySelector('.delete-theme');
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteCustomTheme(key);
                });
            }
            
            themeList.appendChild(themeItem);
        });
    }

    // 渲染颜色输入框
    renderColorInputs() {
        const colorInputs = document.querySelector('.color-inputs');
        colorInputs.innerHTML = '';

        const colorLabels = {
            primary: '主要颜色',
            secondary: '次要颜色',
            accent: '强调色',
            background: '背景色',
            surface: '表面色',
            text: '文字颜色'
        };

        // 获取当前主题，如果不存在则使用默认主题
        const currentTheme = {...this.themes, ...this.customThemes}[this.currentTheme] || this.themes['default'];

        Object.entries(colorLabels).forEach(([key, label]) => {
            const input = document.createElement('div');
            input.className = 'color-input';
            input.innerHTML = `
                <label>${label}</label>
                <input type="color" data-color="${key}" value="${currentTheme.colors[key]}">
            `;
            colorInputs.appendChild(input);
        });
    }

    // 切换主题面板显示
    toggleThemePanel() {
        const panel = document.querySelector('.theme-panel');
        panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
    }

    // 应用主题
    applyTheme(themeName) {
        const theme = {...this.themes, ...this.customThemes}[themeName];
        if (!theme) return;

        this.currentTheme = themeName;
        localStorage.setItem('currentTheme', themeName);

        // 更新CSS变量
        const root = document.documentElement;
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(`--${key}-color`, value);
        });

        // 更新主题列表中的激活状态
        document.querySelectorAll('.theme-item').forEach(item => {
            item.classList.toggle('active', item.querySelector('span').textContent === theme.name);
        });
    }

    // 保存自定义主题
    saveCustomTheme() {
        const nameInput = document.querySelector('.theme-name');
        const name = nameInput.value.trim();
        if (!name) {
            alert('请输入主题名称');
            return;
        }

        const colors = {};
        document.querySelectorAll('.color-input input').forEach(input => {
            colors[input.dataset.color] = input.value;
        });

        const themeKey = `custom_${Date.now()}`;
        this.customThemes[themeKey] = {
            name,
            colors
        };

        // 保存到本地存储
        localStorage.setItem('customThemes', JSON.stringify(this.customThemes));

        // 更新UI
        this.renderThemeList();
        this.applyTheme(themeKey);
        nameInput.value = '';
    }

    // 删除自定义主题
    deleteCustomTheme(themeKey) {
        if (confirm('确定要删除这个主题吗？')) {
            delete this.customThemes[themeKey];
            localStorage.setItem('customThemes', JSON.stringify(this.customThemes));
            
            if (this.currentTheme === themeKey) {
                this.applyTheme('default');
            }
            
            this.renderThemeList();
        }
    }

    // 加载自定义主题
    loadCustomThemes() {
        const saved = localStorage.getItem('customThemes');
        return saved ? JSON.parse(saved) : {};
    }
}

// 初始化主题管理器
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
}); 