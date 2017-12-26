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
		System.out.println(ex.getMessage());
	}

}