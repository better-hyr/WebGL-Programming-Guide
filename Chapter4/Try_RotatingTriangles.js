// Try_RotatingTriangles.js

// 顶点着色器程序
var VSHADER_SOURCE = 
    'attribute vec4 a_Position;\n' +
    'uniform mat4 u_ModelMatrix;\n' +
    'void main() {\n' +
    '   gl_Position = u_ModelMatrix * a_Position;\n' +
    '}\n';

// 片元着色器程序
var FSHADER_SOURCE = 
    'void main() {\n' +
    '   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
    '}\n';

// 旋转速度（度/秒）
var ANGLE_STEP = 45.0;

function main() {
    // 获取canvas元素
    var canvas = document.getElementById('webgl');
    // 获取webgl绘图上下文
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    // 初始化着色器
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders.');
        return;
    }
    // 设置顶点位置
    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the positions of the vertices');
        return;
    }
    // 设置canvas背景色
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // 获取u_ModelMatrix变量（变换矩阵）的存储位置
    var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (u_ModelMatrix < 0) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }
    // 创建模型矩阵，Matrix4对象
    var ModelMatrix = new Matrix4();
    // 三角形的初始旋转角度
    var currentAngle = 0.0;
    // 开始绘制三角形
    var tick = function() {
        currentAngle = animate(currentAngle);  // 更新旋转角度
        draw(gl, n, currentAngle, ModelMatrix, u_ModelMatrix);  // 绘制三角形
        requestAnimationFrame(tick);  // 请求浏览器调用tick
    }
    tick();
}

// 使用缓存区对象
function initVertexBuffers(gl) {
    var n = 3;  // 点的个数
    var vertices = new Float32Array([
        0.0, 0.5, -0.5, -0.5, 0.5, -0.5
    ]);
    // 创建缓存区对象
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }
    // 绑定缓冲区对象
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // 向缓冲区对象中写入数据
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    // 获取attribute变量地址
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }
    // 将缓冲区对象分配给attribute变量
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    // 开启attribute变量
    gl.enableVertexAttribArray(a_Position);
    return n;
}

var g_last = Date.now();
// 更新旋转角度
function animate(angle) {
    // 计算时间间隔
    var now = Date.now();
    var elapsed = now - g_last;
    g_last = now;
    // 根据时间间隔更新旋转角度
    var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
    return newAngle %= 360;
}

// 绘制三角形
function draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
    // 设置变换矩阵
    modelMatrix.setRotate(currentAngle, 0, 0, 1);
    // 将矩阵传输给顶点着色器
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    // 清除canvas
    gl.clear(gl.COLOR_BUFFER_BIT);
    // 绘制三角形
    gl.drawArrays(gl.TRIANGLES, 0, n); 
}