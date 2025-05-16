import { controller } from './modules/controllers/controller.js';
controller.init();
// 当你遇到 "Uncaught SyntaxError: Cannot use import statement outside a module" 错误时，这通常意味着你正在尝试在一个非模块环境中使用 ES6 的 `import` 语句。在 JavaScript 中，`import` 和 `export` 语句只能在模块中使用。
// 为了解决这个问题，你需要确保你的 HTML 文件将你的 JavaScript 文件作为模块加载。如果你使用的是 HTML 文件来引入 JavaScript 文件，可以在 `<script>` 标签中添加 `type="module"` 属性。
// 示例 HTML 文件：
// <!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>My Music Project</title>
// </head>
// <body>
//     <!-- 其他 HTML 内容 -->
//     <script type="module" src="e:\myMusicProject\src\app.js"></script>
// </body>
// </html>
// 如果你是在 Node.js 环境中运行，需要确保你的 `package.json` 文件中有 `"type": "module"` 字段。
// 示例 package.json：
// {
//     "name": "my-music-project",
//     "version": "1.0.0",
//     "type": "module",
//     "scripts": {
//         "start": "node e:/myMusicProject/src/app.js"
//     }
// }
