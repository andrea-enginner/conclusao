"""
ANEXO: Algoritmo de Clusterização K-Means
==========================================

Este anexo apresenta o algoritmo de clusterização utilizado para agrupar
municípios com base em indicadores normalizados de saneamento básico do SINISA.

O algoritmo k-means, conforme proposto por MacQueen (1967) e detalhado por 
Oliveira (2018), inicia-se com a definição do número k de clusters e a escolha 
inicial de centroides. Em cada iteração, cada município é atribuído ao grupo 
cujo centroide apresenta a menor distância, calculada a partir dos valores 
normalizados dos indicadores selecionados. Em seguida, os centroides são 
recalculados com base na média dos elementos atribuídos a cada grupo, e o 
processo é repetido até que não haja mais mudanças na composição dos clusters.

A definição do número de clusters (k) é orientada pelo coeficiente médio de 
silhueta, que avalia simultaneamente a coesão interna e a separação entre os 
grupos formados (Vargas et al., 2022).
"""

import warnings
from typing import Dict, Tuple

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

warnings.filterwarnings("ignore")


def carregar_dados(caminho_csv: str) -> pd.DataFrame:
    """
    Carrega os dados normalizados do arquivo CSV.
    
    Parâmetros:
    -----------
    caminho_csv : str
        Caminho para o arquivo CSV com os dados normalizados
        
    Retorna:
    --------
    pandas.DataFrame
        DataFrame com os dados, onde 'Municipio' é o índice
    """
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
    
    O algoritmo k-means é um método de clusterização particional que divide
    os dados em k grupos, onde k é especificado a priori. O algoritmo busca
    minimizar a soma dos quadrados das distâncias entre os pontos e os
    centróides dos clusters aos quais pertencem.
    
    Conforme a metodologia proposta, o algoritmo segue os seguintes passos:
    1. Define o número k de clusters
    2. Escolhe centroides iniciais (k-means++)
    3. Em cada iteração: atribui cada município ao cluster com menor distância
    4. Recalcula centroides como média dos elementos de cada grupo
    5. Repete até convergência (sem mudanças na composição)
    
    Parâmetros:
    -----------
    dados : numpy.ndarray
        Dados normalizados para clusterização (sem coluna de identificação)
    n_clusters : int
        Número de clusters desejados (k)
    random_state : int, default=42
        Semente aleatória para reprodutibilidade
    max_iter : int, default=300
        Número máximo de iterações do algoritmo
        
    Retorna:
    --------
    sklearn.cluster.KMeans
        Modelo k-means treinado
    numpy.ndarray
        Rótulos dos clusters atribuídos a cada município
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
    
    O coeficiente médio de silhueta avalia simultaneamente a coesão interna
    e a separação entre os grupos formados. Este índice varia de -1 a 1,
    assumindo valores mais elevados (próximos de 1) quando os elementos estão
    bem ajustados ao seu grupo e afastados dos demais, e valores próximos de 0
    ou negativos quando há baixa separação entre os clusters (Vargas et al., 2022).
    
    Parâmetros:
    -----------
    dados : numpy.ndarray
        Dados utilizados na clusterização
    rotulos : numpy.ndarray
        Rótulos dos clusters atribuídos
        
    Retorna:
    --------
    float
        Coeficiente médio de silhueta
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
    
    Parâmetros:
    -----------
    dados : numpy.ndarray
        Dados normalizados para clusterização
    k_min : int, default=2
        Valor mínimo de k para testar
    k_max : int, default=8
        Valor máximo de k para testar (inclusive)
    random_state : int, default=42
        Semente aleatória para reprodutibilidade
    max_iter : int, default=300
        Número máximo de iterações do algoritmo
        
    Retorna:
    --------
    pandas.DataFrame
        DataFrame com os valores de k testados e seus respectivos
        coeficientes de silhueta
    """
    resultados = []

    for k in range(k_min, k_max + 1):
        modelo, rotulos = aplicar_kmeans(
            dados, n_clusters=k, random_state=random_state, max_iter=max_iter
        )
        sil = calcular_silhueta(dados, rotulos)
        resultados.append({"k": k, "silhouette_score": sil})

    tabela_resultados = pd.DataFrame(resultados)
    return tabela_resultados


def executar_clusterizacao_completa(
    caminho_dados: str,
    n_clusters: int,
) -> Dict[str, object]:
    """
    Executa o pipeline completo de clusterização.
    
    Esta função integra todas as etapas do processo:
    1. Carregamento dos dados
    2. Aplicação do k-means
    3. Cálculo do coeficiente de silhueta
    
    Parâmetros:
    -----------
    caminho_dados : str
        Caminho para o arquivo CSV com dados normalizados
    n_clusters : int
        Número de clusters desejados
        
    Retorna:
    --------
    dict
        Dicionário contendo todos os resultados da análise:
        - 'dados_originais': DataFrame original
        - 'modelo_kmeans': Modelo k-means treinado
        - 'rotulos': Rótulos dos clusters
        - 'silhouette_score': Coeficiente médio de silhueta
        - 'dataframe_com_clusters': DataFrame com coluna 'Cluster' adicionada
    """
    print("Carregando dados normalizados...")
    df = carregar_dados(caminho_dados)
    print(f"  {len(df)} municípios carregados.")
    print(f"  {len(df.columns)} indicadores utilizados na clusterização.")

    matriz_dados = df.values

    print(f"\nAplicando k-means com k = {n_clusters}...")
    modelo_kmeans, rotulos = aplicar_kmeans(matriz_dados, n_clusters=n_clusters)
    print("  Clusterização concluída.")

    print("\nCalculando índice de silhueta...")
    silhueta = calcular_silhueta(matriz_dados, rotulos)
    print(f"  Índice de silhueta: {silhueta:.4f}")

    resultados: Dict[str, object] = {
        "dados_originais": df,
        "modelo_kmeans": modelo_kmeans,
        "rotulos": rotulos,
        "silhouette_score": silhueta,
    }

    df_resultado = df.copy()
    df_resultado["Cluster"] = rotulos
    resultados["dataframe_com_clusters"] = df_resultado

    print("\nAnálise de clusterização concluída.")
    return resultados


def exibir_resumo_resultados(resultados: Dict[str, object]) -> None:
    """
    Exibe um resumo dos resultados da clusterização.
    
    Parâmetros:
    -----------
    resultados : dict
        Dicionário com os resultados retornado por executar_clusterizacao_completa
    """
    df_resultado = resultados["dataframe_com_clusters"]
    silhueta = resultados["silhouette_score"]

    print("\n" + "=" * 60)
    print("RESUMO DOS RESULTADOS DA CLUSTERIZAÇÃO")
    print("=" * 60)

    print("\nDistribuição de municípios por cluster:")
    print(df_resultado["Cluster"].value_counts().sort_index())

    print("\nMétrica de qualidade da partição:")
    print(f"  Índice de silhueta: {silhueta:.4f}")

    print("\nMunicípios por cluster:")
    for cluster_id in sorted(df_resultado["Cluster"].unique()):
        municipios = df_resultado[df_resultado["Cluster"] == cluster_id].index.tolist()
        print(f"\n  Cluster {cluster_id} ({len(municipios)} municípios):")
        for municipio in municipios:
            print(f"    - {municipio}")


# ============================================================================
# EXEMPLO DE APLICAÇÃO
# ============================================================================

if __name__ == "__main__":
    # Configuração dos parâmetros
    CAMINHO_DADOS = "../data/dados_normalizados.csv"
    N_CLUSTERS = 4
    
    # Execução do algoritmo
    resultados = executar_clusterizacao_completa(
        caminho_dados=CAMINHO_DADOS,
        n_clusters=N_CLUSTERS
    )
    
    # Exibição dos resultados
    exibir_resumo_resultados(resultados)
    
    # Opcional: Avaliar intervalo de k para seleção do k ótimo
    print("\n" + "=" * 60)
    print("AVALIAÇÃO DE DIFERENTES VALORES DE K")
    print("=" * 60)
    df_avaliacao = avaliar_intervalo_k(
        resultados["dados_originais"].values,
        k_min=2,
        k_max=6,
        random_state=42
    )
    print("\nResultados da avaliação:")
    print(df_avaliacao)
    
    k_otimo = df_avaliacao.loc[df_avaliacao["silhouette_score"].idxmax(), "k"]
    silhueta_otima = df_avaliacao.loc[df_avaliacao["silhouette_score"].idxmax(), "silhouette_score"]
    print(f"\n✓ Melhor k: {int(k_otimo)} (Silhueta = {silhueta_otima:.4f})")
