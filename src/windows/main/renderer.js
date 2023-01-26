console.log("renderer loaded")

var click_add = " clicks!"

const title = document.getElementById("title")
const statusEl = document.getElementById("status")
title.innerHTML = "0" + click_add
statusEl.innerHTML = "loaded"

var clicks = 0
var currentKey = ""

async function createButton() {
    var windowRect = await api.window.info()

    var x = Math.floor(Math.random() * (windowRect.width - 100) + windowRect.x)
    var y = Math.floor(Math.random() * (windowRect.height - 100) + windowRect.y)

    var buttonKey = await api.button.create({ x: x, y: y, width: 100, height: 100 })
    currentKey = buttonKey
}

api.event.button.down((buttonKey) => {
    if (currentKey != buttonKey) { return }
    
    api.button.destroy(buttonKey)

    clicks++
    title.innerHTML = clicks + click_add

    createButton()
})

api.event.coms.connect((event, data) => {
    if (data.event == "message") {
        statusEl.innerHTML = data.message
    }
})

document.addEventListener("DOMContentLoaded", async () => {
    api.util.log("loaded content")

    createButton()
})

window.addEventListener("mousemove", (e) => {
    title.style.top = e.y + "px"
    title.style.left = e.x + "px"

    api.mouse.move({ x: e.x, y: e.y })
})