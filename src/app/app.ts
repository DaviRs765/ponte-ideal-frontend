import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  abaAtiva = 'servicos';

  mudarAba(nomeDaAba: string) {
    this.abaAtiva = nomeDaAba;
  }

  menuMobileAberto = false;
  toggleMenuMobile() {
    this.menuMobileAberto = !this.menuMobileAberto;
  }

  termoBusca = ''; 

  get servicosFiltrados() {
    if (!this.termoBusca) return this.listaServicos;
    return this.listaServicos.filter(servico => 
      servico.titulo.toLowerCase().includes(this.termoBusca.toLowerCase())
    );
  }

  get vagasFiltradas() {
    if (!this.termoBusca) return this.listaVagas;
    return this.listaVagas.filter(vaga => 
      vaga.titulo.toLowerCase().includes(this.termoBusca.toLowerCase()) ||
      vaga.empresa.toLowerCase().includes(this.termoBusca.toLowerCase())
    );
  }

  // --- MODAL DE LOGIN E CADASTRO ---
  mostrarModalLogin = false;
  modoAuth = 'login'; 
  tipoCadastro = 'prestador'; 

  abrirModalLogin() {
    this.mostrarModalLogin = true;
    this.modoAuth = 'login'; 
    this.menuMobileAberto = false; 
  }
  fecharModalLogin() { this.mostrarModalLogin = false; }
  mudarModoAuth(modo: string) { this.modoAuth = modo; }

  // --- MODAL DE ANÚNCIO ---
  mostrarModalAnuncio = false;
  abrirModalAnuncio() {
    this.mostrarModalAnuncio = true;
    this.menuMobileAberto = false;
  }
  fecharModalAnuncio() { this.mostrarModalAnuncio = false; }

  novoServico = { titulo: '', descricao: '', preco: '', formato: 'Presencial', localizacao: '' };

  publicarAnuncio() {
    if (!this.novoServico.titulo) {
      alert('Por favor, preencha pelo menos o título do serviço!');
      return;
    }
    const servico = {
      id: this.listaServicos.length + 1,
      titulo: this.novoServico.titulo,
      preco: this.novoServico.preco || 'A combinar',
      avaliacao: '5.0',
      imagem: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=400&q=80',
      sobreServico: this.novoServico.descricao || 'Serviço recém-publicado na plataforma.',
      sobreProfissional: 'Profissional novo na plataforma.',
      contato: 'Não informado'
    };
    this.listaServicos.unshift(servico);
    this.novoServico = { titulo: '', descricao: '', preco: '', formato: 'Presencial', localizacao: '' };
    this.fecharModalAnuncio();
    this.mudarAba('servicos');
  }

  // --- NAVEGAÇÃO INTELIGENTE (SERVIÇOS E VAGAS) ---
  itemSelecionado: any = null;
  tipoItemSelecionado: 'servico' | 'vaga' | null = null;

  abrirDetalhes(item: any, tipo: 'servico' | 'vaga') {
    this.itemSelecionado = item;
    this.tipoItemSelecionado = tipo;
    window.scrollTo(0, 0);
  }
  
  voltarParaHome() { 
    this.itemSelecionado = null; 
    this.tipoItemSelecionado = null;
  }

  // --- MODAL SOBRE ---
  mostrarModalSobre = false;
  abrirSobre() { this.mostrarModalSobre = true; }
  fecharSobre() { this.mostrarModalSobre = false; }

  // --- SISTEMA DE CHECKOUT (ASSINATURA) ---
  mostrarModalCheckout = false;
  planoSelecionado: any = null;
  parcelasCheckout: any[] = [];
  
  abrirCheckout(plano: any) {
    this.planoSelecionado = plano;
    this.gerarParcelas(plano);
    this.mostrarModalCheckout = true;
  }
  fecharCheckout() {
    this.mostrarModalCheckout = false;
    this.planoSelecionado = null;
  }
  gerarParcelas(plano: any) {
    this.parcelasCheckout = [];
    const total = plano.precoMensal * plano.meses;
    for (let i = 1; i <= plano.meses; i++) {
      const valorParcela = (total / i).toFixed(2).replace('.', ',');
      this.parcelasCheckout.push({ vezes: i, texto: `${i}x de R$ ${valorParcela} (Total: R$ ${total.toFixed(2).replace('.', ',')})` });
    }
  }
  finalizarPagamento() {
    alert('Pagamento processado com sucesso! Bem-vindo ao plano ' + this.planoSelecionado.nome + '!');
    this.fecharCheckout();
  }

  // --- DADOS ENRIQUECIDOS ---
  listaServicos = [
    { 
      id: 1, titulo: 'Tradução de Documentos', preco: 'R$ 80/hora', avaliacao: '4.7', imagem: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=400&q=80',
      sobreServico: 'Tradução juramentada e técnica de documentos do inglês e espanhol para o português. Garantia de formatação original e entrega em até 48h para textos de até 10 páginas.',
      sobreProfissional: 'Sou tradutor certificado com mais de 8 anos de experiência corporativa, formado em Letras e especializado em contratos jurídicos.',
      contato: '+55 (31) 98888-7777'
    },
    { 
      id: 2, titulo: 'Edição de Vídeos Vintage', preco: 'R$ 120/vídeo', avaliacao: '5.0', imagem: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=400&q=80',
      sobreServico: 'Edição de reels e TikToks com estética vintage/retro. Inclui color grading analógico, inserção de ruídos de fita e legendas dinâmicas.',
      sobreProfissional: 'Filmmaker apaixonado pelos anos 80 e 90. Já editei para grandes perfis de lifestyle e moda na região.',
      contato: '+55 (31) 97777-6666'
    }
  ];

  listaVagas = [
    { 
      id: 1, titulo: 'Auxiliar de Logística (Urgente)', empresa: 'Transportes Betim', pagamento: 'R$ 150 / dia', tipo: 'Presencial', imagem: 'https://images.unsplash.com/photo-1586528116311-ad8ed7e66364?auto=format&fit=crop&w=400&q=80',
      local: 'Distrito Industrial, Betim/MG',
      turnos: '08:00 às 17:00 (Segunda a Sexta)',
      tempoAlmoco: '1 hora e 30 minutos',
      fretado: 'Sim (Saídas do Centro e PTB)',
      descricaoVaga: 'Precisamos de auxiliar para carga e descarga de mercadorias leves, organização de paletes e uso de leitor de código de barras. É essencial ter disposição física e pontualidade.'
    },
    { 
      id: 2, titulo: 'Pintor para Galpão', empresa: 'Construtora Silva', pagamento: 'R$ 2.500 / obra', tipo: 'Presencial', imagem: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80',
      local: 'Jardim Teresópolis, Betim/MG',
      turnos: 'Horário Livre (Entrega por Demanda)',
      tempoAlmoco: 'Livre',
      fretado: 'Não possui (Vale Transporte em dinheiro)',
      descricaoVaga: 'Contratação para pintura completa de galpão de 500m². O profissional deve trazer rolos e trinchas; a empresa fornecerá tintas, andaimes e lixas. Pagamento 50% no início e 50% na entrega.'
    }
  ];

  listaPlanos = [
    { nome: 'Mensal', precoMensal: 39.90, meses: 1, servicosAtivos: '1 serviço', suporte: 'Suporte básico', destaque: false },
    { nome: 'Trimestral', precoMensal: 35.90, meses: 3, servicosAtivos: '3 serviços', suporte: 'Suporte prioritário', destaque: false },
    { nome: 'Semestral', precoMensal: 31.90, meses: 6, servicosAtivos: '6 serviços', suporte: 'Suporte premium', destaque: false },
    { nome: 'Anual', precoMensal: 23.90, meses: 12, servicosAtivos: 'Ilimitado', suporte: 'Suporte VIP', destaque: true }
  ];
}