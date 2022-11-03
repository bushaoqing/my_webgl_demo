<template>
  <canvas id="canvas" width="450" height="450" style="border: 1px solid blue">
    你的浏览器不支持画布元素
  </canvas>
</template>

<script setup>
/**
 * @file 纹理贴图：彩色图转灰度图 + 旋转
 */
import { onMounted } from 'vue';
import { initShaders } from '../hooks/use_init_shaders';
import erhaImg from '../assets/erha.jpg';
import dressImg from '../assets/dress.jpg';
import gouziImg from '../assets/gouzi.png';
import logoImg from '../assets/logo.png';
// import xiongImg from '../assets/xiong.png';
import xiongImg from '../assets/xiong.jpg';

//顶点着色器源码
const onVertexShader = '' +
  'attribute vec4 a_Position;' +
  //纹理坐标
  'attribute vec2 a_TexCoord;' +
  'uniform mat4 mx;' +
  'uniform mat4 my;' +
  //插值后纹理坐标
  'varying vec2 v_TexCoord;' +
  'void main(){' +
  '   gl_Position=mx*my*a_Position;' +
  //  纹理坐标插值计算
  '   v_TexCoord=a_TexCoord;' +
  '}';

//片元着色器源码
const onFragmentShader = '' +
  'precision highp float;' +
  // 纹理图片像素数据
  'uniform sampler2D u_Sampler;' +
  'varying vec2 v_TexCoord;' +
  'void main(){' +
  //采集纹素
  '   vec4 texture=texture2D(u_Sampler, v_TexCoord);' +
  //计算RGB三个分量光能量之和，也就是亮度
  '   float luminance=0.299*texture.r+0.587*texture.g+0.114*texture.b;' +
  //逐片元赋值，RGB相同均为亮度值，用黑白两色表达图片的明暗变化
  '   gl_FragColor=vec4(luminance, luminance, luminance, 1);' +
  '}';

const onWebgl = () => {

  //canvas画布
  const canvas = document.getElementById('canvas');
  //三维画笔
  const gl = canvas.getContext('webgl');
  initShaders(gl, onVertexShader, onFragmentShader);
  gl.clearColor(0.0, 0.0, 0.0, .1);


  /**
   * 四个顶点坐标数据data，z轴为零
   * 定义纹理贴图在WebGL坐标系中位置
   **/
  var data = new Float32Array([
    -.5, .5,//左上角——v0
    -.5, -.5,//左下角——v1
    .5, .5,//右上角——v2
    .5, -.5 //右下角——v3
  ]);
  /**
   * 创建UV纹理坐标数据textureData
   **/
  var textureData = new Float32Array([
    0, 1,//左上角——uv0
    0, 0,//左下角——uv1
    1, 1,//右上角——uv2
    1, 0 //右下角——uv3
  ]);


  //创建缓冲区对象
  const buffer = gl.createBuffer();
  //绑定缓冲区对象,激活buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  //顶点数组data数据传入缓冲区
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  //获取顶点着色器的位置变量apos，即aposLocation指向apos变量。
  const aposLocation = gl.getAttribLocation(gl.program, 'a_Position');
  //缓冲区中的数据按照一定的规律传递给位置变量apos
  gl.vertexAttribPointer(aposLocation, 2, gl.FLOAT, false, 0, 0);
  //允许数据传递
  gl.enableVertexAttribArray(aposLocation);


  //创建缓冲区对象
  const ubuffer = gl.createBuffer();
  //绑定缓冲区对象,激活buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, ubuffer);
  //顶点数组data数据传入缓冲区
  gl.bufferData(gl.ARRAY_BUFFER, textureData, gl.STATIC_DRAW);

  //获取顶点着色器的位置变量apos，即aposLocation指向apos变量。
  const atexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
  //缓冲区中的数据按照一定的规律传递给位置变量apos
  gl.vertexAttribPointer(atexCoord, 2, gl.FLOAT, false, 0, 0);
  //允许数据传递
  gl.enableVertexAttribArray(atexCoord);



  /* 图像预处理：纹理图片上下反转 */
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
  /**
   * 激活0号纹理单元TEXTURE0
   * 对于WebGL至少支持8个纹理单元
   * 分别标识为gl.TEXTURE0、gl.TEXTURE1、... gl.TEXTURE7
   */
  gl.activeTexture(gl.TEXTURE0)
  //创建纹理图像缓冲区
  const texture = gl.createTexture()
  //绑定纹理缓冲区
  gl.bindTexture(gl.TEXTURE_2D, texture)

  // 注意：下面这种事拿不到img的！！
  // image.src = '../assets/erha.jpg'

  /**
   * 图片的像素尺寸要保证为2的n次幂:
   * 比如16、512、256、1024等
   * 可以自由组合出256x256、128x512等像素尺寸图片
   * 
   * 下面：logoImg测尺寸就不对，所以渲染不出来
   */
  const image = new Image()
  // image.src = erhaImg
  // image.src = logoImg
  // image.src = gouziImg
  // image.src = dressImg
  image.src = xiongImg
  image.onload = () => {
    //设置纹素格式，jpg格式对应gl.RGB
    //png格式：logoImg、gouziImg   png格式是RGBA
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image)
    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)

    //设置纹理贴图填充方式(纹理贴图像素尺寸大于顶点绘制区域像素尺寸)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)

    const u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler')

    //纹理缓冲区单元TEXTURE0中的颜色数据传入片元着色器
    // 第二个参数0对应TEXTURE0末尾的0
    gl.uniform1i(u_Sampler, 0)

    draw();
  }

  /**
   * 定义绘制函数draw()，定时更新旋转矩阵数据，并调用WebGL绘制API
   ***/
  /**从program对象获得旋转矩阵变量mx、my地址**/
  const mx = gl.getUniformLocation(gl.program, 'mx');
  const my = gl.getUniformLocation(gl.program, 'my');
  let angle = Math.PI / 4;//起始角度
  function draw() {
    console.log(angle)
    if (angle > 15) return;

    //清空画布上一帧图像
    gl.clear(gl.COLOR_BUFFER_BIT);

    //立方体绕y轴旋转
    angle += 0.05;//每次渲染角度递增，每次渲染不同的角度
    const sinB = Math.sin(angle);//旋转角度正弦值
    const cosB = Math.cos(angle);//旋转角度余弦值
    const myArr = new Float32Array([
      cosB, 0, -sinB, 0,
      0, 1, 0, 0,
      sinB, 0, cosB, 0,
      0, 0, 0, 1
    ]);
    gl.uniformMatrix4fv(my, false, myArr);

    //立方体绕x轴旋转
    const mxArr = new Float32Array([
      1, 0, 0, 0,
      0, cosB, -sinB, 0,
      0, sinB, cosB, 0,
      0, 0, 0, 1
    ]);
    gl.uniformMatrix4fv(mx, false, mxArr);

    requestAnimationFrame(draw);

    /**执行绘制命令**/
    render();
  }

  /**执行绘制命令**/
  const render = () => {
    console.log('image.src: ', image.src)
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

}

const onCanvas = () => {
  const canvas = document.getElementById('canvas');

  //通过方法getContext()获取Canvas 2D绘图上下文
  const c = canvas.getContext('2d');
  c.moveTo(10, 50);//直线起点坐标
  c.lineTo(50, 50);//直线第2个点坐标
  c.lineTo(50, 100);//直线第2个点坐标
  c.lineTo(10, 100);//直线第3个点坐标
  c.lineTo(10, 50);//直线第1个点坐标
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
