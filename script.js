// 1. DADOS BASE (O Checklist Oficial)
const tarefasBase = [
    { id: 't1', cat: '1. Saneamento e Segurança', texto: 'Responsável Intimações definido' },
    { id: 't2', cat: '1. Saneamento e Segurança', texto: 'Atribuição de tarefas a partir das intimações RI-DT' },
    { id: 't3', cat: '1. Saneamento e Segurança', texto: 'Sistema de controle de prazos fatais padronizados' },
    { id: 't4', cat: '1. Saneamento e Segurança', texto: 'Integração das intimações: Diários e Sistemas Eletrônicos' },

    { id: 't5', cat: '2. Organização e Dados', texto: 'Acompanhar a Origem dos Clientes' },
    { id: 't6', cat: '2. Organização e Dados', texto: 'Cadastro de clientes completo e atualizado' },
    { id: 't7', cat: '2. Organização e Dados', texto: 'Organização dos processos por fase/etapa adequada' },
    { id: 't8', cat: '2. Organização e Dados', texto: 'Controlar as 4 datas base dos processos' },
    { id: 't9', cat: '2. Organização e Dados', texto: '100% dos processos e recursos cadastrados no sistema' },
    { id: 't10', cat: '2. Organização e Dados', texto: 'Grupos e tipos de ações definidos' },

    { id: 't11', cat: '3. Engajamento da Equipe', texto: '100% da equipe aprendeu a usar o sistema e possui usuário ativo' },
    { id: 't12', cat: '3. Engajamento da Equipe', texto: 'Gestão por tarefa configurada' },
    { id: 't13', cat: '3. Engajamento da Equipe', texto: 'Uso correto de tarefas' },
    { id: 't14', cat: '3. Engajamento da Equipe', texto: 'Comunicação Multilateral pelo sistema' },

    { id: 't15', cat: '4. Maturidade Financeira', texto: 'Usar o Asaas' },
    { id: 't16', cat: '4. Maturidade Financeira', texto: 'Financeiro parcial pelo sistema' },
    { id: 't17', cat: '4. Maturidade Financeira', texto: 'Registo de honorários vinculados ao processo' }
];

let currentSlideIndex = 0;
let clienteIdAtual = null;
let clientesHistoricoCompletos = [];

// 2. INICIALIZAÇÃO E ABAS
window.onload = () => {
    // Bloqueia datas futuras no campo Último Acesso
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('inputUltimoAcesso').max = today;

    renderizarChecklistBase();
    atualizarDropdownClientes();

    const rascunhoSalvo = JSON.parse(localStorage.getItem('cs_rascunho'));

    if (rascunhoSalvo) {
        preencherFormulario(rascunhoSalvo);
    } else {
        preencherFormulario({});
    }

    calcularHealthScore();
    renderizarHistorico();
    switchTab('checklist');

    document.addEventListener('click', (event) => {
        const input = document.getElementById('inputFilterCliente');
        const dropdown = document.getElementById('dropdownClientes');
        if (!input || !dropdown) return;

        if (event.target !== input && !dropdown.contains(event.target)) {
            dropdown.classList.add('hidden');
        }
    });
};

// Lógica de Visibilidade de Campos Condicionais (Sim/Não)
function toggleModelos() {
    const val = document.getElementById('selectModelos').value;
    const qtdInput = document.getElementById('inputModelosQtd');
    if (val === 'Sim') {
        qtdInput.classList.remove('hidden');
        qtdInput.classList.add('block');
    } else {
        qtdInput.classList.remove('block');
        qtdInput.classList.add('hidden');
        qtdInput.value = '';
    }
}

function toggleMetas() {
    const val = document.getElementById('selectMetas').value;
    const areasInput = document.getElementById('inputMetasAreas');
    if (val === 'Sim') {
        areasInput.classList.remove('hidden');
        areasInput.classList.add('block');
    } else {
        areasInput.classList.remove('block');
        areasInput.classList.add('hidden');
        areasInput.value = '';
    }
}

function toggleFalhas() {
    const val = document.getElementById('selectFalhas').value;
    const falhasDiv = document.getElementById('divFalhasDetails');
    if (val === 'Sim') {
        falhasDiv.classList.remove('hidden');
    } else {
        falhasDiv.classList.add('hidden');
        document.getElementById('inputFalhasQtd').value = '';
        document.getElementById('inputFalhasQuais').value = '';
        document.getElementById('inputFalhasQual').value = '';
    }
}

function switchTab(tabId) {
    const tabs = ['precadastro', 'checklist', 'historico'];

    tabs.forEach(t => {
        const btn = document.getElementById('btnTab' + t.charAt(0).toUpperCase() + t.slice(1));
        const content = document.getElementById('tab' + t.charAt(0).toUpperCase() + t.slice(1) + 'Content');

        if (t === tabId) {
            btn.className = "border-indigo-700 text-indigo-700 flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm transition-colors";
            content.classList.remove('hidden');
        } else {
            btn.className = "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors";
            content.classList.add('hidden');
        }
    });

    if (tabId === 'historico') {
        renderizarHistorico();
    } else if (tabId === 'precadastro') {
        const input = document.getElementById('inputPreIdAdvbox');
        if (input) input.focus();
    }

    const dropdown = document.getElementById('dropdownClientes');
    if (dropdown) {
        dropdown.classList.add('hidden');
    }
}

function filtrarSelectClientes() {
    const query = document.getElementById('inputFilterCliente').value.trim().toLowerCase();
    const historico = JSON.parse(localStorage.getItem('cs_historico')) || [];
    const filtrados = historico.filter(c => c.nome.toLowerCase().includes(query) || (c.advboxId && c.advboxId.toLowerCase().includes(query)));

    const dataList = document.getElementById('datalistCliente');
    if (!dataList) return;

    dataList.innerHTML = '';
    filtrados.forEach(c => {
        const option = document.createElement('option');
        option.value = c.nome;
        option.setAttribute('data-id', c.id);
        dataList.appendChild(option);
    });
}

function limparFiltroSelect() {
    const input = document.getElementById('inputFilterCliente');
    if (input) input.value = '';
    filtrarSelectClientes();
}

function carregarDoSelect() {
    selecionarClientePorTexto();
}

    const id = select.value;
    if (id) {
        carregarDoHistorico(id); // já faz switchTab('checklist') internamente
    }

// Lógica de Pré-cadastro
function realizarPreCadastro() {
    const advboxId = document.getElementById('inputPreIdAdvbox').value.trim();
    const nome = document.getElementById('inputPreNome').value.trim();

    if (!advboxId || !nome) {
        alert('Por favor, preencha o ID da Advbox e o Nome do Escritório.');
        return;
    }

    let historico = JSON.parse(localStorage.getItem('cs_historico')) || [];

    if (historico.some(c => c.advboxId === advboxId)) {
        alert('Já existe um cliente cadastrado com este ID Advbox.');
        return;
    }

    const novoCliente = {
        id: Date.now().toString(),
        advboxId: advboxId,
        nome: nome,
        dataSalvamento: new Date().toISOString(),
        score: 0,
        responsavel: '', intimacoes: '', ultimoAcesso: '', integracao: '',
        diarios: '', tarefas: '', modelos: '', modelosQtd: '', metas: '', metasAreas: '',
        falhas: '', falhasQtd: '', falhasQuais: '', falhasQual: '', observacoes: '',
        notasTarefas: {}, obsTarefas: {}
    };

    historico.push(novoCliente);
    localStorage.setItem('cs_historico', JSON.stringify(historico));

    atualizarDropdownClientes();
    renderizarHistorico();

    // Feedback visual no botão sem mudar de aba
    const btnSalvar = document.querySelector('button[onclick="realizarPreCadastro()"]');
    const conteudoOriginal = btnSalvar.innerHTML;

    btnSalvar.innerHTML = `<i class="ph ph-check-circle text-xl"></i> Cadastrado com Sucesso!`;
    btnSalvar.classList.replace('bg-indigo-600', 'bg-emerald-600');
    btnSalvar.classList.replace('hover:bg-indigo-700', 'hover:bg-emerald-700');

    setTimeout(() => {
        btnSalvar.innerHTML = conteudoOriginal;
        btnSalvar.classList.replace('bg-emerald-600', 'bg-indigo-600');
        btnSalvar.classList.replace('hover:bg-emerald-700', 'hover:bg-indigo-700');

        document.getElementById('inputPreIdAdvbox').value = '';
        document.getElementById('inputPreNome').value = '';
        document.getElementById('inputPreIdAdvbox').focus();
    }, 1500);
}

function atualizarDropdownClientes() {
    const input = document.getElementById('inputFilterCliente');
    if (!input) return;

    const historico = JSON.parse(localStorage.getItem('cs_historico')) || [];
    historico.sort((a, b) => a.nome.localeCompare(b.nome));
    clientesHistoricoCompletos = historico;

    renderizarDropdownClientes(historico);

    if (clienteIdAtual) {
        const cliente = historico.find(c => c.id === clienteIdAtual);
        if (cliente) input.value = cliente.nome;
    } else {
        input.value = '';
    }

    const dataList = document.getElementById('datalistCliente');
    if (dataList) {
        dataList.innerHTML = '';
        historico.forEach(c => {
            const option = document.createElement('option');
            option.value = c.nome;
            option.setAttribute('data-id', c.id);
            option.innerText = c.advboxId ? `${c.nome} (ID: ${c.advboxId})` : c.nome;
            dataList.appendChild(option);
        });
    }

    if (clienteIdAtual) {
        const cliente = historico.find(c => c.id === clienteIdAtual);
        if (cliente) {
            const input = document.getElementById('inputFilterCliente');
            if (input) input.value = cliente.nome;
        }
    }
}

function renderizarDropdownClientes(clientes) {
    const dropdown = document.getElementById('dropdownClientes');
    if (!dropdown) return;

    if (clientes.length === 0) {
        dropdown.innerHTML = '<p class="p-2 text-sm text-slate-500">Nenhum cliente encontrado</p>';
        dropdown.classList.remove('hidden');
        return;
    }

    let html = '<ul class="divide-y divide-slate-100">';
    clientes.forEach(c => {
        const badgeId = c.advboxId ? ` (ID: ${c.advboxId})` : '';
        html += `
            <li>
                <button type="button" class="w-full text-left px-3 py-2 hover:bg-indigo-50 focus:bg-indigo-100 text-sm text-slate-800" onclick="selecionarCliente('${c.id}')">
                    ${c.nome}${badgeId}
                </button>
            </li>`;
    });
    html += '</ul>';

    dropdown.innerHTML = html;
    dropdown.classList.remove('hidden');
}

function filtrarClientes() {
    const query = document.getElementById('inputFilterCliente').value.trim().toLowerCase();
    const filtrados = clientesHistoricoCompletos.filter(c => c.nome.toLowerCase().includes(query) || (c.advboxId && c.advboxId.includes(query)));
    renderizarDropdownClientes(filtrados);
    const dropdown = document.getElementById('dropdownClientes');
    if (dropdown) {
        dropdown.classList.remove('hidden');
    }
}

function limparFiltroClientes() {
    const input = document.getElementById('inputFilterCliente');
    if (input) input.value = '';

    clienteIdAtual = null;
    atualizarDropdownClientes();
}

function selecionarCliente(id) {
    const cliente = clientesHistoricoCompletos.find(c => c.id === id);
    if (!cliente) return;

    clienteIdAtual = id;
    const input = document.getElementById('inputFilterCliente');
    if (input) input.value = cliente.nome;
    carregarDoHistorico(id, false);
}

function selecionarClientePorTexto() {
    const valor = document.getElementById('inputFilterCliente').value.trim();
    if (!valor) return;

    const historico = JSON.parse(localStorage.getItem('cs_historico')) || [];
    const cliente = historico.find(c => c.nome.toLowerCase() === valor.toLowerCase() || c.advboxId === valor);
    if (cliente) {
        selecionarCliente(cliente.id);
    }
}

function abrirBuscaCliente() {
    const historico = JSON.parse(localStorage.getItem('cs_historico')) || [];
    const listaElement = document.getElementById('listaClientes');

    if (historico.length === 0) {
        listaElement.classList.add('hidden');
        listaElement.innerHTML = '';
        alert('Nenhum cliente cadastrado disponível. Cadastre um cliente primeiro.');
        return;
    }

    let html = '<ul class="space-y-1 text-sm">';
    historico.forEach(cliente => {
        const badgeId = cliente.advboxId ? ` (ID: ${cliente.advboxId})` : '';
        html += `
            <li class="flex justify-between items-center rounded px-2 py-1 hover:bg-indigo-50">
                <span>${cliente.nome}${badgeId}</span>
                <button onclick="carregarDoHistorico('${cliente.id}', false)" class="text-indigo-600 hover:text-indigo-900 text-xs font-semibold">Selecionar</button>
            </li>`;
    });
    html += '</ul>';

    listaElement.innerHTML = html;
    listaElement.classList.remove('hidden');
}

// 3. LÓGICA DO CARROSSEL E RENDERIZAÇÃO
function renderizarChecklistBase() {
    const container = document.getElementById('checklistContainer');
    container.innerHTML = '';

    const categorias = [...new Set(tarefasBase.map(t => t.cat))];

    let html = '<div id="carouselWrapper" class="relative overflow-hidden">';

    categorias.forEach((cat, index) => {
        const tarefasDaCat = tarefasBase.filter(t => t.cat === cat);
        const isHidden = index === 0 ? '' : 'hidden';

        html += `
                    <div class="carousel-slide ${isHidden} animate-fade-in" data-index="${index}">
                        <div class="flex justify-between items-center mb-4 border-b pb-2">
                            <h4 class="font-bold text-slate-700">${cat}</h4>
                            <span class="text-xs font-semibold text-slate-500 bg-slate-200 px-2 py-1 rounded">Passo ${index + 1} de ${categorias.length}</span>
                        </div>
                        <div class="space-y-4">
                `;

        tarefasDaCat.forEach(tarefa => {
            html += `
                        <div class="p-4 rounded-lg bg-white border border-slate-200 shadow-sm transition-colors group">
                            <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-3 mb-3">
                                <div class="flex-1 pr-4">
                                    <span class="text-slate-800 font-medium group-hover:text-indigo-600 transition-colors">${tarefa.texto}</span>
                                </div>
                                <div class="flex items-center gap-2 shrink-0">
                                    <span class="text-xs text-slate-400 font-semibold uppercase tracking-wider hidden sm:inline mr-2">Nota:</span>
                                    <div class="flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-lg">
                                        <label class="cursor-pointer relative" title="0: Não começou">
                                            <input type="radio" name="nota_${tarefa.id}" value="0" data-label="${tarefa.texto}" onchange="calcularHealthScore(); salvarRascunho();" class="peer sr-only" checked>
                                            <div class="w-8 h-8 flex items-center justify-center rounded peer-checked:bg-red-500 peer-checked:text-white peer-checked:font-bold peer-checked:shadow-sm text-sm text-slate-600 hover:bg-slate-200 transition-all">0</div>
                                        </label>
                                        <label class="cursor-pointer relative" title="1: A começar">
                                            <input type="radio" name="nota_${tarefa.id}" value="1" data-label="${tarefa.texto}" onchange="calcularHealthScore(); salvarRascunho();" class="peer sr-only">
                                            <div class="w-8 h-8 flex items-center justify-center rounded peer-checked:bg-orange-500 peer-checked:text-white peer-checked:font-bold peer-checked:shadow-sm text-sm text-slate-600 hover:bg-slate-200 transition-all">1</div>
                                        </label>
                                        <label class="cursor-pointer relative" title="2: A organizar">
                                            <input type="radio" name="nota_${tarefa.id}" value="2" data-label="${tarefa.texto}" onchange="calcularHealthScore(); salvarRascunho();" class="peer sr-only">
                                            <div class="w-8 h-8 flex items-center justify-center rounded peer-checked:bg-amber-500 peer-checked:text-white peer-checked:font-bold peer-checked:shadow-sm text-sm text-slate-600 hover:bg-slate-200 transition-all">2</div>
                                        </label>
                                        <label class="cursor-pointer relative" title="3: Bom">
                                            <input type="radio" name="nota_${tarefa.id}" value="3" data-label="${tarefa.texto}" onchange="calcularHealthScore(); salvarRascunho();" class="peer sr-only">
                                            <div class="w-8 h-8 flex items-center justify-center rounded peer-checked:bg-emerald-500 peer-checked:text-white peer-checked:font-bold peer-checked:shadow-sm text-sm text-slate-600 hover:bg-slate-200 transition-all">3</div>
                                        </label>
                                        <label class="cursor-pointer relative" title="4: Ótimo">
                                            <input type="radio" name="nota_${tarefa.id}" value="4" data-label="${tarefa.texto}" onchange="calcularHealthScore(); salvarRascunho();" class="peer sr-only">
                                            <div class="w-8 h-8 flex items-center justify-center rounded peer-checked:bg-teal-500 peer-checked:text-white peer-checked:font-bold peer-checked:shadow-sm text-sm text-slate-600 hover:bg-slate-200 transition-all">4</div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div class="mt-2">
                                <input type="text" id="obs_${tarefa.id}" onchange="salvarRascunho()" placeholder="Adicionar observação sobre este ponto..." class="block w-full rounded border-slate-200 bg-slate-50 p-2 text-sm focus:bg-white focus:ring-indigo-600 focus:border-indigo-600 outline-none text-slate-600 placeholder:text-slate-400">
                            </div>
                        </div>
                    `;
        });

        html += `</div></div>`;
    });

    html += `
                <div class="flex justify-between items-center mt-6 pt-4 border-t border-slate-200">
                    <button id="btnPrevSlide" onclick="mudarSlide(-1)" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <i class="ph ph-arrow-left mr-1"></i> Anterior
                    </button>
                    <div class="flex gap-2" id="carouselDots">
                        ${categorias.map((_, i) => `<span onclick="pularParaSlide(${i})" class="w-3 h-3 rounded-full cursor-pointer hover:bg-indigo-400 ${i === 0 ? 'bg-indigo-600' : 'bg-slate-300'} transition-colors"></span>`).join('')}
                    </div>
                    <button id="btnNextSlide" onclick="mudarSlide(1)" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        Próximo <i class="ph ph-arrow-right ml-1"></i>
                    </button>
                </div>
            </div>`;

    container.innerHTML = html;
    atualizarBotoesCarousel();
}

function mudarSlide(direcao) {
    pularParaSlide(currentSlideIndex + direcao);
}

function pularParaSlide(indexAlvo) {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('#carouselDots span');

    slides[currentSlideIndex].classList.add('hidden');
    dots[currentSlideIndex].classList.remove('bg-indigo-600');
    dots[currentSlideIndex].classList.add('bg-slate-300');

    currentSlideIndex = indexAlvo;

    slides[currentSlideIndex].classList.remove('hidden');
    dots[currentSlideIndex].classList.remove('bg-slate-300');
    dots[currentSlideIndex].classList.add('bg-indigo-600');

    atualizarBotoesCarousel();
}

function atualizarBotoesCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    document.getElementById('btnPrevSlide').disabled = currentSlideIndex === 0;
    document.getElementById('btnNextSlide').disabled = currentSlideIndex === slides.length - 1;
}

// 4. PREENCHIMENTO E SALVAMENTO (RASCUNHO E HISTÓRICO)
function preencherFormulario(dados) {
    clienteIdAtual = dados.id || null;
    const inputBusca = document.getElementById('inputFilterCliente');
    if (inputBusca) {
        inputBusca.value = dados.nome || '';
    }

    document.getElementById('inputAdvboxId').value = dados.advboxId || '';
    document.getElementById('inputNome').value = dados.nome || '';
    document.getElementById('inputResponsavel').value = dados.responsavel || '';
    document.getElementById('inputIntimacoes').value = dados.intimacoes !== undefined ? dados.intimacoes : '';
    document.getElementById('inputUltimoAcesso').value = dados.ultimoAcesso || '';
    document.getElementById('inputTarefas').value = dados.tarefas || '';

    // Campos Select e afins
    document.getElementById('selectModelos').value = dados.modelos || '';
    document.getElementById('inputModelosQtd').value = dados.modelosQtd || '';

    document.getElementById('selectMetas').value = dados.metas || '';
    document.getElementById('inputMetasAreas').value = dados.metasAreas || '';

    document.getElementById('selectIntegracao').value = dados.integracao || '';
    document.getElementById('inputDiarios').value = dados.diarios || '';

    document.getElementById('selectFalhas').value = dados.falhas || '';
    document.getElementById('inputFalhasQtd').value = dados.falhasQtd || '';
    document.getElementById('inputFalhasQuais').value = dados.falhasQuais || '';
    document.getElementById('inputFalhasQual').value = dados.falhasQual || '';

    document.getElementById('inputObservacoes').value = dados.observacoes || '';

    // Dispara toggles para mostrar/esconder inputs
    toggleModelos();
    toggleMetas();
    toggleFalhas();

    document.querySelectorAll('#checklistContainer input[type="radio"][value="0"]').forEach(r => r.checked = true);
    document.querySelectorAll('#checklistContainer input[type="text"]').forEach(input => input.value = '');

    if (dados.notasTarefas && Object.keys(dados.notasTarefas).length > 0) {
        for (const [taskId, nota] of Object.entries(dados.notasTarefas)) {
            const radio = document.querySelector(`input[name="nota_${taskId}"][value="${nota}"]`);
            if (radio) radio.checked = true;
        }
    }

    if (dados.obsTarefas && Object.keys(dados.obsTarefas).length > 0) {
        for (const [taskId, obs] of Object.entries(dados.obsTarefas)) {
            const inputObs = document.getElementById(`obs_${taskId}`);
            if (inputObs) inputObs.value = obs;
        }
    }
}

function obterDadosAtuaisRascunho() {
    const notas = {};
    const obs = {};

    document.querySelectorAll('#checklistContainer input[type="radio"]:checked').forEach(radio => {
        const taskId = radio.name.replace('nota_', '');
        notas[taskId] = parseInt(radio.value);

        const obsInput = document.getElementById(`obs_${taskId}`);
        if (obsInput && obsInput.value.trim() !== '') {
            obs[taskId] = obsInput.value;
        }
    });

    return {
        id: clienteIdAtual,
        advboxId: document.getElementById('inputAdvboxId').value,
        nome: document.getElementById('inputNome').value,
        responsavel: document.getElementById('inputResponsavel').value,
        intimacoes: document.getElementById('inputIntimacoes').value,
        ultimoAcesso: document.getElementById('inputUltimoAcesso').value,
        tarefas: document.getElementById('inputTarefas').value,
        modelos: document.getElementById('selectModelos').value,
        modelosQtd: document.getElementById('inputModelosQtd').value,
        metas: document.getElementById('selectMetas').value,
        metasAreas: document.getElementById('inputMetasAreas').value,
        integracao: document.getElementById('selectIntegracao').value,
        diarios: document.getElementById('inputDiarios').value,
        falhas: document.getElementById('selectFalhas').value,
        falhasQtd: document.getElementById('inputFalhasQtd').value,
        falhasQuais: document.getElementById('inputFalhasQuais').value,
        falhasQual: document.getElementById('inputFalhasQual').value,
        observacoes: document.getElementById('inputObservacoes').value,
        notasTarefas: notas,
        obsTarefas: obs
    };
}

function salvarRascunho() {
    const rascunho = obterDadosAtuaisRascunho();
    localStorage.setItem('cs_rascunho', JSON.stringify(rascunho));
}

function salvarNoHistorico(silencioso = false) {
    const rascunho = obterDadosAtuaisRascunho();

    if (!rascunho.nome.trim()) {
        if (!silencioso) alert('Preencha pelo menos o Nome do Escritório para guardar no histórico.');
        document.getElementById('inputNome').focus();
        return;
    }

    let scoreAbsoluto = 0;
    const totalMaximo = tarefasBase.length * 4;
    Object.values(rascunho.notasTarefas).forEach(n => scoreAbsoluto += n);
    const scorePercentual = Math.round((scoreAbsoluto / totalMaximo) * 100);

    const registroFinal = {
        ...rascunho,
        id: rascunho.id || Date.now().toString(),
        dataSalvamento: new Date().toISOString(),
        score: scorePercentual
    };

    let historico = JSON.parse(localStorage.getItem('cs_historico')) || [];

    if (rascunho.id) {
        const index = historico.findIndex(c => c.id === rascunho.id);
        if (index >= 0) {
            historico[index] = registroFinal;
        } else {
            historico.push(registroFinal);
        }
    } else {
        const indexExistente = historico.findIndex(c => c.nome.toLowerCase() === rascunho.nome.toLowerCase());
        if (indexExistente >= 0) {
            if (silencioso || confirm(`Já existe um registo para o cliente "${rascunho.nome}". Deseja atualizar o registo existente?`)) {
                registroFinal.id = historico[indexExistente].id;
                historico[indexExistente] = registroFinal;
                clienteIdAtual = registroFinal.id;
            } else {
                historico.push(registroFinal);
                clienteIdAtual = registroFinal.id;
            }
        } else {
            historico.push(registroFinal);
            clienteIdAtual = registroFinal.id;
        }
    }

    localStorage.setItem('cs_historico', JSON.stringify(historico));

    salvarRascunho();
    atualizarDropdownClientes();
    renderizarHistorico();

    if (!silencioso) {
        const btnSalvar = document.querySelector('button[onclick="salvarNoHistorico()"]');
        if (btnSalvar) {
            const conteudoOriginal = btnSalvar.innerHTML;
            btnSalvar.innerHTML = `<i class="ph ph-check-circle text-lg"></i> Guardado com Sucesso!`;
            btnSalvar.classList.replace('bg-indigo-600', 'bg-emerald-600');
            btnSalvar.classList.replace('hover:bg-indigo-700', 'hover:bg-emerald-700');
            setTimeout(() => {
                btnSalvar.innerHTML = conteudoOriginal;
                btnSalvar.classList.replace('bg-emerald-600', 'bg-indigo-600');
                btnSalvar.classList.replace('hover:bg-emerald-700', 'hover:bg-indigo-700');

                // Limpa o formulário e mantém na aba checklist pronta para um novo cliente
                limparFormulario(false, true);
            }, 1500);
        }
    }
}

function limparFormulario(pedirConfirmacao = true, mudarAba = true) {
    if (!pedirConfirmacao || confirm('Tem certeza que deseja limpar a tela?')) {
        clienteIdAtual = null;
        const inputBusca = document.getElementById('inputFilterCliente');
        if (inputBusca) inputBusca.value = '';

        preencherFormulario({});

        const selectsPadrao = ['selectModelos', 'selectMetas', 'selectIntegracao', 'selectFalhas'];
        selectsPadrao.forEach(id => {
            const sel = document.getElementById(id);
            if (sel) sel.selectedIndex = 0;
        });

        if (currentSlideIndex > 0) pularParaSlide(0);

        // Remove rascunho antigo para garantir novos relatórios com placeholder
        localStorage.removeItem('cs_rascunho');

        salvarRascunho();
        calcularHealthScore();

        // Oculta o relatório de forma segura para não criar loop de funções
        document.getElementById('mainApp').style.display = 'block';
        document.getElementById('relatorio-print').classList.remove('show-for-pdf');

        if (mudarAba) {
            switchTab('checklist');
            document.getElementById('inputNome').focus();
        }
    }
}

// 5. LÓGICA DA ABA DE HISTÓRICO E ANÁLISE
function renderizarHistorico() {
    const historico = JSON.parse(localStorage.getItem('cs_historico')) || [];
    const tbody = document.getElementById('historicoTabela');
    const contClientes = document.getElementById('contadorClientes');

    tbody.innerHTML = '';
    contClientes.innerText = `${historico.length} clientes`;

    if (historico.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-8 text-center text-sm text-slate-500 italic">Nenhum escritório avaliado ainda. Faça um pré-cadastro ou preencha um checklist.</td></tr>`;
    } else {
        historico.sort((a, b) => new Date(b.dataSalvamento) - new Date(a.dataSalvamento)).forEach(cliente => {

            let badgeClass = "bg-slate-100 text-slate-800";
            let scoreText = cliente.score + "%";

            if (cliente.score === 0) {
                badgeClass = "bg-slate-200 text-slate-600 border border-slate-300";
                scoreText = "Pendente";
            } else if (cliente.score < 40) badgeClass = "bg-red-100 text-red-800";
            else if (cliente.score < 60) badgeClass = "bg-amber-100 text-amber-800";
            else if (cliente.score < 80) badgeClass = "bg-emerald-100 text-emerald-800";
            else badgeClass = "bg-teal-100 text-teal-800";

            const dataFormatada = new Date(cliente.dataSalvamento).toLocaleDateString('pt-BR');
            const advId = cliente.advboxId || '-';

            tbody.innerHTML += `
                        <tr class="hover:bg-slate-50 transition-colors">
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">${cliente.nome}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${advId}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${cliente.responsavel || '-'}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-center">${dataFormatada}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-center">
                                <span class="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${badgeClass}">${scoreText}</span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div class="flex items-center justify-end gap-3">
                                    <button onclick="carregarDoHistorico('${cliente.id}')" class="text-indigo-600 hover:text-indigo-900 flex items-center gap-1" title="Editar Checklist">
                                        <i class="ph ph-pencil-simple text-lg"></i> Editar
                                    </button>
                                    <button onclick="excluirDoHistorico('${cliente.id}')" class="text-red-500 hover:text-red-700 flex items-center gap-1" title="Excluir Cliente">
                                        <i class="ph ph-trash text-lg"></i> Excluir
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
        });
    }

    calcularGargalos(historico);
}

function calcularGargalos(historico) {
    const containerGargalos = document.getElementById('containerGargalos');
    if (historico.length === 0) {
        containerGargalos.innerHTML = '<p class="col-span-full text-sm text-slate-500 italic">Sem dados suficientes para análise de gargalos.</p>';
        return;
    }

    const contagemRuins = {};
    const totalAvaliados = historico.length;

    historico.forEach(cliente => {
        if (cliente.notasTarefas && cliente.score > 0) {
            for (const [taskId, nota] of Object.entries(cliente.notasTarefas)) {
                if (nota < 3) {
                    contagemRuins[taskId] = (contagemRuins[taskId] || 0) + 1;
                }
            }
        }
    });

    const arrayGargalos = Object.entries(contagemRuins)
        .map(([id, frequencia]) => {
            const tarefaRef = tarefasBase.find(t => t.id === id);
            return {
                texto: tarefaRef ? tarefaRef.texto : id,
                frequencia: frequencia,
                percentual: Math.round((frequencia / totalAvaliados) * 100)
            };
        })
        .sort((a, b) => b.frequencia - a.frequencia);

    containerGargalos.innerHTML = '';

    if (arrayGargalos.length === 0) {
        containerGargalos.innerHTML = '<p class="col-span-full text-sm text-emerald-600 font-medium"><i class="ph ph-check-circle"></i> Excelente! Nenhum ponto crítico mapeado na sua base de clientes avaliada.</p>';
    } else {
        arrayGargalos.forEach((gargalo, index) => {
            let barColor = "bg-amber-400";
            if (gargalo.percentual > 70) barColor = "bg-red-500";

            containerGargalos.innerHTML += `
                        <div class="p-4 rounded-lg bg-slate-50 border border-slate-200">
                            <div class="flex justify-between items-start mb-2">
                                <span class="text-xs font-bold text-slate-400">#${index + 1}</span>
                                <span class="text-xs font-bold text-slate-600 bg-white px-2 py-0.5 rounded shadow-sm">${gargalo.frequencia} clientes (${gargalo.percentual}%)</span>
                            </div>
                            <p class="text-sm font-semibold text-slate-800 mb-3 h-10 line-clamp-2" title="${gargalo.texto}">${gargalo.texto}</p>
                            <div class="w-full bg-slate-200 rounded-full h-1.5">
                                <div class="${barColor} h-1.5 rounded-full" style="width: ${gargalo.percentual}%"></div>
                            </div>
                        </div>
                    `;
        });
    }
}

function excluirDoHistorico(id) {
    if (confirm('Tem a certeza de que deseja excluir permanentemente o registo deste cliente do histórico?')) {
        let historico = JSON.parse(localStorage.getItem('cs_historico')) || [];
        historico = historico.filter(c => c.id !== id);
        localStorage.setItem('cs_historico', JSON.stringify(historico));

        renderizarHistorico();
        atualizarDropdownClientes();

        if (clienteIdAtual === id) {
            limparFormulario(false, false);
        }
    }
}

function carregarDoHistorico(id, mudarAba = true) {
    let historico = JSON.parse(localStorage.getItem('cs_historico')) || [];
    const cliente = historico.find(c => c.id === id);
    if (cliente) {
        preencherFormulario(cliente);
        salvarRascunho();
        calcularHealthScore();
        if (mudarAba) switchTab('checklist', true);
        function calcularHealthScore() {
            let scoreAbsoluto = 0;
            const totalMaximo = tarefasBase.length * 4;

            document.querySelectorAll('#checklistContainer input[type="radio"]:checked').forEach(radio => {
                scoreAbsoluto += parseInt(radio.value);
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
                card.classList.add("bg-red-50", "border-red-200");
                iconBox.classList.add("bg-red-100", "text-red-600");
                icon.classList.add("ph-warning-octagon");
                display.className = "text-xl font-bold text-red-700";
                classificacao = "BAD";
            } else if (percentual < 60) {
                card.classList.add("bg-amber-50", "border-amber-200");
                iconBox.classList.add("bg-amber-100", "text-amber-600");
                icon.classList.add("ph-warning");
                display.className = "text-xl font-bold text-amber-700";
                classificacao = "POOR";
            } else if (percentual < 80) {
                card.classList.add("bg-emerald-50", "border-emerald-200");
                iconBox.classList.add("bg-emerald-100", "text-emerald-600");
                icon.classList.add("ph-check-circle");
                display.className = "text-xl font-bold text-emerald-700";
                classificacao = "GOOD";
            } else {
                card.classList.add("bg-teal-50", "border-teal-200");
                iconBox.classList.add("bg-teal-100", "text-teal-600");
                icon.classList.add("ph-star");
                display.className = "text-xl font-bold text-teal-700";
                classificacao = "EXCELENT";
            }

            display.innerHTML = `${absoluto} pts <span class="text-sm font-normal">(${percentual}%)</span> - ${classificacao}`;
        }

        // 7. GERAÇÃO DO RELATÓRIO PDF
        function gerarRelatorio() {
            const nomeCliente = document.getElementById('inputNome').value;
            const advboxId = document.getElementById('inputAdvboxId').value;

            if (!nomeCliente.trim()) {
                alert('Por favor, preencha o Nome do Escritório antes de gerar o relatório.');
                document.getElementById('inputNome').focus();
                return;
            }

            salvarNoHistorico(true);

            document.getElementById('relClienteNome').innerText = nomeCliente;
            document.getElementById('relData').innerText = new Date().toLocaleDateString('pt-BR');

            const relAdvboxIdEl = document.getElementById('relAdvboxId');
            if (advboxId) {
                relAdvboxIdEl.innerText = `(ID: ${advboxId})`;
                relAdvboxIdEl.classList.remove('hidden');
            } else {
                relAdvboxIdEl.classList.add('hidden');
            }

            const rascunho = obterDadosAtuaisRascunho();

            document.getElementById('relIntimacoes').innerText = rascunho.intimacoes || "0";
            document.getElementById('relResponsavel').innerText = rascunho.responsavel || "Não definido";
            document.getElementById('relTarefas').innerText = rascunho.tarefas || "0";

            // Valores formatados condicionalmente
            document.getElementById('relModelos').innerText = rascunho.modelos === 'Sim' ? `Sim (${rascunho.modelosQtd || '0'} modelos)` : 'Não';
            document.getElementById('relMetas').innerText = rascunho.metas === 'Sim' ? `Sim (Áreas: ${rascunho.metasAreas || '-'})` : 'Não';
            document.getElementById('relIntegracao').innerText = rascunho.integracao === 'Sim' ? 'Sim' : 'Não';
            document.getElementById('relDiarios').innerText = rascunho.diarios || "Não informado";
            document.getElementById('relObservacoes').innerText = rascunho.observacoes || "Nenhuma observação registrada.";

            // Falhas
            const liFalhas = document.getElementById('liFalhas');
            if (rascunho.falhas === 'Sim') {
                document.getElementById('relFalhas').innerText = `Sim (${rascunho.falhasQtd || '0'} sistemas: ${rascunho.falhasQuais || '-'} - Falha: ${rascunho.falhasQual || '-'})`;
                liFalhas.classList.remove('hidden');
            } else {
                liFalhas.classList.add('hidden');
            }

            const dataAcesso = rascunho.ultimoAcesso;
            let dataFormatada = "Não registrado";
            if (dataAcesso) {
                const [ano, mes, dia] = dataAcesso.split('-');
                dataFormatada = `${dia}/${mes}/${ano}`;
            }
            document.getElementById('relUltimoAcesso').innerText = dataFormatada;

            let fortes = [];
            let melhorias = [];
            let observacoesAcoes = [];

            document.querySelectorAll('#checklistContainer input[type="radio"]:checked').forEach(radio => {
                const tarefaId = radio.name.replace('nota_', '');
                const tarefaNome = radio.getAttribute('data-label');
                const nota = parseInt(radio.value);
                const obsInput = document.getElementById(`obs_${tarefaId}`);
                const obsTexto = obsInput && obsInput.value.trim() !== '' ? obsInput.value.trim() : null;

                if (nota >= 3) {
                    fortes.push(tarefaNome.toLowerCase());
                } else {
                    melhorias.push(tarefaNome.toLowerCase());
                    if (obsTexto) {
                        observacoesAcoes.push(`<strong>${tarefaNome}:</strong> ${obsTexto}`);
                    }
                }
            });

            let txtFortes = fortes.length > 0
                ? `O escritório apresentou um bom nível de maturidade e adoção nos seguintes processos: <strong>${fortes.join(', ')}</strong>.`
                : `<span class="italic text-slate-500">Ainda não há marcos consolidados avaliados com desempenho ideal.</span>`;

            let txtMelhorias = melhorias.length > 0
                ? `Para garantir o sucesso contínuo e a evolução do escritório, mapeamos que as próximas etapas devem focar em aprimorar: <strong>${melhorias.join(', ')}</strong>.`
                : `<span class="italic text-slate-500">Parabéns! Todos os marcos avaliados estão com excelentes indicadores de uso.</span>`;

            if (observacoesAcoes.length > 0) {
                txtMelhorias += `<br><br><span class="font-bold text-slate-800">Ações Específicas e Comentários:</span><br>` + observacoesAcoes.map(obs => `<span class="block mt-2 pl-3 border-l-2 border-red-200">${obs}</span>`).join('');
            }

            document.getElementById('textoPontosFortes').innerHTML = txtFortes;
            document.getElementById('textoPontosMelhoria').innerHTML = txtMelhorias;

            document.getElementById('mainApp').style.display = 'none';
            const relatorio = document.getElementById('relatorio-print');
            relatorio.classList.add('show-for-pdf');
        }

        function fecharRelatorio() {
            // Apenas limpa a tela e garante que volta para a aba checklist limpa
            limparFormulario(false, true);
        }

        function baixarPDF() {
            const elemento = document.getElementById('relatorio-print');
            const clienteNome = document.getElementById('relClienteNome').innerText.replace(/\s+/g, '_');

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

            html2pdf().set(opt).from(elemento).save().then(() => {
                document.getElementById('btnBaixarPDF').style.display = 'flex';
                btnVoltar.style.display = 'block';
            });
        }
    }
}