# 1. 创建项目目录
mkdir doc-editor
cd doc-editor

# 2. 初始化并安装依赖
npm init -y
npm install react react-dom xlsx mammoth html-docx-js-typescript marked turndown pdfjs-dist jszip file-saver
npm install -D vite @vitejs/plugin-react

# 3. 创建上述所有文件

# 4. 启动开发服务器
npm run dev

npm run dev -- --host 0.0.0.0 --port 5174

# 5. 构建生产版本
npm run build