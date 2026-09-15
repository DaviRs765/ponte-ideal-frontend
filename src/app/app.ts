import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, HttpClientModule], 
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  constructor(private http: HttpClient) {}

  // A URL OFICIAL DA SUA NUVEM NO RENDER
  apiUrl = 'https://ponte-ideal-api.onrender.com';

  ngOnInit() { 
    this.carregarServicos(); 
    this.carregarVagas(); 
  }

  // --- DARK MODE ---
  darkMode = false;
  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    if (this.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  // --- CONTROLE DE TELAS ---
  abaAtiva = 'servicos'; 
  menuMobileAberto = false; 
  modoGerenciamento = false; 
  modoAdmin = false; 
  abaPainel = 'dashboard';
  termoBusca = ''; 
  filtroCategoria = ''; 
  filtroFormato = '';
  listaCategorias = ['Tecnologia', 'Reformas e Construção', 'Serviços Domésticos', 'Aulas e Consultoria', 'Beleza e Saúde', 'Logística', 'Design e Marketing', 'Outros'];

  mudarAba(aba: string) { 
    this.abaAtiva = aba; 
    this.filtroCategoria = ''; 
    this.filtroFormato = ''; 
  }
  
  abrirGerenciamento() { 
    this.modoGerenciamento = true; this.modoAdmin = false; this.itemSelecionado = null; this.perfilPublicoAtivo = null; this.abaPainel = 'dashboard'; this.menuMobileAberto = false; window.scrollTo(0, 0); this.carregarMetricas(); 
  }
  
  abrirAdmin() { 
    this.modoAdmin = true; this.modoGerenciamento = false; this.itemSelecionado = null; this.perfilPublicoAtivo = null; this.menuMobileAberto = false; window.scrollTo(0, 0); this.carregarAdmin(); 
  }
  
  voltarParaHome() { 
    this.itemSelecionado = null; this.tipoItemSelecionado = null; this.modoGerenciamento = false; this.modoAdmin = false; this.perfilPublicoAtivo = null; window.scrollTo(0, 0); 
  }

  get servicosFiltrados() { 
    return this.listaServicos.filter((s: any) => (s.status === 'ativo' || !s.status) && (!this.termoBusca || s.titulo.toLowerCase().includes(this.termoBusca.toLowerCase())) && (!this.filtroCategoria || s.categoria === this.filtroCategoria) && (!this.filtroFormato || s.formato === this.filtroFormato)); 
  }
  
  get vagasFiltradas() { 
    return this.listaVagas.filter((v: any) => (v.status === 'ativo' || !v.status) && (!this.termoBusca || v.titulo.toLowerCase().includes(this.termoBusca.toLowerCase()) || v.empresa.toLowerCase().includes(this.termoBusca.toLowerCase())) && (!this.filtroCategoria || v.categoria === this.filtroCategoria)); 
  }

  // --- DASHBOARD E MÉTRICAS ---
  metricas = { total_anuncios: 0, total_interacoes: 0, total_favoritos: 0 };
  carregarMetricas() {
    if (!this.usuarioIdLogado) return;
    this.http.get(`${this.apiUrl}/api/usuarios/${this.usuarioIdLogado}/metricas`).subscribe({ next: (d: any) => this.metricas = d });
  }

  // --- ADMIN SYSTEM ---
  usuariosAdmin: any[] = [];
  abaAdmin = 'usuarios';
  carregarAdmin() {
    this.http.get(`${this.apiUrl}/api/admin/usuarios`).subscribe({ next: (d: any) => this.usuariosAdmin = d });
    this.carregarServicos(); 
    this.carregarVagas();
  }
  banirUsuario(id: number) {
    if(confirm('🚨 ALERTA ADMIN: Tem certeza que deseja BANIR este usuário permanentemente?')) {
      this.http.delete(`${this.apiUrl}/api/admin/usuarios/${id}`).subscribe({ next: (r: any) => { alert('🔨 ' + r.mensagem); this.carregarAdmin(); } });
    }
  }
  excluirAnuncioAdmin(id: number, tipo: string) {
    if(confirm('🚨 ALERTA ADMIN: Apagar este anúncio por violação de regras?')) {
      const url = tipo === 'servico' ? `${this.apiUrl}/api/servicos/${id}` : `${this.apiUrl}/api/vagas/${id}`;
      this.http.delete(url).subscribe({ next: () => { alert('🗑️ Anúncio apagado!'); this.carregarAdmin(); } });
    }
  }

  // --- PERFIL PÚBLICO E REDE SOCIAL ---
  perfilPublicoAtivo: any = null; 
  avaliacoesPerfilPublico: any[] = [];
  abrirPerfilPublico(usuarioId: number) { 
    this.http.get(`${this.apiUrl}/api/usuarios/${usuarioId}`).subscribe({ 
      next: (dados: any) => { 
        this.perfilPublicoAtivo = dados; this.itemSelecionado = null; this.modoGerenciamento = false; this.modoAdmin = false; window.scrollTo(0, 0); 
        this.http.get(`${this.apiUrl}/api/usuarios/${usuarioId}/avaliacoes_recebidas`).subscribe({ next: (avs: any) => this.avaliacoesPerfilPublico = avs }); 
      }, error: () => alert('Usuário não encontrado.') 
    }); 
  }

  dadosMeuPerfil: any = { bio: '', foto_perfil: '', whatsapp: '', linkedin: '', instagram: '' };
  carregarDadosUsuario() { 
    if (!this.usuarioIdLogado) return; 
    this.http.get(`${this.apiUrl}/api/usuarios/${this.usuarioIdLogado}`).subscribe({ next: (dados: any) => this.dadosMeuPerfil = dados }); 
    this.carregarNotificacoes(); 
    this.carregarFavoritos(); 
    this.carregarMetricas(); 
  }
  salvarMeuPerfil() { 
    this.http.put(`${this.apiUrl}/api/usuarios/${this.usuarioIdLogado}/perfil`, this.dadosMeuPerfil).subscribe({ next: (res: any) => alert('✅ ' + res.mensagem) }); 
  }

  itemSelecionado: any = null; 
  tipoItemSelecionado: 'servico' | 'vaga' | null = null;
  abrirDetalhes(item: any, tipo: 'servico' | 'vaga') { 
    this.itemSelecionado = item; this.tipoItemSelecionado = tipo; this.modoGerenciamento = false; this.modoAdmin = false; this.perfilPublicoAtivo = null; window.scrollTo(0, 0); 
    if (tipo === 'servico') this.carregarAvaliacoes(item.id); 
  }

  // --- NOTIFICAÇÕES (Sininho) ---
  notificacoes: any[] = []; 
  mostrarModalNotificacoes = false; 
  get notificacoesNaoLidas() { return this.notificacoes.filter(n => !n.lida).length; }
  carregarNotificacoes() { this.http.get(`${this.apiUrl}/api/usuarios/${this.usuarioIdLogado}/notificacoes`).subscribe({ next: (d: any) => this.notificacoes = d }); }
  abrirNotificacoes() { this.mostrarModalNotificacoes = true; } 
  fecharNotificacoes() { this.mostrarModalNotificacoes = false; }
  marcarLida(n: any) { if(n.lida) return; this.http.put(`${this.apiUrl}/api/notificacoes/${n.id}/lida`, {}).subscribe({ next: () => n.lida = 1 }); }

  // --- FAVORITOS (Coração) ---
  favoritosBrutos: any[] = [];
  carregarFavoritos() { this.http.get(`${this.apiUrl}/api/usuarios/${this.usuarioIdLogado}/favoritos`).subscribe({ next: (d: any) => this.favoritosBrutos = d }); }
  isFavorito(itemId: number, tipoItem: string): boolean { return this.favoritosBrutos.some(f => f.item_id === itemId && f.tipo_item === tipoItem); }
  toggleFavorito(item: any, tipoItem: string, event: Event) { 
    event.stopPropagation(); 
    if (!this.usuarioLogado) return this.abrirModalLogin(); 
    const jaFav = this.isFavorito(item.id, tipoItem); 
    if (jaFav) { 
      this.http.delete(`${this.apiUrl}/api/favoritos/${this.usuarioIdLogado}/${tipoItem}/${item.id}`).subscribe({ next: () => this.carregarFavoritos() }); 
    } else { 
      this.http.post(`${this.apiUrl}/api/favoritos`, { usuario_id: this.usuarioIdLogado, item_id: item.id, tipo_item: tipoItem }).subscribe({ next: () => this.carregarFavoritos() }); 
    } 
  }
  get meusFavoritosRenderizados() { 
    const sFav = this.listaServicos.filter((s: any) => this.isFavorito(s.id, 'servico')).map((s: any) => ({ ...s, _tipo: 'servico' })); 
    const vFav = this.listaVagas.filter((v: any) => this.isFavorito(v.id, 'vaga')).map((v: any) => ({ ...v, _tipo: 'vaga' })); 
    return [...sFav, ...vFav]; 
  }

  // --- AUTENTICAÇÃO ---
  mostrarModalLogin = false; modoAuth = 'login'; tipoCadastro = 'prestador'; 
  dadosCadastro = { nome: '', documento: '', email: '', senha: '' }; 
  dadosLogin = { identificador: '', senha: '' };
  usuarioLogado: string | null = null; tipoUsuarioLogado: string | null = null; usuarioIdLogado: number | null = null; 
  
  abrirModalLogin() { this.mostrarModalLogin = true; this.modoAuth = 'login'; this.menuMobileAberto = false; } 
  fecharModalLogin() { this.mostrarModalLogin = false; } 
  mudarModoAuth(modo: string) { this.modoAuth = modo; }
  
  fazerCadastroReal() { 
    const p = { tipo: this.tipoCadastro, ...this.dadosCadastro }; 
    this.http.post(`${this.apiUrl}/api/cadastro`, p).subscribe({ 
      next: (res: any) => { alert('🎉 ' + res.mensagem); this.mudarModoAuth('login'); }, 
      error: (e) => alert('❌ Erro no cadastro.') 
    }); 
  }
  fazerLoginReal() { 
    this.http.post(`${this.apiUrl}/api/login`, this.dadosLogin).subscribe({ 
      next: (res: any) => { 
        this.usuarioLogado = res.nome; this.tipoUsuarioLogado = res.tipo; this.usuarioIdLogado = Number(res.id); 
        if (this.tipoUsuarioLogado === 'empresa') this.mudarAba('vagas'); 
        if (this.tipoUsuarioLogado === 'admin') alert('👑 Modo Administrador Ativado!'); 
        this.dadosLogin = { identificador: '', senha: '' }; 
        this.fecharModalLogin(); 
        this.carregarDadosUsuario(); 
      }, 
      error: (e) => alert('❌ Senha incorreta ou usuário não encontrado.') 
    }); 
  }
  fazerLogout() { 
    this.usuarioLogado = null; this.tipoUsuarioLogado = null; this.usuarioIdLogado = null; this.modoGerenciamento = false; this.modoAdmin = false; this.perfilPublicoAtivo = null; this.notificacoes = []; this.favoritosBrutos = []; 
  }

  // --- CRUD SERVIÇOS ---
  listaServicos: any = []; 
  mostrarModalAnuncio = false; 
  novoServico: any = { id: null, titulo: '', preco: '', formato: 'Presencial', descricao: '', imagem: '', categoria: 'Outros' }; 
  get meusServicos() { return this.listaServicos.filter((s: any) => Number(s.usuario_id) === this.usuarioIdLogado); } 
  carregarServicos() { this.http.get(`${this.apiUrl}/api/servicos`).subscribe({ next: (d: any) => this.listaServicos = d }); } 
  abrirModalAnuncio(serv: any = null) { if (!this.usuarioLogado) return this.abrirModalLogin(); this.novoServico = serv ? { ...serv } : { id: null, titulo: '', preco: '', formato: 'Presencial', descricao: '', imagem: '', categoria: 'Outros' }; this.mostrarModalAnuncio = true; } 
  fecharModalAnuncio() { this.mostrarModalAnuncio = false; } 
  publicarAnuncio() { const p = { ...this.novoServico, usuario_id: this.usuarioIdLogado }; if (p.id) this.http.put(`${this.apiUrl}/api/servicos/` + p.id, p).subscribe({ next: () => { alert('✏️ Salvo!'); this.fecharModalAnuncio(); this.carregarServicos(); }}); else this.http.post(`${this.apiUrl}/api/servicos`, p).subscribe({ next: () => { alert('🚀 Criado!'); this.fecharModalAnuncio(); this.carregarServicos(); this.mudarAba('servicos'); this.modoGerenciamento = false; }}); } 
  excluirServico(id: number) { if(confirm('Excluir?')) this.http.delete(`${this.apiUrl}/api/servicos/` + id).subscribe({ next: () => this.carregarServicos() }); } 
  alternarStatusServico(s: any) { const st = s.status === 'ativo' || !s.status ? 'pausado' : 'ativo'; this.http.put(`${this.apiUrl}/api/servicos/${s.id}/status`, { status: st }).subscribe({ next: () => s.status = st }); }
  
  // --- CRUD VAGAS ---
  listaVagas: any = []; 
  mostrarModalVaga = false; 
  novaVaga: any = { id: null, titulo: '', pagamento: '', local: '', turnos: '', tempo_almoco: '', fretado: 'Não possui', descricao: '', imagem: '', categoria: 'Outros' }; 
  get minhasVagas() { return this.listaVagas.filter((v: any) => Number(v.usuario_id) === this.usuarioIdLogado); } 
  carregarVagas() { this.http.get(`${this.apiUrl}/api/vagas`).subscribe({ next: (d: any) => this.listaVagas = d }); } 
  abrirModalVaga(vaga: any = null) { if (!this.usuarioLogado) return this.abrirModalLogin(); this.novaVaga = vaga ? { ...vaga } : { id: null, titulo: '', pagamento: '', local: '', turnos: '', tempo_almoco: '', fretado: 'Não possui', descricao: '', imagem: '', categoria: 'Outros' }; this.mostrarModalVaga = true; } 
  fecharModalVaga() { this.mostrarModalVaga = false; } 
  publicarVaga() { const p = { ...this.novaVaga, empresa: this.usuarioLogado, usuario_id: this.usuarioIdLogado }; if (p.id) this.http.put(`${this.apiUrl}/api/vagas/` + p.id, p).subscribe({ next: () => { alert('✏️ Salvo!'); this.fecharModalVaga(); this.carregarVagas(); }}); else this.http.post(`${this.apiUrl}/api/vagas`, p).subscribe({ next: () => { alert('🏢 Publicada!'); this.fecharModalVaga(); this.carregarVagas(); this.mudarAba('vagas'); this.modoGerenciamento = false; }}); } 
  excluirVaga(id: number) { if(confirm('Excluir?')) this.http.delete(`${this.apiUrl}/api/vagas/` + id).subscribe({ next: () => this.carregarVagas() }); } 
  alternarStatusVaga(v: any) { const st = v.status === 'ativo' || !v.status ? 'preenchida' : 'ativo'; this.http.put(`${this.apiUrl}/api/vagas/${v.id}/status`, { status: st }).subscribe({ next: () => v.status = st }); }

  // --- CANDIDATURAS ---
  mostrarModalCandidatura = false; dadosCandidatura = { telefone: '', mensagem: '' }; mostrarModalCandidatos = false; candidatosDaVaga: any[] = []; vagaParaVerCandidatos: any = null; 
  prepararCandidatura() { if (!this.usuarioLogado) return this.abrirModalLogin(); this.dadosCandidatura = { telefone: '', mensagem: '' }; this.mostrarModalCandidatura = true; } 
  fecharModalCandidatura() { this.mostrarModalCandidatura = false; } 
  enviarCurriculo() { const pacote = { vaga_id: Number(this.itemSelecionado.id), prestador_id: Number(this.usuarioIdLogado), telefone: this.dadosCandidatura.telefone, mensagem: this.dadosCandidatura.mensagem }; this.http.post(`${this.apiUrl}/api/candidaturas`, pacote).subscribe({ next: (res: any) => { alert('✅ ' + res.mensagem); this.fecharModalCandidatura(); } }); } 
  abrirCandidatos(vaga: any) { this.vagaParaVerCandidatos = vaga; this.http.get(`${this.apiUrl}/api/vagas/${vaga.id}/candidaturas`).subscribe({ next: (d: any) => { this.candidatosDaVaga = d; this.mostrarModalCandidatos = true; }}); } 
  fecharCandidatos() { this.mostrarModalCandidatos = false; this.vagaParaVerCandidatos = null; } 
  atualizarStatusCandidato(c: any, st: string) { this.http.put(`${this.apiUrl}/api/candidaturas/${c.id}/status`, { status_candidatura: st }).subscribe({ next: () => c.status_candidatura = st }); }
  
  // --- ORÇAMENTOS ---
  mostrarModalOrcamento = false; dadosOrcamento = { cliente_nome: '', telefone: '', mensagem: '' }; 
  prepararOrcamento() { this.dadosOrcamento = { cliente_nome: this.usuarioLogado || '', telefone: '', mensagem: '' }; this.mostrarModalOrcamento = true; } 
  fecharModalOrcamento() { this.mostrarModalOrcamento = false; } 
  enviarOrcamento() { const pacote = { servico_id: this.itemSelecionado.id, ...this.dadosOrcamento }; this.http.post(`${this.apiUrl}/api/orcamentos`, pacote).subscribe({ next: (res: any) => { alert('✅ ' + res.mensagem); this.fecharModalOrcamento(); }}); } 
  mostrarModalVerOrcamentos = false; orcamentosDoServico: any[] = []; servicoParaVerOrcamentos: any = null; 
  abrirOrcamentos(servico: any) { this.servicoParaVerOrcamentos = servico; this.http.get(`${this.apiUrl}/api/servicos/${servico.id}/orcamentos`).subscribe({ next: (d: any) => { this.orcamentosDoServico = d; this.mostrarModalVerOrcamentos = true; }}); } 
  fecharVerOrcamentos() { this.mostrarModalVerOrcamentos = false; this.servicoParaVerOrcamentos = null; } 
  atualizarStatusOrcamento(orc: any, novoStatus: string) { this.http.put(`${this.apiUrl}/api/orcamentos/${orc.id}/status`, { status: novoStatus }).subscribe({ next: () => orc.status = novoStatus }); }
  
  // --- AVALIAÇÕES ---
  avaliacoesDoServico: any[] = []; mostrarModalAvaliacao = false; dadosAvaliacao = { autor_nome: '', nota: 5, comentario: '' }; 
  carregarAvaliacoes(servicoId: number) { this.http.get(`${this.apiUrl}/api/servicos/${servicoId}/avaliacoes`).subscribe({ next: (d: any) => this.avaliacoesDoServico = d }); } 
  prepararAvaliacao() { if (!this.usuarioLogado) return this.abrirModalLogin(); this.dadosAvaliacao = { autor_nome: this.usuarioLogado, nota: 5, comentario: '' }; this.mostrarModalAvaliacao = true; } 
  fecharModalAvaliacao() { this.mostrarModalAvaliacao = false; } 
  enviarAvaliacao() { const pacote = { servico_id: this.itemSelecionado.id, autor_id: this.usuarioIdLogado, ...this.dadosAvaliacao }; this.http.post(`${this.apiUrl}/api/avaliacoes`, pacote).subscribe({ next: (res: any) => { alert('⭐ ' + res.mensagem); this.fecharModalAvaliacao(); this.carregarAvaliacoes(this.itemSelecionado.id); this.carregarServicos(); } }); } 
  gerarEstrelas(nota: number): string { return '⭐'.repeat(Math.round(nota)) + '☆'.repeat(5 - Math.round(nota)); }
  
  // --- PLANOS PREMIUM (Exibidos na Home) ---
  listaPlanos = [ 
    { nome: 'Mensal', preco: '39.90', desc: 'Destaque padrão nas buscas.', destaque: false }, 
    { nome: 'Trimestral', preco: '34.90', desc: 'Visibilidade média na plataforma.', destaque: false }, 
    { nome: 'Semestral', preco: '29.90', desc: 'Melhor custo-benefício.', destaque: true }, 
    { nome: 'Anual', preco: '19.90', desc: 'Maior desconto e destaque máximo.', destaque: false } 
  ]; 
  
  assinarPlano(plano: any) { 
    if (!this.usuarioLogado) {
      alert('Faça login ou cadastre-se como Prestador para assinar um plano!');
      this.abrirModalLogin();
      return;
    }
    alert(`Redirecionando para pagamento seguro do plano ${plano.nome}...`); 
  } 

  rolarParaPlanos() {
    setTimeout(() => {
      const elemento = document.getElementById('secao-planos');
      if (elemento) elemento.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }
}