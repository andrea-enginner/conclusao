# Requisitos do dashboard (alinhado ao projeto atual)

Este documento foi **atualizado** para refletir a arquitetura descrita na monografia: **clusterização e benchmarks calculados em Python**, resultados expostos em **`resultados_clusterizacao.json`**, e **dashboard como aplicação estática (React)** que **consome** esse arquivo — **sem** reexecutar k-means nem normalização no navegador.

_Uma versão anterior deste arquivo previa clustering em tempo real com backend, PCA obrigatório e parâmetros editáveis (k, normalização); esse desenho **não** corresponde mais ao escopo._

---

## Tabela — Requisitos funcionais (RF)

Conforme o fluxo **JSON + frontend** (Quadro 6 da monografia).

| ID | Descrição |
|----|-----------|
| **RF01** | A aplicação deve carregar, em formato JSON, os dados provenientes do resultado de clusterização e benchmarking. |
| **RF02** | A aplicação deve exibir a lista de municípios incluídos no estudo, indicando a qual cluster cada um pertence. |
| **RF03** | A aplicação deve apresentar, para cada cluster, os municípios do grupo, os valores dos indicadores selecionados e os respectivos valores de referência de benchmarking (P25 no cluster). |
| **RF04** | A aplicação deve apresentar visualizações sintéticas (gráficos) que permitam comparar municípios e clusters com base nos indicadores selecionados. |
| **RF05** | A aplicação deve permitir que o usuário selecione o cluster de interesse para filtrar as informações exibidas. |
| **RF06** | A aplicação deve permitir que o usuário selecione quais indicadores deseja visualizar em cada módulo. |
| **RF07** | A aplicação deve permitir que o usuário identifique a posição de cada município em relação ao valor de referência do seu cluster para cada indicador. |

**Contrato de dados esperado** (gerado pelo script de clusterização): chaves `municipios` (indicadores normalizados + `Cluster`), `benchmarks` (P25 por cluster e indicador), opcionalmente `metricas` (k escolhido, silhueta, avaliação por k).

---

## Tabela — Requisitos não funcionais (RNF)

| ID | Descrição |
|----|-----------|
| **RNF08** | A aplicação deve ser desenvolvida utilizando **React**, versão 18, para o frontend e **Tailwind CSS** para estilização. |
| **RNF09** | A aplicação deve funcionar como aplicação estática no lado do cliente (frontend), **sem** necessidade de backend dedicado em produção. |
| **RNF10** | A aplicação deve poder ser hospedada em serviços gratuitos de hospedagem de páginas e aplicações frontend, como a **Vercel**. |
| **RNF11** | A interface deve ser responsiva e de fácil navegação, adaptando-se a diferentes tamanhos de tela e dispositivos. |

---

## Versão resumida (uma tabela só)

| Tipo | ID | Resumo |
|------|-----|--------|
| RF | RF01–RF07 | Carregar JSON; listar municípios e clusters; tabela/visualização de indicadores vs benchmark por cluster; filtros de cluster e indicador; destaque da posição em relação ao P25. |
| RNF | RNF08–RNF11 | React 18, Tailwind, SPA estática, deploy compatível com Vercel, layout responsivo. |

---

## Como usar no TCC

1. Inserir as tabelas na seção de **implementação do dashboard** ou **requisitos**, conforme a numeração dos capítulos.
2. Referenciar no texto que a **análise de clusters** e os **benchmarks** são **pré-processados**; o dashboard **não** recalcula k-means.
3. Ajustar o número da tabela (“Tabela X”) conforme a norma da instituição.
