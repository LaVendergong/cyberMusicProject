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
            },
            nature: {
                name: '自然森林',
                colors: {
                    primary: '#4CAF50',
                    secondary: '#8BC34A',
                    accent: '#FFC107',
                    background: '#1B2F1B',
                    surface: '#2A442A',
                    text: '#E8F5E9'
                }
            },
            ocean: {
                name: '深海之境',
                colors: {
                    primary: '#03A9F4',
                    secondary: '#00BCD4',
                    accent: '#009688',
                    background: '#002633',
                    surface: '#003847',
                    text: '#E1F5FE'
                }
            },
            sunset: {
                name: '日落黄昏',
                colors: {
                    primary: '#FF9800',
                    secondary: '#FF5722',
                    accent: '#F44336',
                    background: '#2C1810',
                    surface: '#3E2723',
                    text: '#FFECB3'
                }
            },
            minimalist: {
                name: '简约白',
                colors: {
                    primary: '#212121',
                    secondary: '#757575',
                    accent: '#2196F3',
                    background: '#FFFFFF',
                    surface: '#F5F5F5',
                    text: '#212121'
                }
            },
            galaxy: {
                name: '星空银河',
                colors: {
                    primary: '#7B1FA2',
                    secondary: '#E040FB',
                    accent: '#00BCD4',
                    background: '#0D0221',
                    surface: '#1A033E',
                    text: '#E1BEE7'
                }
            },
            desert: {
                name: '沙漠黄昏',
                colors: {
                    primary: '#FFA000',
                    secondary: '#FF6D00',
                    accent: '#FFD740',
                    background: '#3E2723',
                    surface: '#4E342E',
                    text: '#FFF8E1'
                }
            },
            arctic: {
                name: '北极极光',
                colors: {
                    primary: '#26C6DA',
                    secondary: '#00BFA5',
                    accent: '#64FFDA',
                    background: '#102027',
                    surface: '#37474F',
                    text: '#E0F7FA'
                }
            },
            sakura: {
                name: '樱花季',
                colors: {
                    primary: '#FF80AB',
                    secondary: '#FF4081',
                    accent: '#F50057',
                    background: '#FCE4EC',
                    surface: '#F8BBD0',
                    text: '#880E4F'
                }
            },
            steampunk: {
                name: '蒸汽朋克',
                colors: {
                    primary: '#795548',
                    secondary: '#D7CCC8',
                    accent: '#FFC107',
                    background: '#3E2723',
                    surface: '#4E342E',
                    text: '#D7CCC8'
                }
            },
            matrix: {
                name: '矩阵代码',
                colors: {
                    primary: '#00FF00',
                    secondary: '#008F00',
                    accent: '#00FF00',
                    background: '#000000',
                    surface: '#001F00',
                    text: '#00FF00'
                }
            },
            vampire: {
                name: '血色黑夜',
                colors: {
                    primary: '#D32F2F',
                    secondary: '#B71C1C',
                    accent: '#FF5252',
                    background: '#1A0000',
                    surface: '#260000',
                    text: '#FFEBEE'
                }
            },
            emerald: {
                name: '翡翠森林',
                colors: {
                    primary: '#2E7D32',
                    secondary: '#1B5E20',
                    accent: '#00C853',
                    background: '#E8F5E9',
                    surface: '#C8E6C9',
                    text: '#1B5E20'
                }
            },
            lavender: {
                name: '薰衣草',
                colors: {
                    primary: '#9575CD',
                    secondary: '#7E57C2',
                    accent: '#B39DDB',
                    background: '#EDE7F6',
                    surface: '#D1C4E9',
                    text: '#311B92'
                }
            },
            coral: {
                name: '珊瑚礁',
                colors: {
                    primary: '#FF7043',
                    secondary: '#FF5722',
                    accent: '#FF9E80',
                    background: '#FBE9E7',
                    surface: '#FFCCBC',
                    text: '#BF360C'
                }
            },
            midnight: {
                name: '午夜蓝',
                colors: {
                    primary: '#1A237E',
                    secondary: '#283593',
                    accent: '#3949AB',
                    background: '#E8EAF6',
                    surface: '#C5CAE9',
                    text: '#1A237E'
                }
            },
            autumn: {
                name: '秋日暖阳',
                colors: {
                    primary: '#F57C00',
                    secondary: '#EF6C00',
                    accent: '#FFB74D',
                    background: '#FFF3E0',
                    surface: '#FFE0B2',
                    text: '#E65100'
                }
            },
            neonPink: {
                name: '霓虹粉',
                colors: {
                    primary: '#FF1493',
                    secondary: '#FF69B4',
                    accent: '#FFB6C1',
                    background: '#1A0011',
                    surface: '#2D001C',
                    text: '#FFC0CB'
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