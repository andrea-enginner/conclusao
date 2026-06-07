# Algoritmo de Clusterização K-Means para Análise de Municípios
# Baseado em Indicadores de Saneamento do SINISA

import json
import warnings
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

warnings.filterwarnings("ignore")

# Dicionário de direção para identificar o "melhor município" por indicador em cada cluster.
# max = quanto maior melhor; min = quanto menor melhor.
SENTIDO_INDICADORES: Dict[str, str] = {
    "IAG0001": "max",
    "IAG2006": "max",
    "IAG2013": "min",
    "IES0001": "max",
    "IES2004": "max",
    "IFE1001": "max",
    "IRS0001": "max",
    "IRS1004": "min",
    "IRS3002": "min",
    "IAP0002": "max",
    "IFD0010": "max",
    "IGR0002": "min",
}


def carregar_dados(caminho_csv: str) -> pd.DataFrame:
    df = pd.read_csv(caminho_csv, index_col="Municipio")
    return df


def validar_dados_para_clusterizacao(df: pd.DataFrame) -> None:
    """Garante colunas numéricas e ausência de valores ausentes (requisito do k-means e da silhueta)."""
    if len(df) < 3:
        raise ValueError(
            "São necessários pelo menos 3 municípios para k >= 2 e cálculo da silhueta."
        )
    non_numeric = [c for c in df.columns if not pd.api.types.is_numeric_dtype(df[c])]
    if non_numeric:
        raise ValueError(f"Colunas não numéricas nos indicadores: {non_numeric}")
    if df.isna().any().any():
        loc = np.where(df.isna().to_numpy())
        raise ValueError(
            "Existem valores ausentes (NaN) na matriz de indicadores. "
            "Trate-os antes da clusterização."
        )


def k_maximo_recomendado(n_municipios: int, k_limite_superior: int = 8) -> int:
    """Limita k superior para evitar clusters muito escassos: min(limite, n - 1)."""
    return int(min(k_limite_superior, max(2, n_municipios - 1)))


def aplicar_kmeans(
    dados: np.ndarray,
    n_clusters: int,
    random_state: int = 42,
    max_iter: int = 300,
) -> Tuple[KMeans, np.ndarray]:
    modelo = KMeans(
        n_clusters=n_clusters,
        init="k-means++",
        n_init=10,
        max_iter=max_iter,
        random_state=random_state,
        algorithm="lloyd",
    )
    rotulos = modelo.fit_predict(dados)
    return modelo, rotulos


def calcular_silhueta(dados: np.ndarray, rotulos: np.ndarray) -> float:
    return float(silhouette_score(dados, rotulos))


def avaliar_intervalo_k(
    dados: np.ndarray,
    k_min: int = 2,
    k_max: int = 8,
    random_state: int = 42,
    max_iter: int = 300,
) -> pd.DataFrame:
    resultados: List[Dict[str, float]] = []
    for k in range(k_min, k_max + 1):
        _, rotulos = aplicar_kmeans(
            dados, n_clusters=k, random_state=random_state, max_iter=max_iter
        )
        sil = calcular_silhueta(dados, rotulos)
        resultados.append({"k": float(k), "silhouette_score": sil})

    return pd.DataFrame(resultados)


def escolher_k_por_maior_silhueta(quadro: pd.DataFrame) -> int:
    idx = quadro["silhouette_score"].idxmax()
    return int(quadro.loc[idx, "k"])


def calcular_benchmarks_do_cluster(
    df_com_clusters: pd.DataFrame, indicadores_cols: list
) -> pd.DataFrame:
    benchmarks = (
        df_com_clusters.groupby("Cluster")[indicadores_cols].quantile(0.25)
    )
    benchmarks.index.name = "Cluster_ID"
    return benchmarks


def executar_clusterizacao_completa(
    caminho_dados: str,
    n_clusters: int,
) -> Dict[str, object]:
    print("Carregando dados normalizados...")
    df = carregar_dados(caminho_dados)
    validar_dados_para_clusterizacao(df)
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

    indicadores_cols = df.columns.tolist()
    benchmarks = calcular_benchmarks_do_cluster(df_resultado, indicadores_cols)
    resultados["benchmarks"] = benchmarks

    print("\nAnálise de clusterização concluída.")
    return resultados


def exibir_resumo_resultados(resultados: Dict[str, object]) -> None:
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


def salvar_resultados_para_json(
    df_com_clusters: pd.DataFrame,
    benchmarks: pd.DataFrame,
    caminho_saida: str,
    metricas: Optional[Dict[str, object]] = None,
) -> None:
    dados_municipios = json.loads(df_com_clusters.to_json(orient="index"))
    dados_benchmarks = json.loads(benchmarks.to_json(orient="index"))

    dados_finais: Dict[str, object] = {
        "municipios": dados_municipios,
        "benchmarks": dados_benchmarks,
    }
    if metricas is not None:
        dados_finais["metricas"] = metricas

    caminho = Path(caminho_saida)
    caminho.parent.mkdir(parents=True, exist_ok=True)
    with open(caminho, "w", encoding="utf-8") as f:
        json.dump(dados_finais, f, ensure_ascii=False, indent=4)
    print(f"\nResultados salvos com sucesso em: {caminho_saida}")


def main() -> None:
    # --- CONFIGURAÇÕES (Colab: use o nome do arquivo após o upload) ---
    CAMINHO_DADOS = "dados_normalizados.csv"
    K_MIN = 2
    K_LIMITE_SUPERIOR = 8
    CAMINHO_SAIDA_JSON = "resultados_clusterizacao.json"
    CAMINHO_AVALIACAO_K_CSV = "avaliacao_silhueta_por_k.csv"

    print("--- INICIANDO ANÁLISE DE CLUSTERIZAÇÃO ---\n")

    df = carregar_dados(CAMINHO_DADOS)
    validar_dados_para_clusterizacao(df)
    matriz = df.values
    n = len(df)

    k_max = k_maximo_recomendado(n, k_limite_superior=K_LIMITE_SUPERIOR)
    if k_max < K_MIN:
        raise ValueError("k_max efetivo < k_min; verifique o tamanho da amostra.")

    print(
        f"Avaliando silhueta para k em [{K_MIN}, {k_max}] "
        f"(limite superior = min({K_LIMITE_SUPERIOR}, n-1), n = {n}).\n"
    )
    quadro_k = avaliar_intervalo_k(matriz, k_min=K_MIN, k_max=k_max)
    print(quadro_k.to_string(index=False))

    quadro_k.to_csv(CAMINHO_AVALIACAO_K_CSV, index=False)
    print(f"\nTabela salva em: {CAMINHO_AVALIACAO_K_CSV}")

    k_escolhido = escolher_k_por_maior_silhueta(quadro_k)
    print(f"\nk escolhido (maior coeficiente de silhueta): {k_escolhido}")

    resultados = executar_clusterizacao_completa(CAMINHO_DADOS, k_escolhido)
    exibir_resumo_resultados(resultados)

    avaliacao_lista = quadro_k.astype({"k": int}).to_dict(orient="records")
    metricas_json: Dict[str, object] = {
        "criterio_selecao_k": "maximo_silhueta_no_intervalo",
        "k_min": K_MIN,
        "k_max_testado": k_max,
        "k_escolhido": k_escolhido,
        "silhueta_particao_final": resultados["silhouette_score"],
        "sentido_indicadores": SENTIDO_INDICADORES,
        "avaliacao_silhueta_por_k": avaliacao_lista,
    }

    salvar_resultados_para_json(
        resultados["dataframe_com_clusters"],
        resultados["benchmarks"],
        CAMINHO_SAIDA_JSON,
        metricas=metricas_json,
    )

    print("\n--- PROCESSO CONCLUÍDO ---")


if __name__ == "__main__":
    main()
