# 一款将图片打成粒子渲染的js特效
```js
new Point({
    element: document.getElementById('map'),
    src:'./love.png',
    //颗粒化度 0 ~ 1 值越小 颗粒化程度越高
    granuleLimit: 1,
    //模糊度 越大越模糊
    dim: 6,
    //粒子的动画间隔
    interval: 40,
    //动画持续时间
    duration: 6000,
    //动画的起始点
    startLocation: [
        150, 300
    ],
    //粒子动画类型
    easeType: 'easeInOutExpo',//[linear,easeInOutBack,easeInOutExpo]
});
```