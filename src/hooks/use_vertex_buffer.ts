export const vertexBuffer = (gl, data, that, n) => {
    //创建缓冲区对象
    const buffer = gl.createBuffer();
    //绑定缓冲区对象,激活buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    //顶点数组data数据传入缓冲区
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    //缓冲区中的数据按照一定的规律传递给位置变量apos
    gl.vertexAttribPointer(that, n, gl.FLOAT, false, 0, 0);
    //允许数据传递
    gl.enableVertexAttribArray(that);
}
