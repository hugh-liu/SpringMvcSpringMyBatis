package com.hugh.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.hugh.annotation.SystemControllerLog;

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
	@SystemControllerLog(description = "获取主页页面")
	@RequestMapping(value = "/", method = { RequestMethod.GET })
	public String home() {
		return "main";
	}
}