# ProspectaHub — Mapeamento Inteligente de Clientes

## Visão Geral

**ProspectaHub** é uma plataforma SaaS de prospecção comercial B2B que transforma a forma como empresas descobrem, qualificam e gerenciam potenciais clientes. Desenvolvida como uma aplicação web completa (single-page application), a plataforma combina busca multi-fonte com inteligência artificial para entregar perfis detalhados de empresas — eliminando o trabalho manual de pesquisa e qualificação de leads.

**URL:** [prospectahub.digital](https://prospectahub.digital)

---

## O Problema

Equipes comerciais de fabricantes e distribuidores perdem horas por semana pesquisando manualmente potenciais clientes: buscando no Google, navegando LinkedIn, copiando dados de redes sociais, tentando descobrir quem é o responsável por compras. Esse processo fragmentado e demorado resulta em baixa produtividade, dados incompletos e oportunidades perdidas.

---

## A Solução

O ProspectaHub automatiza todo o ciclo de descoberta e qualificação de leads em uma interface unificada:

### 🔍 Busca Inteligente Multi-Fonte
- **Busca Rápida**: Consulta a Google Places API com paginação otimizada (até 60 resultados por busca), incluindo avaliações, endereços e contatos
- **Busca Profunda**: Além do Google Places, descobre automaticamente perfis em LinkedIn, Instagram e Facebook via Google Custom Search API
- Importação em massa com seleção por checkbox
- Sugestões de termos de busca por segmento

### 🤖 Análise por Inteligência Artificial
- Integração com OpenAI (GPT-4o) e Anthropic (Claude) para análise automática de empresas
- Gera automaticamente: sensibilidades comerciais (Preço, Qualidade, Prazo, etc.), canal de contato preferido, produtos relevantes
- Cada insight inclui justificativa e nível de confiança
- Elimina a subjetividade da qualificação manual

### 📋 Radiografia da Empresa (Perfil Completo)
- **Aba Info**: Dados cadastrais, departamento de compras (nome, cargo, email, telefone, WhatsApp), endereço
- **Aba Redes Sociais**: Links diretos para LinkedIn, Instagram, Facebook, Google Maps + avaliações Google com estrelas
- **Aba Sensibilidades**: 8 dimensões de sensibilidade (Preço, Qualidade, Prazo, Estoque, Marca, Pós-Venda, Personalização, Crédito) com sliders ajustáveis e badges de IA
- **Aba Produtos**: Tags editáveis de produtos relevantes da empresa
- Sistema de status em 1 clique: Novo → Contatado → Em Negociação → Fechado

### 📊 Dashboard Analítico
- Cards de status com contagem de empresas por estágio do funil
- Métricas: total de empresas, analisadas por IA, avaliação média Google
- Distribuição de canais de contato preferidos
- Sensibilidades agregadas do portfólio
- Adições recentes

### ⚙️ Painel Administrativo Completo
- Gestão de usuários com papéis (Admin, Vendedor, Visualizador)
- Gestão de projetos e permissões granulares
- Configuração de APIs (Google Places, Custom Search, IA) via interface
- Personalização visual (cores e logo)
- Logs de atividades
- Sistema de planos SaaS (Starter, Pro, Enterprise) com limites configuráveis

### 🌐 Multi-idioma
- Interface completa em Português e Inglês
- Troca de idioma em tempo real

---

## Stack Técnica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 (CDN) + Babel Standalone |
| Estilização | CSS-in-JS inline com design system customizado |
| Estado | React Hooks (useState, useEffect) |
| Persistência | localStorage com sistema de serialização |
| APIs | Google Places API v1, Google Custom Search API, OpenAI API, Anthropic API |
| Hospedagem | Arquivo único HTML — deploy simples em qualquer servidor estático |
| Autenticação | Sistema próprio com roles e permissões |

### Decisões Arquiteturais

- **Single-file architecture**: Toda a aplicação vive em um único arquivo HTML (~1600 linhas). Isso permite deploy instantâneo, sem build system, e facilidade para clientes não-técnicos hospedarem
- **Zero dependências de build**: React e Babel carregados via CDN — sem npm, webpack, ou pipeline de CI/CD
- **Progressive Enhancement**: Funciona com dados de exemplo offline; ativa funcionalidades avançadas conforme APIs são configuradas
- **Migration system**: Sistema de migração automática de dados garante que atualizações nunca quebrem dados existentes

---

## Resultados

- **10x mais empresas** encontradas por busca comparado ao processo manual
- **Eliminação de 3-4 horas semanais** de pesquisa manual por vendedor
- **Perfis 80% completos** automaticamente (vs. ~20% no processo manual)
- **Qualificação objetiva** via IA substitui "achismo" da equipe comercial

---

## Meu Papel

Atuei como **desenvolvedor full-stack e designer de produto**, responsável por:
- Levantamento de requisitos com o cliente (fabricante de LED)
- Arquitetura da aplicação e design system ("Signal Cartography")
- Desenvolvimento frontend completo (React)
- Integração com 4 APIs externas (Google Places, Custom Search, OpenAI, Anthropic)
- Design de UX/UI focado em produtividade comercial
- Deploy e suporte em produção

---

## Screenshots

1. **Dashboard** — Visão geral com cards de status, métricas e gráficos de sensibilidades
2. **Busca Inteligente** — Interface de busca multi-fonte com toggle rápida/profunda
3. **Radiografia (Info)** — Perfil completo com status em 1 clique e departamento de compras
4. **Radiografia (Sensibilidades)** — Análise de 8 dimensões com IA e sliders ajustáveis
5. **Admin (Integrações)** — Painel de configuração de APIs
6. **Clientes** — Lista de empresas com status e filtros
7. **Login** — Tela de acesso com identidade visual

---

*Projeto desenvolvido em 2025-2026 | React + Google APIs + OpenAI/Anthropic*
