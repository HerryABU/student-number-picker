// main.js - Electron 主进程
const { app, BrowserWindow, Menu, dialog } = require('electron')
const path = require('path')
const fs = require('fs')

let mainWindow

/**
 * 创建主窗口
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    autoHideMenuBar: false, // ❌ 关闭自动隐藏，菜单常显
    title: '智能学号抽取系统V5.8.2',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: false,
      webSecurity: false
    }
  })

  // ✅ 初始加载（无参数）
  mainWindow.loadFile('index.html')

  // 🔴 已移除：Alt 键切换菜单栏的功能

  return mainWindow
}

/**
 * 构建中文菜单（含「参数」选项卡）
 */
function buildMenu() {
  const template = [
    {
      label: '应用',
      submenu: [
        { label: '重新加载', role: 'reload', accelerator: 'Ctrl+R' },
        { label: '强制刷新', role: 'forcereload', accelerator: 'Ctrl+F5' },
        { type: 'separator' },
        { label: '开发者工具', role: 'toggledevtools', accelerator: 'Ctrl+Shift+I' },
        { type: 'separator' },
        { label: '退出', accelerator: 'Ctrl+Q', click: () => app.quit() }
      ]
    },
    {
      label: '窗口',
      submenu: [
        { label: '最小化', role: 'minimize', accelerator: 'Ctrl+M' },
        { label: '最大化', role: 'maximize' },
        { label: '还原', role: 'unmaximize' },
        { type: 'separator' },
        { label: '关闭', role: 'close', accelerator: 'Ctrl+W' }
      ]
    },
    // ✅ 参数选项卡（中文）
    {
      label: '参数',
      submenu: [
        {
          label: '导出参数',
          accelerator: 'Ctrl+E',
          click: async () => {
            // 从页面获取 ? 后面的参数（去掉 ?）
            const paramStr = await mainWindow.webContents.executeJavaScript(`
              new URLSearchParams(window.location.search).toString()
            `, true)

            if (!paramStr) {
              dialog.showErrorBox('导出失败', '当前没有参数可导出。')
              return
            }

            // 保存对话框
            const { filePath } = await dialog.showSaveDialog(mainWindow, {
              title: '导出参数',
              defaultPath: '学号抽取系统_参数配置.txt',
              filters: [{ name: '文本文件', extensions: ['txt'] }]
            })

            if (filePath) {
              try {
                fs.writeFileSync(filePath, paramStr, 'utf-8')
                dialog.showMessageBox(mainWindow, {
                  message: `✅ 参数已导出：\n${path.basename(filePath)}`
                })
              } catch (err) {
                dialog.showErrorBox('保存失败', err.message)
              }
            }
          }
        },
        {
          label: '导入参数',
          accelerator: 'Ctrl+I',
          click: async () => {
            const { filePaths } = await dialog.showOpenDialog(mainWindow, {
              title: '导入参数',
              filters: [{ name: '文本文件', extensions: ['txt'] }],
              properties: ['openFile']
            })

            if (!filePaths || filePaths.length === 0) return

            const filePath = filePaths[0]
            try {
              const content = fs.readFileSync(filePath, 'utf-8').trim()
              if (!content) {
                dialog.showErrorBox('读取失败', '文件为空。')
                return
              }

              // 验证是否为合法 query string
              let params
              try {
                params = Object.fromEntries(new URLSearchParams(content))
                // 转换数据类型，与您的Vue应用匹配
                if (params.start) params.start = parseInt(params.start, 10)
                if (params.end) params.end = parseInt(params.end, 10)
                if (params.noRepeat) params.noRepeat = params.noRepeat === 'true'
                if (params.darkMode) params.darkMode = params.darkMode === 'true'
                if (params.nameSize) params.nameSize = parseFloat(params.nameSize)
                if (params.numberSize) params.numberSize = parseInt(params.numberSize, 10)
                if (params.multiDrawCount) params.multiDrawCount = parseInt(params.multiDrawCount, 10)
                if (params.batchSize) params.batchSize = parseInt(params.batchSize, 10)
              } catch (e) {
                dialog.showErrorBox('格式错误', '参数格式不正确！\n示例：start=1&end=40&mode=d&noRepeat=true')
                return
              }

              // ✅ 终极修复：使用 loadFile + query
              await mainWindow.loadFile('index.html', {
                query: params
              })

              dialog.showMessageBox(mainWindow, {
                message: '🎉 参数导入成功，页面已刷新！'
              })
            } catch (err) {
              dialog.showErrorBox('导入失败', err.message)
            }
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// 应用启动
app.whenReady().then(() => {
  mainWindow = createWindow()
  buildMenu() // 初始构建菜单

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 关闭所有窗口时退出
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})