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
	boolean findAccount(LoginVO loginVO);

}