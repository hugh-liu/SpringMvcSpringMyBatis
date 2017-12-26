package com.hugh.controller;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.hugh.annotation.SystemControllerLog;
import com.hugh.service.AccountService;
import com.hugh.vo.LoginVO;

/**
 * 
 * 控制器-用户
 * 
 * @author jinhui
 *
 */
@Controller
@RequestMapping(value = "/account")
public class AccountController {
	
	@Resource
	private AccountService accountService;

	/**
	 * 获取登录页面
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception 
	 */
	@SystemControllerLog(description = "获取登录页面-控制器")
	@RequestMapping(value = "/login", method = { RequestMethod.GET })
	public String login(HttpServletRequest request, HttpServletResponse response) {
		return "login";
	}

	/**
	 * 登录验证
	 * @param request
	 * @param response
	 * @param loginVO 登录VO
	 * @return
	 */
	@SystemControllerLog(description = "登录验证-控制器")
	@RequestMapping(value = "/login", method = { RequestMethod.POST })
	public String login(HttpServletRequest request, HttpServletResponse response, LoginVO loginVO) {
		// 如果登录成功
		if(accountService.findAccount(loginVO)) {
			// 获取SESSION
			HttpSession session = request.getSession();
			session.setAttribute("Global.loginVO", loginVO);
			return "main";
		}
		return "login";
	}

}
