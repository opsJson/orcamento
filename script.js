if (localStorage.getItem("version") != "2.0") {
    localStorage.clear();
    localStorage.setItem("version", "2.0");
}

tailwind.config = {
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				primary: {
					50: '#f0f9ff',
					100: '#e0f2fe',
					200: '#bae6fd',
					300: '#7dd3fc',
					400: '#38bdf8',
					500: '#0ea5e9',
					600: '#0284c7',
					700: '#0369a1',
					800: '#075985',
					900: '#0c4a6e',
				}
			}
		}
	}
}

// Constantes e variáveis globais
const { jsPDF } = window.jspdf;
const estadosBR = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];
const ORCAMENTOS_KEY = 'orcamentos';

let orcamentoItens = [];
let totalOrcamento = 0;
let editandoClienteId = null;
let editandoProdutoId = null;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    loadBrazilianStates();
    carregarDadosIniciais();
    showSection('orcamento');
    
    // Carrega dados salvos
    carregarClientes();
    carregarProdutos();
    atualizarDashboard();
    carregarHistoricoOrcamentos();
});

// Funções de UI
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    document.getElementById(sectionId).classList.remove('hidden');
    
    // Atualizar tabs ativas
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('border-primary-500', 'text-primary-600', 'dark:text-primary-400');
        btn.classList.add('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300', 'dark:text-gray-400', 'dark:hover:text-gray-300');
    });
    
    const activeBtn = document.querySelector(`.tab-button[data-target="${sectionId}"]`);
    if (activeBtn) {
        activeBtn.classList.add('border-primary-500', 'text-primary-600', 'dark:text-primary-400');
        activeBtn.classList.remove('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300', 'dark:text-gray-400', 'dark:hover:text-gray-300');
    }
}

// Funções da Empresa
function salvarEmpresa(event) {
    event.preventDefault();
    
    const logoInput = document.getElementById('logoEmpresa');
    const logoPreview = document.getElementById('logoPreview');
    
    const empresa = {
        nome: document.getElementById('empresaNome').value,
        cnpj: document.getElementById('empresaCnpj').value,
        endereco: document.getElementById('empresaEndereco').value,
        cidade: document.getElementById('empresaCidade').value,
        estado: document.getElementById('empresaEstado').value,
        telefone: document.getElementById('empresaTelefone').value,
        email: document.getElementById('empresaEmail').value,
        cep: document.getElementById('empresaCep').value,
        site: document.getElementById('empresaSite').value,
        inscricaoEstadual: document.getElementById('empresaInscricaoEstadual').value,
        logo: null,
        dataAtualizacao: new Date().toISOString()
    };
    
    // Se há um arquivo selecionado, converte para base64
    if (logoInput.files && logoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            empresa.logo = e.target.result;
            localStorage.setItem('minhaEmpresa', JSON.stringify(empresa));
            alert('Informações da empresa salvas com sucesso!');
            carregarDadosEmpresa();
        };
        reader.readAsDataURL(logoInput.files[0]);
    } else {
        // Se já existe uma logo salva e não foi selecionado novo arquivo, mantém a existente
        const empresaExistente = JSON.parse(localStorage.getItem('minhaEmpresa')) || {};
        empresa.logo = empresaExistente.logo || null;
        localStorage.setItem('minhaEmpresa', JSON.stringify(empresa));
        alert('Informações da empresa salvas com sucesso!');
        carregarDadosEmpresa();
    }
}

function carregarDadosEmpresa() {
    const empresa = JSON.parse(localStorage.getItem('minhaEmpresa')) || {};
    
    document.getElementById('empresaNome').value = empresa.nome || '';
    document.getElementById('empresaCnpj').value = empresa.cnpj || '';
    document.getElementById('empresaEndereco').value = empresa.endereco || '';
    document.getElementById('empresaCidade').value = empresa.cidade || '';
    document.getElementById('empresaEstado').value = empresa.estado || '';
    document.getElementById('empresaTelefone').value = empresa.telefone || '';
    document.getElementById('empresaEmail').value = empresa.email || '';
    document.getElementById('empresaCep').value = empresa.cep || '';
    document.getElementById('empresaSite').value = empresa.site || '';
    document.getElementById('empresaInscricaoEstadual').value = empresa.inscricaoEstadual || '';
    
    // Logo
    const logoPreview = document.getElementById('logoPreview');
    if (empresa.logo) {
        logoPreview.src = empresa.logo;
        logoPreview.style.display = 'block';
        document.getElementById('logoPlaceholder').style.display = 'none';
    }
}

// Funções de Clientes
function openClientModal(cliente = null) {
    const modal = document.getElementById('clientModal');
    const title = document.getElementById('clientModalTitle');
    const form = document.getElementById('formCliente');
    
    if (cliente) {
        title.textContent = 'Editar Cliente';
        editandoClienteId = cliente.id;
        
        // Preencher formulário
        document.getElementById('clienteId').value = cliente.id;
        document.getElementById('clienteNome').value = cliente.nome;
        document.getElementById('clienteCnpj').value = cliente.cnpj;
        document.getElementById('clienteEndereco').value = cliente.endereco;
        document.getElementById('clienteCidade').value = cliente.cidade;
        document.getElementById('clienteEstado').value = cliente.estado;
        document.getElementById('clienteTelefone').value = cliente.telefone;
        document.getElementById('clienteEmail').value = cliente.email;
        document.getElementById('clienteCep').value = cliente.cep || '';
        document.getElementById('clienteSite').value = cliente.site || '';
        document.getElementById('clienteInscricaoEstadual').value = cliente.inscricaoEstadual || '';
    } else {
        title.textContent = 'Novo Cliente';
        editandoClienteId = null;
        form.reset();
    }
    
    modal.classList.remove('hidden');
	modal.querySelector("#clienteNome").focus();
}

function closeClientModal() {
    document.getElementById('clientModal').classList.add('hidden');
}

function salvarCliente(event) {
    if (event) event.preventDefault();
    
    const cliente = {
        id: editandoClienteId || Date.now().toString(),
        nome: document.getElementById('clienteNome').value,
        cnpj: document.getElementById('clienteCnpj').value,
        endereco: document.getElementById('clienteEndereco').value,
        cidade: document.getElementById('clienteCidade').value,
        estado: document.getElementById('clienteEstado').value,
        telefone: document.getElementById('clienteTelefone').value,
        email: document.getElementById('clienteEmail').value,
        cep: document.getElementById('clienteCep').value,
        site: document.getElementById('clienteSite').value,
        inscricaoEstadual: document.getElementById('clienteInscricaoEstadual').value
    };
    
    let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    
    if (editandoClienteId) {
        clientes = clientes.map(c => c.id === editandoClienteId ? cliente : c);
    } else {
        clientes.push(cliente);
    }
    
    localStorage.setItem('clientes', JSON.stringify(clientes));
    closeClientModal();
    carregarClientes();
    atualizarDashboard();
    
    alert('Cliente salvo com sucesso!');
}

function carregarClientes() {
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    const tbody = document.getElementById('clientesTableBody');
    const select = document.getElementById('clienteSelect');
    
    // Limpar tabela e select
    tbody.innerHTML = '';
    select.innerHTML = '<option value="">Selecione um cliente</option>';
    
    if (clientes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    Nenhum cliente cadastrado
                </td>
            </tr>
        `;
        return;
    }
    
    // Popular tabela
    clientes.forEach(cliente => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50 dark:hover:bg-gray-700';
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${cliente.nome}</td>
            <td class="px-6 py-4 whitespace-nowrap">${formatarCNPJ(cliente.cnpj)}</td>
            <td class="px-6 py-4 whitespace-nowrap">${cliente.cidade}/${cliente.estado}</td>
            <td class="px-6 py-4 whitespace-nowrap">${cliente.telefone || '-'}<br>${cliente.email || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onclick="editarCliente('${cliente.id}')" class="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-3">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="excluirCliente('${cliente.id}')" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
        
        // Popular select
        const option = document.createElement('option');
        option.value = cliente.id;
        option.textContent = `${cliente.nome} - ${formatarCNPJ(cliente.cnpj)}`;
        select.appendChild(option);
    });
}

function editarCliente(id) {
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    const cliente = clientes.find(c => c.id === id);
    if (cliente) openClientModal(cliente);
}

function excluirCliente(id) {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
        let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
        clientes = clientes.filter(c => c.id !== id);
        localStorage.setItem('clientes', JSON.stringify(clientes));
        carregarClientes();
        atualizarDashboard();
        alert('Cliente excluído com sucesso!');
    }
}

// Funções de Produtos
function openProductModal(produto = null) {
    const modal = document.getElementById('productModal');
    const title = document.getElementById('productModalTitle');
    const form = document.getElementById('formProduto');
    
    if (produto) {
        title.textContent = 'Editar Produto';
        editandoProdutoId = produto.id;
        
        // Preencher formulário
        document.getElementById('produtoId').value = produto.id;
        document.getElementById('produtoCodigo').value = produto.codigo;
        document.getElementById('produtoDescricao').value = produto.descricao;
        document.getElementById('produtoPreco').value = produto.preco;
        document.getElementById('produtoNcm').value = produto.ncm;
        document.getElementById('produtoUnidade').value = produto.unidade;
    } else {
        title.textContent = 'Novo Produto';
        editandoProdutoId = null;
        form.reset();
    }
    
    modal.classList.remove('hidden');
	modal.querySelector("#produtoCodigo").focus();
}

function closeProductModal() {
    document.getElementById('productModal').classList.add('hidden');
}

function salvarProduto(event) {
    if (event) event.preventDefault();
    
    const produto = {
        id: editandoProdutoId || Date.now().toString(),
        codigo: document.getElementById('produtoCodigo').value,
        descricao: document.getElementById('produtoDescricao').value,
        preco: parseFloat(document.getElementById('produtoPreco').value),
        ncm: document.getElementById('produtoNcm').value,
        unidade: document.getElementById('produtoUnidade').value,
    };
    
    let produtos = JSON.parse(localStorage.getItem('produtos')) || [];
    
    if (editandoProdutoId) {
        produtos = produtos.map(p => p.id === editandoProdutoId ? produto : p);
    } else {
        produtos.push(produto);
    }
    
    localStorage.setItem('produtos', JSON.stringify(produtos));
    closeProductModal();
    carregarProdutos();
    atualizarDashboard();
    
    alert('Produto salvo com sucesso!');
}

function carregarProdutos() {
    const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
    const tbody = document.getElementById('produtosTableBody');
    const select = document.getElementById('produtoSelect');
    
    // Limpar tabela e select
    tbody.innerHTML = '';
    select.innerHTML = '<option value="">Selecione um produto</option>';
    
    if (produtos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    Nenhum produto cadastrado
                </td>
            </tr>
        `;
        return;
    }
    
    // Popular tabela
    produtos.forEach(produto => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50 dark:hover:bg-gray-700';
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${produto.codigo}</td>
            <td class="px-6 py-4">${produto.descricao}</td>
            <td class="px-6 py-4 whitespace-nowrap">R$ ${formatarMoeda(produto.preco)}</td>
            <td class="px-6 py-4 whitespace-nowrap">${produto.ncm || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onclick="editarProduto('${produto.id}')" class="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-3">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="excluirProduto('${produto.id}')" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
        
        // Popular select
        const option = document.createElement('option');
        option.value = produto.id;
        option.textContent = `${produto.codigo} - ${produto.descricao} (R$ ${formatarMoeda(produto.preco)})`;
        option.dataset.preco = produto.preco;
        select.appendChild(option);
    });
}

function editarProduto(id) {
    const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
    const produto = produtos.find(p => p.id === id);
    if (produto) openProductModal(produto);
}

function excluirProduto(id) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        let produtos = JSON.parse(localStorage.getItem('produtos')) || [];
        produtos = produtos.filter(p => p.id !== id);
        localStorage.setItem('produtos', JSON.stringify(produtos));
        carregarProdutos();
        atualizarDashboard();
        alert('Produto excluído com sucesso!');
    }
}

// Funções de Orçamento
function adicionarItem() {
    const produtoSelect = document.getElementById('produtoSelect');
    const quantidadeInput = document.getElementById('quantidade');
    
    const produtoId = produtoSelect.value;
    const quantidade = parseInt(quantidadeInput.value) || 1;
    
    if (!produtoId) {
        alert('Selecione um produto');
        return;
    }
    
    if (quantidade <= 0) {
        alert('Quantidade deve ser maior que zero');
        return;
    }
    
    const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
    const produto = produtos.find(p => p.id === produtoId);
    
    if (!produto) {
        alert('Produto não encontrado');
        return;
    }
    
    // Verificar se já existe no orçamento
    const itemExistente = orcamentoItens.find(item => item.produto.id === produtoId);
    
    if (itemExistente) {
        itemExistente.quantidade += quantidade;
        itemExistente.total = itemExistente.quantidade * itemExistente.produto.preco;
    } else {
        orcamentoItens.push({
            produto,
            quantidade,
            total: quantidade * produto.preco
        });
    }
    
    // Atualizar total e tabela
    calcularTotal();
    atualizarTabelaItens();
    
    // Resetar seleção
    produtoSelect.value = '';
    quantidadeInput.value = 1;
    produtoSelect.focus();
}

function removerItem(index) {
    orcamentoItens.splice(index, 1);
    calcularTotal();
    atualizarTabelaItens();
}

function calcularTotal() {
    totalOrcamento = orcamentoItens.reduce((sum, item) => sum + item.total, 0);
    document.getElementById('totalOrcamento').textContent = formatarMoeda(totalOrcamento);
}

function atualizarTabelaItens() {
    const tbody = document.querySelector('#itensOrcamento tbody');
    tbody.innerHTML = '';
    
    if (orcamentoItens.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    Nenhum item adicionado
                </td>
            </tr>
        `;
        return;
    }
    
    orcamentoItens.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50 dark:hover:bg-gray-700';
        tr.innerHTML = `
            <td class="px-6 py-4">${item.produto.descricao}</td>
            <td class="px-6 py-4 whitespace-nowrap">R$ ${formatarMoeda(item.produto.preco)}</td>
            <td class="px-6 py-4 whitespace-nowrap">${item.quantidade}</td>
            <td class="px-6 py-4 whitespace-nowrap">R$ ${formatarMoeda(item.total)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onclick="removerItem(${index})" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Funções do Histórico
function carregarHistoricoOrcamentos() {
    const historico = JSON.parse(localStorage.getItem(ORCAMENTOS_KEY)) || [];
    const tbody = document.getElementById('historicoTableBody');
    
    tbody.innerHTML = '';
    
    if (historico.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    Nenhum orçamento encontrado
                </td>
            </tr>
        `;
        return;
    }
    
    historico.forEach(orc => {
        const data = new Date(orc.data);
        const dataFormatada = data.toLocaleDateString('pt-BR');
        
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50 dark:hover:bg-gray-700';
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${orc.id}</td>
            <td class="px-6 py-4">${orc.clienteNome}</td>
            <td class="px-6 py-4 whitespace-nowrap">${dataFormatada}</td>
            <td class="px-6 py-4 whitespace-nowrap">R$ ${formatarMoeda(orc.total)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onclick="visualizarOrcamento('${orc.id}')" class="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors mr-2">
                    <i class="fas fa-eye mr-1"></i> Visualizar
                </button>
                <button onclick="baixarOrcamentoNovamente('${orc.id}')" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                    <i class="fas fa-download mr-1"></i> Baixar
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function visualizarOrcamento(id) {
    const historico = JSON.parse(localStorage.getItem(ORCAMENTOS_KEY)) || [];
    const orcamento = historico.find(o => o.id === id);
    
    if (!orcamento) {
        alert('Orçamento não encontrado');
        return;
    }
    
    // Recriar o PDF para visualização
    gerarPdfParaVisualizacao(orcamento);
}

function baixarOrcamentoNovamente(id) {
    const historico = JSON.parse(localStorage.getItem(ORCAMENTOS_KEY)) || [];
    const orcamento = historico.find(o => o.id === id);
    
    if (!orcamento) {
        alert('Orçamento não encontrado');
        return;
    }
    
    // Recriar o PDF para download
    gerarPdfParaDownload(orcamento);
}

//funções de PDF
function gerarPdfBase(orcamento, options = {}) {
    const { saveToHistory = false } = options;
    const cliente = JSON.parse(localStorage.getItem('clientes')).find(c => c.id === orcamento.clienteId);
    const empresa = JSON.parse(localStorage.getItem('minhaEmpresa')) || {};
    
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margem = 40;
    let y = 40;

    // Função auxiliar para converter texto para maiúsculas
    const toUpper = (text) => text ? text.toString().toUpperCase() : '';

    // Adicionar logo se existir
    if (empresa.logo) {
        try {
            // Definir limites máximos para o logo
            const MAX_WIDTH = 200;  // Largura máxima em pontos
            const MAX_HEIGHT = 120;   // Altura máxima em pontos
            
            // Criar elemento de imagem para obter dimensões originais
            const img = new Image();
            img.src = empresa.logo;
            
            // Calcular proporções mantendo aspect ratio
            let width = img.width;
            let height = img.height;
            
            if (width > MAX_WIDTH) {
                const ratio = MAX_WIDTH / width;
                width = MAX_WIDTH;
                height = height * ratio;
            }
            
            if (height > MAX_HEIGHT) {
                const ratio = MAX_HEIGHT / height;
                height = MAX_HEIGHT;
                width = width * ratio;
            }
            
            // Posicionar o logo no canto superior direito (sem afetar o Y do conteúdo)
            const logoX = doc.internal.pageSize.width - margem - width;
            const logoY = margem;
            
            doc.addImage(empresa.logo, 'JPEG', logoX, logoY, width, height);
            
            // Não incrementar o Y aqui (remova esta linha)
            // y += height + 10; // ← REMOVER ESTA LINHA
            
        } catch (e) {
            console.error('Erro ao adicionar logo:', e);
        }
    }

    // Número do orçamento
    doc.setFontSize(12);
    doc.setTextColor(40);
    doc.text(toUpper(`ORÇAMENTO Nº ${orcamento.id}`), margem, y);

    // Nome da empresa em vermelho
    y += 30;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(204, 51, 51);
    doc.text(toUpper(empresa.nome || 'MINHA EMPRESA'), margem, y);

    // Dados da empresa
    y += 40;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(toUpper(empresa.nome || 'MINHA EMPRESA'), margem, y);
    doc.text(toUpper(`CNPJ: ${formatarCNPJ(empresa.cnpj || '')}`), margem, (y += 20));
    doc.text(toUpper(`INSCRIÇÃO ESTADUAL: ${formatarCNPJ(empresa.inscricaoEstadual || '')}`), margem, (y += 20));
    doc.text(toUpper(`ENDEREÇO: ${empresa.endereco || '-'}`), margem, (y += 20));
    doc.text(
        toUpper(`${empresa.cidade || '-'} / ${empresa.estado || '-'}`),
        margem,
        (y += 20)
    );
    doc.text(`TELEFONE: ${empresa.telefone || '-'}`, margem, (y += 20));
    doc.text(`EMAIL: ${empresa.email || '-'}`, margem, (y += 20));
    doc.text(`SITE: ${empresa.site || '-'}`, margem, (y += 20));

    // Informações do Cliente
    y += 30;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(40);
    doc.text(toUpper('INFORMAÇÕES DO CLIENTE'), margem, y);

    y += 20;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(toUpper(cliente.nome), margem, y);
    doc.text(toUpper(`CNPJ: ${formatarCNPJ(cliente.cnpj)}`), margem, (y += 20));
    doc.text(toUpper(`INSCRIÇÃO ESTADUAL: ${formatarCNPJ(cliente.inscricaoEstadual || '')}`), margem, (y += 20));
    doc.text(toUpper(`ENDEREÇO: ${cliente.endereco || '-'}`), margem, (y += 20));
    doc.text(
        toUpper(`${cliente.cidade || '-'} / ${cliente.estado || '-'}`),
        margem,
        (y += 20)
    );
    doc.text(`TELEFONE: ${cliente.telefone || '-'}`, margem, (y += 20));
    doc.text(`EMAIL: ${cliente.email || '-'}`, margem, (y += 20));
    doc.text(`SITE: ${cliente.site || '-'}`, margem, (y += 20));

    // Itens do Orçamento
    y += 30;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(toUpper('ITENS DO ORÇAMENTO'), margem, y);

    const cabecalho = [[
        toUpper('CÓDIGO'), 
        toUpper('DESCRIÇÃO'), 
        toUpper('NCM'), 
        toUpper('QUANT.'), 
        toUpper('UNIT.'), 
        toUpper('VALOR TOTAL')
    ]];
    
    const linhas = orcamento.itens.map(item => [
        item.produto.codigo || '-',
        toUpper(item.produto.descricao),
        item.produto.ncm || '-',
        item.quantidade,
        toUpper(item.produto.unidade || 'UN'),
        formatarMoeda(item.total)
    ]);
    
    const rodape = [
        { content: toUpper('TOTAL'), colSpan: 5, styles: { halign: 'right' } },
        { content: formatarMoeda(orcamento.total) }
    ];

    doc.autoTable({
        startY: y + 15,
        margin: { left: margem, right: margem },
        head: cabecalho,
        body: linhas,
        foot: [rodape],
        styles: { 
            fontSize: 10, 
            cellPadding: 6,
            textColor: 40,
            halign: 'center',     // Centraliza todo o conteúdo por padrão
            valign: 'middle',     // Centraliza verticalmente
            lineColor: [50, 50, 50], // Cor das bordas (cinza escuro)
            lineWidth: 0.3        // Espessura fina para bordas
        },
        headStyles: { 
            fillColor: [249, 115, 22], 
            textColor: 255, 
            fontStyle: 'bold',
            halign: 'center',
            lineWidth: 0.5        // Bordas mais espessas no cabeçalho
        },
        bodyStyles: {
            lineWidth: 0.3        // Bordas para todas as células do corpo
        },
        alternateRowStyles: { 
            fillColor: [245, 245, 245],
            lineWidth: 0.3
        },
        footStyles: { 
            fillColor: [249, 115, 22], 
            textColor: 255, 
            fontStyle: 'bold',
            halign: 'center',
            lineWidth: 0.5        // Bordas mais espessas no rodapé
        },
        columnStyles: {
            // Sobrescreve o alinhamento padrão para colunas específicas
            1: { halign: 'left' },    // Descrição alinhada à esquerda
            3: { halign: 'center' },  // Quantidade centralizada
            4: { halign: 'center' },  // Unidade centralizada
            5: { halign: 'right' }    // Valor Total alinhado à direita
        }
    });

    if (saveToHistory) {
        let historico = JSON.parse(localStorage.getItem(ORCAMENTOS_KEY)) || [];
        historico.unshift(orcamento);
        
        if (historico.length > 30) {
            historico = historico.slice(0, 30);
        }
        
        localStorage.setItem(ORCAMENTOS_KEY, JSON.stringify(historico));
    }

    return { doc, cliente };
}

function gerarOrcamento(event) {
    event.preventDefault();

    const clienteSelect = document.getElementById('clienteSelect');
    const clienteId = clienteSelect.value;
    if (!clienteId) { alert('Selecione um cliente'); return; }
    if (orcamentoItens.length === 0) { alert('Adicione itens ao orçamento'); return; }

    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) { alert('Cliente não encontrado'); return; }

    const orcamento = {
        id: Date.now().toString(),
        clienteId: clienteId,
        clienteNome: cliente.nome,
        data: new Date().toISOString(),
        itens: orcamentoItens,
        total: totalOrcamento
    };

    const { doc, cliente: clienteData } = gerarPdfBase(orcamento, { 
        saveToHistory: true 
    });

    // Nome do arquivo
    const dataBR = new Date().toLocaleDateString('pt-BR');
    const nomeArquivo = `ORCAMENTO_${clienteData.nome.replace(/\s+/g,'_')}_${dataBR}.pdf`;
    
    // Salvar PDF
    doc.save(nomeArquivo);

    // Limpar
    orcamentoItens = [];
    totalOrcamento = 0;
    atualizarTabelaItens();
    calcularTotal();
    carregarHistoricoOrcamentos();
    atualizarDashboard();
}

function gerarPdfParaVisualizacao(orcamento) {
    const { doc } = gerarPdfBase(orcamento);
    
    // Abrir em nova janela para visualização
    const pdfData = doc.output('datauristring');
    const win = window.open();
    win.document.write('<iframe width="100%" height="100%" src="' + pdfData + '"></iframe>');
}

function gerarPdfParaDownload(orcamento) {
    const { doc, cliente } = gerarPdfBase(orcamento);
    
    // Nome do arquivo
    const dataBR = new Date(orcamento.data).toLocaleDateString('pt-BR');
    const nomeArquivo = `ORCAMENTO_${cliente.nome.replace(/\s+/g,'_')}_${dataBR}.pdf`;
    
    // Salvar PDF
    doc.save(nomeArquivo);
}

// Funções auxiliares
function formatarCNPJ(cnpj) {
    if (!cnpj) return '';
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

function formatarMoeda(valor) {
    return parseFloat(valor).toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+\,)/g, '$1.');
}

function loadBrazilianStates() {
    const selects = document.querySelectorAll('#empresaEstado, #clienteEstado');
    selects.forEach(select => {
        estadosBR.forEach(uf => {
            const option = document.createElement('option');
            option.value = uf;
            option.textContent = uf;
            select.appendChild(option);
        });
    });
}

function carregarDadosIniciais() {
    carregarDadosEmpresa();
    
    // Adicionar evento de submit aos formulários
    document.getElementById('formEmpresa').addEventListener('submit', salvarEmpresa);
    document.getElementById('formCliente').addEventListener('submit', salvarCliente);
    document.getElementById('formProduto').addEventListener('submit', salvarProduto);
    document.getElementById('formOrcamento').addEventListener('submit', gerarOrcamento);
    
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    });
    
    // Verificar tema salvo
    if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    }

    // Máscara para CEP
    document.getElementById('empresaCep').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/^(\d{5})(\d)/, '$1-$2');
        e.target.value = value;
    });

    document.getElementById('clienteCep').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/^(\d{5})(\d)/, '$1-$2');
        e.target.value = value;
    });
}

function atualizarDashboard() {
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
    const historico = JSON.parse(localStorage.getItem(ORCAMENTOS_KEY)) || [];
    
    document.getElementById('clientCount').textContent = clientes.length;
    document.getElementById('productCount').textContent = produtos.length;
    document.getElementById('quoteCount').textContent = historico.length;
}