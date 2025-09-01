package com.sabrina.daniel.Livratech.negocio;

public interface IStrategy<DomainEntity> {
    String processar(DomainEntity entity);
}
