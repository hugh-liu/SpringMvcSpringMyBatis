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