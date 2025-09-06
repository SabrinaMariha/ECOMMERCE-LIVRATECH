async function atualizarCliente(clienteId, clienteData) {
    try {
        const response = await fetch(`http://localhost:8080/clientes/${clienteId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(clienteData)
        });

        if(!response.ok) {
            throw new Error('Erro ao atualizar cliente: ${response.statusText}');
        }

        return await response.json();
    } catch (error) {
        console.error('Erro na atualização:', error);
        throw error;
    }
}