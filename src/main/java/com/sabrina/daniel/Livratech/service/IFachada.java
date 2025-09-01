package com.sabrina.daniel.Livratech.service;

import com.sabrina.daniel.Livratech.model.Cliente;

import java.util.List;

public interface IFachada<DomainEntity> {

	public String save(DomainEntity entity);
	public String update(DomainEntity entity);


	public String delete(DomainEntity entity);
	public List<DomainEntity> findAll(DomainEntity entity);
   // public DomainEntity findById(Long id) throws Exception;
	//
   public String updateSenha(DomainEntity entity);
}