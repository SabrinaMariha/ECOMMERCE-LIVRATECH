

    // Remove clones ao clicar fora
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-btn')) {
            const parent = e.target.closest('.address-clone, .card-clone, .telefone-clone');
            if (parent) parent.remove();
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        function abrirModal(modal) {
            if (modal) modal.style.display = 'flex';
        }

        function fecharModal(modal) {
            if (modal) modal.style.display = 'none';
        }


        const modalSucesso = document.getElementById('success-modal');
        const closeSucesso = modalSucesso?.querySelector('.close-btn');

        window.addEventListener('click', (event) => {
            if (event.target === modalSucesso) {
                fecharModal(modalSucesso);
                window.location.replace('index.html');
            }
        });

        const btnCancelar = document.querySelector('.btn-cancelar');
        const btnNao = document.querySelector('.btn-nao');
        const btnSim = document.querySelector('.btn-sim');
        const modalCancelamento = document.getElementById('cancel-modal');
        const closeCancelamento = modalCancelamento?.querySelector('.close-btn');

        btnCancelar?.addEventListener('click', (e) => {
            e.preventDefault();
            abrirModal(modalCancelamento);
        });

        btnNao?.addEventListener('click', () => fecharModal(modalCancelamento));
        btnSim?.addEventListener('click', () => {
            fecharModal(modalCancelamento);
            window.location.replace('index.html');
        });
        closeCancelamento?.addEventListener('click', () => fecharModal(modalCancelamento));

        window.addEventListener('click', (event) => {
            if (event.target === modalCancelamento) {
                fecharModal(modalCancelamento);
            }
        });


    });
