"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
console.log("renderer loaded");
var click_add = " clicks!";
const title = document.getElementById("title");
const statusEl = document.getElementById("status");
title.innerHTML = "0" + click_add;
statusEl.innerHTML = "loaded";
var clicks = 0;
var currentKey = "";
function createButton() {
    return __awaiter(this, void 0, void 0, function* () {
        api.util.log("created");
        var windowRect = yield api.window.info();
        var x = Math.floor(Math.random() * (windowRect.width - 100) + windowRect.x);
        var y = Math.floor(Math.random() * (windowRect.height - 100) + windowRect.y);
        var buttonKey = yield api.button.create({ x: x, y: y, width: 100, height: 100 });
        currentKey = buttonKey;
    });
}
api.event.button.down((buttonKey) => {
    if (currentKey != buttonKey) {
        return;
    }
    api.button.destroy(buttonKey);
    clicks++;
    title.innerHTML = clicks + click_add;
    createButton();
});
api.event.coms.connect((event, data) => {
    if (data.event == "message") {
        statusEl.innerHTML = data.message;
    }
});
document.addEventListener("DOMContentLoaded", () => __awaiter(void 0, void 0, void 0, function* () {
    api.util.log("loaded content");
    createButton();
}), { once: true });
window.addEventListener("mousemove", (e) => {
    title.style.top = e.y + "px";
    title.style.left = e.x + "px";
    api.mouse.move({ x: e.x, y: e.y });
});
