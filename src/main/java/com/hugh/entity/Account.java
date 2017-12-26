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