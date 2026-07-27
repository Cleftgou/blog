---
title: Servlet 源码分析
published: 2024-04-25
description: 深入分析 HttpServlet 的源码实现，从模板方法设计模式到 HTTP 协议处理，理解 Servlet 规范的底层工作原理。
tags: [Servlet, Java, 源码分析, HTTP, 设计模式]
category: Java
image: /images/covers/cover_07.jpg
draft: false
---

# 第一步 从一个简单的基于servlet的应用开始分析

### 构建一个普通的servlet应用有两种情况

- ##### 第一种是继承HttpServlet，重写service方法

  - 运用了模板方法设计模式

```java
package com.niu.oa.web.action;

import com.niu.oa.bean.User;
import com.niu.oa.utils.DBUtil;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@WebServlet({"/user/login", "/user/exit"})
public class UserServlet extends HttpServlet {
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        req.setCharacterEncoding("UTF-8");
```

- ##### 第二种是继承HttpServlet，重写doGet和doPost方法

  - 更符合模板方法设计模式的规范，两个方法互相调用，由 protected void service 方法统一调度

# 第二步 HttpServlet源码深度分析

### Servlet生命周期回顾

- 用户第一次请求：
  - Tomcat服务器通过反射机制，调用无参数构造方法创建Servlet对象
  - Tomcat调用 `init` 方法完成初始化
  - Tomcat调用 `service` 方法处理请求
- 后续请求：
  - Tomcat只调用 `service` 方法
- 服务器关闭：
  - Tomcat调用 `destroy` 方法，然后销毁Servlet对象

### 源码调用链

```
WelcomeServlet extends HttpServlet
    └── HttpServlet extends GenericServlet
        ├── GenericServlet implements Servlet, ServletConfig, Serializable
        │   ├── init(ServletConfig config) → 保存config → 调用无参 init()
        │   └── init() → 空方法（NOOP），给子类重写
        └── service(ServletRequest req, ServletResponse res)
            └── 向下转型为 HttpServletRequest / HttpServletResponse
            └── 调用 service(HttpServletRequest, HttpServletResponse) ← 模板方法
                └── 根据 method (GET/POST/PUT/DELETE...) 分发
                    ├── doGet() → 默认 405
                    ├── doPost() → 默认 405
                    ├── doPut()
                    ├── doDelete()
                    └── ...
```

### HttpServlet 的 service 方法（核心的模板方法）

```java
protected void service(HttpServletRequest req, HttpServletResponse resp) 
        throws ServletException, IOException {
    String method = req.getMethod();

    if (method.equals(METHOD_GET)) {
        long lastModified = getLastModified(req);
        if (lastModified == -1) {
            doGet(req, resp);
        } else {
            // 支持 If-Modified-Since 缓存机制
            long ifModifiedSince = req.getDateHeader(HEADER_IFMODSINCE);
            if (ifModifiedSince < (lastModified / 1000 * 1000)) {
                maybeSetLastModified(resp, lastModified);
                doGet(req, resp);
            } else {
                resp.setStatus(HttpServletResponse.SC_NOT_MODIFIED);
            }
        }
    } else if (method.equals(METHOD_HEAD)) {
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
        resp.sendError(HttpServletResponse.SC_NOT_IMPLEMENTED, errMsg);
    }
}
```

### 默认的 doGet 和 doPost 返回 405

```java
protected void doGet(HttpServletRequest req, HttpServletResponse resp) 
        throws ServletException, IOException {
    String msg = lStrings.getString("http.method_get_not_supported");
    sendMethodNotAllowed(req, resp, msg);
}

protected void doPost(HttpServletRequest req, HttpServletResponse resp) 
        throws ServletException, IOException {
    String msg = lStrings.getString("http.method_post_not_supported");
    sendMethodNotAllowed(req, resp, msg);
}
```

**关键理解**：
- 如果前端发 GET 请求，后端就要重写 `doGet` 方法
- 如果前端发 POST 请求，后端就要重写 `doPost` 方法
- 如果不重写，就会收到 HttpServlet 的 405 错误（请求方式不支持）

# 核心总结

1. **模板方法设计模式**是 HttpServlet 的精髓：`service()` 方法定义了请求分发的骨架，具体的 `doGet`/`doPost` 等延迟到子类实现
2. `GenericServlet` 的 `init(ServletConfig)` 方法中设计了一个巧妙的两步初始化：保存 config 引用 → 调用无参 init() 供子类重写
3. HttpServlet 还内置了 HTTP 缓存机制（`If-Modified-Since` 头处理）
4. Servlet 对象是单例的，多线程并发访问 service 方法，因此要注意线程安全问题
