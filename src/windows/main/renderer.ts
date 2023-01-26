console.log("renderer loaded")

const title = document.getElementById("title")!
title.innerHTML = "testing"

window.addEventListener("mousemove", (e) => {
    title.style.top = e.y + "px"
    title.style.left = e.x + "px"

    api.mouse.move({x: e.x, y: e.y})
})