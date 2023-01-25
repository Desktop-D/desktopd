import { ipcRenderer } from "electron";

const title = document.getElementById("title")
title!.innerHTML = "testing"

ipcRenderer.send("ping")