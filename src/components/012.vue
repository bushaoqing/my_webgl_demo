<template>
  <canvas id="canvas" width="450" height="450" style="border: 1px solid blue">
    你的浏览器不支持画布元素
  </canvas>
</template>

<script setup>
/**
 * @file 切换着色器程序（立方体添加局部贴图）
 */
import { onMounted } from 'vue';
import { creatShaders } from '../hooks/use_init_shaders';
import { vertexBuffer } from '../hooks/use_vertex_buffer';
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
  // 采集纹素
  // '   vec4 texture=texture2D(u_Sampler, v_TexCoord);' +
  // //计算RGB三个分量光能量之和，也就是亮度
  // '   float luminance=0.299*texture.r+0.587*texture.g+0.114*texture.b;' +
  // //逐片元赋值，RGB相同均为亮度值，用黑白两色表达图片的明暗变化
  // '   gl_FragColor=vec4(luminance, luminance, luminance, 1);' +
  '   gl_FragColor=texture2D(u_Sampler, v_TexCoord);' +
  '}';

//顶点着色器源码
const onVertexShader1 = '' +
  'attribute vec4 apos;' +
  'attribute vec4 a_color;' +
  'uniform mat4 mx1;' +
  'uniform mat4 my1;' +
  'varying vec4 v_color;' +
  'void main(){' +
  '   gl_Position=mx1*my1*apos;' +
  '   v_color=a_color;' +
  '}';

//片元着色器源码
const onFragmentShader1 = '' +
  'precision lowp float;' +
  'varying vec4 v_color;' +
  'void main(){' +
  '   gl_FragColor=v_color;' +
  '}';


const onWebgl = () => {

  //canvas画布
  const canvas = document.getElementById('canvas');
  //三维画笔
  const gl = canvas.getContext('webgl');
  gl.clearColor(0.0, 0.0, 0.0, .1);


  /**
   * 四个顶点坐标数据data，z轴为零
   * 定义纹理贴图在WebGL坐标系中位置
   **/
  const dataP = new Float32Array([
    -.45, .45, -.51,//左上角——v0
    -.45, -.45, -.51,//左下角——v1
    .45, .45, -.51,//右上角——v2
    .45, -.45, -.51,//右下角——v3
  ]);
  /**
   * 创建UV纹理坐标数据textureData
   **/
  const textureData = new Float32Array([
    0, 1,//左上角——v0
    0, 0,//左下角——v1
    1, 1,//右上角——v2
    1, 0,//右下角——v3
  ]);

  /**
   * 四个顶点坐标数据data，z轴为零
   * 定义纹理贴图在WebGL坐标系中位置
   **/
  const data = new Float32Array([
    .5, .5, .5, -.5, .5, .5, -.5, -.5, .5, .5, .5, .5, -.5, -.5, .5, .5, -.5, .5,      //面1
    .5, .5, .5, .5, -.5, .5, .5, -.5, -.5, .5, .5, .5, .5, -.5, -.5, .5, .5, -.5,      //面2
    .5, .5, .5, .5, .5, -.5, -.5, .5, -.5, .5, .5, .5, -.5, .5, -.5, -.5, .5, .5,      //面3
    -.5, .5, .5, -.5, .5, -.5, -.5, -.5, -.5, -.5, .5, .5, -.5, -.5, -.5, -.5, -.5, .5,//面4
    -.5, -.5, -.5, .5, -.5, -.5, .5, -.5, .5, -.5, -.5, -.5, .5, -.5, .5, -.5, -.5, .5,//面5
    .5, -.5, -.5, -.5, -.5, -.5, -.5, .5, -.5, .5, -.5, -.5, -.5, .5, -.5, .5, .5, -.5, //面6
  ]);

  /**
   * border上色
   * 创建顶点位置数据数组data，存储两个顶点(-.5,.5)、(.5,.5)
   * 创建顶点颜色数组colorData，存储两个顶点对应RGB颜色值(0,0,1)、(1,0,0)
   **/
  const colorData = new Float32Array([
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,//红色——面1
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,//绿色——面2
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,//蓝色——面3
    1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0,//黄色——面4
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,//蓝色——面5
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, //白色——面6
  ]);

  // 旋转角度函数
  const rotateFun = (gl, program, mxStrr, myStr) => {
    /**从program对象获得旋转矩阵变量mx、my地址**/
    const mx = gl.getUniformLocation(program, mxStrr);
    const my = gl.getUniformLocation(program, myStr);
    const angle = Math.PI / 8;
    const sinB = Math.sin(angle);//旋转角度正弦值
    const cosB = Math.cos(angle);//旋转角度余弦值

    //立方体绕y轴旋转
    const myArr = new Float32Array([
      cosB, 0, -sinB, 0,
      0, 1, 0, 0,
      sinB, 0, cosB, 0,
      0, 0, 0, 1,
    ]);

    //立方体绕x轴旋转
    const mxArr = new Float32Array([
      1, 0, 0, 0,
      0, cosB, -sinB, 0,
      0, sinB, cosB, 0,
      0, 0, 0, 1,
    ]);

    gl.uniformMatrix4fv(my, false, myArr);
    gl.uniformMatrix4fv(mx, false, mxArr);
  }



  // 立方體
  const drawSolid = () => {
    const program1 = creatShaders(gl, onVertexShader1, onFragmentShader1);
    gl.useProgram(program1);
    gl.program1 = program1;

    const aposLocation1 = gl.getAttribLocation(gl.program1, 'apos');
    vertexBuffer(gl, data, aposLocation1, 3);

    const acolor = gl.getAttribLocation(gl.program1, 'a_color');
    vertexBuffer(gl, colorData, acolor, 3);

    // 传入数据
    rotateFun(gl, gl.program1, 'mx1', 'my1');

    /**执行绘制之前，一定要开启深度测试，以免颜色混乱**/
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT);
    /**执行绘制命令**/
    gl.drawArrays(gl.TRIANGLES, 0, 36);

  }

  // 紋理貼圖
  const drawTexture = (image) => {
    const program = creatShaders(gl, onVertexShader, onFragmentShader);
    gl.useProgram(program);
    gl.program = program;

    const aposLocation = gl.getAttribLocation(gl.program, 'a_Position');
    vertexBuffer(gl, dataP, aposLocation, 3);

    const atexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
    vertexBuffer(gl, textureData, atexCoord, 2);

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

    //设置纹素格式，jpg格式对应gl.RGB
    //png格式：logoImg、gouziImg   png格式是RGBA
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image)
    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)

    //设置纹理贴图填充方式(纹理贴图像素尺寸大于顶点绘制区域像素尺寸)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)

    // 传入数据
    rotateFun(gl, gl.program, 'mx', 'my');

    const u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler')

    //纹理缓冲区单元TEXTURE0中的颜色数据传入片元着色器
    // 第二个参数0对应TEXTURE0末尾的0
    gl.uniform1i(u_Sampler, 0)

    /**执行绘制命令**/
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }


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
    drawSolid()
    drawTexture(image)
  }
}

onMounted(onWebgl)
</script>
