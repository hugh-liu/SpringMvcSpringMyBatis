# Spring+SpringMVC+Mybatis+MySql项目
***
## 前  言
本项目是用maven管理创建的一个简单的SpringMvc+Spring+MyBatis的web框架，里面用到些常用的技术，能够快速的搭建一套web框架，如说明的不好还望谅解。
***
## 项目介绍
1、项目管理：Maven  
2、框架：SpringMVC+Spring+MyBatis  
3、数据库：mysql  
4、开发工具：eclipse  
5、JDK版本：1.8.0_102  
6、服务器：tomcat7.0.57  
7、Java命名规则：驼峰命名法，方法名和属性首字母小写、类首字母大写  
8、数据命名规则：全部小写用下划线连接如：create_date  
***
## 目录
* [第一章、创建Maven项目](#第一章maven项目)
* [第二章、整合springmvc、spring、mybatis框架](#第二章整合springmvc_spring_mybatis框架)
* [第三章、前后台交互DEMO](#第三章前后台交互demo)
* [第四章、登录验证DEMO](#第四章登录验证demo)
* [第五章、登录拦截器DEMO](#第五章登录拦截器demo)
* [第六章、使用MyBatis逆向工程生成代码](#第六章使用mybatis逆向工程生成代码)
* [第七章、利用AOP、注解实现日志管理](#第七章利用aop、注解实现日志管理)
***
***
***
### 第一章、maven项目
#### 1、创建Maven项目  
![1](/img/1.png)  
#### 2、选择工作中心  
![2](/img/2.png)  
#### 3、选择Maven项目原型-WEB项目  
![3](/img/3.png)  
#### 4、填写项目Group Id（一般为域名反写）、Artifact Id、Package（可不填会自动生成）  
![4](/img/4.png)  
#### 5、创建完成项目目录  
![5](/img/5.png)  
#### 6、添加源文件夹  
Maven规定，必须创建以下几个Source Folder：  
src/main/resources  
src/main/java（如果创建时报错说已经存在，它确实存在了只是你看不到，别急后面会显示出来）  
src/test/resources  
src/test/java（如果创建时报错说已经存在，它确实存在了只是你看不到，别急后面会显示出来）  
 ![6](/img/6.png)  
#### 7、选中项目右击选择Build Path，配置Build Path，双击修改，分别修改为：  
src/main/resources		对应　　target/classes  
src/main/java			对应　　target/classes  
src/test/resources		对应　　target/test-classes  
src/test/java			对应　　target/test-classes  
![7](/img/7.png)  
#### 8、修改Libraries  
![8](/img/8.png)  
![9](/img/9.png)  
![10](/img/10.png)  
然后再看目录那两个java文件夹就出来了  
![11](/img/11.png)  
#### 9、修改Web Module版本和java版本-选择项目右键Properties，选择 Project Facets  
Dynamic Web Module版本修改为3.0  
Java版本修改1.8（和前面jdk版面一样就行了）  
![12](/img/12.png)  
如果修改版本后出现提示Further configuration available…则点击修改ContentDirectory：src/main/webapp；  
如果修改Dynamic Web Module版本报错则可以修改文件：  
![13](/img/13.png)  
![14](/img/14.png)  
然后刷新下项目他就改成3.0了  
#### 10、配置tomcat，如果已经创建了就不需要新建了直接选中Apply就行了  
![15](/img/15.png)  
![16](/img/16.png)  
选择tomcat路径  
![17](/img/17.png)  
![18](/img/18.png)  
#### 11、修改web.xml文件  
![19](/img/19.png)  
修改为：  
```
 <?xml version="1.0" encoding="UTF-8"?>  
 <web-app xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"  
     xmlns="http://java.sun.com/xml/ns/javaee"  
     xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_3_0.xsd"  
     id="WebApp_ID" version="3.0">  
     <display-name>test-hd-</display-name>  
     <welcome-file-list>  
         <welcome-file>index.jsp</welcome-file>  
     </welcome-file-list>  
 </web-app>  
```
#### 12、设置部署程序集（Web Deployment Assembly）-选择项目右键Properties，选择Deployment Assembly  
我们要删除test的两项，因为test是测试使用，并不需要部署  
然后将Maven的jar包发布到lib下  
![20](/img/20.png)  
#### 13、项目创建完成，启动项目  
![21](/img/21.png)  
***
***
### 第二章整合springmvc_spring_mybatis框架
#### 1、选择pom.xml文件导入需要的架包，如下：
```
    <!-- Spring包版本号 -->
    <properties>
		<spring.version>4.1.9.RELEASE</spring.version>
	</properties>
	
	<dependencies>
		<!-- 测试包 -->
		<dependency>
			<groupId>junit</groupId>
			<artifactId>junit</artifactId>
			<version>3.8.1</version>
			<scope>test</scope>
		</dependency>
    
		<!-- 通用包 -->
		<dependency>
			<groupId>org.apache.commons</groupId>
			<artifactId>commons-lang3</artifactId>
			<version>3.4</version>
		</dependency>

		<dependency>
			<groupId>commons-io</groupId>
			<artifactId>commons-io</artifactId>
			<version>2.4</version>
		</dependency>
		
		<!-- poi类库 -->
		<dependency>
            <groupId>org.apache.poi</groupId>
            <artifactId>poi</artifactId>
            <version>3.13</version>
        </dependency>
        <dependency>
            <groupId>org.apache.poi</groupId>
            <artifactId>poi-ooxml</artifactId>
            <version>3.13</version>
        </dependency>
        
        <!-- mysql驱动包 -->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>5.1.18</version>
        </dependency>
        
        <!-- spring包 -->
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-aop</artifactId>
            <version>${spring.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-aspects</artifactId>
            <version>${spring.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-beans</artifactId>
            <version>${spring.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-context</artifactId>
            <version>${spring.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-context-support</artifactId>
            <version>${spring.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-core</artifactId>
            <version>${spring.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-expression</artifactId>
            <version>${spring.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-instrument</artifactId>
            <version>${spring.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-jdbc</artifactId>
            <version>${spring.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-jms</artifactId>
            <version>${spring.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-messaging</artifactId>
            <version>${spring.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-orm</artifactId>
            <version>${spring.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-oxm</artifactId>
            <version>${spring.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-test</artifactId>
            <version>${spring.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-tx</artifactId>
            <version>${spring.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-web</artifactId>
            <version>${spring.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-webmvc</artifactId>
            <version>${spring.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-webmvc-portlet</artifactId>
            <version>${spring.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-websocket</artifactId>
            <version>${spring.version}</version>
        </dependency>
        
        <!-- spring依赖包 -->
        <dependency>
            <groupId>aopalliance</groupId>
            <artifactId>aopalliance</artifactId>
            <version>1.0</version>
        </dependency>
        <dependency>
            <groupId>cglib</groupId>
            <artifactId>cglib</artifactId>
            <version>3.0</version>
        </dependency>
        <dependency>
            <groupId>aspectj</groupId>
            <artifactId>aspectjweaver</artifactId>
            <version>1.5.4</version>
        </dependency>
        <dependency>
            <groupId>javax.servlet</groupId>
            <artifactId>jstl</artifactId>
            <version>1.2</version>
        </dependency>
 
        <!-- 日志 -->
        <dependency>
            <groupId>log4j</groupId>
            <artifactId>log4j</artifactId>
            <version>1.2.17</version>
        </dependency>
        
        <!-- commons -->
        <dependency>
            <groupId>commons-fileupload</groupId>
            <artifactId>commons-fileupload</artifactId>
            <version>1.3</version>
        </dependency>
        <dependency>
            <groupId>commons-httpclient</groupId>
            <artifactId>commons-httpclient</artifactId>
            <version>3.0</version>
        </dependency>
        
        <!-- mybatis包 -->
        <dependency>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis</artifactId>
            <version>3.3.0</version>
        </dependency>
        <dependency>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis-spring</artifactId>
            <version>1.2.3</version>
        </dependency>
        
        <!-- c3p0 -->
        <dependency>
            <groupId>c3p0</groupId>
            <artifactId>c3p0</artifactId>
            <version>0.9.1.2</version>
        </dependency>
        
        <!-- 转换拼音 -->
        <dependency>
            <groupId>com.belerweb</groupId>
            <artifactId>pinyin4j</artifactId>
            <version>2.5.0</version>
        </dependency>
        
        <!-- JSON -->
        <dependency>
            <groupId>net.sf.json-lib</groupId>
            <artifactId>json-lib</artifactId>
            <version>2.4</version>
            <classifier>jdk15</classifier>
        </dependency>
        
        <!-- json传递 -->
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-annotations</artifactId>
            <version>2.9.0</version>
        </dependency>
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-core</artifactId>
            <version>2.9.0</version>
        </dependency>
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
            <version>2.9.0</version>
        </dependency>
</dependencies>
```
#### 2、导完包后再重新启动下项目，如果报错说找不到项目或jar，说明jar包下载的时候没下载好需要重新下载，如果一直下载不行可以用阿里云的架包中央仓  
https://bbs.aliyun.com/read/299023.html   阿里云中央仓如何配置  
http://www.jb51.net/softjc/454464.html	如何设置中央仓下载路径  
如果不是用的eclipse自带的maven，可以在maven的settings.xml 文件里配置mirrors的子节点，添加如下mirror ：  
```
<mirror>
        <id>nexus-aliyun</id>
        <mirrorOf>*</mirrorOf>
        <name>Nexus aliyun</name>
        <url>http://maven.aliyun.com/nexus/content/groups/public</url>
</mirror>
```
#### 3、创建包
![22](/img/22.png)  

| 包名 | 说明 | 作用 |
| :------------ | :--------------- | :----- |
| dao | 数据库持久层（接口） | 对数据进行增删改查的操作，这里我们就不需要再建dao.impl包了，因为我们持久层的框架用的是mybatis，所以可以直接在配置文件中实现接口的每个方法。 |
| entity | 实体类 | 与数据库的表相对应，封装dao层取出来的数据，一般只在dao层与service层之间传输 |
| service | 业务逻辑层（接口） | 写业务逻辑的接口 |
| service.impl | 业务逻辑层（实现） | 业务逻辑接口的实现，所有业务逻辑处理都应该在service层，同时事务管理一般也都是在service层 |
| controller | 控制器层 | SpringMVC就是用在这前后台交互的层，相当于struts中的action或者servlet |
| vo | 视图对象 | 因为在很多时候entity对象是满足不了页面所需要的信息，这时候就需要vo对象，把entity跟vo区分开是很有必要的 |
| mapper | 持久层的sql映射 | 存放dao中每个方法对应的sql，在这里配置了就无需写daoimpl层了 |
| Spring | 配置文件 | 这是存放spring相关的配置文件，这里分为三层dao、service、web三层 |
| 文件名 |  | 说明 |
| Java |  | 存放java代码 |
| Resources |  | 存放资源文件 |
| Webapp |  | 存放静态资源 |
| WEB-INF |  | 这个文件夹内的资源外部无法访问的，只能通过后台去访问，可以把页面放在这里更安全 |
| Test |  | 测试分支，测试用到的 |

#### 4、创建spring配置文件，为了更直观清晰分为三个文件，分别是web、service、dao
##### 4.1、在spring文件夹下创建spring-web.xml文件
```
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
	xmlns:mvc="http://www.springframework.org/schema/mvc" 
	xmlns:context="http://www.springframework.org/schema/context"
	xsi:schemaLocation="http://www.springframework.org/schema/mvc  
        http://www.springframework.org/schema/mvc/spring-mvc-3.0.xsd
        http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context
        http://www.springframework.org/schema/context/spring-context.xsd"> 
        
	<!-- 启动注解模式 -->
	<mvc:annotation-driven />
	
	<!-- 静态资源设置 -->
	<mvc:default-servlet-handler/>

	<!-- 扫描Controlle控制器类 -->
	<context:component-scan base-package="com.hugh.controller"/>
	
	<!-- 视图渲染器 配置 -->
	<bean id="jspViewResolver" class="org.springframework.web.servlet.view.InternalResourceViewResolver">
		<property name="viewClass" value="org.springframework.web.servlet.view.JstlView" />
		<!-- 前缀 指定资源存放的位置 -->
		<property name="prefix" value="/WEB-INF/webPage/" />
		<!-- 后缀 指定资源的类型 -->
		<property name="suffix" value=".jsp" />
	</bean>
	
	<!-- JSON数据转换器 -->
	<bean id="stringConverter"
		class="org.springframework.http.converter.StringHttpMessageConverter">
		<property name="supportedMediaTypes">
			<list>
				<value>text/plain;charset=UTF-8</value>
			</list>
		</property>
	</bean>
	<bean id="jsonConverter"
		class="org.springframework.http.converter.json.MappingJackson2HttpMessageConverter"></bean>
	<bean
		class="org.springframework.web.servlet.mvc.annotation.AnnotationMethodHandlerAdapter">
		<property name="messageConverters">
			<list>
				<ref bean="stringConverter" />
				<ref bean="jsonConverter" />
			</list>
		</property>
	</bean>
	
	<!-- SpringMVC上传文件时，需要配置MultipartResolver处理器 -->
	<bean id="multipartResolver" class="org.springframework.web.multipart.commons.CommonsMultipartResolver">
		<property name="defaultEncoding" value="UTF-8" />
		<!-- 指定所上传文件的总大小不能超过200KB。注意maxUploadSize属性的限制不是针对单个文件，而是所有文件的容量之和 -->
		<property name="maxUploadSize" value="-1" />
	</bean>
	<!-- SpringMVC在超出上传文件限制时，会抛出org.springframework.web.multipart.MaxUploadSizeExceededException -->
	<!-- 该异常是SpringMVC在检查上传的文件信息时抛出来的，而且此时还没有进入到Controller方法中 -->
	<bean id="exceptionResolver" class="org.springframework.web.servlet.handler.SimpleMappingExceptionResolver">
		<property name="exceptionMappings">
			<props>
				<!-- 遇到MaxUploadSizeExceededException异常时，自动跳转到XXX页面 -->
				<prop key="org.springframework.web.multipart.MaxUploadSizeExceededException">login.html</prop>
			</props>
		</property>
	</bean>

</beans>
```
##### 4.2、在spring文件夹下创建spring-service.xml文件
```
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
	xmlns:context="http://www.springframework.org/schema/context"
	xmlns:aop="http://www.springframework.org/schema/aop"
	xmlns:tx="http://www.springframework.org/schema/tx"
	xsi:schemaLocation="http://www.springframework.org/schema/beans
	http://www.springframework.org/schema/beans/spring-beans.xsd
	http://www.springframework.org/schema/context
	http://www.springframework.org/schema/context/spring-context.xsd
	http://www.springframework.org/schema/aop
    http://www.springframework.org/schema/aop/spring-aop.xsd
	http://www.springframework.org/schema/tx
	http://www.springframework.org/schema/tx/spring-tx.xsd">
	<!-- 扫描service包下所有使用注解的类 -->
	<context:component-scan base-package="com.hugh.service" />

	<!-- 配置事务管理器 -->
	<bean id="transactionManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
		<!-- 注入数据库连接池 -->
		<property name="dataSource" ref="dataSource" />
	</bean>
	
	<!-- 通知 -->
	<!-- transaction-manager 表示把这通知给谁 transactionManager就是上面的事务管理器的id -->
	<tx:advice id="txAdvice" transaction-manager="transactionManager">
		<tx:attributes>
			<!-- 传播行为 -->
			<tx:method name="save*" propagation="REQUIRED" />
			<tx:method name="delete*" propagation="REQUIRED" />
			<tx:method name="insert*" propagation="REQUIRED" />
			<tx:method name="update*" propagation="REQUIRED" />
			<tx:method name="find*" propagation="SUPPORTS" read-only="true" />
			<tx:method name="get*" propagation="SUPPORTS" read-only="true" />
			<tx:method name="select*" propagation="SUPPORTS" read-only="true" />
		</tx:attributes>
	</tx:advice>
	
	<!-- aop 通知是有aop来调用 -->
	<aop:config>
		<!-- execution(* com.hugh.service.impl.*.*(..)) 表示要切com.hugh.service.impl这个包下面的所有类的所有方法 -->
		<aop:advisor advice-ref="txAdvice"
			pointcut="execution(* com.hugh.service.impl.*.*(..))" />
	</aop:config>

	<!-- 配置基于注解的声明式事务 -->
	<!-- <tx:annotation-driven transaction-manager="transactionManager" /> -->
</beans>
```
##### 4.3、在spring文件夹下创建spring-dao.xml文件
```
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:context="http://www.springframework.org/schema/context"
	xsi:schemaLocation="http://www.springframework.org/schema/beans
	http://www.springframework.org/schema/beans/spring-beans.xsd
	http://www.springframework.org/schema/context
	http://www.springframework.org/schema/context/spring-context.xsd">
	
	<!-- 配置扫描数据库信息配置文件 jdbc.properties -->
	<context:property-placeholder location="classpath:jdbc.properties" />

	<!-- 配置c3p0 数据源 -->
	<bean id="dataSource" class="com.mchange.v2.c3p0.ComboPooledDataSource"
		destroy-method="close">
		<!-- 数据库驱动名称 -->
		<property name="driverClass" value="${jdbc.driverClassName}"></property>
		<!-- 数据库连接路径 -->
		<property name="jdbcUrl" value="${jdbc.url}"></property>
		<!-- 数据库登录名 -->
		<property name="user" value="${jdbc.username}"></property>
		<!-- 数据库登录密码 -->
		<property name="password" value="${jdbc.password}"></property>
		<!-- 初始化时获取的连接数，取值应在minPoolSize与maxPoolSize之间。Default: 3 -->
		<property name="initialPoolSize" value="${jdbc.initialPoolSize}"></property>
		<!-- 连接池中保留的最小连接数 -->
		<property name="minPoolSize" value="${jdbc.minPoolSize}"></property>
		<!-- 连接池中保留的最大连接数,Default: 15 -->
		<property name="maxPoolSize" value="${jdbc.maxPoolSize}"></property>
		<!-- 最大空闲时间,60秒内未使用则连接被丢弃。若为0则永不丢弃。Default: 0 -->
		<property name="maxIdleTime" value="${jdbc.maxIdleTime}"></property>
		<!-- 当连接池中的连接耗尽的时候c3p0一次同时获取的连接数。Default: 3 -->
		<property name="acquireIncrement" value="${jdbc.acquireIncrement}"></property>
		<!-- 每60秒检查所有连接池中的空闲连接。Default: 0 -->
		<property name="idleConnectionTestPeriod" value="${jdbc.idleConnectionTestPeriod}"></property>
		<!-- 定义在从数据库获取新连接失败后重复尝试的次数。Default: 30  -->
		<property name="acquireRetryAttempts" value="${jdbc.acquireRetryAttempts}"></property>
		<!-- 获取连接失败将会引起所有等待连接池来获取连接的线程抛出异常。但是数据源仍有效保留，并在下次调用getConnection()的时候继续尝试获取连接。如果设为true，那么在尝试获取连接失败后该数据源将申明已断开并永久关闭。Default: false -->
		<property name="breakAfterAcquireFailure" value="${jdbc.breakAfterAcquireFailure}"></property>
		<!-- JDBC的标准参数，用以控制数据源内加载的PreparedStatements数量。但由于预缓存的statements属于单个connection而不是整个连接池。所以设置这个参数需要考虑到多方面的因素。如果maxStatements与maxStatementsPerConnection均为0，则缓存被关闭。Default: 0 -->
		<property name="maxStatements" value="${jdbc.maxStatements}"></property>
		<!-- 因性能消耗大请只在需要的时候使用它。如果设为true那么在每个connection提交的时候都将校验其有效性。建议使用idleConnectionTestPeriod或automaticTestTable等方法来提升连接测试的性能。Default: false -->
		<property name="testConnectionOnCheckout" value="${jdbc.testConnectionOnCheckout}"></property>
	</bean>

	<!-- 配置Mybatis 的SqlSessionFactory 工厂 -->
	<bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
		<property name="dataSource" ref="dataSource" />
		<!-- 加载mybatis配置文件 -->
		<property name="configLocation" value="classpath:mybatis.cfg.xml" />
		<!-- 扫描entity包 使用别名 -->
		<property name="typeAliasesPackage" value="com.hugh.entity" />
		<!-- 扫描sql配置文件:mapper需要的xml文件 -->
		<property name="mapperLocations" value="classpath:mapper/*.xml" />
		<!-- 多个设置sql语句映射文件 -->
		<!-- <property name="mapperLocations">
			<list>
				表示在com/card/dao/impl目录下的任意以-Mapper.xml结尾所有文件
				<value>classpath:com/card/dao/impl/*Mapper.xml</value>
			</list>
		</property> -->
	</bean>

	<!-- 配置扫描Dao接口包，动态实现Dao接口，注入到spring容器中 -->
	<bean class="org.mybatis.spring.mapper.MapperScannerConfigurer">
		<!-- 注入sqlSessionFactory -->
		<property name="sqlSessionFactoryBeanName" value="sqlSessionFactory" />
		<!-- 给出需要扫描Dao接口包 -->
		<property name="basePackage" value="com.hugh.dao" />
	</bean>
</beans> 
```
##### 4.4、在src/main/resources文件夹下创建jdbc.properties文件
```
jdbc.driverClassName=com.mysql.jdbc.Driver
jdbc.url=jdbc:mysql://localhost:3306/hugh?useUnicode=true&characterEncoding=UTF-8&allowMultiQueries=true
jdbc.username=root
jdbc.password=tiger
jdbc.initialPoolSize=10
jdbc.minPoolSize=5
jdbc.maxPoolSize=30
jdbc.maxIdleTime=60
jdbc.acquireIncrement=5
jdbc.idleConnectionTestPeriod=60
jdbc.acquireRetryAttempts=20
jdbc.breakAfterAcquireFailure=false
jdbc.maxStatements=0
jdbc.testConnectionOnCheckout=false 
```
##### 4.5、在resources文件夹下创建mybatis.cfg.xml文件
```
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration PUBLIC "-//mybatis.org//DTD Config 3.0//EN" "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
	<!-- 配置全局属性 -->
	<settings>
		<!-- 使用jdbc的getGeneratedKeys获取数据库自增主键值 -->
		<setting name="useGeneratedKeys" value="true" />

		<!-- 使用列别名替换列名 默认:true -->
		<setting name="useColumnLabel" value="true" />

		<!-- 开启驼峰命名转换:Table{create_time} -> Entity{createTime} -->
		<setting name="mapUnderscoreToCamelCase" value="true" />

<!-- 让sql语句在控制台输出 -->
		<setting name="logImpl" value="STDOUT_LOGGING"/>
	</settings>
</configuration> 
```
##### 4.6、配置web.xml文件
```
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns="http://java.sun.com/xml/ns/javaee"
    xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_3_0.xsd"
    id="WebApp_ID" version="3.0">
    <display-name>test-hd-</display-name>
    <welcome-file-list>
        <welcome-file>index.jsp</welcome-file>
    </welcome-file-list>
    
	<!-- 字符过滤器 -->
	<filter>
		<filter-name>characterEncodingFilter</filter-name>
		<filter-class>org.springframework.web.filter.CharacterEncodingFilter</filter-class>
		<init-param>
			<param-name>encoding</param-name>
			<param-value>UTF-8</param-value>
		</init-param>
		<init-param> 
			<param-name>forceEncoding</param-name>
			<param-value>true</param-value>
		</init-param>
	</filter>
	<filter-mapping>
		<filter-name>characterEncodingFilter</filter-name>
		<url-pattern>/*</url-pattern>
	</filter-mapping>
    
    <!-- 如果是用mvn命令生成的xml，需要修改servlet版本为3.1 -->
	<!-- 配置DispatcherServlet -->
	<servlet>
		<servlet-name>dispatcherServlet</servlet-name>
		<servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
		<!-- 配置springMVC需要加载的配置文件
			spring-dao.xml,spring-service.xml,spring-web.xml
			Mybatis - > spring -> springmvc
		 -->
		<init-param>
			<param-name>contextConfigLocation</param-name>
			<param-value>classpath:spring/spring-*.xml</param-value>
		</init-param>
	</servlet>
	<servlet-mapping>
		<servlet-name>dispatcherServlet</servlet-name>
		<!-- 默认匹配所有的请求 -->
		<url-pattern>/</url-pattern>
	</servlet-mapping>
	
</web-app>
```
##### 4.7、修改index.jsp文件
```
<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    <title>My JSP 'index.jsp' starting page</title>
	<meta http-equiv="pragma" content="no-cache">
	<meta http-equiv="cache-control" content="no-cache">
	<meta http-equiv="expires" content="0">    
	<meta http-equiv="keywords" content="keyword1,keyword2,keyword3">
	<meta http-equiv="description" content="This is my page">
	<!--
	<link rel="stylesheet" type="text/css" href="styles.css">
	-->
  </head>
  
  <body>
	测试
  </body>
</html>
```
好了，我们再启动下服务看到如下页面，启动没报错就证明你配置正确
![23](/img/23.png) 
***
***
### 第三章前后台交互demo
#### 1、在WEB-INF下添加webPage文件夹存放jsp文件，该目录下必须通过后台访问
#### 2、在webPage文件下添加login.jsp文件
```
<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    <title>Hugh-User Login</title>
	<meta http-equiv="pragma" content="no-cache">
	<meta http-equiv="cache-control" content="no-cache">
	<meta http-equiv="expires" content="0">    
	<meta http-equiv="keywords" content="keyword1,keyword2,keyword3">
	<meta http-equiv="description" content="This is my page">
	<!--
	<link rel="stylesheet" type="text/css" href="styles.css">
	-->
  </head>
  
  <body>
	<form action=""  method="">
		<input type="text" name="name" value=""/>
		<input type="password" name="password" value=""/>
		<input type="submit" value="提交" />
	</form>
  </body>
</html>
```
#### 3、写一个对应的controller，在controller包下添加AccountController.java文件，由于我们页面是写在web-inf目录下，所以在controller里写一个获取页面的方法
```
package com.hugh.controller;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

/**
 * 
 * 控制器-登录
 * 
 * @author jinhui
 *
 */
@Controller
@RequestMapping(value = "/account")
public class AccountController {

	/**
	 * 获取登录页面
	 * 
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping(value = "/login", method = { RequestMethod.GET })
	public String login(HttpServletRequest request, HttpServletResponse response) {
		return "login";
	}
}
```
#### 4、运行项目输入登录路径看是否运行正常
![24](/img/24.png) 
***
***
### 第四章登录验证demo
#### 1、打开mysql数据创建数据库hugh，表名account
```
/*===========================================*/
/*新建数据库命名为：hugh
/*===========================================*/
CREATE DATABASE hugh;

USE hugh;

/*==============================================================*/
/* Table: account	账户
/*==============================================================*/
CREATE TABLE account
(
    NAME	    VARCHAR(20) PRIMARY KEY NOT NULL COMMENT '用户名，主键',
    PASSWORD	    VARCHAR(20) NOT NULL COMMENT '用户密码',
    create_date      DATETIME NOT NULL COMMENT '创建时间',
    update_date	    DATETIME NOT NULL COMMENT '修改时间'
 );
INSERT INTO account(NAME,PASSWORD,create_date,update_date) VALUE('admin','admin',NOW(),NOW());
SELECT * FROM ACCOUNT;
```
#### 2、在com.hugh.entity包下创建BaseEntity实体类-基类
```
package com.hugh.entity;

import java.util.Date;

/**
 * 实体类-基类
 * 
 * @author jinhui
 * 
 */
public class BaseEntity {
	private Date createDate;// 创建时间
	private Date updateDate;// 修改时间

	public BaseEntity() {
	}

	public Date getCreateDate() {
		return createDate;
	}

	public void setCreateDate(Date createDate) {
		this.createDate = createDate;
	}

	public Date getUpdateDate() {
		return updateDate;
	}

	public void setUpdateDate(Date updateDate) {
		this.updateDate = updateDate;
	}

}
```
#### 3、在com.hugh.entity包下创建Account实体类-用户
```
package com.hugh.entity;

/**
 * 实体类-用户
 * 
 * @author jinhui
 *
 */
public class Account extends BaseEntity {

	private String name;// 用户名
	private String password;// 密码

	public Account() {}
	
	public Account(String name, String password) {
		this.setName(name);
		this.setPassword(password);
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

}
```
#### 4、在com.hugh.vo包下创建登录VO对象LoginVO类
```
package com.hugh.vo;

/**
 * VO层-登录
 * 
 * @author jinhui
 *
 */
public class LoginVO {
	private String name;// 账号
	private String password;// 密码
	
	public LoginVO() {}
	
	public LoginVO(String name, String password) {
		this.name = name;
		this.password = password;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

}
```
#### 5、在com.hugh.dao包下创建AccountDao接口类
```
package com.hugh.dao;

import com.hugh.entity.Account;

/**
 * 持久层-用户
 * 
 * @author jinhui
 *
 */
public interface AccountDao {
	/**
	 * 登录验证
	 * 
	 * @param account 用户实体类
	 * @return 用户实体类
	 */
	Account findAccount(Account account);
}
```
#### 6、在mapper目录下创建AccountMapper.xml
```
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.hugh.dao.AccountDao">
	<!-- 登录验证 -->
	<select id="findAccount" parameterType="Account" resultType="Account">
		SELECT * FROM ACCOUNT WHERE NAME = #{name} AND PASSWORD = #{password}
	</select>
</mapper>
```
#### 7、在com.hugh.service包下创建AccountService接口类
```
package com.hugh.service;

import com.hugh.vo.LoginVO;

/**
 * 业务层接口类-用户
 * 
 * @author jinhui
 *
 */
public interface AccountService {

	/**
	 * 登录验证
	 * 
	 * @param loginVO 登录VO
	 * @return 是否成功
	 */
	public boolean findAccount(LoginVO loginVO);

}
```
#### 8、在com.hugh.service.impl包下创建AccountService接口的实现类AccountServiceImpl类
```
package com.hugh.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hugh.dao.AccountDao;
import com.hugh.entity.Account;
import com.hugh.service.AccountService;
import com.hugh.vo.LoginVO;

/**
 * 业务层实现类-用户
 * 
 * @author jinhui
 *
 */
@Service
public class AccountServiceImpl implements AccountService {

	@Autowired
	private AccountDao accountDao;

	@Override
	public boolean findAccount(LoginVO loginVO) {
		Account account = new Account(loginVO.getName(), loginVO.getPassword());
		account = accountDao.findAccount(account);
		if (account == null) {
			return false;
		}
		return true;
	}

}
```
#### 9、在com.hugh.controller包AccountController控制器中引用：
```
@Resource
private AccountService accountService;
```
添加方法：
```
/**
 * 登录验证
 * @param request
 * @param response
 * @param loginVO 登录VO
 * @return
 */
@RequestMapping(value = "/login", method = { RequestMethod.POST })
public String login(HttpServletRequest request, HttpServletResponse response, LoginVO loginVO) {
	if(accountService.findAccount(loginVO)) {
		return "main";
	}
	return "login";
}
```
#### 10、修改login.jsp中的form表单action=”login”，method=”post”
#### 11、在webPage目录下创建main.jsp文件
```
<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    <title>My JSP 'index.jsp' starting page</title>
	<meta http-equiv="pragma" content="no-cache">
	<meta http-equiv="cache-control" content="no-cache">
	<meta http-equiv="expires" content="0">    
	<meta http-equiv="keywords" content="keyword1,keyword2,keyword3">
	<meta http-equiv="description" content="This is my page">
	<!--
	<link rel="stylesheet" type="text/css" href="styles.css">
	-->
  </head>
  
  <body>
	登录成功！
  </body>
</html>
```
#### 12、运行测试：
![25](/img/25.png) 
![26](/img/26.png) 
***
***
### 第五章登录拦截器demo
#### 1、在com.hugh.controller包下创建HomeController类
```
package com.hugh.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

/**
 * 控制器-主页
 * 
 * @author jinhui
 *
 */
@Controller
public class HomeController {

	/**
	 * 获取主页页面
	 * 
	 * @return
	 */
	@RequestMapping(value = "/", method = { RequestMethod.GET })
	public String home() {
		return "main";
	} 
}
```
#### 2、修改web.xml的欢迎页面改为/
![27](/img/27.png) 
#### 3、在文件夹src/main/java下创建com.hugh.common包，这个包主要放一些公共的类
#### 4、修改登录验证方法，把登录成功的用户信息放到session里如下图
![28](/img/28.png) 
#### 5、在配置文件spring-web.xml文件中添加拦截器配置，添加登录路径不拦截
```
<!-- 拦截器 -->  
<mvc:interceptors>  
    <!-- 多个拦截器，顺序执行 -->  
    <mvc:interceptor>  
        <!-- /**表示所有url包括子url路径 -->  
        <mvc:mapping path="/**"/>
        <bean class="com.hugh.common.LoginInterceptor">
        	<!-- 如果请求中包含以下路径，则不进行拦截 --> 
	        <property name="excludePath">    
		        <list>    
					<value>/account/login</value>
				</list>    
			</property>
		</bean>
    </mvc:interceptor>  
</mvc:interceptors>
```
#### 6、在com.hugh.common包下创建LoginInterceptor类实现org.springframework.web.servlet.HandlerInterceptor类
#### 7、在这里讲一下实现的三个方法的作用：
第一个preHandle：执行Handler方法之前执行 用于身份认证、身份授权 比如身份认证，如果认证通过表示当前用户没有登陆，需要此方法拦截不再向下执行  
第二个postHandle：进入Handler方法之后，返回modelAndView之前执行 应用场景从modelAndView出发：将公用的模型数据(比如菜单导航)在这里传到视图，也可以在这里统一指定视图  
第三个afterCompletion：执行Handler完成执行此方法 应用场景：统一异常处理，统一日志处理  
#### 8、所以我们的登录验证用preHandle方法就可以了，并在里面添加数组excludePath来存储xml文件里配置的不拦截路径，记住一定要给这个变量get和set方法不然就会报错，并引用用户业务层接口类，在preHandle方法里写拦截代码，代码如下：
```
package com.hugh.common;

import java.util.Arrays;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import com.hugh.service.AccountService;
import com.hugh.vo.LoginVO;

/**
 * 登录拦截器
 * 
 * @author jinhui
 *
 */
public class LoginInterceptor implements HandlerInterceptor {
	
	@Resource
	private AccountService accountService;
	
	private String[] excludePath;// 不拦截路径
	
	public String[] getExcludePath() {
		return excludePath;
	}

	public void setExcludePath(String[] excludePath) {
		this.excludePath = excludePath;
	}
	
	/**
	 * 执行Handler方法之前执行 用于身份认证、身份授权 比如身份认证，如果认证通过表示当前用户没有登陆，需要此方法拦截不再向下执行
	 */
	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
		// 先判断是否需要拦截该请求
		if (!Arrays.asList(this.excludePath).contains(request.getServletPath())) {
			// 获取SESSION
			HttpSession session = request.getSession();
			// 获得当前session帐号
			LoginVO loginVO = (LoginVO) session.getAttribute("Global.loginVO");
			// 如果登录对象为空或者登录验证失败
			if(loginVO == null || !accountService.findAccount(loginVO)) {
				request.getRequestDispatcher("account/login").forward(request, response);
				return false;
			}
		}
		return true;
	}

	/**
	 * 进入Handler方法之后，返回modelAndView之前执行 应用场景从modelAndView出发：将公用的模型数据(比如菜单导航)在这里
	 */
	@Override
	public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
	}

	/**
	 * 执行Handler完成执行此方法 应用场景：统一异常处理，统一日志处理
	 */
	@Override
	public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
	}

}
```
#### 9、重新启动项目发现会直接跳到登录页面，证明拦截器就起作用了，如果没有拦截器你运行他是调用的HomeController控制器home方法，返回页面是main.jsp
***
***
### 第六章使用mybatis逆向工程生成代码
***
***
### 第七章利用aop注解实现日志管理
