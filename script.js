// 1. DADOS BASE (O Checklist Oficial)
const tarefasBase = [
    { id: 't1', cat: '1. Saneamento e Segurança', texto: 'Responsável Intimações definido' },
    { id: 't2', cat: '1. Saneamento e Segurança', texto: 'Atribuição de tarefas a partir das intimações RI-DT' },
    { id: 't3', cat: '1. Saneamento e Segurança', texto: 'Sistema de controle de prazos fatais padronizados (CUIDAR DO PRAZO FATAL)' },
    { id: 't4', cat: '1. Saneamento e Segurança', texto: 'Integração das intimações: Diários e Eletrônicas' },

    { id: 't5', cat: '2. Organização e Dados', texto: 'Acompanhar a Origem dos Clientes (não informado)' },
    { id: 't6', cat: '2. Organização e Dados', texto: 'Cadastro de clientes completo e atualizado' },
    { id: 't7', cat: '2. Organização e Dados', texto: 'Organização dos processos por fase/etapa adequada (MOVIMENTAR/ARQUIVAR CRM)' },
    { id: 't8', cat: '2. Organização e Dados', texto: 'Controlar as 4 datas base dos processos' },
    { id: 't9', cat: '2. Organização e Dados', texto: '100% processos e recursos no sistema (Judiciais e Administrativos)' },
    { id: 't10', cat: '2. Organização e Dados', texto: 'Grupos e tipos de ações definidos' },

    { id: 't11', cat: '3. Engajamento da Equipe', texto: '100% da equipe aprendeu a usar o sistema e possui usuário ativo' },
    { id: 't12', cat: '3. Engajamento da Equipe', texto: 'Gestão por tarefa configurada (Lista de tarefas nas fases certas e não genéricas)' },
    { id: 't13', cat: '3. Engajamento da Equipe', texto: 'Uso correto de tarefas (CUIDAR DO USO DE ANDAMENTOS, não usar só recado)' },
    { id: 't14', cat: '3. Engajamento da Equipe', texto: 'Comunicação Multilateral pelo sistema' },

    { id: 't15', cat: '4. Maturidade Financeira', texto: 'Usar o Assas' },
    { id: 't16', cat: '4. Maturidade Financeira', texto: 'Financeiro parcial pelo sistema (com cadastramento adequado)' },
    { id: 't17', cat: '4. Maturidade Financeira', texto: 'Registro de honorários vinculados ao processo (VINCULAR PROCESSOS FINANCEIRO)' }
];

// 2. INICIALIZAÇÃO
window.onload = () => {
    renderizarChecklistBase();

    // Carrega os dados que estavam sendo digitados ou inicia vazio
    const rascunhoSalvo = JSON.parse(localStorage.getItem('cs_rascunho'));

    if (rascunhoSalvo) {
        preencherFormulario(rascunhoSalvo);
    } else {
        // Inicia com o formulário totalmente limpo na primeira vez
        preencherFormulario({});
    }

    calcularHealthScore();
};

function renderizarChecklistBase() {
    const container = document.getElementById('checklistContainer');
    container.innerHTML = '';

    const categorias = [...new Set(tarefasBase.map(t => t.cat))];

    categorias.forEach(cat => {
        const tarefasDaCat = tarefasBase.filter(t => t.cat === cat);
        let html = `
                    <div class="mb-6">
                        <h4 class="font-bold text-slate-700 border-b pb-2 mb-3">${cat}</h4>
                        <div class="space-y-3">
                `;

        tarefasDaCat.forEach(tarefa => {
            // Adicionado atualizarOpcoesPlanoAcao() no evento onchange
            html += `
                        <div class="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-slate-100 transition-colors group">
                            <div class="flex-1 pr-4">
                                <span class="text-slate-700 font-medium group-hover:text-indigo-700 transition-colors">${tarefa.texto}</span>
                            </div>
                            <div class="flex items-center gap-2 shrink-0">
                                <span class="text-xs text-slate-400 font-semibold uppercase tracking-wider hidden sm:inline">Nota:</span>
                                <select id="${tarefa.id}" data-label="${tarefa.texto}" onchange="atualizarOpcoesPlanoAcao(); calcularHealthScore(); salvarRascunho();" class="bg-white border border-slate-300 text-slate-900 text-sm rounded focus:ring-indigo-500 focus:border-indigo-500 block p-1 font-bold w-14 text-center cursor-pointer hover:bg-indigo-50 outline-none">
                                    <option value="0" title="0: Não começou - O cliente ainda não tem nada relacionado ao marco">0</option>
                                    <option value="1" title="1: Começando - Na fase inicial de utilização, estruturando ainda">1</option>
                                    <option value="2" title="2: Organizando - Já está utilizando, mas ainda está baixo">2</option>
                                    <option value="3" title="3: Bom - Está bom, mas ainda precisa de alguns ajustes">3</option>
                                    <option value="4" title="4: Ótimo - Está excelente, não precisa de nenhum ajuste">4</option>
                                </select>
                            </div>
                        </div>
                    `;
        });

        html += `</div></div>`;
        container.innerHTML += html;
    });
}

// NOVO: Atualiza as opções do Plano de Ação (Apenas notas 0 a 2)
function atualizarOpcoesPlanoAcao(savedPlanoAcao = null) {
    const container = document.getElementById('containerPlanoAcao');

    // Pega os marcados atuais para não perder seleção ao mudar um dropdown
    let valoresMarcados = savedPlanoAcao;
    if (!valoresMarcados) {
        valoresMarcados = Array.from(container.querySelectorAll('.plano-acao-cb:checked')).map(cb => cb.value);
    }

    container.innerHTML = '';
    let hasItems = false;

    document.querySelectorAll('#checklistContainer select').forEach(select => {
        const nota = parseInt(select.value);
        // Consideramos 0, 1 e 2 como pontos de atenção (melhoria)
        if (nota < 3) {
            hasItems = true;
            const texto = select.getAttribute('data-label');
            const isChecked = valoresMarcados.includes(texto) ? 'checked' : '';

            const label = document.createElement('label');
            label.className = "flex items-start gap-2 text-sm text-slate-700 cursor-pointer hover:text-indigo-600 bg-white p-2 border border-slate-100 rounded shadow-sm";
            label.innerHTML = `
                        <input type="checkbox" value="${texto}" class="plano-acao-cb rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5 shrink-0" onchange="salvarRascunho()" ${isChecked}>
                        <span class="leading-tight">${texto}</span>
                    `;
            container.appendChild(label);
        }
    });

    if (!hasItems) {
        container.innerHTML = '<p class="text-sm text-slate-500 italic p-2 text-center">Nenhum ponto de melhoria (notas de 0 a 2) foi identificado no checklist.</p>';
    }
}

// 3. PREENCHIMENTO E SALVAMENTO AUTOMÁTICO (Rascunho)
function preencherFormulario(dados) {
    document.getElementById('inputNome').value = dados.nome || '';
    document.getElementById('inputResponsavel').value = dados.responsavel || '';
    document.getElementById('inputIntimacoes').value = dados.intimacoes !== undefined ? dados.intimacoes : '';
    document.getElementById('inputUltimoAcesso').value = dados.ultimoAcesso || '';
    document.getElementById('inputIntegracao').value = dados.integracao || '';
    document.getElementById('inputDiarios').value = dados.diarios || '';
    document.getElementById('inputTarefas').value = dados.tarefas || '';
    document.getElementById('inputModelos').value = dados.modelos || '';
    document.getElementById('inputMetas').value = dados.metas || '';
    document.getElementById('inputObservacoes').value = dados.observacoes || '';
    document.getElementById('inputPlanoAcaoCustom').value = dados.planoAcaoCustom || '';

    if (dados.notasTarefas) {
        for (const [taskId, nota] of Object.entries(dados.notasTarefas)) {
            const select = document.getElementById(taskId);
            if (select) select.value = nota;
        }
    }

    // Depois de preencher as notas, gera os checkboxes e marca os que estavam salvos
    atualizarOpcoesPlanoAcao(dados.planoAcao || []);
}

function salvarRascunho() {
    const notas = {};
    document.querySelectorAll('#checklistContainer select').forEach(select => {
        notas[select.id] = parseInt(select.value);
    });

    const planoAcaoSelecionados = Array.from(document.querySelectorAll('.plano-acao-cb:checked')).map(cb => cb.value);

    const rascunho = {
        nome: document.getElementById('inputNome').value,
        responsavel: document.getElementById('inputResponsavel').value,
        intimacoes: document.getElementById('inputIntimacoes').value,
        ultimoAcesso: document.getElementById('inputUltimoAcesso').value,
        integracao: document.getElementById('inputIntegracao').value,
        diarios: document.getElementById('inputDiarios').value,
        tarefas: document.getElementById('inputTarefas').value,
        modelos: document.getElementById('inputModelos').value,
        metas: document.getElementById('inputMetas').value,
        observacoes: document.getElementById('inputObservacoes').value,
        planoAcao: planoAcaoSelecionados,
        planoAcaoCustom: document.getElementById('inputPlanoAcaoCustom').value,
        notasTarefas: notas
    };

    localStorage.setItem('cs_rascunho', JSON.stringify(rascunho));
}

function limparFormulario() {
    if (confirm('Tem certeza que deseja limpar a tela para iniciar um novo cliente?')) {
        document.getElementById('inputNome').value = '';
        document.getElementById('inputResponsavel').value = '';
        document.getElementById('inputIntimacoes').value = '';
        document.getElementById('inputUltimoAcesso').value = '';
        document.getElementById('inputIntegracao').value = '';
        document.getElementById('inputDiarios').value = '';
        document.getElementById('inputTarefas').value = '';
        document.getElementById('inputModelos').value = '';
        document.getElementById('inputMetas').value = '';
        document.getElementById('inputObservacoes').value = '';
        document.getElementById('inputPlanoAcaoCustom').value = '';

        document.querySelectorAll('#checklistContainer select').forEach(select => {
            select.value = "0";
        });

        // Atualiza caixas com array vazio e reseta pontuação
        atualizarOpcoesPlanoAcao([]);
        salvarRascunho();
        calcularHealthScore();

        // FECHA O RELATÓRIO SE ESTIVER ABERTO E VOLTA PARA A TELA INICIAL
        fecharRelatorio();

        document.getElementById('inputNome').focus();
    }
}

// 4. LÓGICA DE PONTUAÇÃO
function calcularHealthScore() {
    let scoreAbsoluto = 0;
    const totalMaximo = tarefasBase.length * 4; // Total de metas x Nota Máxima (4)

    document.querySelectorAll('#checklistContainer select').forEach(select => {
        scoreAbsoluto += parseInt(select.value);
    });

    const scorePercentual = Math.round((scoreAbsoluto / totalMaximo) * 100);

    atualizarUIHealthScore(scorePercentual, scoreAbsoluto);
}

function atualizarUIHealthScore(percentual, absoluto) {
    const display = document.getElementById('scoreDisplay');
    const card = document.getElementById('healthCard');
    const iconBox = document.getElementById('healthIconBox');
    const icon = document.getElementById('healthIcon');

    card.className = "rounded-lg p-3 border flex items-center gap-3 min-w-[220px] transition-colors";
    iconBox.className = "p-2 rounded-full shadow-sm";
    icon.className = "ph text-xl";

    let classificacao = "";

    if (percentual < 40) {
        // BAD (< 40%)
        card.classList.add("bg-red-50", "border-red-200");
        iconBox.classList.add("bg-red-100", "text-red-600");
        icon.classList.add("ph-warning-octagon");
        display.className = "text-xl font-bold text-red-700";
        classificacao = "BAD";
    } else if (percentual < 60) {
        // POOR (40% - 59%)
        card.classList.add("bg-amber-50", "border-amber-200");
        iconBox.classList.add("bg-amber-100", "text-amber-600");
        icon.classList.add("ph-warning");
        display.className = "text-xl font-bold text-amber-700";
        classificacao = "POOR";
    } else if (percentual < 80) {
        // GOOD (60% - 79%)
        card.classList.add("bg-emerald-50", "border-emerald-200");
        iconBox.classList.add("bg-emerald-100", "text-emerald-600");
        icon.classList.add("ph-check-circle");
        display.className = "text-xl font-bold text-emerald-700";
        classificacao = "GOOD";
    } else {
        // EXCELENT (80% - 100%)
        card.classList.add("bg-teal-50", "border-teal-200");
        iconBox.classList.add("bg-teal-100", "text-teal-600");
        icon.classList.add("ph-star");
        display.className = "text-xl font-bold text-teal-700";
        classificacao = "EXCELENT";
    }

    // Mostra os pontos absolutos e a porcentagem global
    display.innerHTML = `${absoluto} pts <span class="text-sm font-normal">(${percentual}%)</span> - ${classificacao}`;
}

// 5. GERAÇÃO DO RELATÓRIO
function gerarRelatorio() {
    const nomeCliente = document.getElementById('inputNome').value;

    if (!nomeCliente.trim()) {
        alert('Por favor, preencha o Nome do Escritório antes de gerar o relatório.');
        document.getElementById('inputNome').focus();
        return;
    }

    // Preenche dados manuais no cabeçalho do relatório
    document.getElementById('relClienteNome').innerText = nomeCliente;
    document.getElementById('relData').innerText = new Date().toLocaleDateString('pt-BR');
    document.getElementById('relIntimacoes').innerText = document.getElementById('inputIntimacoes').value || "0";
    document.getElementById('relResponsavel').innerText = document.getElementById('inputResponsavel').value || "Não definido";
    document.getElementById('relIntegracao').innerText = document.getElementById('inputIntegracao').value || "Não informado";
    document.getElementById('relDiarios').innerText = document.getElementById('inputDiarios').value || "Não informado";
    document.getElementById('relTarefas').innerText = document.getElementById('inputTarefas').value || "Não informado";
    document.getElementById('relModelos').innerText = document.getElementById('inputModelos').value || "Não informado";
    document.getElementById('relMetas').innerText = document.getElementById('inputMetas').value || "Não informado";
    document.getElementById('relObservacoes').innerText = document.getElementById('inputObservacoes').value || "Nenhuma observação registrada.";

    // Formatar data de último acesso
    const dataAcesso = document.getElementById('inputUltimoAcesso').value;
    let dataFormatada = "Não registrado";
    if (dataAcesso) {
        const [ano, mes, dia] = dataAcesso.split('-');
        dataFormatada = `${dia}/${mes}/${ano}`;
    }
    document.getElementById('relUltimoAcesso').innerText = dataFormatada;

    // Renderizar Plano de Ação
    const selecionados = Array.from(document.querySelectorAll('.plano-acao-cb:checked')).map(cb => cb.value);
    const custom = document.getElementById('inputPlanoAcaoCustom').value;
    let planoCompleto = [...selecionados];

    if (custom.trim() !== '') {
        planoCompleto.push(...custom.split(',').map(s => s.trim()).filter(s => s !== ''));
    }

    const listaPlano = document.getElementById('relPlanoAcaoLista');
    const containerPlano = document.getElementById('relPlanoAcaoContainer');
    listaPlano.innerHTML = '';

    if (planoCompleto.length > 0) {
        containerPlano.style.display = 'block';
        planoCompleto.forEach(linha => {
            const li = document.createElement('li');
            li.className = "flex items-start gap-2";
            const textoLimpo = linha.replace(/^-\s*/, '').trim();
            li.innerHTML = `<i class="ph ph-caret-circle-right text-amber-600 mt-1"></i> <span>${textoLimpo}</span>`;
            listaPlano.appendChild(li);
        });
    } else {
        containerPlano.style.display = 'none';
    }

    const listaFortes = document.getElementById('listaPontosFortes');
    const listaMelhoria = document.getElementById('listaPontosMelhoria');

    listaFortes.innerHTML = '';
    listaMelhoria.innerHTML = '';

    let temForte = false;
    let temMelhoria = false;

    document.querySelectorAll('#checklistContainer select').forEach(select => {
        const tarefaNome = select.getAttribute('data-label');
        const nota = parseInt(select.value);
        const li = document.createElement('li');
        li.className = "flex items-start gap-2 bg-white p-3 rounded shadow-sm border border-slate-100";

        // Notas 3 e 4 são pontos fortes, Notas 0 a 2 são melhorias
        if (nota >= 3) {
            li.innerHTML = `<i class="ph ph-check-circle text-emerald-500 text-xl mt-0.5"></i> 
                                    <span class="text-slate-700 font-medium">${tarefaNome} 
                                        <span class="text-emerald-700 font-bold text-xs ml-2 bg-emerald-100 px-2 py-0.5 rounded">Nota ${nota}/4</span>
                                    </span>`;
            listaFortes.appendChild(li);
            temForte = true;
        } else {
            li.innerHTML = `<i class="ph ph-arrow-circle-right text-red-400 text-xl mt-0.5"></i> 
                                    <span class="text-slate-700">${tarefaNome} 
                                        <span class="text-red-700 font-bold text-xs ml-2 bg-red-100 px-2 py-0.5 rounded">Nota ${nota}/4</span>
                                    </span>`;
            listaMelhoria.appendChild(li);
            temMelhoria = true;
        }
    });

    if (!temForte) listaFortes.innerHTML = '<li class="text-slate-500 italic p-3">Ainda não há marcos consolidados (Notas 3 ou 4).</li>';
    if (!temMelhoria) listaMelhoria.innerHTML = '<li class="text-slate-500 italic p-3">Parabéns! Todos os marcos estão com nota máxima.</li>';

    // Esconde o app e mostra o relatório
    document.getElementById('mainApp').style.display = 'none';
    const relatorio = document.getElementById('relatorio-print');
    relatorio.classList.add('show-for-pdf');
}

function fecharRelatorio() {
    document.getElementById('mainApp').style.display = 'block';
    document.getElementById('relatorio-print').classList.remove('show-for-pdf');
}

function baixarPDF() {
    const elemento = document.getElementById('relatorio-print');
    const clienteNome = document.getElementById('relClienteNome').innerText.replace(/\s+/g, '_');

    // Oculta botões temporariamente para o PDF
    document.getElementById('btnBaixarPDF').style.display = 'none';
    const btnVoltar = document.querySelector('button[onclick="fecharRelatorio()"]');
    btnVoltar.style.display = 'none';

    const opt = {
        margin: 10,
        filename: `Relatorio_CS_${clienteNome}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Gera o PDF e depois volta os botões
    html2pdf().set(opt).from(elemento).save().then(() => {
        document.getElementById('btnBaixarPDF').style.display = 'flex';
        btnVoltar.style.display = 'block';
    });
}