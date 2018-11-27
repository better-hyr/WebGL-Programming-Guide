// HelloCanvas.js

function main() {

    // 获取canvas元素
    var canvas = document.getElementById('webgl');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }

    // 获取WebGL绘图上下文
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // 指定清空canvas的颜色
    gl.clearColor(0.0, 0.0, 1.0, 1.0);

    // 清空canvas
    gl.clear(gl.COLOR_BUFFER_BIT);  // 清空颜色缓存区
}