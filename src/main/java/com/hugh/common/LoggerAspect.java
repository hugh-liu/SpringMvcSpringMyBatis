package com.hugh.common;

import java.lang.reflect.Method;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.UUID;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.hugh.annotation.SystemControllerLog;
import com.hugh.annotation.SystemServiceLog;
import com.hugh.entity.Account;
import com.hugh.entity.Logger;
import com.hugh.enums.LoggerState;
import com.hugh.enums.LoggerType;
import com.hugh.service.LoggerService;
import com.hugh.vo.LoginVO;

import net.sf.json.JSONObject;

/**
 * 日志记录器-切面类
 * 
 * @author jinhui
 *
 */
public class LoggerAspect {
	
	@Resource
	LoggerService loggerService;

	/**
	 * 日志记录器-前置
	 * @param joinPoint 切入点参数
	 */
	@SuppressWarnings("static-access")
	public void beforeLogger(JoinPoint joinPoint) {
		HttpServletRequest request = ((ServletRequestAttributes)RequestContextHolder.getRequestAttributes()).getRequest();
		HttpSession session = request.getSession();
		Logger logger = new Logger();// 日志实体类
		Date date = new Date();
		LoginVO loginVO = (LoginVO)session.getAttribute("Global.loginVO");
		SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMddHHmmss");
		String uuid = dateFormat.format(date) + UUID.randomUUID().toString().substring(0,6);
		logger.setUuid(uuid);
		try {
			logger.setMethod(joinPoint.getTarget().getClass().getName() + "." + joinPoint.getSignature().getName() + "()");
			logger.setMethodDes(this.getControllerMthodDescription(joinPoint));
			logger.setIp(request.getRemoteAddr());
			if(loginVO != null) {
				Account account = new Account(loginVO.getName(), loginVO.getPassword());
				logger.setCreateAccount(account);
				logger.setUpdateAccount(account);
			}
			logger.setLoggerType(LoggerType.NORMAL);
			logger.setLoggerState(LoggerState.SOLVE);
		} catch (Exception e) {
			logger.setMethod("com.hugh.common.LoggerAspect.beforeLogger(JoinPoint joinPoint)");
			logger.setMethodDes("日志记录器-前置");
			logger.setExceptionCode(e.getClass().getName());
			logger.setExceptionMsg(e.getMessage());
			logger.setLoggerType(LoggerType.ABNORMAL);
			logger.setLoggerState(LoggerState.NEW);
		} finally {
			logger.setCreateDate(date);
			logger.setUpdateDate(date);
			loggerService.insertLogger(logger);
		}
	}

	/**
	 * 日志记录器-后置
	 * @param joinPoint 切入点参数
	 */
	public void afterLogger(JoinPoint joinPoint) {
		System.out.println("后置-日志记录器测试！");
	}

	/**
	 * 日志记录器-返回（如果执行中出现异常则不会进入到这里）
	 * @param joinPoint 切入点参数
	 */
	public void afterReturningLogger(JoinPoint joinPoint) {
		System.out.println("返回-日志记录器测试！");
	}
	
	/**
	 * 日志记录器-异常
	 * @param joinPoint 切入点参数
	 * @param e 异常参数
	 */
	@SuppressWarnings("static-access")
	public void afterThrowingLogger(JoinPoint joinPoint, Throwable e) {
		HttpServletRequest request = ((ServletRequestAttributes)RequestContextHolder.getRequestAttributes()).getRequest();
		HttpSession session = request.getSession();
		Logger logger = new Logger();// 日志实体类
		Date date = new Date();
		LoginVO loginVO = (LoginVO)session.getAttribute("Global.loginVO");
		String params = "";// 请求参数
		SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMddHHmmss");
		String uuid = dateFormat.format(date) + UUID.randomUUID().toString().substring(0,6);
		logger.setUuid(uuid);
		try {
			logger.setMethod(joinPoint.getTarget().getClass().getName() + "." + joinPoint.getSignature().getName() + "()");
			logger.setMethodDes(this.getServiceMthodDescription(joinPoint));
			logger.setExceptionCode(e.getClass().getName());
			logger.setExceptionMsg(e.getMessage());
			//获取用户请求方法的参数并序列化为JSON格式字符串
			if (joinPoint.getArgs() !=  null && joinPoint.getArgs().length > 0) {
	            for ( int i = 0; i < joinPoint.getArgs().length; i++) {
	            	params += JSONObject.fromObject(joinPoint.getArgs()[i]);
	            }
			}
			logger.setParams(params);
			logger.setIp(request.getRemoteAddr());
			if(loginVO != null) {
				Account account = new Account(loginVO.getName(), loginVO.getPassword());
				logger.setCreateAccount(account);
				logger.setUpdateAccount(account);
			}
		} catch (Exception e1) {
			logger.setMethod("com.hugh.common.LoggerAspect.afterThrowingLogger(JoinPoint joinPoint, Throwable e)");
			logger.setMethodDes("日志记录器-异常");
			logger.setExceptionCode(e1.getClass().getName());
			logger.setExceptionMsg(e1.getMessage());
		} finally {
			logger.setLoggerType(LoggerType.ABNORMAL);
			logger.setLoggerState(LoggerState.NEW);
			logger.setCreateDate(date);
			logger.setUpdateDate(date);
			loggerService.insertLogger(logger);
		}
	}
	
	/**
	 * 日志记录器-环绕
	 * @param pJoinPoint 切入点参数
	 * @return 返回参数
	 */
	public Object aroundLogger(ProceedingJoinPoint pJoinPoint) {
		Object result = null;
		try {
			System.out.println("环绕前置-日志记录器测试！");
			result = pJoinPoint.proceed();
			System.out.println("环绕后置-日志记录器测试！");
		} catch (Throwable e) {
			System.out.println("环绕异常-日志记录器测试！");
		}
		System.out.println("环绕返回-日志记录器测试！");
		return result;
	}
	
	/**
	 * 获取控制层注解中对方法的描述信息
	 * @param joinPoint 切点
	 * @return 描述
	 * @throws Exception
	 */
	public  static String getControllerMthodDescription(JoinPoint joinPoint) throws Exception {    
		String targetName = joinPoint.getTarget().getClass().getName();    
        String methodName = joinPoint.getSignature().getName();    
        Object[] arguments = joinPoint.getArgs();    
        @SuppressWarnings("rawtypes")
		Class targetClass = Class.forName(targetName);    
        Method[] methods = targetClass.getMethods();    
        String description = "";    
         for (Method method : methods) {    
             if (method.getName().equals(methodName)) {    
                @SuppressWarnings("rawtypes")
				Class[] clazzs = method.getParameterTypes();    
                 if (clazzs.length == arguments.length) {    
                    description = method.getAnnotation(SystemControllerLog.class).description();    
                     break;    
                }    
            }    
        }    
         return description;    
    }
	
	/**
	 * 获取业务层注解中对方法的描述信息
	 * @param joinPoint 切点
	 * @return 描述
	 * @throws Exception
	 */
	public  static String getServiceMthodDescription(JoinPoint joinPoint) throws Exception {    
		String targetName = joinPoint.getTarget().getClass().getName();    
        String methodName = joinPoint.getSignature().getName();    
        Object[] arguments = joinPoint.getArgs();    
        @SuppressWarnings("rawtypes")
		Class targetClass = Class.forName(targetName);    
        Method[] methods = targetClass.getMethods();    
        String description = "";    
         for (Method method : methods) {    
             if (method.getName().equals(methodName)) {    
                @SuppressWarnings("rawtypes")
				Class[] clazzs = method.getParameterTypes();    
                 if (clazzs.length == arguments.length) {    
                    description = method.getAnnotation(SystemServiceLog.class).description();    
                     break;    
                }    
            }    
        }    
         return description;    
    }

}