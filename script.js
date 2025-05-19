// ---------- Modal e Abas ----------
const configBtn   = document.getElementById("config-btn");
const configModal = document.getElementById("config-modal");
const closeBtn    = configModal.querySelector(".close");
const tabs        = Array.from(configModal.querySelectorAll(".tab"));
const contents    = Array.from(configModal.querySelectorAll(".tab-content"));

configBtn.onclick = () => configModal.style.display = "flex";
closeBtn.onclick  = () => configModal.style.display = "none";

// Fechar modal apenas se mousedown e click ocorrerem no overlay
let isOverlayMouseDown = false;
configModal.addEventListener("mousedown", e => {
	isOverlayMouseDown = (e.target === configModal);
});
configModal.addEventListener("click", e => {
	if (e.target === configModal && isOverlayMouseDown) {
		configModal.style.display = "none";
	}
});

tabs.forEach(tab => {
	tab.onclick = () => {
		tabs.forEach(t => t.classList.remove("active"));
		contents.forEach(c => c.style.display = "none");
		tab.classList.add("active");
		document.getElementById(tab.dataset.target).style.display = "block";
	};
});

// --------- Carrega dados do localStorage ---------
let clients    = JSON.parse(localStorage.getItem("clientes"))   || [];
let products   = JSON.parse(localStorage.getItem("produtos"))   || [];
let company    = JSON.parse(localStorage.getItem("empresa"))    || {
	nome:"", cnpj:"", inscricaoEstadual:"", endereco:"", cidade:"", estado:"", cep:"", telefone:"", email:"", site:""
};
let orcamentos = JSON.parse(localStorage.getItem("orcamentos")) || [];

// ---------- CLIENTES ----------
function updateClientDatalist() {
	const dl = document.getElementById("clientes");
	dl.innerHTML = "";
	clients.forEach(c => {
		const opt = document.createElement("option");
		opt.value = c.nome;
		dl.appendChild(opt);
	});
}

function renderClientsList() {
	const container = document.getElementById("clients-list");
	container.innerHTML = "";
	clients.forEach((c, i) => {
		const details = document.createElement("details");
		const summary = document.createElement("summary");
		summary.innerHTML = `<strong>${c.nome}</strong> — ${c.cnpj} — ${c.email}`;
		details.appendChild(summary);

		const info = document.createElement("div");
		info.style.padding = "8px 0";
		info.innerHTML = `
			<p><strong>Inscrição Estadual:</strong> ${c.inscricaoEstadual}</p>
			<p><strong>Endereço:</strong> ${c.endereco}</p>
			<p><strong>Cidade/Estado:</strong> ${c.cidade} – ${c.estado}</p>
			<p><strong>CEP:</strong> ${c.cep}</p>
			<p><strong>Telefone:</strong> ${c.telefone}</p>
		`;
		details.appendChild(info);

		const btnEdit = document.createElement("button");
		btnEdit.textContent   = "✏️ Editar";
		btnEdit.className     = "edit-client";
		btnEdit.dataset.i     = i;
		btnEdit.style.marginRight = "8px";

		const btnDel = document.createElement("button");
		btnDel.textContent   = "🗑️ Excluir";
		btnDel.className     = "delete-client";
		btnDel.dataset.i     = i;

		details.appendChild(btnEdit);
		details.appendChild(btnDel);
		container.appendChild(details);
		container.appendChild(document.createElement("hr"));
	});
	updateClientDatalist();
}

function promptClient(existing = {}) {
	const fields = [
		{ key: "nome",               label: "Nome" },
		{ key: "cnpj",               label: "CNPJ" },
		{ key: "inscricaoEstadual",  label: "Inscrição Estadual" },
		{ key: "endereco",           label: "Endereço" },
		{ key: "cidade",             label: "Cidade" },
		{ key: "estado",             label: "Estado" },
		{ key: "cep",                label: "CEP" },
		{ key: "telefone",           label: "Telefone" },
		{ key: "email",              label: "Email" },
	];
	const obj = {};
	for (const f of fields) {
		const resp = prompt(`${f.label}:`, existing[f.key] || "");
		if (resp == null) {
			alert("Operação Cancelada!");
			return null;
		}
		obj[f.key] = resp.trim();
	}
	return obj;
}

document.getElementById("add-client-btn").onclick = () => {
	const novo = promptClient();
	if (!novo) return;
	clients.push(novo);
	localStorage.setItem("clientes", JSON.stringify(clients));
	renderClientsList();
};

document.getElementById("clients-list").onclick = e => {
	const i = e.target.dataset.i;
	if (e.target.classList.contains("edit-client")) {
		const atualizado = promptClient(clients[i]);
		if (!atualizado) return;
		clients[i] = atualizado;
		localStorage.setItem("clientes", JSON.stringify(clients));
		renderClientsList();
	}
	if (e.target.classList.contains("delete-client")) {
		if (confirm("Excluir este cliente?")) {
			clients.splice(i, 1);
			localStorage.setItem("clientes", JSON.stringify(clients));
			renderClientsList();
		}
	}
};

// ---------- PRODUTOS ----------
function renderProducts() {
	const tbody = document.querySelector("#products-table tbody");
	tbody.innerHTML = "";
	products.forEach((p, i) => {
		tbody.innerHTML += `
			<tr>
				<td>${p.codigo}</td>
				<td>${p.descricao}</td>
				<td>${p.ncm}</td>
				<td class="numero">${p.unit.toFixed(2)}</td>
				<td>
					<button class="edit-product" data-i="${i}">✏️</button>
					<button class="delete-product" data-i="${i}">🗑️</button>
				</td>
			</tr>
		`;
	});
}

document.getElementById("add-product-btn").onclick = () => {
	const codigo    = prompt("Código:");
	const descricao = prompt("Descrição:");
	const ncm       = prompt("NCM:");
	const unit      = parseFloat(prompt("Preço unitário:"));
	if (!codigo || !descricao || isNaN(unit)) return;
	products.push({ codigo, descricao, ncm, unit });
	localStorage.setItem("produtos", JSON.stringify(products));
	renderProducts();
};

document.querySelector("#products-table").onclick = e => {
	const i = e.target.dataset.i;
	if (e.target.classList.contains("edit-product")) {
		const p = products[i];
		const codigo    = prompt("Código:", p.codigo);
		const descricao = prompt("Descrição:", p.descricao);
		const ncm       = prompt("NCM:", p.ncm);
		const unit      = parseFloat(prompt("Preço unitário:", p.unit));
		if (!codigo || !descricao || isNaN(unit)) return;
		products[i] = { codigo, descricao, ncm, unit };
		localStorage.setItem("produtos", JSON.stringify(products));
		renderProducts();
	}
	if (e.target.classList.contains("delete-product")) {
		if (confirm("Excluir este produto?")) {
			products.splice(i, 1);
			localStorage.setItem("produtos", JSON.stringify(products));
			renderProducts();
		}
	}
};

// ---------- MINHA EMPRESA ----------
function renderCompanyForm() {
	document.getElementById("company-name").value               = company.nome;
	document.getElementById("company-cnpj").value               = company.cnpj;
	document.getElementById("company-inscricaoEstadual").value  = company.inscricaoEstadual;
	document.getElementById("company-endereco").value           = company.endereco;
	document.getElementById("company-cidade").value             = company.cidade;
	document.getElementById("company-estado").value             = company.estado;
	document.getElementById("company-cep").value                = company.cep;
	document.getElementById("company-telefone").value           = company.telefone;
	document.getElementById("company-email").value              = company.email;
	document.getElementById("company-site").value               = company.site;
}

document.getElementById("company-form").onsubmit = e => {
	e.preventDefault();
	company = {
		nome:              e.target["company-name"].value,
		cnpj:              e.target["company-cnpj"].value,
		inscricaoEstadual: e.target["company-inscricaoEstadual"].value,
		endereco:          e.target["company-endereco"].value,
		cidade:            e.target["company-cidade"].value,
		estado:            e.target["company-estado"].value,
		cep:               e.target["company-cep"].value,
		telefone:          e.target["company-telefone"].value,
		email:             e.target["company-email"].value,
		site:              e.target["company-site"].value
	};
	localStorage.setItem("empresa", JSON.stringify(company));
	alert("Dados da empresa salvos!");
};

// ---------- ORÇAMENTOS ----------
function renderOrcamentos() {
	const tbody = document.querySelector("#orcamentos-table tbody");
	tbody.innerHTML = "";
	orcamentos.forEach(o => {
		tbody.innerHTML += `
			<tr>
				<td>${o.id}</td>
				<td>${o.clientName}</td>
				<td>${o.clientCnpj}</td>
				<td>${o.clientEmail}</td>
				<td class="numero">${o.total.toFixed(2)}</td>
				<td><button class="reprint-btn" data-id="${o.id}">🔄</button></td>
			</tr>
		`;
	});
}

document.querySelector("#orcamentos-table").onclick = e => {
	if (e.target.classList.contains("reprint-btn")) {
		const id = e.target.dataset.id;
		const o  = orcamentos.find(x => x.id == id);
		if (!o) return;
		document.getElementById("entrada-cliente").value = o.clientName;
		gerarBtn.click();
	}
};

// ---------- BUILDER DE ITENS ----------
const addItemBtn      = document.getElementById("adicionar-item");
const builderTable    = document.getElementById("tabela-itens");
const builderTbody    = document.querySelector("#tabela-itens tbody");
const buscaInput      = document.getElementById("busca-item");
const quantidadeInput = document.getElementById("quantidade-item");

addItemBtn.addEventListener("click", () => {
	const term = buscaInput.value.trim();
	const qty  = parseInt(quantidadeInput.value, 10) || 1;
	const prod = products.find(p =>
		p.codigo === term ||
		p.descricao.toLowerCase().includes(term.toLowerCase())
	);
	if (!prod) return alert("Produto não encontrado");

	const subtotal = prod.unit * qty;
	builderTable.style.display = "";
	const tr = document.createElement("tr");
	tr.innerHTML = `
		<td>${prod.codigo}</td>
		<td>${prod.descricao}</td>
		<td class="numero">${prod.ncm}</td>
		<td class="numero">${qty}</td>
		<td class="numero">${prod.unit.toFixed(2)}</td>
		<td class="numero">${subtotal.toFixed(2)}</td>
		<td><button class="remover-item">🗑️</button></td>
	`;
	builderTbody.appendChild(tr);

	builderTbody.addEventListener("click", e => {
		if (e.target.classList.contains("remover-item")) {
			e.target.closest("tr").remove();
			if (builderTbody.children.length === 0) {
				builderTable.style.display = "none";
			}
		}
	});

	buscaInput.value      = "";
	quantidadeInput.value = 1;
});

// ---------- GERAR PDF ----------
const gerarBtn = document.getElementById("gerar");
gerarBtn.addEventListener("click", () => {
	// 1) Número e data
	const now = Date.now().toString();
	document.getElementById("numero-nota").textContent = now;
	document.getElementById("data-nota").textContent   = new Date().toLocaleString("pt-BR");

	// 2) Cliente e condições
	const clientName = document.getElementById("entrada-cliente").value;
	const clienteObj = clients.find(c => c.nome === clientName) || {};
	const clienteDiv = document.getElementById("cliente-nota");
	clienteDiv.innerHTML = `
		<p><strong>${clienteObj.nome || clientName}</strong></p>
		<p>CNPJ: ${clienteObj.cnpj || ""}</p>
		<p>Inscrição Estadual: ${clienteObj.inscricaoEstadual || ""}</p>
		<p>Endereço: ${clienteObj.endereco || ""}</p>
		<p>${clienteObj.cidade || ""} – ${clienteObj.estado || ""} – CEP ${clienteObj.cep || ""}</p>
		<p>Telefone: ${clienteObj.telefone || ""}</p>
		<p>Email: ${clienteObj.email || ""}</p>
	`;
	document.getElementById("condicoes-pagamento").textContent =
		document.getElementById("termos-pagamento").value;

	// 3) Injetar dados da empresa
	const companyData = JSON.parse(localStorage.getItem("empresa")) || {};
	const companyDiv  = document.querySelector("#invoice .company");
	companyDiv.innerHTML = `
		<p style="color:var(--brand-red);font-size:26px;font-weight:bold;margin-bottom:6px">${companyData.nome||""}</p>
		<p><strong>${companyData.nome||""}</strong></p>
		<p>${companyData.site ? `<a href="${companyData.site}" target="_blank">${companyData.site}</a>` : ""}</p>
		<p>CNPJ: ${companyData.cnpj||""}</p>
		<p>${companyData.endereco||""}</p>
		<p>${companyData.cidade||""} – ${companyData.estado||""} – CEP ${companyData.cep||""}</p>
		<p>Telefone: ${companyData.telefone||""}</p>
		<p>Email: ${companyData.email||""}</p>
	`;

	// 4) Itens na invoice
	const notaTbody = document.querySelector("#itens-nota tbody");
	notaTbody.innerHTML = "";
	builderTbody.querySelectorAll("tr").forEach(row => {
		const cols = row.querySelectorAll("td");
		notaTbody.innerHTML += `
			<tr>
				<td>${cols[0].textContent}</td>
				<td>${cols[1].textContent}</td>
				<td class="numero">${cols[2].textContent}</td>
				<td class="numero">${cols[3].textContent}</td>
				<td class="numero">${cols[4].textContent}</td>
				<td class="numero">${cols[5].textContent}</td>
			</tr>
		`;
	});

	// 5) Resumo (Total)
	const total = Array.from(builderTbody.querySelectorAll("tr"))
		.reduce((sum, row) => sum + parseFloat(row.cells[5].textContent.replace(",", ".")), 0);
	document.getElementById("resumo-nota").innerHTML = `
		<tr><td>Total</td><td class="numero">${total.toFixed(2)}</td></tr>
	`;

	// 6) Salvar Orçamento
	orcamentos.push({
		id:           parseInt(now, 10),
		clientName,
		clientCnpj:  clienteObj.cnpj   || "",
		clientEmail: clienteObj.email  || "",
		total
	});

	const orcamentCount = 30;
	if (orcamentos.length > orcamentCount) {
		orcamentos.splice(0, orcamentos.length - orcamentCount);
	}

	localStorage.setItem("orcamentos", JSON.stringify(orcamentos));
	renderOrcamentos();

	// 7) Gerar PDF
	const invoiceEl = document.getElementById("invoice");
	invoiceEl.style.display = "block";
	html2pdf()
		.from(invoiceEl)
		.set({
			margin:      10,
			filename:    `orcamento_${now}.pdf`,
			html2canvas: { scale: 2 },
			jsPDF:       { unit: "mm", format: "a4" }
		})
		.save()
		.then(() => invoiceEl.style.display = "none");
});

// ---------- Inicialização ----------
renderClientsList();
renderProducts();
renderCompanyForm();
renderOrcamentos();