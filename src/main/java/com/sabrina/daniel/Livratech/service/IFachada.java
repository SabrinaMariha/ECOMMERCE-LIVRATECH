package com.sabrina.daniel.Livratech.service;

import com.sabrina.daniel.Livratech.dtos.DadosConsultaCliente;

import java.util.List;

public interface IFachada<DomainEntity> {

	public String save(DomainEntity entity);
	public String update(DomainEntity entity);
	public String delete(DomainEntity entity);
	public List<DomainEntity> findAll(DomainEntity entity);
   	public DadosConsultaCliente findDTOById(Long id) throws Exception;
	public String update(Long id, DadosConsultaCliente dto);
	public String updateSenha(Long id, String novaSenha, String confirmarSenha);

}