# ANEXO: Algoritmo de Clusterização K-Means

## Descrição do Algoritmo

O algoritmo k-means, conforme proposto por MacQueen (1967) e detalhado por Oliveira (2018), é um método de clusterização particional não-supervisionado que divide os dados em k grupos (clusters). O algoritmo inicia-se com a definição do número k de clusters e a escolha inicial de centroides. Em cada iteração, cada município é atribuído ao grupo cujo centroide apresenta a menor distância, calculada a partir dos valores normalizados dos indicadores selecionados. Em seguida, os centroides são recalculados com base na média dos elementos atribuídos a cada grupo, e o processo é repetido até que não haja mais mudanças na composição dos clusters.

A definição do número de clusters (k) é orientada principalmente pelo coeficiente médio de silhueta, que avalia simultaneamente a coesão interna e a separação entre os grupos formados. Este índice, cujo valor varia de -1 a 1, assume valores mais elevados (próximos de 1) quando os elementos estão bem ajustados ao seu grupo e afastados dos demais, e valores próximos de 0 ou negativos quando há baixa separação entre os clusters (Vargas et al., 2022).

## Pseudocódigo

```
ALGORITMO K-MEANS
Entrada: Dados normalizados X, intervalo de valores de k [k_min, k_max]
Saída: Rótulos de cluster para cada município, k ótimo selecionado

1. SELEÇÃO DO NÚMERO DE CLUSTERS (k):
   1.1. PARA cada k no intervalo [k_min, k_max]:
        1.1.1. Inicializar k centroides
        1.1.2. REPETIR até convergência:
               - Atribuir cada município ao cluster do centroide mais próximo
               - Recalcular centroides como média dos elementos do cluster
        1.1.3. Calcular coeficiente médio de silhueta
   1.2. Selecionar k com maior coeficiente de silhueta

2. APLICAÇÃO DO K-MEANS COM K ÓTIMO:
   2.1. Inicializar k centroides
   2.2. REPETIR até convergência (sem mudanças na composição):
       2.2.1. Atribuir cada município ao grupo cujo centroide apresenta menor distância
       2.2.2. Recalcular centroides com base na média dos elementos atribuídos
   2.3. RETORNAR rótulos dos clusters
```

## Implementação em Python

O algoritmo é implementado de forma modular, com funções específicas para cada etapa do processo:

```python
import warnings
from typing import Dict, Tuple

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

warnings.filterwarnings("ignore")

def carregar_dados(caminho_csv: str) -> pd.DataFrame:
    """Carrega os dados normalizados do arquivo CSV."""
    df = pd.read_csv(caminho_csv, index_col="Municipio")
    return df

def aplicar_kmeans(
    dados: np.ndarray,
    n_clusters: int,
    random_state: int = 42,
    max_iter: int = 300,
) -> Tuple[KMeans, np.ndarray]:
    """
    Aplica o algoritmo k-means aos dados normalizados.
    
    Conforme a metodologia proposta, o algoritmo segue os seguintes passos:
    1. Define o número k de clusters
    2. Escolhe centroides iniciais (k-means++)
    3. Em cada iteração: atribui cada município ao cluster com menor distância
    4. Recalcula centroides como média dos elementos de cada grupo
    5. Repete até convergência (sem mudanças na composição)
    """
    modelo = KMeans(
        n_clusters=n_clusters,
        init="k-means++",  # Inicialização inteligente dos centróides
        n_init=10,         # Número de inicializações diferentes
        max_iter=max_iter,
        random_state=random_state,
        algorithm="lloyd",  # Algoritmo clássico de Lloyd (MacQueen, 1967)
    )
    rotulos = modelo.fit_predict(dados)
    return modelo, rotulos

def calcular_silhueta(dados: np.ndarray, rotulos: np.ndarray) -> float:
    """
    Calcula o coeficiente médio de silhueta.
    
    Este índice varia de -1 a 1, assumindo valores mais elevados (próximos de 1)
    quando os elementos estão bem ajustados ao seu grupo e afastados dos demais.
    """
    return float(silhouette_score(dados, rotulos))

def avaliar_intervalo_k(
    dados: np.ndarray,
    k_min: int = 2,
    k_max: int = 8,
    random_state: int = 42,
    max_iter: int = 300,
) -> pd.DataFrame:
    """
    Avalia diferentes valores de k no intervalo especificado.
    
    Testa diferentes valores de k e calcula o coeficiente de silhueta para
    cada um, permitindo a seleção do k ótimo baseado no maior valor de silhueta.
    """
    resultados = []
    for k in range(k_min, k_max + 1):
        modelo, rotulos = aplicar_kmeans(
            dados, n_clusters=k, random_state=random_state, max_iter=max_iter
        )
        sil = calcular_silhueta(dados, rotulos)
        resultados.append({"k": k, "silhouette_score": sil})
    return pd.DataFrame(resultados)

def executar_clusterizacao_completa(
    caminho_dados: str,
    n_clusters: int,
) -> Dict[str, object]:
    """
    Executa o pipeline completo de clusterização.
    
    Integra todas as etapas: carregamento, aplicação do k-means e cálculo
    do coeficiente de silhueta.
    """
    df = carregar_dados(caminho_dados)
    matriz_dados = df.values
    
    modelo_kmeans, rotulos = aplicar_kmeans(matriz_dados, n_clusters=n_clusters)
    silhueta = calcular_silhueta(matriz_dados, rotulos)
    
    df_resultado = df.copy()
    df_resultado["Cluster"] = rotulos
    
    return {
        "dados_originais": df,
        "modelo_kmeans": modelo_kmeans,
        "rotulos": rotulos,
        "silhouette_score": silhueta,
        "dataframe_com_clusters": df_resultado,
    }
```

## Parâmetros do Algoritmo

| Parâmetro | Valor | Descrição |
|-----------|-------|-----------|
| `n_clusters` | None ou int | Número de clusters desejados (k). Se None, seleciona automaticamente baseado em silhueta |
| `k_range` | (2, 6) | Intervalo de valores de k para testar quando n_clusters=None |
| `init` | 'k-means++' | Método de inicialização dos centroides |
| `n_init` | 10 | Número de inicializações diferentes |
| `max_iter` | 300 | Número máximo de iterações |
| `random_state` | 42 | Semente aleatória para reprodutibilidade |
| `algorithm` | 'lloyd' | Algoritmo clássico de Lloyd (MacQueen, 1967) |
| `tol` | 1e-4 | Tolerância para convergência (sem mudanças na composição) |

## Métricas de Qualidade

### Coeficiente Médio de Silhueta

O coeficiente médio de silhueta avalia simultaneamente a coesão interna e a separação entre os grupos formados. Este índice, cujo valor varia de -1 a 1, é amplamente utilizado como medida de validação interna de agrupamentos, assumindo valores mais elevados (próximos de 1) quando os elementos estão bem ajustados ao seu grupo e afastados dos demais, e valores próximos de 0 ou negativos quando há baixa separação entre os clusters ou possíveis alocações inadequadas (Vargas et al., 2022).

```
Silhouette Score = (b - a) / max(a, b)
```

onde:
- `a`: distância média do ponto aos outros pontos do mesmo cluster (coesão interna)
- `b`: distância média do ponto aos pontos do cluster mais próximo (separação)

A seleção do número de clusters (k) é orientada principalmente por este coeficiente, testando-se valores de k e selecionando-se aquele que apresentar o maior valor médio do índice de silhueta.

## Exemplo de Aplicação

```python
# Configuração dos parâmetros
CAMINHO_DADOS = "dados_normalizados.csv"
N_CLUSTERS = 4

# Execução do algoritmo
resultados = executar_clusterizacao_completa(
    caminho_dados=CAMINHO_DADOS,
    n_clusters=N_CLUSTERS
)

# Exibição dos resultados
print(f"Coeficiente médio de silhueta: {resultados['silhouette_score']:.4f}")
print(f"Distribuição por cluster:")
print(resultados['dataframe_com_clusters']['Cluster'].value_counts().sort_index())

# Opcional: Avaliar intervalo de k para seleção do k ótimo
df_avaliacao = avaliar_intervalo_k(
    resultados["dados_originais"].values,
    k_min=2,
    k_max=6,
    random_state=42
)
print("\nResultados da avaliação de diferentes valores de k:")
print(df_avaliacao)

k_otimo = df_avaliacao.loc[df_avaliacao["silhouette_score"].idxmax(), "k"]
silhueta_otima = df_avaliacao.loc[df_avaliacao["silhouette_score"].idxmax(), "silhouette_score"]
print(f"\n✓ Melhor k: {int(k_otimo)} (Silhueta = {silhueta_otima:.4f})")
```

## Referências

- MacQueen, J. (1967). Some methods for classification and analysis of multivariate observations. Proceedings of the fifth Berkeley symposium on mathematical statistics and probability, 1(14), 281-297.

- Oliveira, A. (2018). [Referência específica sobre k-means - ajustar conforme bibliografia do trabalho]

- Vargas, M., et al. (2022). [Referência sobre qualidade de partições e silhueta - ajustar conforme bibliografia do trabalho]

- Rousseeuw, P. J. (1987). Silhouettes: a graphical aid to the interpretation and validation of cluster analysis. Journal of computational and applied mathematics, 20, 53-65.

