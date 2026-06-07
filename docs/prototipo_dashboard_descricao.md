# Protótipo do Dashboard de Análise de Cluster e Benchmarking

## Descrição Geral

O dashboard web foi projetado para disponibilizar de forma interativa os resultados da análise de cluster dos 19 municípios da Bahia e Pernambuco, utilizando os indicadores do SINISA. A interface permite visualização dinâmica dos clusters, análise de benchmarking e exploração dos dados.

## Estrutura da Interface

### 1. Cabeçalho (Header)
- **Localização**: Topo da página
- **Conteúdo**: 
  - Título principal: "🏙️ Dashboard de Análise de Cluster - Saneamento SINISA"
  - Ícone representativo do tema (saneamento/urbanização)
- **Função**: Identificação visual e branding da aplicação

### 2. Barra Lateral (Sidebar)
- **Localização**: Lado esquerdo da tela
- **Largura**: Aproximadamente 20% da largura total
- **Cor de fundo**: Cinza claro (#f0f2f6) para diferenciação visual

#### 2.1 Seção: ⚙️ Configurações

**2.1.1 Seleção de Indicadores**
- **Tipo**: Multi-select por módulo
- **Organização**: 
  - 📊 Água (3 indicadores)
  - 🚽 Esgoto (3 indicadores)
  - ♻️ Resíduos (3 indicadores)
  - 🌧️ Drenagem (3 indicadores)
- **Funcionalidade**: Permite selecionar quais indicadores serão utilizados no clustering
- **Validação**: Mínimo de 3 indicadores selecionados

**2.1.2 Parâmetros do Clustering**
- **Número de Clusters (k)**: 
  - Tipo: Slider
  - Range: 2 a 6
  - Valor padrão: 4
  - Atualização: Em tempo real ao alterar o valor

- **Método de Normalização**:
  - Tipo: Selectbox
  - Opções: StandardScaler, RobustScaler, MinMaxScaler
  - Valor padrão: MinMaxScaler

**2.1.3 Métricas de Qualidade**
- **Silhouette Score**: 
  - Exibição automática após execução do clustering
  - Formato: 3 casas decimais
  - Indicador visual: 
    - > 0.7: Verde (clusters bem definidos)
    - 0.5-0.7: Amarelo (clusters razoáveis)
    - < 0.5: Vermelho (clusters mal definidos)

### 3. Área Principal

#### 3.1 Painel de Métricas (Topo)
- **Localização**: Logo abaixo do header, antes das abas
- **Layout**: 4 cards horizontais lado a lado
- **Métricas exibidas**:
  1. **Municípios**: Total de entidades analisadas (19)
  2. **Indicadores**: Quantidade de indicadores selecionados (12)
  3. **Clusters**: Número de grupos formados (k)
  4. **Silhouette Score**: Qualidade dos clusters (0.623)

#### 3.2 Sistema de Abas
- **Localização**: Abaixo do painel de métricas
- **Abas disponíveis**:
  1. **📊 Visualização** (aba padrão/ativa)
  2. **🏆 Benchmarking**
  3. **📈 Análise**
  4. **📋 Relatório**

#### 3.3 Conteúdo das Abas

##### Aba 1: 📊 Visualização

**3.3.1 Scatter Plot PCA 2D**
- **Localização**: Lado esquerdo, parte superior
- **Dimensões**: Aproximadamente 45% da largura, 30% da altura
- **Conteúdo**:
  - Eixos: PC1 e PC2 (com percentual de variância explicada)
  - Pontos coloridos por cluster
  - Hover: Mostra nome do município
  - Legenda: Identificação dos clusters (C0, C1, C2, C3)
- **Interatividade**: Zoom e pan habilitados

**3.3.2 Gráfico de Distribuição por Cluster**
- **Localização**: Lado direito, parte superior
- **Dimensões**: Aproximadamente 45% da largura, 30% da altura
- **Tipo**: Gráfico de barras
- **Conteúdo**:
  - Eixo X: Número do cluster (0, 1, 2, 3)
  - Eixo Y: Quantidade de municípios
  - Cores: Mesmas cores dos clusters no scatter plot
- **Função**: Mostra quantos municípios pertencem a cada cluster

**3.3.3 Heatmap: Indicadores por Município**
- **Localização**: Parte inferior, largura total
- **Dimensões**: 100% da largura, 30% da altura
- **Conteúdo**:
  - Eixo Y: Lista de indicadores (12 indicadores)
  - Eixo X: Lista de municípios (19 municípios)
  - Cores: Escala RdYlBu_r (vermelho = baixo, azul = alto)
  - Valores: Anotados em cada célula (2 casas decimais)
- **Organização**: Municípios ordenados por cluster
- **Interatividade**: Hover mostra valor exato e município/indicador

##### Aba 2: 🏆 Benchmarking

**3.3.4 Análise de Benchmarking por Cluster**
- **Estrutura**: Seção para cada cluster
- **Conteúdo por cluster**:
  - **Cabeçalho**: Nome do cluster e quantidade de municípios
  - **Lista de municípios**: Todos os municípios pertencentes ao cluster
  - **Melhores práticas**: 
    - Para cada indicador, identifica o município com melhor desempenho
    - Formato: "Indicador: Município (valor)"
    - Diferenciação: Indicadores onde menor é melhor (IAG2013, IRS3002, IGR0002)
- **Layout**: Cards verticais, um por cluster

##### Aba 3: 📈 Análise

**3.3.5 Métricas de Qualidade Detalhadas**
- **Silhouette Score Global**: Valor numérico + interpretação visual
- **Variância Explicada (PCA)**: 
  - PC1: Percentual
  - PC2: Percentual
  - Total: Soma dos dois

**3.3.6 Boxplots por Indicador**
- **Layout**: Grid de boxplots (3 colunas × 4 linhas)
- **Conteúdo**: Um boxplot por indicador
- **Estrutura**: 
  - Eixo X: Número do cluster
  - Eixo Y: Valor normalizado do indicador
  - Cores: Diferenciação por cluster
- **Função**: Mostra distribuição de cada indicador dentro de cada cluster

##### Aba 4: 📋 Relatório

**3.3.7 Resumo Executivo**
- **Parâmetros da Análise**: Lista formatada dos parâmetros utilizados
- **Caracterização dos Clusters**: 
  - Para cada cluster:
    - Lista de municípios
    - Perfil médio (média de cada indicador)
- **Botão de Download**: 
  - Formato: CSV
  - Conteúdo: Dados originais + coluna de cluster atribuído

## Funcionalidades Interativas

### 1. Atualização em Tempo Real
- Alteração de parâmetros (k, normalização, indicadores) atualiza automaticamente:
  - Gráficos
  - Métricas
  - Clusters
  - Benchmarking

### 2. Interatividade nos Gráficos
- **Hover**: Mostra informações detalhadas ao passar o mouse
- **Zoom**: Possibilidade de ampliar áreas específicas
- **Seleção**: Clicar em pontos/municípios destaca informações relacionadas

### 3. Exportação de Dados
- **Formato CSV**: Download dos dados com clusters atribuídos
- **Formato PNG**: Download dos gráficos gerados
- **Formato PDF**: Relatório completo (futuro)

## Tecnologias Utilizadas

- **Framework**: Streamlit (Python)
- **Visualização**: Plotly (gráficos interativos), Matplotlib/Seaborn (gráficos estáticos)
- **Processamento**: Pandas, NumPy, Scikit-learn
- **Deploy**: Streamlit Cloud (gratuito)

## Fluxo de Uso

1. **Carregamento**: Dashboard carrega dados do SINISA automaticamente
2. **Configuração**: Usuário ajusta parâmetros na sidebar
3. **Execução**: Clustering é executado automaticamente
4. **Visualização**: Resultados são exibidos nas abas
5. **Exploração**: Usuário navega entre abas e interage com gráficos
6. **Exportação**: Usuário pode baixar resultados se necessário

## Acessibilidade

- **Responsivo**: Adapta-se a diferentes tamanhos de tela
- **Navegação por teclado**: Suporte básico
- **Cores**: Paleta acessível (considerando daltonismo)
- **Legendas**: Todas as visualizações possuem legendas claras

## Protótipo Visual

O protótipo visual foi gerado utilizando matplotlib e está disponível em `outputs/prototipo_dashboard.png`, mostrando o layout completo da interface proposta.

