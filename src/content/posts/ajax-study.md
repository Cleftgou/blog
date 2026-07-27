---
title: Ajax 学习笔记
published: 2024-02-10
description: AJAX（Asynchronous Javascript And Xml）是前端异步请求的核心技术。本文记录了 Ajax 的基本使用、封装原理，以及一个简易 jQuery 库的底层实现。
tags: [JavaScript, Ajax, jQuery, 前端]
category: 前端
image: /images/covers/cover_01.jpg
draft: false
---

# 第一章 Ajax概述

- AJAX（Asynchronous Javascript And Xml）AJAX是可以发送异步请求的。也就是说，在同一个浏览器页面当中，可以发送多个ajax请求，这些ajax请求之间不需要等待，是并发的
- AJAX是JavaScript代码，写在<script>标签里
- 用来实现网页的局部刷新

# 第二章 Ajax基本代码

- 发送get请求

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>ajax get请求</title>
</head>
<body>
<script>
    window.onload = function (){
        document.getElementById("btn").onclick = function (){
            //获取xhr对象
            var xhr = new XMLHttpRequest();
            //绑定回调函数
            xhr.onreadystatechange = function (){
                if (this.readyState == 4) {
                    //ajax结束
                    if (this.status == 200){
                        //http请求正常
                        //这个responseText不管服务器端返回的是什么，都当作普通文本处理
                        //innerHTML是js的语法，可以设置元素内部的html代码，当作html解释
                        document.getElementById("myDiv").innerHTML = this.responseText
                    }else {
                        alert("HTTP响应码："+this.status)
                    }
                }
            }
            //获取通道
            //发送文本框的内容到服务器，因为是get请求，方法是拼url
            var username = document.getElementById("username").value
            var userpwd = document.getElementById("userpwd").value
            xhr.open("GET", "/ajax/yy?username="+username+"&userpwd="+userpwd, true)
            //发送请求
            xhr.send()
        }
    }
</script>
用户名：<input type="text" id="username"><br>
密码：<input type="password" id="userpwd"><br>
<button id="btn">发送ajax请求</button>
<div id="myDiv">
</div>
</body>
</html>
```

- 发送post请求

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>ajax post请求</title>
</head>
<body>
<script>
    window.onload = function (){
        document.getElementById("myBtn").onclick = function (){
            //创建核心对象
            var xhr = new XMLHttpRequest()
            //回调函数
            xhr.onreadystatechange = function (){
                if (this.readyState == 4) {
                    if (this.status == 200){
                        document.getElementById("myDiv").innerHTML = this.responseText
                    }else {
                        alert(this.status)
                    }
                }
            }
            //开启通道
            xhr.open("POST", "/ajax/zz", true)

            //post请求头，以表单的形式（固定格式）
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")

            //发送，依然是拼接字符串
            var username = document.getElementById("username").value
            var userpwd = document.getElementById("userpwd").value
            xhr.send("username="+username+"&userpwd="+userpwd)
        }
    }
</script>
账号：<input type="text" id="username">
密码：<input type="password" id="userpwd">
<button id="myBtn">发送一个post请求</button>
<div id="myDiv"></div>
<!--<form enctype="application/x-www-form-urlencoded"></form>-->
</body>
</html>
```

- 书写的具体步骤

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>ajax get请求</title>
</head>
<body>
<script>
    //当页面加载完毕，回调函数
    window.onload = function (){
        //注意这里是onclick属性，不是onclick方法
        //按钮被点击，回调函数
        document.getElementById("helloBtn").onclick = function (){
            //创建ajax的核心对象
            var xhr = new XMLHttpRequest();
            //当readystate状态改变时，回调函数
            xhr.onreadystatechange = function (){
                //以下用this代替了xhr
                //0-1
                //1-2
                //2-3
                //3-4
                //控制台输出1234
                //xhr的状态码
                console.log(this.readyState)
                //当控制台输出4时表示响应结束，即使是404也照样结束
                if (this.readyState == 4) {
                    //其实是xhr.readyState
                    console.log("响应结束了")
                    //这时还会有一个HTTP状态码
                    //200成功
                    //404资源找不到
                    //500服务器错误
                    //控制台输出HTTP的状态码
                    console.log("HTTP状态码"+this.status);
                    if (this.status == 404) {
                        alert("对不起，你访问的资源的不存在，请检查请求路径")
                    }else if (this.status == 500){
                        alert("服务器发生严重错误!")
                    }else if (this.status == 200){
                        //响应正常，把响应的内容取出来
                        //alert(this.responseText)
                        //把响应的内容取到div中
                        document.getElementById("myDiv").innerHTML = this.responseText
                    }
                }
            }
            //开启通道
            xhr.open("GET", "/ajax/xx", true)
            //发送请求
            xhr.send()
        }
    }
</script>

<input type="button" value="hello ajax" id="helloBtn">

<div id="myDiv">

</div>
</body>
</html>
```

# 第三章 Ajax封装（jQuery底层）

- jQuery本质上就是对Ajax使用过程中各种函数和属性的封装

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>手动封装JS库JQuery</title>
</head>
<body>
<script type="text/javascript">
    /*封装一个函数，通过这个函数可以获取到html页面中的节点，这个函数叫做jQuery*/
    /*要封装的代码是，根据id来获取元素，document.getElementById("btn")*/
    /*设计思路来源于css的语法（id选择器，类选择器），#id可以获取到这个元素*/
    function jQuery(selector){ // selector（只是一个参数，没其他意思）传入的可能是#id，也可能是其他的选择器，比如.class
        if (typeof selector == "string"){
            //为字符串了再去判断选择器，是函数就走下面的判断
            if (selector.charAt(0) == "#"){
                //表示selector是一个id选择器这里
                //domObj没有加上var，所以是全局变量，后面要用
                domObj = document.getElementById(selector.substring(1))
                //为了使用html方法，所以不能返回domObj，而应该返回一个jQuery对象
                //return domObj
                return new jQuery()
            }
        }

        //这个分支表示，页面加载完毕后，注册回调函数
        if (typeof selector == "function"){
            //如果这个传递的是function表示这是要传一个函数类型的变量
            //于是就把这个函数穿给页面加载完毕事件
            window.onload = selector;
        }

        //定义一个html方法代替domObj.innerHTML = ""
        //这是一个成员方法，只能使用对象去调用
        this.html = function (htmlText){
            //让domObj对象去document.getElementById("div1").innerHTML = "<font color=\"red\">显示的信息如下</font>"
            domObj.innerHTML = htmlText
        }

        //定义一个click()函数，代替domObj.onclick = function(){}
        this.click = function (fun){
            domObj.onclick = fun
        }

        //其它事件发生时进行执行的函数...
        this.focus = function (fun){
            domObj.onfocus = fun
        }

        this.change = function (fun){
            domObj.onchange = fun
        }

        this.val = function (v){
            if (v == undefined){
                return domObj.value
            }
            else {
                domObj.value = v
            }
        }
    }


    //觉得jQuery名字太长，所以可以重新命名
    $ = jQuery

    //-------------------------------------------------------------------------------------------------
    //window.onload = function (){
        /*document.getElementById("btn").onclick = function (){
            document.getElementById("div1").innerHTML = "<font color=\"red\">显示的信息如下</font>"*/

        //改造后
        /*jQuery("#btn").onclick = function (){
            jQuery("#div1").innerHTML = "<font color=\"red\">显示的信息如下</font>"
        }*/

        //再改
        /*$("#btn").onclick = function (){
            $("#div1").innerHTML = "<font color=\"red\">显示的信息如下</font>"
        }*/
    //}

    //再改
    /*$(function (){
        $("#btn").onclick = function () {
            $("#div1").innerHTML = "<font color=\"red\">显示的信息如下</font>"
        }
    })*/

    //不想使用innerHTML这个属性，想用html()函数
    //再改
    $(function (){
        $("#btn").click(function () {
            $("#div1").html("<font color=\"red\">显示的信息如下</font>")

            //获取文本框的内容
            // var username = document.getElementById("username").value
            // alert(username)

            //修改文本框内容
            //document.getElementById("username").value = "hehe"

            //获取文本框的内容
            var username = $("#username").val()
            alert(username)

            //修改文本框内容
            $("#username").val("你好")


        })
    })

</script>
用户名：<input type="text" id="username">
<button id="btn">显示信息</button>
<div id="div1"></div>
</body>
</html>
```

- 删除注释整理后

```javascript
function jQuery(selector){
    if (typeof selector == "string"){
        if (selector.charAt(0) == "#"){
            domObj = document.getElementById(selector.substring(1))
            return new jQuery()
        }
    }

    if (typeof selector == "function"){
        window.onload = selector;
    }

    this.html = function (htmlText){
        domObj.innerHTML = htmlText
    }
    this.click = function (fun){
        domObj.onclick = fun
    }
    this.focus = function (fun){
        domObj.onfocus = fun
    }
    this.change = function (fun){
        domObj.onchange = fun
    }
    this.val = function (v){
        if (v == undefined){
            return domObj.value
        }
        else {
            domObj.value = v
        }
    }
}
$ = jQuery
```

- 封装后使用jQuery能简化代码

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>测试我们的jQuery</title>
</head>
<body>
<script type="text/javascript" src="js/jQuery-1.0.0.js"></script>

<script>
    $(function (){
        $("#btn").click(function (){
            //获取文本框内容
            alert($("#username").val())
            $("#mydiv").html("<font color='aqua'>你好</font>")
        })
    })

</script>
username:<input type="text" id="username">
<button id="btn">hello</button>
<div id="mydiv"></div>
</body>
</html>
```

- 最终版本（底层原理）

```JavaScript
function jQuery(selector){
    if (typeof selector == "string") {
        if (selector.charAt(0) == "#") {
            domObj = document.getElementById(selector.substring(1))
            return new jQuery()
        }
    }
    if (typeof selector == "function") {
        window.onload = selector
    }
    this.html = function(htmlStr){
        domObj.innerHTML = htmlStr
    }
    this.click = function(fun){
        domObj.onclick = fun
    }
    this.focus = function (fun){
        domObj.onfocus = fun
    }
    this.blur = function(fun) {
        domObj.onblur = fun
    }
    this.change = function (fun){
        domObj.onchange = fun
    }
    this.val = function(v){
        if (v == undefined) {
            return domObj.value
        }else{
            domObj.value = v
        }
    }

    // 静态的方法，发送ajax请求
    /**
     * 分析：使用ajax函数发送ajax请求的时候，需要程序员给我们传过来什么？
     *      请求的方式(type)：GET/POST
     *      请求的URL(url)：url
     *      请求时提交的数据(data)：data
     *      请求时发送异步请求还是同步请求(async)：true表示异步，false表示同步。
     */
    jQuery.ajax = function(jsonArgs){
        // 1.
        var xhr = new XMLHttpRequest();
        // 2.
        xhr.onreadystatechange = function(){
            if (this.readyState == 4) {
                if (this.status == 200) {
                    // 我们这个工具类在封装的时候，先不考虑那么多，假设服务器返回的都是json格式的字符串。
                    var jsonObj = JSON.parse(this.responseText)
                    // 调用函数
                    jsonArgs.success(jsonObj)
                }
            }
        }

        if (jsonArgs.type.toUpperCase() == "POST") {
            // 3.
            xhr.open("POST", jsonArgs.url, jsonArgs.async)
            // 4.
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
            xhr.send(jsonArgs.data)
        }

        if (jsonArgs.type.toUpperCase() == "GET") {
            xhr.open("GET", jsonArgs.url + "?" + jsonArgs.data, jsonArgs.async)
            xhr.send()
        }

    }
}
$ = jQuery

// 这里有个细节，执行这个目的是为了让静态方法ajax生效。
new jQuery()
```

- 使用示例（引入真正的jQuery也是这样的）

```JavaScript
<script type="text/javascript">
    $(function(){
        $("#btn1").click(function(){
            $.ajax({
                type : "POST",
                url : "/ajax/ajaxrequest11",
                data : "username=" + $("#username").val(),
                async : true,
                success : function(json){
                    $("#div1").html(json.uname)
                }
            })
        })
    })
</script>
```
