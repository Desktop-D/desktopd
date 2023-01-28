var key = document.title

api.event.coms.connect((event: any, data: any) => {
    key = data.key
})

window.onmousedown = function() {
    api.mouse.down(key)
}