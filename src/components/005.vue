<template>
  <canvas id="canvas" width="500" height="500" style="border: 1px solid blue">
    你的浏览器不支持画布元素
  </canvas>
</template>

<script setup>
/**
 * @file 三角形
 */
import { onMounted } from 'vue';
import { initShaders } from '../hooks/use_init_shaders';

//顶点着色器源码
const onVertexShader = '' +
  'attribute vec4 apos;' +
  'attribute vec4 a_color;' +
  'varying vec4 v_color;' +
  'void main(){' +
  // '   float angle=radians(15.0);' +
  // '   float sinB=sin(angle);' +
  // '   float cosB=cos(angle);' +
  // '   mat4 mx=mat4(1,0,0,0,  0,cosB,-sinB,0,  0,sinB,cosB,0,  0,0,0,1);' +
  // '   mat4 my=mat4(cosB,0,-sinB,0,  0,1,0,0,  sinB,0,cosB,0,  0,0,0,1);' +
  // '   gl_Position=mx*my*apos;' +
  '   gl_Position=apos;' +
  '   v_color = a_color;' +
  '}';

//片元着色器源码
const onFragmentShader = '' +
  'precision lowp float;' +
  'varying vec4 v_color;' +
  'void main(){' +
  // '   gl_FragColor=vec4(0.0,0.0,0.0,1.0);' +
  '   gl_FragColor=v_color;' +
  '}';

const onWebgl = () => {

  //canvas画布
  const canvas = document.getElementById('canvas');
  //三维画笔
  const gl = canvas.getContext('webgl');
  initShaders(gl, onVertexShader, onFragmentShader);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);


  // //顶点坐标数组
  // var data = new Float32Array([
  //   0.0, 0.5, 1.0,
  //   0.5, 0.0, 1.0,
  //   -0.5, 0.0, 1.0,
  //   0.0, -0.5, 1.0,
  // ]);
  //顶点坐标数组
  var data = new Float32Array([
    0.0, 0.5, 1.0,
    1, 0, 0,
    0.5, 0.0, 1.0,
    0, 0, 1,
    -0.5, 0.0, 1.0,
    0, 1, 0,
    0.0, -0.5, 1.0,
    1, 0, 0,
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
  gl.vertexAttribPointer(aposLocation, 3, gl.FLOAT, false, 4 * 6, 0);
  //允许数据传递
  gl.enableVertexAttribArray(aposLocation);

  var a_color = gl.getAttribLocation(gl.program, 'a_color');
  gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, 4 * 6, 4 * 3);
  gl.enableVertexAttribArray(a_color);

  // /**
  //  * border上色
  //  * 创建顶点位置数据数组data，存储两个顶点(-0.5,0.5、(0.5,0.5)
  //  * 创建顶点颜色数组colorData，存储两个顶点对应RGB颜色值(0,0,1)、(1,0,0)
  //  **/
  // var colorData = new Float32Array([
  //   1, 0, 0,
  //   0, 0, 1,
  //   0, 1, 0,
  //   1, 0, 0,
  // ]);
  // var a_color = gl.getAttribLocation(gl.program, 'a_color');
  // var colorBuffer = gl.createBuffer();
  // gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  // gl.bufferData(gl.ARRAY_BUFFER, colorData, gl.STATIC_DRAW);
  // gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, 0, 0);
  // gl.enableVertexAttribArray(a_color);

  // 上三角
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  // 下三角
  gl.drawArrays(gl.LINE_LOOP, 1, 3);
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
