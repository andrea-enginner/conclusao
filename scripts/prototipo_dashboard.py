"""
Script para gerar protótipo visual do dashboard de clusters e benchmarking
Gera uma imagem estática mostrando o layout da interface
"""

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import Rectangle, FancyBboxPatch
import numpy as np

# Configurar figura
fig = plt.figure(figsize=(16, 10))
ax = fig.add_subplot(111)
ax.set_xlim(0, 16)
ax.set_ylim(0, 10)
ax.axis('off')

# Cores
cor_header = '#1f77b4'
cor_sidebar = '#f0f2f6'
cor_card = '#ffffff'
cor_borda = '#d3d3d3'
cor_texto = '#333333'

# ========== HEADER ==========
header = FancyBboxPatch((0, 9), 16, 1, 
                       boxstyle="round,pad=0.01", 
                       facecolor=cor_header, 
                       edgecolor='none',
                       transform=ax.transData)
ax.add_patch(header)
ax.text(8, 9.5, '🏙️ Dashboard de Análise de Cluster - Saneamento SINISA', 
        ha='center', va='center', fontsize=18, color='white', weight='bold')

# ========== SIDEBAR ==========
sidebar = FancyBboxPatch((0, 0), 3, 9, 
                         boxstyle="round,pad=0.05", 
                         facecolor=cor_sidebar, 
                         edgecolor=cor_borda,
                         linewidth=1.5,
                         transform=ax.transData)
ax.add_patch(sidebar)

# Título sidebar
ax.text(1.5, 8.5, '⚙️ Configurações', 
        ha='center', va='center', fontsize=14, weight='bold', color=cor_texto)

# Seções da sidebar
secoes_sidebar = [
    ('📊 Indicadores', 8.0),
    ('🔧 Parâmetros', 6.5),
    ('📈 Métricas', 5.0)
]

for secao, y_pos in secoes_sidebar:
    ax.text(1.5, y_pos, secao, 
            ha='center', va='center', fontsize=11, weight='bold', color=cor_texto)
    
    # Linha divisória
    ax.plot([0.3, 2.7], [y_pos - 0.2, y_pos - 0.2], 
            color=cor_borda, linewidth=1)

# Exemplos de controles
controles = [
    ('Número de Clusters (k):', '4', 6.0),
    ('Normalização:', 'Min-Max', 5.5),
    ('Silhouette Score:', '0.623', 4.5)
]

for label, valor, y_pos in controles:
    ax.text(0.4, y_pos, f'{label}', 
            ha='left', va='center', fontsize=9, color=cor_texto)
    ax.text(2.6, y_pos, f'{valor}', 
            ha='right', va='center', fontsize=9, weight='bold', color=cor_header)

# ========== ÁREA PRINCIPAL ==========
# Métricas no topo
metricas_y = 8.0
metricas = [
    ('Municípios', '19', 3.5),
    ('Indicadores', '12', 6.0),
    ('Clusters', '4', 8.5),
    ('Silhouette', '0.623', 11.0)
]

for label, valor, x_pos in metricas:
    card = FancyBboxPatch((x_pos, metricas_y), 2.2, 0.8, 
                         boxstyle="round,pad=0.05", 
                         facecolor=cor_card, 
                         edgecolor=cor_borda,
                         linewidth=1,
                         transform=ax.transData)
    ax.add_patch(card)
    ax.text(x_pos + 1.1, metricas_y + 0.5, valor, 
            ha='center', va='center', fontsize=16, weight='bold', color=cor_header)
    ax.text(x_pos + 1.1, metricas_y + 0.2, label, 
            ha='center', va='center', fontsize=9, color=cor_texto)

# ========== ABAS ==========
abas_y = 7.0
abas = ['📊 Visualização', '🏆 Benchmarking', '📈 Análise', '📋 Relatório']
aba_width = 3.5

for i, aba in enumerate(abas):
    x_pos = 3.2 + i * aba_width
    if i == 0:  # Primeira aba ativa
        cor_aba = cor_header
        cor_texto_aba = 'white'
    else:
        cor_aba = cor_card
        cor_texto_aba = cor_texto
    
    aba_rect = FancyBboxPatch((x_pos, abas_y), aba_width, 0.5, 
                              boxstyle="round,pad=0.02", 
                              facecolor=cor_aba, 
                              edgecolor=cor_borda,
                              linewidth=1,
                              transform=ax.transData)
    ax.add_patch(aba_rect)
    ax.text(x_pos + aba_width/2, abas_y + 0.25, aba, 
            ha='center', va='center', fontsize=10, color=cor_texto_aba, weight='bold')

# ========== CONTEÚDO DA ABA VISUALIZAÇÃO ==========
conteudo_y = 6.0

# Gráfico PCA 2D
pca_card = FancyBboxPatch((3.5, conteudo_y - 1.5), 5.5, 2.5, 
                         boxstyle="round,pad=0.05", 
                         facecolor=cor_card, 
                         edgecolor=cor_borda,
                         linewidth=1.5,
                         transform=ax.transData)
ax.add_patch(pca_card)
ax.text(6.25, conteudo_y + 0.5, 'Clusters - PCA 2D', 
        ha='center', va='center', fontsize=12, weight='bold', color=cor_texto)

# Simular pontos do scatter plot
np.random.seed(42)
for cluster in range(4):
    x_points = np.random.normal(6.25 + (cluster - 1.5) * 0.8, 0.3, 5)
    y_points = np.random.normal(conteudo_y - 0.3 + (cluster % 2) * 0.4, 0.2, 5)
    cores = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
    ax.scatter(x_points, y_points, c=cores[cluster], s=80, alpha=0.7, edgecolors='black', linewidth=0.5)

# Distribuição por cluster
dist_card = FancyBboxPatch((9.5, conteudo_y - 1.5), 5.5, 2.5, 
                          boxstyle="round,pad=0.05", 
                          facecolor=cor_card, 
                          edgecolor=cor_borda,
                          linewidth=1.5,
                          transform=ax.transData)
ax.add_patch(dist_card)
ax.text(12.25, conteudo_y + 0.5, 'Distribuição por Cluster', 
        ha='center', va='center', fontsize=12, weight='bold', color=cor_texto)

# Simular barras
barras_x = [10.5, 11.5, 12.5, 13.5]
barras_altura = [0.8, 1.2, 0.6, 1.0]
cores_barras = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
for i, (x, h) in enumerate(zip(barras_x, barras_altura)):
    barra = Rectangle((x, conteudo_y - 0.5), 0.6, h, 
                     facecolor=cores_barras[i], 
                     edgecolor='black', linewidth=1)
    ax.add_patch(barra)
    ax.text(x + 0.3, conteudo_y - 0.7, f'C{i}', 
            ha='center', va='center', fontsize=9, color=cor_texto)

# Heatmap
heatmap_card = FancyBboxPatch((3.5, conteudo_y - 4.5), 11.5, 2.5, 
                             boxstyle="round,pad=0.05", 
                             facecolor=cor_card, 
                             edgecolor=cor_borda,
                             linewidth=1.5,
                             transform=ax.transData)
ax.add_patch(heatmap_card)
ax.text(9.25, conteudo_y - 2.5, '🔥 Heatmap: Indicadores por Município', 
        ha='center', va='center', fontsize=12, weight='bold', color=cor_texto)

# Simular grid do heatmap
heatmap_x_start = 4.0
heatmap_y_start = conteudo_y - 4.0
cell_width = 0.6
cell_height = 0.3

# Cores do heatmap (simulando valores normalizados)
import matplotlib.cm as cm
cmap = cm.RdYlBu_r

for i in range(12):  # 12 indicadores
    for j in range(5):  # 5 municípios (amostra)
        x = heatmap_x_start + j * cell_width
        y = heatmap_y_start - i * cell_height
        valor = np.random.random()
        cor = cmap(valor)
        cell = Rectangle((x, y), cell_width - 0.05, cell_height - 0.05, 
                        facecolor=cor, edgecolor='white', linewidth=0.5)
        ax.add_patch(cell)

# Labels do heatmap
indicadores_short = ['IAG0001', 'IAG2006', 'IAG2013', 'IES0001', 'IES2004', 
                     'IFE1001', 'IRS0001', 'IRS1004', 'IRS3002', 'IAP0002', 
                     'IFD0010', 'IGR0002']
for i, ind in enumerate(indicadores_short[:6]):  # Mostrar apenas alguns
    ax.text(3.7, heatmap_y_start - i * cell_height - cell_height/2, ind, 
            ha='right', va='center', fontsize=7, color=cor_texto)

# ========== LEGENDA ==========
legenda_y = 0.5
ax.text(8, legenda_y, 'Protótipo do Dashboard - Interface de Visualização de Clusters e Benchmarking', 
        ha='center', va='center', fontsize=10, style='italic', color=cor_texto)

# Salvar figura
plt.tight_layout()
plt.savefig('outputs/prototipo_dashboard.png', dpi=300, bbox_inches='tight', 
            facecolor='white', edgecolor='none')
print("✅ Protótipo do dashboard salvo em 'outputs/prototipo_dashboard.png'")

# Também criar uma versão mais simples para descrição textual
print("\n📋 DESCRIÇÃO DO PROTÓTIPO:")
print("=" * 60)
print("""
LAYOUT DO DASHBOARD:

1. HEADER (topo):
   - Título: "🏙️ Dashboard de Análise de Cluster - Saneamento SINISA"

2. SIDEBAR (esquerda):
   - Seção: ⚙️ Configurações
   - Controles:
     * Seleção de indicadores por módulo (Água, Esgoto, Resíduos, Drenagem)
     * Slider: Número de Clusters (k)
     * Selectbox: Método de Normalização
     * Exibição: Silhouette Score

3. ÁREA PRINCIPAL:
   
   a) Métricas no topo (4 cards):
      - Municípios: 19
      - Indicadores: 12
      - Clusters: 4
      - Silhouette Score: 0.623
   
   b) Abas de navegação:
      - 📊 Visualização (ativa)
      - 🏆 Benchmarking
      - 📈 Análise
      - 📋 Relatório
   
   c) Conteúdo da aba Visualização:
      - Scatter Plot PCA 2D (esquerda)
      - Gráfico de Distribuição por Cluster (direita)
      - Heatmap: Indicadores por Município (abaixo)

4. FUNCIONALIDADES:
   - Interatividade: Hover nos gráficos mostra nome do município
   - Filtros dinâmicos: Alterar indicadores atualiza visualizações
   - Download: Botão para exportar resultados em CSV
""")

plt.show()

