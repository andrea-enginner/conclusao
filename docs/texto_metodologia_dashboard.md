# Texto para Metodologia - Protótipo do Dashboard

## Versão para Inserir no TCC

### Seção: Implementação da Aplicação Web (Dashboard)

Para disponibilizar os resultados da análise de cluster de forma interativa e acessível, foi desenvolvido um protótipo de dashboard web utilizando o framework Streamlit, uma biblioteca Python especializada na criação de interfaces web para análise de dados. A escolha do Streamlit se justifica pela integração nativa com o ecossistema Python já utilizado na análise (pandas, scikit-learn, plotly), pela facilidade de prototipagem e pela possibilidade de deploy gratuito na nuvem.

O dashboard foi projetado com uma arquitetura em três componentes principais: (1) uma barra lateral (sidebar) contendo os controles de configuração, permitindo ao usuário selecionar indicadores por módulo (água, esgoto, resíduos sólidos e drenagem), ajustar o número de clusters (k) através de um slider, e escolher o método de normalização; (2) um painel de métricas no topo da página, exibindo informações resumidas como número de municípios analisados, quantidade de indicadores selecionados, número de clusters formados e o Silhouette Score como medida de qualidade; e (3) uma área de conteúdo organizada em abas, compreendendo quatro seções: Visualização, Benchmarking, Análise e Relatório.

A aba de Visualização apresenta três componentes gráficos principais: um scatter plot em duas dimensões utilizando Análise de Componentes Principais (PCA), onde cada ponto representa um município e a cor indica o cluster ao qual pertence; um gráfico de barras mostrando a distribuição de municípios por cluster; e um heatmap exibindo os valores normalizados de cada indicador para todos os municípios, facilitando a identificação visual de padrões e discrepâncias. A aba de Benchmarking apresenta, para cada cluster, a lista de municípios pertencentes ao grupo e identifica as melhores práticas, destacando o município com melhor desempenho em cada indicador dentro do cluster. A aba de Análise fornece métricas detalhadas de qualidade do clustering (Silhouette Score, variância explicada pelo PCA) e boxplots mostrando a distribuição de cada indicador dentro de cada cluster. Por fim, a aba de Relatório gera um resumo executivo da análise e permite o download dos dados com os clusters atribuídos em formato CSV.

A interface foi projetada para ser interativa, atualizando automaticamente todos os gráficos e métricas quando o usuário altera os parâmetros de configuração, permitindo exploração dinâmica dos dados. Os gráficos utilizam a biblioteca Plotly, que oferece funcionalidades de zoom, pan e hover, exibindo informações detalhadas ao passar o mouse sobre os elementos. O protótipo visual do dashboard está apresentado na Figura X (ou Anexo X), demonstrando o layout proposto e a organização dos componentes.

Esta abordagem de visualização interativa facilita a interpretação dos resultados da análise de cluster, permitindo que gestores públicos e pesquisadores explorem os dados de forma intuitiva, identifiquem padrões regionais e utilizem as informações de benchmarking para orientar políticas públicas de saneamento básico.

---

## Versão Resumida (Alternativa)

### Seção: Implementação da Aplicação Web

Foi desenvolvido um protótipo de dashboard web utilizando o framework Streamlit para disponibilizar de forma interativa os resultados da análise de cluster. A interface é composta por: (1) uma sidebar com controles para seleção de indicadores, ajuste do número de clusters e escolha do método de normalização; (2) um painel de métricas exibindo resumo da análise; e (3) quatro abas de conteúdo: Visualização (scatter plot PCA, distribuição por cluster, heatmap), Benchmarking (melhores práticas por cluster), Análise (métricas detalhadas e boxplots) e Relatório (resumo executivo e download de dados). A interface atualiza automaticamente os gráficos quando os parâmetros são alterados, utilizando a biblioteca Plotly para visualizações interativas. O protótipo visual está apresentado na Figura X.

---

## Notas para o Autor

- Substitua "Figura X" pela numeração correta da figura no seu TCC
- Se preferir, pode mencionar "Anexo X" ao invés de figura
- Ajuste o tom conforme o estilo do seu TCC (mais formal ou mais direto)
- Pode adicionar uma citação sobre Streamlit se necessário
- Considere mencionar que o dashboard será disponibilizado online após a conclusão do TCC

