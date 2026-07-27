---
title: Java Web 开发学习笔记
published: 2024-04-10
description: 从 Servlet 基础到 JSP、EL 表达式、JSTL、Filter、Listener、Session/Cookie 机制，再到 MVC 设计模式与前后端分离的全面 Java Web 学习笔记。
tags: [Java Web, Servlet, JSP, Filter, Session, Cookie, MVC]
category: Java
image: /images/covers/cover_02.jpg
draft: false
---

```txt
webapproot(比如StudentServlet文件夹下)
	|------WEB-INF
			|------classes(存放编译好的class文件【记得带上com文件夹】)
			|------lib(第三方jar包)
			|------web.xml(注册Servlet)
	|-------html
	|-------css
	|-------javascript
	|-------image
	...
```

新建一个基本的Java项目，然后选中项目为其加上web框架支持



# 😊在idea中开发servlet程序的步骤

1、New Project 新建一个空工程然后再添加模块

2、新建一个普通的javase模块

3、添加web框架支持

4、现在可以先把jsp文件删除

5、编写servlet的实现类，记得先导入servlet模块

6、在servlet中的service方法中编写业务代码（这里用了jdbc需要起点数据库服务，以及连接数据库等等）

```java
package com.niu.servlet;

import jakarta.servlet.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.*;

public class StudentServlet implements Servlet {
    @Override
    public void init(ServletConfig servletConfig) throws ServletException {

    }

    @Override
    public ServletConfig getServletConfig() {
        return null;
    }

    @Override
    public void service(ServletRequest servletRequest, ServletResponse servletResponse)
            throws ServletException, IOException {
        //设置响应的内容类型
        servletResponse.setContentType("text/html");
        PrintWriter out = servletResponse.getWriter();

        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            //注册驱动
            Class.forName("com.mysql.cj.jdbc.Driver");
            //获取连接
            String url = "jdbc:mysql://localhost:3306/bjpowernode";
            String name = "root";
            String password = "123456";
            conn = DriverManager.getConnection(url, name, password);
            //获取数据库操作对象
            String sql = "select deptno, loc from dept";
            ps = conn.prepareStatement(sql);
            //执行sql
            rs = ps.executeQuery();
            //处理查询结果集
            while (rs.next()){
                String deptno = rs.getString("deptno");
                String loc = rs.getString("loc");
                out.print(deptno + "," + loc +"<br>");
            }

        } catch (ClassNotFoundException | SQLException e) {
            e.printStackTrace();
        }finally {
            //关闭数据流
            if (rs != null){
                try {
                    rs.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
            if (ps != null){
                try {
                    ps.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
            if (conn != null){
                try {
                    conn.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    @Override
    public String getServletInfo() {
        return null;
    }

    @Override
    public void destroy() {

    }
}

```

7、在WEB-INF下新建子目录lib，把数据库的驱动jar包放到这里

8、在web.xml中完成类的注册

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd"
         version="4.0">

    <servlet>
        <servlet-name>studentServlet</servlet-name>
        <servlet-class>com.niu.servlet.StudentServlet</servlet-class>
    </servlet>
    <servlet-mapping>
        <servlet-name>studentServlet</servlet-name>
        <url-pattern>/servlet/student</url-pattern>
    </servlet-mapping>
</web-app>
```

9、在web目录下新建一个html文件用于给出一个超链接访问数据库

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>student page</title>
</head>
<body>
<!--这里只是静态界面，没学习jsp-->
<!--这里要随便加上项目名-->
<a href="/xiangmuming/servlet/student">student list</a>
</body>
</html>
```

10、让idea去关联tomcat服务器，在部署选项中修改“应用程序上下文”为/项目名

11、启动tomcat服务器

12、不要让tomcat自己启动浏览器，应该自己手动输入（例如：(http://localhost:8080/xiangmuming/student.html)）

# 😊Servlet对象的生命周期

Servlet对象是由Tomcat服务器（又叫做WEB容器）全权负责的，但是自己创建的Servlet对象是不受WEB容器管理的。

WEB容器底层是一个HashMap集合，只有放到这个集合里的Servlet才能被WEB容器管理。

这个集合的key:请求路径，value:对应的Servlet对象。



默认情况下，服务器在启动时Servlet对象并不会被实例化。

但可以在xml中这样配置，就能开局实例化了（一般不用）

```xml
        <servlet-class>com.bj.javaweb.servlet.AServlet</servlet-class>
        <!--这里加个整数，数字越小优先级越高-->
        <load-on-startup>0</load-on-startup>
```



Servlet对象生命周期

先看控制台输出

```
A无参数构造方法执行了
AServlet's init method execute!
AServlet's service method execute!
AServlet's service method execute!
AServlet's service method execute!
AServlet's service method execute!
```

用户第一次发送请求时，Servlet对象被实例化（AServlet的无参构造方法被执行了）。

AServlet对象被创建出来后，Tomcat服务器马上调用AServlet对象的init方法。

init方法执行之后，Tomcat服务器马上调用AServlet对象的service方法

后续用户发出请求，只执行service方法



以上这些说明：

1.Servlet对象是单例（单个实例对象）的，准确来说是假单例的（因为new的操作是服务器做的）。

2.无参数构造方法，init只有第一次请求时执行，也就是说无参构造方法只执行一次，init方法页只被Tomcat服务器调用一次。

3.只要用户发送一次请求，service方法就必然会被服务器调用一次。



关闭服务器时，控制台输出了下面的内容

```
AServlet's destroy method execute!
```



这说明：

Servlet的destroy方法只被服务器调用一次。

destroy方法是在服务器关闭的时候调用的，这是服务器为了销毁AServlet对象。

这个方法调用时，对象还没有被销毁（因为要对象要调用这个方法），调用完成后才销毁。

# 😎ServletConfig

ServletConfig（Servlet对象的配置信息对象）:Servlet规范中的一员，是一个接口
org.apache.catalina.core.StandardWrapperFacade实现了接口（tomcat服务器实现了接口）

```java
public class org.apache.catalina.core.StandardWrapperFacade implements ServletContext
```

一个Servlet对象有一个ServletConfig对应，且是一对一的
这个对象是tomcat服务器创建的，在创建Servlet对象的同时创建了ServletConfig对象

ServletConfig对象中包含的信息（在xml文件中）servlet标签中的内容：

```xml
    <servlet>
        <servlet-name>AServlet</servlet-name>
        <servlet-class>com.niu.pojo.AServlet</servlet-class>
        <init-param>
            <param-name>name</param-name>
            <param-value>niu</param-value>
        </init-param>
        <init-param>
            <param-name>password</param-name>
            <param-value>123456</param-value>
        </init-param>
    </servlet>
```

tomcat服务器创建ServletConfig对象时，会把Servlet标签中的内容封装到ServletConfig对象中

<init-parm>标签中就是Servlet标签中的初始化参数



ServletConfig接口的常用方法：

```java
public String getInitParameter(String nane);//通过初始化参数的name获取value
public Enumeration<string> getInitParameterNames();//获取所有的初始化参数的name
public ServletContext getServletContext();//获取ServletContext对象
public String getServletName();//获取Servlet的name
```

# 😎ServletContext

ServletContext（Servlet对象的环境信息对象又叫Servlet对象的上下文对象）是Servlet规范中的一员。

org.apache.catalina.core.ApplicationContextFacade实现了接口（tomcat服务器实现了接口）

```java
public class org.apache.catalina.core.ApplicationContextFacade implements ServletContext
```

对于一个webapp来说，ServletContext对象只有一个，且在服务器关闭时销毁

```xml
    <context-param>
        <param-name>user</param-name>
        <param-value>root</param-value>
    </context-param>

    <context-param>
        <param-name>work</param-name>
        <param-value>homework</param-value>
    </context-param>
	<!--    以上信息属于应用级的配置信息，一般一个项目中共享的配置信息会放到以上的标签当中-->
	<!--    如果配置信息只想给某一个servlet参考，那么应当配置在servlet标签中使用-->
```

ServletContext接口的常用方法：

```java
public String getInitParameter(String name);//通过初始化参数的name获取value

public Enumeration<string> getInitParameterNames();//获取所有的初始化参数的name

使用实例：
        Enumeration<String> en = application.getInitParameterNames();
        while (en.hasMoreElements()){
            String name = en.nextElement();
            String value = application.getInitParameter(name);
            out.println("name:"+name+"value:"+value);
        }
```

更多方法：

```java
public String getContextPath();//动态的获取应用的根路径，避免在程序中将路径写死，
//输出结果例如/servlet03_war_exploded
    
public String getRealPath(String path);//获取文件的绝对路径（真实路径）默认是从根目录（即web目录）下开始寻找，所以参数要填写web下的目录路径，例如\common\index.html
//输出结果例如D:\JAVA\IntelliJ IDEA 2021.2.3\WorkSpace_JAVA\JavaWeb_Study\out\artifacts\servlet03_war_exploded\common\index.html 

public void log(String message);//记录日志，application.log("今天是美好的一天");
//记录在例如C:\Users\bairimengchang\AppData\Local\JetBrains\IntelliJIdea2021.2\tomcat\92fbcfde-f5d8-4b1b-9c57-3e22239ccede目录下的logs文件夹下
//日志文件的分类
//catalina.2023-10-07.log 服务器端的java程序运行的控制台信息
//localhost.2023-10-17.log ServletContext对象的log方法记录的日志信息
//localhost_access_log.2023-10-21.log 访问日志
```

更多方法：

```java
// ServletContext对象又被叫做应用域（后面还有请求域、会话域）
// 如果所有servlet应用共享一份数据，并且这个数据很少修改，量很少，那么就可以将这些数据放到ServletContext这个应用域中
public void setAttribute(String name,Object value);//向应用域存数据
public Object getAttribute(String name);//向应用域取数据
public void removeAttribute(String name);//删除应用域的数据
```

# 😊HTTP协议

协议：一套规范，一套标准，按照这个规范来，才能无障碍交流。

HTTP（超文本传输协议）由W3C制定的一种消息模板。

- 超文本：不是普通文本，比如流媒体：声音、视频、图片等。
- HTTP协议支持：不但可以传送普通字符串，同时支持传递声音、视频、图片等流媒体信息。

这种协议游走在B/S之间，B->S发数据需要遵循HTTP协议（请求request），S->B发数据也需要遵循HTTP协议（响应response）。这样B和S之间才能解耦合。

- 解耦合：B不依赖S，S也不依赖B。

- 请求协议：浏览器向web服务器发送数据的时候，这个发送的数据需要遵循一套标准，这套标准中规定了发送的数据具体格式。

  - HTTP请求协议包括：4部分

    - 请求行
    - 请求头
    - 空白行
    - 请求体

  - HTTP请求协议的具体报文：GET请求

    - ```
      请求行
      GET /servlet04_war_exploded/getServlet?username=jick&userpwd=123456 HTTP/1.1       
      Accept:         	 			 
      请求头text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
      Accept-Encoding: gzip, deflate, br
      Accept-Language: zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6
      Connection: keep-alive
      Cookie: Webstorm-5e0ef3d1=dff06e2a-2d77-41a9-8e2f-fd485e866ba3
      Host: localhost:8080
      Referer: http://localhost:8080/servlet04_war_exploded/index.html
      Sec-Fetch-Dest: document
      Sec-Fetch-Mode: navigate
      Sec-Fetch-Site: same-origin
      Sec-Fetch-User: ?1
      Upgrade-Insecure-Requests: 1
      User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 Edg/118.0.2088.61
      sec-ch-ua: "Chromium";v="118", "Microsoft Edge";v="118", "Not=A?Brand";v="99"
      sec-ch-ua-mobile: ?0
      sec-ch-ua-platform: "Windows"
      空白行
      
      请求体
      username=jick&userpwd=123456        （查询字符串参数）
      ```
      
      

  - HTTP请求协议的具体报文：POST请求

    - ```
      请求行
      POST /servlet04_war_exploded/postServlet HTTP/1.1
      请求头
      Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
      Accept-Encoding: gzip, deflate, br
      Accept-Language: zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6
      Cache-Control: max-age=0
      Connection: keep-alive
      Content-Length: 28
      Content-Type: application/x-www-form-urlencoded
      Cookie: Webstorm-5e0ef3d1=dff06e2a-2d77-41a9-8e2f-fd485e866ba3
      Host: localhost:8080
      Origin: http://localhost:8080
      Referer: http://localhost:8080/servlet04_war_exploded/index.html
      Sec-Fetch-Dest: document
      Sec-Fetch-Mode: navigate
      Sec-Fetch-Site: same-origin
      Sec-Fetch-User: ?1
      Upgrade-Insecure-Requests: 1
      User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 Edg/118.0.2088.61
      sec-ch-ua: "Chromium";v="118", "Microsoft Edge";v="118", "Not=A?Brand";v="99"
      sec-ch-ua-mobile: ?0
      sec-ch-ua-platform: "Windows"
      空白行
      
      请求体
      username=jick&userpwd=123456        （表单数据）
      ```
      
      

- 响应协议：web服务器向浏览器发送数据的时候，这个发送的数据需要遵循一套标准，这套标准中规定了发送的数据具体格式。

  - HTTP响应协议包括：4部分

    - 状态行
    - 响应头
    - 空白行
    - 响应体

  - HTTP响应协议具体报文

    - ```html
      HTTP/1.1 200
      Content-Type: text/html;charset=UTF-8
      Content-Length: 128
      Date: Sat, 21 Oct 2023 12:23:57 GMT
      Keep-Alive: timeout=20
      Connection: keep-alive
      
      <!DOCTYPE html>
      <head>
          <title>from get servlet</title>
      </head>
      <body>
          <h1>from get servlet</h1>
      </body>
      </html>
      ```


从服务器上获取资源，使用get请求；向服务器提交数据，使用post请求。post请求相对安全

大部分的form表单提交，因为数据量大，且要传给服务器，所以使用post请求。

get请求会回显敏感信息到地址栏上。

发送的请求数据的格式

- name=value&name=value&name=value&name=value
- name是什么？	
  - 以form表单为例：form表单中input标签的name
- value是什么？
  - 以form表单为例：form表单中input标签的value

# 😊模板方法设计模式

- 设计模式：某个问题的固定的解决方案。（可以被重复使用）
- 设计模式分类
  - GoF设计模式：
    - 指23种设计模式
    - 单例模式
    - 工厂模式
    - 代理模式
    - 门面模式
    - 责任链设计模式
    - 观察者模式
    - 模板方法设计模式
    - ......
  - JavaEE设计模式：
    - DAO
    - DTO
    - VO
    - PO
    - pojo
    - ......
- 模板方法设计模式：在模板类（通常是抽象类）的模板方法中定义核心算法（通常是final的）骨架，具体的实现步骤可以延迟到子类当中完成。

# 😀HttpServlet源码分析

回忆一下Servlet的生命周期

- 用户第一次请求：
  - Tomcat服务器通过反射机制，调用无参数构造方法。创建Servlet对象。（web.xml文件中配置的Servlet类对应的对象）
  - Tomcat服务器调用Servlet对象的init方法完成初始化
  - Tomcat服务器调用Servlet对象的service方法处理请求
- 用户第二次请求：
  - Tomcat服务器调用Servlet对象的service方法处理请求
- 用户第三次请求：
  - Tomcat服务器调用Servlet对象的service方法处理请求
- ...
  - Tomcat服务器调用Servlet对象的service方法处理请求
- 服务器关闭
  - Tomcat服务器调用Servlet对象的destory方法，做销毁之前的工作
  - Tomcat服务器销毁Servlet对象

```java
public class WelcomeServlet extends HttpServlet{
	//用户第一次请求，创建WelcomeServlet对象的时候，会执行这个无参数构造方法。
    public WelcomeServlet(){
        
    }
}

public abstract class GenericServlet implements Servlet, ServletConfig, java.io.Serializable {
    
    //用户第一次请求的时候，WelcomeServlet对象第一次被创建之后，这个init方法会执行
        public void init(ServletConfig config) throws ServletException {
        this.config = config;
        this.init();
    }
    
    //用户第一次请求的时候，带有参数的init(ServletConfig config)执行之后，会执行这个没有参数的init()
     public void init() throws ServletException {
        // NOOP by default
    }
}

//HttpServlet模板类
public abstract class HttpServlet extends GenericServlet {
    //用户每次发请求都会执行一次这个service方法
    @Override
    public void service(ServletRequest req, ServletResponse res) throws ServletException, IOException {

        HttpServletRequest request;
        HttpServletResponse response;

        try {
            //将ServletRequest和ServletResponse向下转型为带有Http的HttpServletRequest和HttpServletResponse
            request = (HttpServletRequest) req;
            response = (HttpServletResponse) res;
        } catch (ClassCastException e) {
            throw new ServletException(lStrings.getString("http.non_http"));
        }
        //调用重载的service方法
        service(request, response);
    }
    
    //这个service方法的两个参数都是带有Http的
    //这个service是一个模板方法
    //核心算法骨架，具体实现延迟到子类中去完成
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		//获取请求方式，这里用到了请求对象req，我们之后重写doGet等首先操作的是响应对象resp
        //获得七种请求方式中的一种
        //GET POST PUT DELETE HEAD OPTIONS TRACE
        String method = req.getMethod();

        //如果请求方式是GET请求，则执行doGet方式
        if (method.equals(METHOD_GET)) {
            long lastModified = getLastModified(req);
            if (lastModified == -1) {
                // servlet doesn't support if-modified-since, no reason
                // to go through further expensive logic
                doGet(req, resp);
            } else {
                long ifModifiedSince;
                try {
                    ifModifiedSince = req.getDateHeader(HEADER_IFMODSINCE);
                } catch (IllegalArgumentException iae) {
                    // Invalid date header - proceed as if none was set
                    ifModifiedSince = -1;
                }
                if (ifModifiedSince < (lastModified / 1000 * 1000)) {
                    // If the servlet mod time is later, call doGet()
                    // Round down to the nearest second for a proper compare
                    // A ifModifiedSince of -1 will always be less
                    maybeSetLastModified(resp, lastModified);
                    doGet(req, resp);
                } else {
                    resp.setStatus(HttpServletResponse.SC_NOT_MODIFIED);
                }
            }

        } else if (method.equals(METHOD_HEAD)) {
            long lastModified = getLastModified(req);
            maybeSetLastModified(resp, lastModified);
            doHead(req, resp);

        } else if (method.equals(METHOD_POST)) {
            doPost(req, resp);

        } else if (method.equals(METHOD_PUT)) {
            doPut(req, resp);

        } else if (method.equals(METHOD_DELETE)) {
            doDelete(req, resp);

        } else if (method.equals(METHOD_OPTIONS)) {
            doOptions(req, resp);

        } else if (method.equals(METHOD_TRACE)) {
            doTrace(req, resp);

        } else {
            //
            // Note that this means NO servlet supports whatever
            // method was requested, anywhere on this server.
            //

            String errMsg = lStrings.getString("http.method_not_implemented");
            Object[] errArgs = new Object[1];
            errArgs[0] = method;
            errMsg = MessageFormat.format(errMsg, errArgs);

            resp.sendError(HttpServletResponse.SC_NOT_IMPLEMENTED, errMsg);
        }
    }
    
    //两个405错误，表示请求方式错误
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String msg = lStrings.getString("http.method_get_not_supported");
        sendMethodNotAllowed(req, resp, msg);
    }
    
        protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

        String msg = lStrings.getString("http.method_post_not_supported");
        sendMethodNotAllowed(req, resp, msg);
    }

}

```

如果前端发送请求是get请求，则后端程序员重写的方法是doGet。

如果前端发送请求是post请求，则后端程序员重写的方法是doPost。

如果不这样做，就会体会到HttpServlet的405报错服务。

# 😂web站点的欢迎界面

当我们访问http://localhost:8080/servlet06时，没有制定资源路径，此时就是在访问资源界面

在web目录下新建一个welcome.html文件，servlet类文件也能作为欢迎页

```xml
    <welcome-file-list>
        <!--        注意不能以斜杠开头-->
        <welcome-file>welcome.html</welcome-file>
    </welcome-file-list>
```

这样就完成了欢迎界面的配置

# 😘WEB-INF目录

放在WEB-INF目录下的资源是受保护的，在浏览器是不能够通过路径直接访问。所以像HTML\CSS\JS\image等静态资源一定要放到WEB-INF目录之外。

# 😗HttpServletResquest接口

request对象和response对象，一个是请求对象，一个是响应对象。这两个对象只在当前请求中有效。

HttpServletRequest接口中的常用方法

- 获取前端浏览器用户提交的数据

  - ```java
    Map<String, String[]> getParmeterMap() 这个是获取Map
    Enumeration<String> getParameterNames() 这个是获取Map集合中的所有key
    String[] getParameterValues(String name) 根据key获取Map集合的value
    String getParameter(String name) 获取value这个一维数组当中的第一个元素（常用）
    ```
    

- 如何存储form表单提交的数据（name=value&name=value&name=value&name=value）

- 采用Map集合来存储

  - ```java
    Map<String, String[]>
    	key存储String
    	value存储String[]
        key        value
        ----------------
        username   abc
        userpwd    1234
        aihao      {"a", "b", "c"}
        注意到一个键可能会对应多个值的情况，所以采取上面所示的数据结构
    ```

- 注意：前端永远提交的是字符串，后端获取的也一定是字符串，即数字120其实是"120"。

- ”应用域“ServletContext当中有三个操作域的方法：

- ```java
  void setAttribute(String name, Object obj);//向域中绑定数据
  Object getAttribute(String name);//从域中根据name获取数据
  void removeAttribute(String name);//将域当中绑定的数据移除
  
  //以上操作类似Map集合的操作
  Map<String, Object> map;
  map.put("name", obj);//向map集合中添加key和value
  Object obj = map.get("name");//通过key获取value
  map.remove("name");//通过key删除key和value这个键值对
  ```

- “请求域”对象

  - “请求域”对象要比“应用域“对象范围小很多，生命周期也短很多，请求域只在一次请求内有效。
  - 一个请求对象request对应一个请求域对象，一次请求之后就被销毁了
  - 请求域对象也有这三个方法

- ```java
  void setAttribute(String name, Object obj);//向域中绑定数据
  Object getAttribute(String name);//从域中根据name获取数据
  void removeAttribute(String name);//将域当中绑定的数据移除
  ```

- 请求转发方法

  - ```java
    //以转发html为例
    req.getRequestDispatcher("/test.html").forward(req, resp);
    ```

    

- 关于request对象中两个非常容易混淆的方法：

  - ```java
    //Paramter翻译为：参数
    //uri?username=zhangsan&userpwd=123456
    String username = request.getParamter("username");
    
    //Attribute翻译为：属性
    //之前是执行了request.setAttribute("name", new Object())
    Object obj = request.getAttribute("name");
    
    //以上两个方法的区别
    //第一个方法获取的是用户在浏览器上提交的数据
    //第二个方法获取的是在请求域中绑定的数据
    ```

- 其他方法

  - ```java
    //获取客户端的IP地址
    String remoteAddr = req.getRemoteAddr();
    
    //get请求在请求行上提交数据
    //post请求在请求体中提交数据
    //设置请求体的字符集（显然这个是针对post请求乱码问题，解决不了get请求的乱码问题）
    //这个乱码问题在tomcat10之后，request请求体当中的字符集编码默认就是utf-8了，所以不用再设置
    request.setCharacterEncoding("UTF-8");
    //解决tomcat10版本之前的响应中，中文乱码问题
    resp.setContentType("text/html;charset=UTF-8");
    
    //处理get请求乱码问题
    //不会乱码，因为URIEncoding默认就是UTF-8（tomcat8之前还是会乱码）
    //解决办法：修改CATALINA_HOME/conf/server.xml文件
    <Connector URIEncoding = "UTF-8"/>
    
    //获取应用的根路径
    String contextPath = request.getContextPath();
    
    //获取请求方式
    String method = req.getMethod();
    
    //获取请求的uri
    String requestURI = req.getRequestURI();
    
    //获取servlet path
    String servletPath = req.getServletPath();
    ```
    

# 🤗使用纯Servlet做一个单表的CRUD操作

- 对部门的增删改查操作（B/S结构）

- 步骤

  - 第一步：准备一张数据库表

    - ```sql
      #部门表
      drop table if exists dept;
      create table dept(
          deptno int primary key,
          dname varchar(255),
          loc varchar(255)
      );
      insert into dept(deptno, dname, loc) values(10,'销售部','北京');
      insert into dept(deptno, dname, loc) values(20,'研发部','上海');
      insert into dept(deptno, dname, loc) values(30,'技术部','广州');
      insert into dept(deptno, dname, loc) values(40,'媒体部','深圳');
      commit;
      select * from dept;
      ```

  - 第二步：准备一套HTML页面（项目原型）

    - 欢迎界面：indext.html
    - 列表界面：list.html(以此界面为核心，展开其他操作)
    - 新增界面：add.html
    - 修改界面：edit.html
    - 详情界面：detail.html
  
  - 第三步：分析系统中包含的功能
  
    - 功能：只要操作连接了数据库，就表示一个独立的功能。
    - 包含的功能：
      - 查看部门列表
      - 新增部门
      - 删除部门
      - 查看部门详细信息
      - 跳转到修改界面
      - 修改部门
  
  - 第四步：在IDEA中搭建开发环境
  
    - 基本的环境配置
    - 把html文件放到web目录下
  
  - 第五步：实现功能（查看部门列表）
  
    - 写代码的过程应该是程序的执行过程
    - 分析list界面中哪部分是静态的以及哪部分是动态的
    - 为了避免冲突，html界面中的双引号替换为单引号（用记事本即可）
  
  - 第六步：接下来就是逐步实现每个功能（这里仅放一些重要的代码）
  
    - DBUtil 数据库连接工具类
  
    - ```java
      package com.niu.oa.utils;
      
      import java.sql.*;
      import java.util.ResourceBundle;
      
      /*
      JDBC工具类
       */
      public class DBUtil {
      
          //静态变量：在类加载时执行
          //并且是自上而下的顺序
          private static ResourceBundle bundle = ResourceBundle.getBundle("resources.jdbc");
          private static String driver = bundle.getString("driver");
          private static String url = bundle.getString("url");
          private static String user = bundle.getString("user");
          private static String password = bundle.getString("password");
      
          static {
              //注册驱动（注册驱动只需要注册一次，放在静态代码块当中。DBUtil类加载的时候执行）
              try {
                  //"com.mysql.cj.jdbc.Driver"是链接数据库的驱动，不能写死。因为以后可能还会链接Oracle数据库
                  //如果链接oracle数据库的时候，还需要修改java代码，违背了OCP开闭原则
                  //OCP开闭原则：对扩展开放，对修改关闭
                  Class.forName(driver);
              } catch (ClassNotFoundException e){
                  e.printStackTrace();
              }
          }
      
          /**
           * 获取链接对象
           * @return Connection链接对象
           * @throws SQLException
           */
          public static Connection getConnection() throws SQLException {
              //获取链接
              return DriverManager.getConnection(url, user, password);
          }
      
          /**
           * 释放资源
           * @param conn 连接对象
           * @param ps 数据库操作对象
           * @param rs 结果集对象
           */
          public static void close(Connection conn, Statement ps, ResultSet rs){
              if (rs!=null){
                  try {
                      rs.close();
                  } catch (SQLException e) {
                      e.printStackTrace();
                  }
              }
              if (ps!=null){
                  try {
                      ps.close();
                  } catch (SQLException e) {
                      e.printStackTrace();
                  }
              }
              if (conn!=null){
                  try {
                      conn.close();
                  } catch (SQLException e) {
                      e.printStackTrace();
                  }
              }
          }
      }
      ```
  
    - jdbc.properties配置文件
  
    - ```properties
      driver = com.mysql.cj.jdbc.Driver
      url = jdbc:mysql://localhost:3306/bjpowernode
      user = root
      password = 123456
      ```
  
    - 三段必备代码
  
    - ```java
      resp.setContentType("text/html");
      PrintWriter out = resp.getWriter();
      String contextPath = req.getContextPath();
      ```
  
    - 请求和转发/重定向
  
    - ```java
      req.getRequestDispatcher("/dept/list").forward(req, resp);
      resp.sendRedirect(""+contextPath+"/dept/list");
      ```

# 🤔将OA项目中的资源跳转修改为合适的跳转方式

重定向（Redirect）和转发（Forward）是两种常用的页面跳转方式，它们有以下区别：

- 请求对象：重定向是两次请求-响应过程，而转发是一次请求-响应过程。

- 浏览器地址栏：重定向会改变浏览器的地址栏，而转发不会改变浏览器的地址栏。

- 执行位置：重定向是在客户端浏览器中完成的，而转发是在服务器端完成的。

- 数据传递：重定向不能直接传递数据，需要通过URL参数、Session或Cookie等进行传递；而转发可以通过Request对象的属性、请求转发器等直接传递数据。

- 跳转范围：重定向可以跳转到任何URL，可以是同一应用程序内的URL，也可以是其他应用程序的URL；而转发只能在当前应用程序内部进行页面跳转。

- 性能开销：由于重定向是两次请求-响应过程，相对于转发来说，它需要更多的网络开销和时间开销。

  

删除之后，重定向（一般都用这个）

修改之后，重定向

保存之后，重定向

重定向：成功界面/失败界面

# 🤔Servlet注解简化开发

不需要编写大量的xml配置信息，直接在java类上标注即可。@WebServlet

这并不是说要抛弃xml文件，一些后期需要改动的配置信息，还是要写在xml文件当中的。

@WebServlet注解具有的属性

- **name属性**，用来指定Servlet的名字，相当于<servlet-name>
- **urlPatterns属性**，用来指定Servlet的映射路径，可以指定多个字符串<url-pattern>
- loadOnStartUp属性，用来指定在服务器启动阶段是否加载该Servlet对象，等同于<load-on-startup>
- value属性，当注解的属性名是value时，value的属性名是可以省略的。

注解对象的使用格式：

- @注解名称(属性名=属性值,属性名=属性值,属性名=属性值...)

# 😀使用模板方法设计模式优化oa项目

之前的设计是1个请求对应1个Servlet类，导致类爆炸

现在可以一个请求对应一个方法，一个业务对应一个Servlet类

只写一个servlet类代码，然后通过if语句判断请求路径即可

```java
package com.niu.oa.web.action;

import com.niu.oa.utils.DBUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

//模板类
@WebServlet({"/dept/list", "/dept/save", "/dept/edit", "/dept/detail", "/dept/delete", "/dept/modify" })
//也可以模糊匹配（目前这个有问题）
//@WebServlet("/dept/*")
public class DeptServlet extends HttpServlet {
    //模板方法
    //重写service方法
    //ctrl+o快捷重写

    //可以重写doGet和doPost方法，但那样又要互相调用，他俩的上层方法就是service方法


    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        //获取servlet path
        String servletPath = req.getServletPath();

        if ("/dept/list".equals(servletPath)){
            doList(req, resp);
        }else if("/dept/save".equals(servletPath)){
            doSave(req, resp);
        }else if("/dept/edit".equals(servletPath)){
            doEdit(req, resp);
        }else if("/dept/detail".equals(servletPath)){
            doDetail(req, resp);
        }else if("/dept/delete".equals(servletPath)){
            doDel(req, resp);
        }else if("/dept/modify".equals(servletPath)){
            doModify(req,resp);
        }
    }

    private void doList(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        resp.setContentType("text/html");
        PrintWriter out = resp.getWriter();
        String contextPath = req.getContextPath();

        out.print("<!DOCTYPE html>");
        out.print("<html lang='en'>");
        out.print("<head>");
        out.print("    <meta charset='UTF-8'>");
        out.print("    <title>部门列表页面</title>");

        out.print("<script type='text/javascript'>");
        out.print("function del(dno){");
        //作用：弹出确认框，点击确定返回true，点击取消返回false(即无事发生)
        out.print("if (window.confirm('注意，删除后不可恢复！')){");
        out.print("document.location.href = '"+contextPath+"/dept/delete?deptno=' + dno");
        out.print("}");
        out.print("}");

        out.print("</script>");
        out.print("</head>");
        out.print("<body>");
        out.print("    <h1 align='center'>部门列表</h1>");
        out.print("    <hr>");
        out.print("    <table border='1px' align='center' width='50%'>");
        out.print("        <tr>");
        out.print("            <th>序号</th>");
        out.print("            <th>部门编号</th>");
        out.print("            <th>部门名称</th>");
        out.print("            <th>操作</th>");
        out.print("        </tr>");
        //上面一部分是死的



        //连接数据库，查询所有部门
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            conn = DBUtil.getConnection();
            String sql = "select deptno,dname,loc from dept";
            ps = conn.prepareStatement(sql);
            rs = ps.executeQuery();
            int i = 0;
            while (rs.next()){
                String deptno = rs.getString("deptno");
                String dname = rs.getString("dname");
                String loc = rs.getString("loc");

                //这部分是活的
                out.print("        <tr>");
                out.print("            <td>"+(++i)+"</td>");
                out.print("            <td>"+deptno+"</td>");
                out.print("            <td>"+dname+"</td>");
                out.print("            <td>");
                //调用js函数，函数有一个参数
                out.print("                <a href='javascript:void(0)' onclick='del("+deptno+")'>删除</a>");
                out.print("                <a href='"+contextPath+"/dept/edit?deptno="+deptno+"'>修改</a>");
                out.print("                <a href='"+contextPath+"/dept/detail?deptno="+deptno+"'>详情</a>");
                out.print("            </td>");
                out.print("        </tr>");

            }
        } catch (SQLException e) {
            e.printStackTrace();
        }finally {
            DBUtil.close(conn, ps, rs);
        }

        //下面一部分是死的
        out.print("</table>");
        out.print("<hr>");
        out.print("<h2 align='center'><a href='"+contextPath+"/add.html'>新增部门</a></h2>");
        out.print("</body>");
        out.print("</html>");
    }

    private void doSave(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        String contextPath = req.getContextPath();
        //获取部门信息
        String deptno = req.getParameter("deptno");
        String dname = req.getParameter("dname");
        String loc = req.getParameter("loc");
        //链接数据库
        Connection conn = null;
        PreparedStatement ps = null;
        int count = 0;
        try {
            conn = DBUtil.getConnection();
            String sql = "insert into dept(deptno, dname, loc) values (?, ?, ?) ";
            ps = conn.prepareStatement(sql);
            ps.setString(1, deptno);
            ps.setString(2, dname);
            ps.setString(3, loc);
            count = ps.executeUpdate();
        } catch (SQLException throwables) {
            throwables.printStackTrace();
        } finally {
            DBUtil.close(conn, ps, null);
        }
        //保存成功跳转到列表界面
        if (count == 1){
            //删除成功(回到部门列表界面，需要执行另一个界面，使用转发机制)
            //req.getRequestDispatcher("/dept/list").forward(req, resp);
            resp.sendRedirect(""+contextPath+"/dept/list");
        } else {
            //删除失败
            //req.getRequestDispatcher("/error.html").forward(req, resp);
            resp.sendRedirect(""+contextPath+"/error.html");
        }
        //保存失败，跳转到错误界面
    }

    private void doEdit(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        resp.setContentType("text/html");
        PrintWriter out = resp.getWriter();
        //跳转到修改界面
        out.print("<!DOCTYPE html>");
        out.print("<html lang='en'>");
        out.print("<head>");
        out.print("    <meta charset='UTF-8'>");
        out.print("    <title>修改部门</title>");
        out.print("</head>");
        out.print("<body>");
        out.print("<h1 align='center'>修改部门</h1>");
        out.print("<hr>");
        out.print("<div align='center'>");

        //获取部门编号
        String deptno = req.getParameter("deptno");
        //链接数据库，根据部门编号查询部门信息
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            conn = DBUtil.getConnection();
            String sql = "select dname, loc from dept where deptno = ?";
            ps = conn.prepareStatement(sql);
            ps.setString(1, deptno);
            rs = ps.executeQuery();
            //这个结果中只有一条记录
            if (rs.next()){
                String dname = rs.getString("dname");
                String loc = rs.getString("loc");
                out.print("<form action='/oa/dept/modify' method='post'>");
                out.print("部门编号<input type='text' name='deptno' value='"+deptno+"' readonly/><br>");
                out.print("部门名称<input type='text' name='dname' value='"+dname+"'/><br>");
                out.print("部门位置<input type='text' name='loc' value='"+loc+"'/><br>");
            }
        } catch (SQLException throwables) {
            throwables.printStackTrace();
        } finally {
            DBUtil.close(conn, ps, rs);
        }
        out.print("<input type='submit' value='修改'/><br>");
        out.print("</form>");
        out.print("</div>");
        out.print("</body>");
        out.print("</html>");
    }

    private void doDetail(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        resp.setContentType("text/html");
        PrintWriter out = resp.getWriter();
        req.getServletPath();

        out.print("<!DOCTYPE html>");
        out.print("<html lang='en'>");
        out.print("<head>");
        out.print("<meta charset='UTF-8'>");
        out.print("<title>部门详情</title>");
        out.print("</head>");
        out.print("<body>");
        out.print("<h1 align='center'>部门详情</h1>");
        out.print("<hr>");
        out.print("<div align='center'>");

        //获取部门编号
        String deptno = req.getParameter("deptno");

        //链接数据库
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            conn = DBUtil.getConnection();
            String sql = "select dname,loc from dept where deptno = ?";
            ps = conn.prepareStatement(sql);
            ps.setString(1, deptno);
            rs = ps.executeQuery();
            //这个结果集只有一条记录
            if(rs.next()){
                String dname = rs.getString("dname");
                String loc = rs.getString("loc");
                out.print("部门编号:"+deptno+"<br>");
                out.print("部门名称:"+dname+"<br>");
                out.print("部门位置:"+loc+"<br>");
            }
        } catch (SQLException throwables) {
            throwables.printStackTrace();
        } finally {
            DBUtil.close(conn, ps, rs);
        }
        out.print("  <input type='button' value='后退' onclick='window.history.back()'/>");
        out.print("</div>");
        out.print("</body>");
        out.print("</html>");
    }

    private void doDel(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        String contextPath = req.getContextPath();
        //根据部门编号删除部门
        String deptno = req.getParameter("deptno");
        //连接数据库
        Connection conn = null;
        PreparedStatement ps = null;
        int count = 0;

        try {
            conn = DBUtil.getConnection();
            //开启事物(自动提交机制关闭)(同时成功或者同时失败)(目前用不到)
            conn.setAutoCommit(false);
            String sql = "delete from dept where deptno = ?";
            ps = conn.prepareStatement(sql);
            ps.setString(1, deptno);
            count = ps.executeUpdate();
            //事物提交
            conn.commit();

        } catch (SQLException throwables) {
            //遇到异常就回滚
            if (conn != null){
                try {
                    conn.rollback();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
            throwables.printStackTrace();
        } finally {
            DBUtil.close(conn, ps, null);
        }

        //判断是否删除成功
        if (count == 1){
            //删除成功(回到部门列表界面，需要执行另一个界面，使用转发机制)
            //req.getRequestDispatcher("/dept/list").forward(req, resp);
            //使用重定向更合适，两次请求而不是一次
            resp.sendRedirect(""+contextPath+"/dept/list");
        } else {
            //删除失败
            //req.getRequestDispatcher("/error.html").forward(req, resp);
            resp.sendRedirect(""+contextPath+"/error.html");
        }
    }

    private void doModify(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        //修改部门
        String contextPath = req.getContextPath();
        //获取表单中的数据
        String deptno = req.getParameter("deptno");
        String dname = req.getParameter("dname");
        String loc = req.getParameter("loc");

        //链接数据库
        Connection conn = null;
        PreparedStatement ps = null;
        int count = 0;
        try {
            conn = DBUtil.getConnection();
            String sql = "update dept set dname = ?, loc = ? where deptno = ?";
            ps = conn.prepareStatement(sql);
            ps.setString(1, dname);
            ps.setString(2, loc);
            ps.setString(3, deptno);
            count = ps.executeUpdate();
        } catch (SQLException throwables) {
            throwables.printStackTrace();
        } finally {
            DBUtil.close(conn, ps, null);
        }

        if (count == 1){
            //更新成功，跳转到部门列表界面
            //req.getRequestDispatcher("/dept/list").forward(req, resp);
            resp.sendRedirect(""+contextPath+"/dept/list");
        }else {
            //更新失败，返回错误界面
            //req.getRequestDispatcher("/error.html").forward(req, resp);
            resp.sendRedirect(""+contextPath+"/error.html");
        }
    }
}

```

# 🤨分析使用纯粹Servlet开发web应用的缺陷

java代码混合了html等前端代码，使得程序耦合度非常高，代码不美观，维护成本非常高等一系列缺点。

我们需要一种机制将前端代码自动翻译成Java代码，如下：

前端代码：

```html
<html>
    <head></head>
</html>
```

转换后：

```java
out.print("<html>");
out.print("<head></head>");    
out.print("</html>");
```

这个机制就是JSP

# 😗B/S结构系统的会话机制（session机制）

- 会话机制:

  - HTTP是无状态的协议
  - 用户打开浏览器,进行一系列操作,最终将浏览器关闭,这个过程叫做一次会话.会话在服务器端也有一个对应的Java对象,即session
  - 用户在浏览器上点击一次,直到界面停下来,可以认为这是一次请求,请求对应的Java对象是request.
  - 因此,一次会话中包含多次请求

- session对象的作用：保存会话状态（比如用session记录用户已登录的状态）

  - 获取session对象
  - ```java
    //从web获取session对象，如果没有session对象，就新建一个
    HttpSession session = req.getSession();
    
    //从web获取session对象，如果没有session对象，就不创建并返回一个null
    HttpSession session = req.getSession(false);
    ```

- org.apache.catalina.session.StandardSessionFacade@4e89be27 内存地址每次会话都不一样

- 几个域
  - request（请求域 请求级 HttpServletRequest）<session（会话域 用户级 HttpSession）<application（应用域 项目级 ServletContext）
  - 通过这个作用范围也可知一个用户应该对应一个会话域
  - 这几个域都有的公共方法
    - setAttribute（绑定）
    - getAttribute（获取）
    - 
      removeAttribute（删除）
  - 使用原则：尽量使用小的域

- session的一些机制

  - 因为HTTP是无状态的协议（服务器无法监视到浏览器关闭），所以session有一个超时自动删除的机制，即长时间未向服务器发送请求后，会把该用户的session删除，也就是要重新登录了。

  - session对象的销毁机制

    - 超时销毁（用户不再访问服务器一段时间）

      - 在xml文件中可以配置

      - ```xml
        <!--    session的超时时长是30分钟（默认也是30分钟）-->
            <session-config>
                <session-timeout>30</session-timeout>
            </session-config>
        ```

    - 手动销毁（网银中的“安全退出”）

- session的实验原理

  - 在web服务器中有一个session列表，类似于map集合，这个map集合的key存储的是session_id，这个map集合的value存储的是对应的session对象。

  - 用户发送第一次请求的时候：服务器会创建一个新的session对象，同时给session对象生成一个id，然后web服务器会将session的id发送给浏览器，浏览器将session的id保存在**浏览器的缓存**中。

    - ```
      Response Headers（响应标头）:
      Set-Cookie: JSESSIONID=6D6ADAD0160C715CC57E0BADC0C7018A;
      
      这说明session_id本质是一个放到浏览器缓存里的一个cookie
      ```

  - 用户发送第二次请求的时候：会自动将**浏览器缓存**中的session_id自动发送给服务器，服务器获取到session_id，然后从session列表中查找到对应的session对象。

    - ```
      Request Headers（请求标头）
      Cookie: JSESSIONID=6D6ADAD0160C715CC57E0BADC0C7018A;
      ```

  - 关闭浏览器，内存消失，cookie消失，session_id消失，会话等同结束。

- cookie禁用后，对session的影响

  - cookie禁用：服务器正常发送cookie给浏览器，但是浏览器不要了。拒收，并不是服务器不发了。

  - 因为没有了sessionid，所以每一次请求都将获取到新的session对象

  - 在禁用的情况下如何实现session机制如何实现

    - 使用URL重写机制即可

    - 但这样会大大增加开发者的成本，即开发人员在编写任何请求路径时，后面都要加上一个sessionid。所以大部分网站都是禁用cookie就不让用了。

    - ```
      http://localhost:8080/servlet08/test/session;jsessionid=6D6ADAD0160C715CC57E0BADC0C7018A
      ```




# 😎JSP

访问一个index.jsp界面，底层执行的是index_jsp.class这个java程序（Servlet程序），自动生成的。

JSP实际上就是一个Servlet。

```java
public final class index_jsp extends org.apache.jasper.runtime.HttpJspBase

public abstract class HttpJspBase extends HttpServlet implements HttpJspPage
```

所以jsp的生命周期与Servlet生命周期完全相同。

此外，jsp界面第一次访问比较慢，因为需要编译成java文件，编译后的java文件在以下示例目录里（此外，必须先访问jsp文件才会出现java文件以及class文件，若java文件有错误，则不会出现class文件）

```
Using CATALINA_BASE:   "C:\Users\bairimengchang\AppData\Local\JetBrains\IntelliJIdea2021.2\tomcat\92fbcfde-f5d8-4b1b-9c57-3e22239ccede"
```

JSP是什么：

- JSP是java程序（本质是一个Servlet）
- JSP：JavaServer Page 的缩写（基于java语言实现的服务器端界面）
- Servlet是JavaEE的13个子规范之一，那么JSP也是JavaEE的13个子规范之一
- JSP是一套规范，所有的web服务器都遵循这套规范，都内置一个jsp翻译引擎，都是按照这套规范进行的翻译

JSP与Servlet的区别：

- 职责不同
  - Servlet的职责：收集数据（逻辑处理，业务处理，连接数据库，获取/收集数据）
  - JSP的职责：展示数据（做数据的展示）

jsp中直接写的东西会出现在class文件中的形式（被当作普通字符串打印输出到浏览器，然后浏览器进行解释执行）比如：

jsp：

```jsp
<%@page contentType="text/html; charset=UTF-8" %>
abc
<head>
    <meta charset="UTF-8">
    <title>hello</title>
</head>
<body>
<h1 align="center">
    你好<br>
    <a href="/oa/dept/list">list</a>
</h1>
</body>
</html>
```

java：

```java
      out.write('a');
      out.write('b');
      out.write('c');
      out.write("<head>\r\n");
      out.write("    <meta charset=\"UTF-8\">\r\n");
      out.write("    <title>hello</title>\r\n");
      out.write("</head>\r\n");
      out.write("<body>\r\n");
      out.write("<h1 align=\"center\">\r\n");
      out.write("    你好<br>\r\n");
      out.write("    <a href=\"/oa/dept/list\">list</a>\r\n");
      out.write("</h1>\r\n");
      out.write("</body>\r\n");
      out.write("</html>");
```

解决中文乱码问题（在jsp文件的开头加上一句话）

```jsp
<%@page contentType="text/html; charset=UTF-8" %>
```

在jsp中编写java程序

```jsp
<%java语句放在这里，会被翻译到Servlet类的service方法内部，这是一个方法体%>

<!--HTML的注释，这个注释不专业，仍然会被翻译到java源代码当中，在jsp中不要使用这种注释-->
<%--System.out.println("I am going to torture syp!");这才是标准jsp专业，这个注释信息不会被翻译到java源文件中--%>

<%!这里面的代码会被翻译到service方法之外，会存在线程安全（修改操作）问题，所以不常用%>
```

jsp有九大内置对象，都是之前用过的

- out对象，作为输出对象，可以直接拿来在service方法里用
  - 向浏览器输出一个java对象
  - <% String name = "jack"; out.write("name:"+name);%>
  - 输出的内容中没有java代码直接写就可以，如果输出的内容中含有"java"代码，可以使用以下语法格式
    - <%= %>，注意在=后面写要输出的内容
    - 这个符号最终被翻译成out.print();，注意这里带分号
    - <%="Hello world!"%> 左右两句话是等效的 <%--out.print("Hello world!");--%>

jsp文件的扩展名可以是别的，tomcat配置文件如下，对于tomcat来讲jsp文件就只是一个普通的文本文件，最终调用的还是翻译之后的java文件，与jsp就没什么关系了

```xml
    <servlet-mapping>
        <servlet-name>jsp</servlet-name>
        <url-pattern>*.jsp</url-pattern>
        <url-pattern>*.jspx</url-pattern>
    </servlet-mapping>
```

- JSP指令

  - 指令的作用：指导jsp翻译引擎如何翻译jsp文件

  - ```jsp
    <%@page%> 
    <%@include file=""%> 包含指令，在JSP中完成静态包含（很少用）
    <%@taglib prefix=""%> 引入标签库的指令
    ```

  - 指令的语法格式

    - <%@指令名 属性名=属性值 属性名=属性值 属性名=属性值...%>

  - 关于page指令

    - ```jsp
      <%@page session="true|false" %>
      是否启用jsp内置对象session，默认值是true
      
      <%@page contentType="text/html; ISO-8859-1" %>
      设置响应的内容类型，默认值是text/html
      
      <%@page pageEncoding="UTF-8" %>
      设置字符集
      
      <%@page import="java.util.List, java.util.Enumeration" %>
      导包
      
      <%@page errorPage="/error.jsp" %>
      当前jsp出错之后跳转到error.jsp界面
      
      <%@page isErrorPage="true" %>
      启用jsp九大内置对象exception
      从而后台打印输出错误信息exception.printStackTrace();
      ```

- jsp九大内置对象

  - ```java
    jakarta.servlet.jsp.PageContext pageContext//页面作用域
    ```

  - ```java
    jakarta.servlet.http.HttpServletRequest request//请求作用域
    ```

  - ```java
    jakarta.servlet.http.HttpSession session//会话作用域
    ```

  - ```java
    jakarta.servlet.ServletContext application//应用作用域
    ```

    
    
  - ```java
    jakarta.lang.Throwable.exeception//处理异常
    ```
  
  - ```java
    jakarta.servlet.ServletConfig config//获取servlet标签里的配置信息
    ```

  - ```java
    java.lang.Object page//就是this，表示当前的servlet对象
    ```

    
    
  - ```java
    jakarta.servlet.jsp.JspWriter out//负责输出
    ```
  
  - ```java
    jakarta.servlet.http.HttpServletResponse response//负责响应
    ```
  
    

# 🤩使用session会话机制解决登录的问题

登录成功后保存一个session对象，然后进入到部门列表时读取session对象即可

```java
public class UserServlet extends HttpServlet

protected void doLogin(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
/*...*/
        if (success){
            //成功，跳转到用户列表
            //重定向机制

            //获取session对象，必须获取到session
            HttpSession session = req.getSession();
            session.setAttribute("username", username);

            resp.sendRedirect(contextPath+"/dept/list");
        } else {
            //失败
            resp.sendRedirect(contextPath+"/error.jsp");
        }
}
```

```java
public class DeptServlet extends HttpServlet
    
protected void service(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        //入口的验证，这个session不需要新建
        HttpSession session = req.getSession(false);
        if (session!=null&&session.getAttribute("username")!=null){
/*...*/
        }else {
            //跳转到登录界面，自动找到欢迎界面
            resp.sendRedirect(req.getContextPath());
        }
}
```

此外可以利用session机制设置一个安全退出按钮

```java
public class UserServlet extends HttpServlet

protected void doExit(HttpServletRequest req, HttpServletResponse resp)
        throws ServletException, IOException {
    //获取session对象，然后销毁
    HttpSession session = req.getSession(false);
    if (session != null){
        session.invalidate();
        //跳转回登录界面
        resp.sendRedirect(req.getContextPath());
    }
}
```

有了模板方法设计模式，进行这些修改非常容易。

# 🤔Cookie

- session的实现就是cookie
- cookie机制和session机制都是HTTP协议中的一部分，HTTP协议规定：任何应该cookie都是由name和value组成的，name和value都是字符串类型的，在浏览器发送请求时，会自动携带该路径（path）下的cookie数据给服务器
- 在java的servlet中对cookie提供的支持

  - jakarta.servlet.http.Cookie;
  - 把cookie数据发送到浏览器 response.addCookie(cookie);
- cookie的有效时间

  - ```java
    //设置cookie在一小时之后失效，保存在内存文件中
    cookie.setMaxAge(60*60);
    //设置Cookie的有效期<0，表示cookie不会被存储在硬盘文件中，会放在浏览器的运行内存中
    cookie.setMaxAge(-1);//和不调用setMaxAge是同一个效果
    //设置Cookie的有效期=0，表示cookie被删除，同名cookie被删除
    ```
- 关于Cookie的路径path

  - cookie.setPath("/servlet10")，表示只要浏览器的请求路径是这个路径，以及这个路径下的子路径，cookie都会被提交到服务器
- 在servlet中获取Cookie并打印输出name和value

  - ```java
    //通过request获取
            //这个方法有可能会返回一个null，即浏览器没有向服务器提交cookie
            Cookie[] cookies = req.getCookies();
    
            //如果不是null
            if (cookies != null) {
                //遍历数组
                for (Cookie cookie : cookies){
                    //获取cookie的name与value
                    String name = cookie.getName();
                    String value = cookie.getValue();
                    System.out.println(name + "=" + value);
                }
            }
    ```


# 🤗使用cookie完成oa项目的十天之内免登录

- 思路与教训：

  - 设置一个欢迎用的servlet，让这个servlet去判断处理cookie，然后跳转登录界面或列表界面

    - 用户浏览器在发出HTTP请求时，会将与请求相关的全部Cookie信息一起发送给服务器。这意味着浏览器会将存储在特定域名下的所有Cookie都发送给服务器，而不仅仅是某个特定的Cookie。

      服务器收到这些Cookie后，可以根据需要对其中的某个或多个Cookie进行解析和处理。通常情况下，服务器会根据Cookie的名称来识别和提取特定的Cookie值，以完成相应的业务逻辑，比如用户身份验证、个性化设置等。

    - 此外，如果用户在两个不同的网站上使用相同的用户名和密码，并且这两个网站使用相同的 Cookie 键来存储用户名和密码，那么就可能会导致一个网站登录成功后，在另一个网站上自动登录成功的情况。

  - 在用户服务器类里处理用户勾选10天之内免登录（这个操作要向服务器发送个键值对，用来让服务器执行发cookie的操作）后，发放装有账号密码的cookie

    - ```java
      //登录成功才考虑，是否给cookie
      String f = req.getParameter("f");
      if ("1".equals(f)){
          //一个cookie保存一对键值对
          Cookie cookie1 = new Cookie("username", username);
          Cookie cookie2 = new Cookie("password", password);//实际情况是加密存储
          //设置有效期10天
          cookie1.setMaxAge(60*60*24*10);
          cookie2.setMaxAge(60*60*24*10);
          //设置cookie的路径
          cookie1.setPath(req.getContextPath());
          cookie2.setPath(req.getContextPath());
          //把放好账号的cookie和放好密码的Cookie交给用户（设置好有效期和路径的cookie）
          resp.addCookie(cookie1);
          resp.addCookie(cookie2);
      }
      resp.sendRedirect(contextPath+"/dept/list");
      ```

  - 用户安全退出以后，cookie会直接失效

    - ```java
      //获取session对象，然后销毁（实际上也摧毁了cookie）
      HttpSession session = req.getSession(false);
      if (session != null){
          session.invalidate();
          //跳转回登录界面
          resp.sendRedirect(req.getContextPath());
      }
      ```


# 😘EL表达式

- EL表达式

  - E芯片热苏斯哦那Language（表达式语言）
  - 用来代替jsp中的java代码，从而让代码更加美观
  - EL表达式归属于jsp

- EL表达式在jsp中的作用

  - 从某个域中取数据
    - 指四大作用域
  - 将取出的数据转成字符串
    - 如果是一个java对象，会自动调用java对象的toString方法将其转换成字符串
  - 将字符串输出到浏览器
    - 和<%=%>一样，将其输出到浏览器

- 基本语法格式

  - ${表达式}

    - ```jsp
      <%@ page import="com.niu.javaweb.jsp.bean.User" %>
      <%@page contentType="text/html; ISO-8859-1"%>
      
      <%
          //创建user对象
          User user = new User();
          user.setName("jak");
          user.setPassword(12345);
          user.setAge(12);
      
          //将user放到request作用域中
          request.setAttribute("userObj", user);
      %>
      
      <%--从域中取数据，取出user对象，然后调用user对象的toString方法，转换成字符串，然后输出到浏览器--%>
      ${userObj}
      
      <%--省略掉了get。所以看起来像是直接获取了属性。实际上底层还是调用get方法，如果没有对应的方法，则会报500错误，与属性无关，这里注意命名的规范--%>
      <br>
      ${userObj.name}
      <br>
      ${userObj.password}
      <br>
      ${userObj.email}
      <br>
      
      <%--在EL表达式里不能加双引号，因为这样EL表达式会将其当作普通的字符串输出到浏览器--%>
      ${"userObj"}
      ```

  - 在没有指定范围时，EL表达式优先从小范围中取数据

    - pageContext<request<session<application

    - ```jsp
      <%--EL表达式中有四个隐含的范围，这样就可以指定范围取数据了--%>
      ${pageScope.data}<br>
      ${requestScope.data}<br>
      ${sessionScope.data}<br>
      ${applicationScope.data}<br>
      ```

    - 取数据有两种方式

      - 第一种，直接用()，正常情况

      - 第二种，用[]，名字含有特殊字符时

        - ```jsp
          <%--当名字有冲突时，可以这样取数据，这里[]没加双引号的话，会将其看作变量，如果带双引号的话，就去找对应的属性--%>
          ${requestScope["abc.def"]}
          ```

    - 从Map集合中取数据

      - ${map, key}

    - 从数组/集合中取数据

      - ${数组昵称[0]}
      - ${数组昵称[1]}
      - ${数组昵称[2]}
      - ${数组昵称[3]}

  - 是否忽略所有的EL表达式，使其解释为一个普通字符串

    - ```jsp
      <%@page isELIgnored="true" %>默认不忽略
      ```

    - 其实如果只想忽略其中某一个，直接在表达式前加个反斜杠\即可

      - ```
        \${userObj}
        ```

  - 使用EL表达式获取应用的根

    - ```jsp
      <%--
          在EL表达式当中没有request这个隐式对象（jsp的九大内置对象）
          requestScope 这个只代表“请求范围”，不等同于request对象
          在EL表达式中有一个隐式对象，pageContext
          EL表达式中的pageContext和jsp中九大内置对象pageContext是同一个对象
      --%>
      ${pageContext.request.contextPath}
      ```

- EL表达式的隐式对象

  - pageContext

    - 见上面描述

  - param

    - ```jsp
      <%--http://localhost:8080/jsp/6.jsp?username=lisi--%>
      用户名：<%=request.getParameter("username")%><br>
      用户名：${param.username}<br>
      
      <%--http://localhost:8080/jsp/6.jsp?username=lisi&aihao=hejiu&aihao=chouyan&aihao=tangtou--%>
      <%--param只会获取一维数组的第一个元素--%>
      爱好：${param.aihao}<br>
      爱好：<%=request.getParameter("aihao")%><br>
      ```

  - paraValues

    - ```jsp
      <%--等同于<%=request.getParameterValues("aihao")%>，都是一维数组--%>
      爱好：${paramValues.aihao}<br>
      
      <%--通过下标获取数组元素--%>
      爱好：${paramValues.aihao[0]}、${paramValues.aihao[1]}、${paramValues.aihao[2]}<br>
      ```

  - initPram

    - ```jsp
      <%--获取xml文件里的application配置信息--%>
      <%
          String pageSize = application.getInitParameter("pageSize");
      %>
      <%=pageSize%>
      ${initParam.pageSize}
      ```

    - ```xml
      <!--    Servlet上下文参数，被封装到ServletContext参数中了对应jsp九大内置对象application-->
          <context-param>
              <param-name>pageSize</param-name>
              <param-value>20</param-value>
          </context-param>
      ```

- EL表达式中的运算符

  - 关于EL表达式中的运算符(一般的运算还是放在java代码中)
    - 算术运算符
    - 关系运算符
      - == != > >= < <= eq
      - EL表达式==与!=实际上调用的equals方法
  
    - 逻辑运算符
      - ! && || not and or
  
    - 条件运算符
      - ? :
  
    - 取值运算符
      - [] .
  
    - empty 运算符
      - 判断是否为空，为空则为true否则false
  

# 🤩JSTL标签库

- JSTL标签库

  - Java Standard Tag Lib（Java标准的标签库），目的是让jsp中的java代码消失。实际上还是执行java代码

  - 对应的jar包：

    - jakarta.servlet.jsp.jstl-2.0.0.jar
    - jakarta.servlet.jsp.jstl-api-2.0.0.jar
    - 因为tomcat没有对应的jar包，所以要像jdbc一样，加入到lib目录下，而不是项目结构里（jsp和servlet的jar包都是为了编译通过才加入的，所以不需要放入lib下打包）

  - ```jsp
    <%--引入jstl的核心标签库--%>
    <%--prefix="这里随便起名即可，一般是c"--%>
    <%@taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
    ```

- JSTL标签库的原理

  - ```
    <%@taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
    这实际上指向了一个xxx.tld文件
    tld实际上是一个xml配置文件
    这个文件中描述了标签与java类的关系
    ```

  - 以catch部分的配置文件为例

  - ```xml
      <tag>
        <description>
            <!--标签的描述-->
            Catches any Throwable that occurs in its body and optionally
            exposes it.
        </description>
        <name><!--标签的名字-->catch</name>
        <tag-class><!--标签对应的java类-->org.apache.taglibs.standard.tag.common.core.CatchTag</tag-class>
        <body-content><!--标签体当中可以出现的内容，如果是JSP，就表示标签体中可以出现符合jsp所有语法的代码，比如EL表达式-->JSP</body-content>
        <attribute><!--标签的属性-->
            <description>
                <!--标签属性的描述-->
    Name of the exported scoped variable for the
    exception thrown from a nested action. The type of the
    scoped variable is the type of the exception thrown.
            </description>
            <name><!--标签的属性名称-->var</name>
            <required>false<!--这里表示该属性不是必须的--></required>
            <rtexprvalue>false<!--表示该属性不支持EL表达式--></rtexprvalue>
        </attribute>
      </tag>
    ```

- 常用的标签

  - c:if

    - ```jsp
      <%--没有else标签，可以用两个if代替--%>
      <%--var属性存储的是test属性的值（true/false），不是必须的--%>
      <%--scope指定var的存储域（四大作用域），不是必须的--%>
      <c:if test="${not empty param.username}" var="v" scope="request">
          <h1>欢迎你${param.username}。</h1>
      </c:if>
      ${v}
      ```

  - c:forEach

    - ```jsp
      <c:forEach var="i" begin="1" end="10" step="1">
          ${i}<br>
      </c:forEach>
      
      var属性代表的是集合中的每一个学生对象
      varStatus属性表示var的状态对象，有一个count属性
      <c:forEach items="${stuList}" var="s" varStatus="stuStatus">
      <%--    varStatus的count属性值从1开始，然后递增，用于编号--%>
          编号：${stuStatus.count},id:${s.id},name:${s.name}
      </c:forEach>
      ```

  - c:choose

    - ```jsp
      <%--就是if ,else if语句--%>
      <c:choose>
          <c:when test="${param.age < 18}">
              青少年
          </c:when>
          <c:when test="${param.age >= 18 && param.age < 35}">
              青年
          </c:when>
          <c:when test="${param.age >= 35 && param.age < 50}">
              中年
          </c:when>
          <c:otherwise>
              老年
          </c:otherwise>
      </c:choose>
      ```


# 🤩Filter过滤器

- Filter

  - Filter可以在Servlet这个目标程序执行之前或者执行之后添加代码（过滤规则，也可以理解为公共代码，比如登录验证）

- 写一个过滤器

  - ```java
    package com.niu.servlet;
    
    import jakarta.servlet.*;
    import jakarta.servlet.annotation.WebFilter;
    
    import java.io.IOException;
    
    //这种模糊匹配不要以"/"开始，这里表示所有以.do结尾的Servlet请求路径都要经过过滤器
    @WebFilter("*.do")
    public class Filter_1 implements jakarta.servlet.Filter {
        @Override
        public void init(FilterConfig filterConfig) throws ServletException {
            System.out.println("init方法执行");
        }
    
        @Override
        public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
                throws IOException, ServletException {
            //在请求的时候添加过滤规则
            System.out.println("doFilter方法开始执行");
            //执行下一个过滤器，如果下一个不是过滤器，则执行目标Servlet
            chain.doFilter(request, response);
            //在响应的时候添加过滤规则
            System.out.println("doFilter方法执行完毕");
            /*
                效果：
                doFilter方法开始执行
                AServlet执行
                doFilter方法执行完毕
             */
        }
    
        @Override
        public void destroy() {
            System.out.println("destroy方法执行");
        }
    }
    ```

  - 关于方法：

    - init方法：在Filter对象第一次被创建之后调用，并且只调用一次。
    - doFilter方法：只要用户发送一次请求，就执行一次（所以在此编辑过滤规则）。
    - destory方法：在Filter对象被销毁前调用，并且只调用一次。
    - Filte与Servlet的生命周期一致

  - 在xml文件中对Filter进行配置，类似于Servlet

    - ```xml
      <filter>
          <filter-name>filter</filter-name>
          <filter-class>com.niu.servlet.Filter_1</filter-class>
      </filter>
      <filter-mapping>
          <filter-name>filter</filter-name>
          <url-pattern>*.do</url-pattern>
      </filter-mapping>
      ```

  - 使用注解也可以（但因为责任链设计模式，一般还是在xml文件里配置）

    - ```java
      //这种模糊匹配不要以"/"开始，这里表示所有以.do结尾的Servlet请求路径都要经过过滤器
      @WebFilter("*.do")
      ```

  - 补充

    - Servlet对象默认情况下，在服务器启动时是不会新建对象的
    - Filter对象默认情况下，在服务器启动时会创建对象
    - Servlet和Filter都是单例的（单实例）。
    - Filter的优先级高于Servlet，同一个请求路径，一定是先去执行Filter再去执行Servlet

  - 关于路径的配置

    - /a.do、/b.do 这些都是精确匹配
    - /* 匹配所有路径
    - *.do 后缀匹配，注意不要以/开始
    - /dept/* 前缀匹配
    - 此外xml文件里配置路径时，Filter的执行顺序按<filter-mapping>标签优先级从上往下；注解则是按照字母排序，从A-Z
    - 过滤器的调用顺序遵循栈数据结构（先进后出）
  
  - 责任链设计模式
  
    - 先看这个程序的问题
  
      - ```java
        package com.niu.servlet;
        
        public class Test {
            public static void main(String[] args) {
                System.out.println("method begin");
                m1();
                System.out.println("method over");
            }
        
            private static void m1() {
                System.out.println("method begin");
                m2();
                System.out.println("method over");
            }
        
            private static void m2() {
                System.out.println("method begin");
                m3();
                System.out.println("method over");
            }
        
            private static void m3() {
                System.out.println("目标程序执行");
            }
            
        }
        /*
        method begin
        method begin
        method begin
        目标程序执行
        method over
        method over
        method over
         */
        ```
  
      - 这个程序在编译阶段就确定了调用顺序，想要修改调用顺序，必须对Java代码作出大量修改，这不符合开闭原则
  
    - 而过滤器在编译阶段不会确定调用顺序，因为这个调用顺序是配置在xml文件里的，是动态可调的（不用调整Java代码），这种设计模式被称作责任链设计模式。

# 😊LIstener监听器

- crtl+o 代码快速补全


- 监听器Listener与过滤器Filter一样，都是Servlet规范中的一员。

  监听器实际上是Servlet规范留给我们程序员的特殊时机。

  监听器中的方法不需要程序员手动调用，是发生某个特殊事件后被服务器调用。

- Servlet规范中提供了以下监听器：

  - Jakarta.servlet包下：

    - ServletContextListener

      - 该监听器监听的是ServletContext对象的状态

      - ```java
        package com.niu.servlet;
        
        import jakarta.servlet.ServletContextEvent;
        import jakarta.servlet.ServletContextListener;
        import jakarta.servlet.annotation.WebListener;
        
        @WebListener
        public class MyServletContextListener implements ServletContextListener {
            @Override
            public void contextInitialized(ServletContextEvent sce) {
                //这个方法是在ServletContext对象被创建时调用
                System.out.println("ServletContext对象创建了");
            }
        
            @Override
            public void contextDestroyed(ServletContextEvent sce) {
                //这个方法是在ServletContext对象被销毁时调用
                System.out.println("ServletContext对象被销毁了");
            }
        }
        ```

    - ServletContextAttributeListener

    - ServletRequestListener

    - ServletRequestAttributeListener

  - Jakarta.servlet.http包下：

    - HttpSessionListener

    - HttpSessionAttributeListener

      - 该监听器的使用需要使用@WebListener注解进行标注。

      - 该监听器监听session域中数据的变化，只要数据变化，则执行相应的方法。

    - HttpSessionBindingListener

      - 该监听器不需要使用注解进行标注

      - 假设User类实现了该监听器，那么User对象在被放入session的时候会触发bind事件，User对象从session中删除时，触发unbind事件

      - 假设Customer类没有实现该监听器，那么Customer对象放入或者删除session时，不会触发bind和unbind事件

    - HttpSessionIdListener（不常用）

      - 当session的id发生变化时，监听器中的一个方法会被调用。

    - HttpSessionActivationListener（不常用）

      - 监听session对象的钝化（session对象从内存到硬盘文件）与活化（从硬盘文件把session恢复到内存）

- 可以使用监听器（HttpSessionBindingListener）实现实时更新网站在线人数的操作

  - ```java
    package com.niu.oa.bean;
    
    import jakarta.servlet.ServletContext;
    import jakarta.servlet.http.HttpSessionBindingEvent;
    import jakarta.servlet.http.HttpSessionBindingListener;
    
    import java.util.Objects;
    
    public class User implements HttpSessionBindingListener {
        @Override
        public void valueBound(HttpSessionBindingEvent event) {
            //用户登录了
            //User类型的对象往session中存放了
            //获取ServletContext对象，对于一个webapp来说，ServletContext对象只有一个，且在服务器关闭时销毁
            //request（请求域 请求级 HttpServletRequest）<session（会话域 用户级 HttpSession）<application（应用域 项目级 ServletContext）
            ServletContext application = event.getSession().getServletContext();
            //获取在线人数
            Object onlinecount = application.getAttribute("onlinecount");
            if (onlinecount == null){
                application.setAttribute("onlinecount", 1);
            }else {
                int count = (Integer)onlinecount;
                count++;
                application.setAttribute("onlinecount", count);
            }
        }
    
        @Override
        public void valueUnbound(HttpSessionBindingEvent event) {
            //用户退出了
            //User类型的对象从session域中被删除了
            ServletContext application = event.getSession().getServletContext();
            Integer onlinecount = (Integer)application.getAttribute("onlinecount");
            onlinecount--;
            application.setAttribute("onlinecount", onlinecount);
        }
    }
    ```

  - 再在用户登录成功的情况下，创建用户对象并放到session作用域即可

    - ```java
      if (success){
                  User user = new User();
                  user.setUsername(username);
                  user.setPassword(password);
          
                  //获取session对象，必须获取到session
                  HttpSession session = req.getSession();
                  session.setAttribute("user", user);
      }
      ```

  - jsp界面作显示(注意在线人数是放在最大的作用域，也就是应用作用域)

    - ```jsp
      <h3>欢迎${sessionscope.username},在线人数${applicationScope.onlinecount}</h3>
      ```

# 😀总结一下四大作用域

这四大作用域的作用范围从小到大排列如下：

- **页面作用域（Page Scope）pageContext**：数据存储范围仅在当前的JSP页面中有效，不同页面之间的数据是隔离的。

- **请求作用域（Request Scope）HttpServletRequest **：数据存储范围仅在一次HTTP请求过程中有效。request
- **会话作用域（Session Scope）HttpSession**：数据存储范围在用户的整个会话期间有效，跨多个请求。session
- **应用作用域（Application Scope）ServletContext**：数据存储范围在整个Web应用程序中有效，对所有用户和会话可见。application

# 😗关于MVC设计模式与前后端分离

- 传统的 MVC 架构中，例如使用 Servlet + JSP，通常并没有做到严格的前后端分离。在这种架构下，Java 代码负责处理请求、控制逻辑、数据处理等，而 JSP 页面负责呈现 HTML 内容。因此，即使在 MVC 架构中，Java 代码与前端的 HTML 页面仍然耦合在一起。
- SSM（Spring + Spring MVC + MyBatis）框架结合确实在一定程度上没有严格实现前后端分离。虽然 SSM 框架将应用分为了业务逻辑层（Service）、数据访问层（DAO）、控制器层（Controller）、视图层（JSP 或者 Thymeleaf），但前端视图通常是直接由服务器端渲染并生成，与后端代码耦合较为紧密。
- 前后端分离的概念是为了更好地实现前端与后端的职责分离，让前端负责页面呈现和用户交互，后端则负责数据处理和业务逻辑。在前后端分离的架构中，通常采用前端框架（如 Vue.js、React、Angular 等）来构建用户界面，而后端提供 RESTful API 或 GraphQL 接口来处理数据和业务逻辑。

