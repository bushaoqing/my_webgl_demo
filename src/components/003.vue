<template>
  <canvas id="canvas" width="500" height="500" style="border: 1px solid blue">
    你的浏览器不支持画布元素
  </canvas>
</template>

<script setup>
/**
 * @file 线框立方体（无颜色）
 */
import { onMounted } from 'vue';
import { initShaders } from '../hooks/use_init_shaders';

//顶点着色器源码
const onVertexShader = '' +
  'attribute vec4 apos;' +
  'void main(){' +
  '   float angle=radians(15.0);' +
  '   float sinB=sin(angle);' +
  '   float cosB=cos(angle);' +
  '   mat4 mx=mat4(1,0,0,0,  0,cosB,-sinB,0,  0,sinB,cosB,0,  0,0,0,1);' +
  '   mat4 my=mat4(cosB,0,-sinB,0,  0,1,0,0,  sinB,0,cosB,0,  0,0,0,1);' +
  '   gl_Position=mx*my*apos;' +
  '}';

//片元着色器源码
const onFragmentShader = '' +
  'void main(){' +
  '   gl_FragColor=vec4(0.0,0.0,0.0,1.0);' +
  '}';

const onWebgl = () => {

  //canvas画布
  const canvas = document.getElementById('canvas');
  //三维画笔
  const gl = canvas.getContext('webgl');

  initShaders(gl, onVertexShader, onFragmentShader);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  //   8个顶点坐标数组
  var data = new Float32Array([
    0.5, 0.5, 0.5,//顶点0
    -0.5, 0.5, 0.5,//顶点1
    -0.5, -0.5, 0.5,//顶点2
    0.5, -0.5, 0.5,//顶点3
    0.5, 0.5, -0.5,//顶点4
    -0.5, 0.5, -0.5,//顶点5
    -0.5, -0.5, -0.5,//顶点6
    0.5, -0.5, -0.5,//顶点7
  ]);

  //创建缓冲区对象
  var buffer = gl.createBuffer();
  //绑定缓冲区对象,激活buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  //顶点数组data数据传入缓冲区
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  //获取顶点着色器的位置变量apos，即aposLocation指向apos变量。
  var aposLocation = gl.getAttribLocation(gl.program, 'apos');
  //缓冲区中的数据按照一定的规律传递给位置变量apos
  gl.vertexAttribPointer(aposLocation, 3, gl.FLOAT, false, 0, 0);
  //允许数据传递
  gl.enableVertexAttribArray(aposLocation);

  // 顶点索引数组
  var indexes = new Uint8Array([
    //前四个点对应索引值
    0, 1, 2, 3,//gl.LINE_LOOP模式四个点绘制一个矩形框
    //后四个顶点对应索引值
    4, 5, 6, 7,//gl.LINE_LOOP模式四个点绘制一个矩形框
    //前后对应点对应索引值  
    0, 4,//两个点绘制一条直线
    1, 5,//两个点绘制一条直线
    2, 6,//两个点绘制一条直线
    3, 7//两个点绘制一条直线
  ]);

  //创建缓冲区对象
  var indexesBuffer = gl.createBuffer();
  //绑定缓冲区对象
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexesBuffer);
  //索引数组indexes数据传入缓冲区
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexes, gl.STATIC_DRAW);

  gl.drawArrays(gl.LINE_LOOP, 0, 4);
  gl.drawArrays(gl.LINE_LOOP, 4, 4);
  gl.drawElements(gl.LINES, 8, gl.UNSIGNED_BYTE, 8);
}

const onCanvas = () => {
  const canvas = document.getElementById('canvas');

  //通过方法getContext()获取Canvas 2D绘图上下文
  var c = canvas.getContext('2d');
  c.moveTo(0, 50);//直线起点坐标
  c.lineTo(50, 50);//直线第2个点坐标
  c.lineTo(50, 100);//直线第2个点坐标
  c.lineTo(0, 100);//直线第3个点坐标
  c.stroke();//把点连成直线绘制出来
}

const init = () => {
  const bool = 0;

  if (bool) {

    // canvas
    onCanvas();
  } else {

    // webGl
    onWebgl();
  }
}

onMounted(init)
</script>
