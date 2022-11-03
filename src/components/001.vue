<template>
  <canvas id="canvas" width="500" height="500" style="border: 1px solid blue">
    你的浏览器不支持画布元素
  </canvas>
</template>

<script setup>
/**
 * @file 点
 */
import { onMounted } from 'vue';
import { initShaders } from '../hooks/use_init_shaders';

//顶点着色器源码
const onVertexShader = '' +
  'void main(){' +
  // 给内置变量gl_PointSize赋值像素大小
  '   gl_PointSize=20.0;' +
  // 顶点位置，位于坐标原点
  '   gl_Position =vec4(0.0,0.0,0.0,1.0);' +
  '}';
// const onVertexShader = document.getElementById('vertexShader').innerText;

//片元着色器源码
const onFragmentShader = '' +
  'void main(){' +
  '   gl_FragColor=vec4(0.0,0.0,0.0,1.0);' +
  '}';
// const onFragmentShader = document.getElementById('fragmentShader').innerText;

const onWebgl = () => {

  //canvas画布
  const canvas = document.getElementById('canvas');
  //三维画笔
  const gl = canvas.getContext('webgl');

  initShaders(gl, onVertexShader, onFragmentShader);

  /** 
   * 1、画点
   */
  gl.clearColor(0, 0, 0, 0.6);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.POINTS, 0, 1);
  gl.drawArrays(gl.POINTS, 0, 1);

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
