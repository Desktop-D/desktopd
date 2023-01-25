"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const title = document.getElementById("title");
title.innerHTML = "testing";
electron_1.ipcRenderer.send("ping");
