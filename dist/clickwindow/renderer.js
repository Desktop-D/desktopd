"use strict";
var key = document.title;
api.event.coms.connect((event, data) => {
    key = data.key;
});
window.onmousedown = function () {
    api.mouse.down(key);
};
