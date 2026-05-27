const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const http = require("http");

app.setPath(
  "userData",
  path.join(app.getPath("temp"), "offline-chat-bot-userdata")
);

app.commandLine.appendSwitch("disable-gpu");
app.commandLine.appendSwitch("disable-http-cache");

let backendProcess = null;
let mainWindow = null;

function waitForUrl(url, timeout = 120000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    function check() {
      const req = http.get(url, (res) => {
        res.resume();
        resolve(true);
      });

      req.on("error", () => {
        if (Date.now() - start > timeout) {
          reject(new Error(`${url} not ready`));
        } else {
          setTimeout(check, 1000);
        }
      });

      req.setTimeout(3000, () => req.destroy());
    }

    check();
  });
}

function startBackend() {
  const backendPath = app.isPackaged
    ? path.join(process.resourcesPath, "backend", "OfflineChatbotBackend.exe")
    : path.join(
        __dirname,
        "..",
        "..",
        "dist",
        "OfflineChatbotBackend",
        "OfflineChatbotBackend.exe"
      );

  console.log("Backend path:", backendPath);
  console.log("Backend cwd:", path.dirname(backendPath));

  backendProcess = spawn(backendPath, [], {
    cwd: path.dirname(backendPath),
    shell: false,
    windowsHide: false,
    env: { ...process.env },
  });

  backendProcess.stdout.on("data", (data) => {
    console.log("BACKEND OUT:", data.toString());
  });

  backendProcess.stderr.on("data", (data) => {
    console.error("BACKEND ERR:", data.toString());
  });

  backendProcess.on("error", (err) => {
    console.error("Backend start error:", err);
  });

  backendProcess.on("exit", (code) => {
    console.log("Backend exited with code:", code);
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 750,
    minWidth: 1000,
    minHeight: 650,
    backgroundColor: "#050914",
    autoHideMenuBar: true,
    show: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (app.isPackaged) {
    await mainWindow.loadFile(
      path.join(process.resourcesPath, "app", "out", "index.html")
    );
  } else {
    await mainWindow.loadURL("http://localhost:3000");
  }

  mainWindow.show();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  startBackend();

  try {
    await waitForUrl("http://127.0.0.1:8001", 120000);
  } catch (err) {
    console.error("Backend not ready:", err.message);
  }

  await createWindow();
});

app.on("window-all-closed", () => {
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
  }

  if (process.platform !== "darwin") {
    app.quit();
  }
});