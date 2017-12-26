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
