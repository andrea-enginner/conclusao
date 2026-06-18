import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import {
    ChipIndicador,
    CodigoIndicador,
    LegendaIndicadoresSelecionados,
} from "./IndicadorInfo";

type Sentido = "max" | "min";

type MunicipioLinha = {
    Cluster: number;
    [indicador: string]: number;
};

type AvaliacaoK = { k: number; silhouette_score: number };

type DashboardData = {
    municipios: Record<string, MunicipioLinha>;
    benchmarks: Record<string, Record<string, number>>;
    metricas?: {
        criterio_selecao_k?: string;
        k_min?: number;
        k_max_testado?: number;
        k_escolhido?: number;
        silhueta_particao_final?: number;
        sentido_indicadores?: Record<string, Sentido>;
        avaliacao_silhueta_por_k?: AvaliacaoK[];
    };
};
type FiltroCluster = "todos" | number;
type AbaAnalise = "graficos" | "relatorio";

function avaliarStatus(
    valor: number,
    benchmark: number,
    sentido: Sentido | undefined
): "ok" | "alerta" {
    if (sentido === "min") return valor <= benchmark ? "ok" : "alerta";
    return valor >= benchmark ? "ok" : "alerta";
}

function clampPct(x: number): number {
    if (!Number.isFinite(x)) return 0;
    return Math.max(0, Math.min(100, x * 100));
}

/** Rótulo exibido ao usuário (clusters no JSON começam em 0). */
function rotuloCluster(clusterId: number): number {
    return clusterId + 1;
}

/**
 * Municípios do cluster que cumprem a "meta mínima" em relação ao P25:
 * - indicador "max": valor >= P25 (conforme Pertel / monografia);
 * - indicador "min": valor <= P25.
 * Alinhado à leitura operacional de Pertel et al. (2016) com P25 como referência interna.
 */
function municipiosQueAtingemMetaP25(
    municipios: Record<string, MunicipioLinha>,
    clusterId: number,
    codigo: string,
    p25: number,
    sentido: Sentido | undefined
): string[] {
    const modo: Sentido = sentido ?? "max";
    return Object.entries(municipios)
        .filter(([, v]) => v.Cluster === clusterId)
        .filter(([, v]) => (modo === "max" ? v[codigo] >= p25 : v[codigo] <= p25))
        .map(([nome]) => nome)
        .sort((a, b) => a.localeCompare(b, "pt-BR"));
}

/** Célula visual: valor, P25 no trilho 0–1, distância ao benchmark e status. */
function CelulaBenchmark({
    valor,
    benchmark,
    sentido,
}: {
    valor: number;
    benchmark: number;
    sentido: Sentido | undefined;
}) {
    const status = avaliarStatus(valor, benchmark, sentido);
    const pctValor = clampPct(valor);
    const pctP25 = clampPct(benchmark);
    const delta = valor - benchmark;
    const deltaFmt =
        delta === 0 ? "0" : delta > 0 ? `+${delta.toFixed(3)}` : delta.toFixed(3);

    return (
        <div className="min-w-[160px] max-w-[220px] space-y-2">
            <div className="flex items-center justify-between gap-2">
                <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${status === "ok"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                        }`}
                >
                    {status === "ok" ? "ADEQUADO" : "ATENÇÃO"}
                </span>
                <span className="text-[10px] text-slate-400">{sentido === "min" ? "menor melhor" : "maior melhor"}</span>
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] leading-tight">
                <span className="text-slate-500">Município</span>
                <span className="text-right font-mono font-medium text-slate-800">{valor.toFixed(3)}</span>
                <span className="text-slate-500">P25 cluster</span>
                <span className="text-right font-mono text-slate-600">{benchmark.toFixed(3)}</span>
                <span className="text-slate-500">Δ (valor − P25)</span>
                <span className="text-right font-mono font-medium text-slate-700">{deltaFmt}</span>
            </div>

            <div>
                <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Escala normalizada (0 → 1)
                </p>
                <div className="relative h-2.5 overflow-hidden rounded-full bg-slate-200">
                    <div
                        className="h-full rounded-full bg-brand transition-[width] duration-300"
                        style={{ width: `${pctValor}%` }}
                        title={`Valor municipal: ${valor.toFixed(4)}`}
                    />
                    <div
                        className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-amber-500 shadow-sm"
                        style={{ left: `${pctP25}%`, transform: "translateX(-50%)" }}
                        title={`P25 (benchmark): ${benchmark.toFixed(4)}`}
                    />
                </div>
                <div className="mt-0.5 flex justify-between text-[10px] text-slate-400">
                    <span>0</span>
                    <span className="text-amber-700/90">traço = P25</span>
                    <span>1</span>
                </div>
            </div>
        </div>
    );
}

function SeletorIndicadores({
    indicadores,
    selecionados,
    sentidos,
    onToggle,
}: {
    indicadores: string[];
    selecionados: string[];
    sentidos?: Record<string, Sentido>;
    onToggle: (codigo: string) => void;
}) {
    return (
        <div className="flex flex-wrap gap-2">
            {indicadores.map((ind) => (
                <ChipIndicador
                    key={ind}
                    codigo={ind}
                    ativo={selecionados.includes(ind)}
                    sentido={sentidos?.[ind]}
                    onToggle={() => onToggle(ind)}
                />
            ))}
        </div>
    );
}

function KpiCard({
    label,
    value,
    hint,
    gradient,
}: {
    label: string;
    value: string;
    hint?: string;
    gradient: string;
}) {
    return (
        <div
            className={`relative overflow-hidden rounded-xl bg-gradient-to-br p-5 text-white shadow-md ${gradient}`}
        >
            <p className="text-sm font-medium text-white/85">{label}</p>
            <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
            {hint && <p className="mt-1 text-xs text-white/75">{hint}</p>}
        </div>
    );
}

function Panel({
    id,
    title,
    subtitle,
    badge,
    children,
    className = "",
}: {
    id?: string;
    title: string;
    subtitle?: string;
    badge?: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <section id={id} className={`dashboard-panel scroll-mt-24 ${className}`}>
            <div className="dashboard-panel-header flex flex-wrap items-start justify-between gap-2">
                <div>
                    <h2 className="text-base font-semibold text-slate-800">{title}</h2>
                    {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
                </div>
                {badge && (
                    <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                        {badge}
                    </span>
                )}
            </div>
            <div className="dashboard-panel-body">{children}</div>
        </section>
    );
}

function AbasAnalise({
    ativa,
    onChange,
}: {
    ativa: AbaAnalise;
    onChange: (aba: AbaAnalise) => void;
}) {
    const abas: { id: AbaAnalise; label: string }[] = [
        { id: "graficos", label: "Gráficos" },
        { id: "relatorio", label: "Relatório" },
    ];
    return (
        <div
            role="tablist"
            aria-label="Tipo de análise"
            className="flex gap-1 border-b border-brand-100 px-5"
        >
            {abas.map(({ id, label }) => (
                <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={ativa === id}
                    onClick={() => onChange(id)}
                    className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${ativa === id
                        ? "border-brand text-brand-600"
                        : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                        }`}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}

type LinhaComparacaoP25 = { nome: string; valor: number; benchmark: number };

function GraficoMunicipioVsP25({ linhas }: { linhas: LinhaComparacaoP25[] }) {
    if (linhas.length === 0) {
        return (
            <p className="flex h-full min-h-[240px] items-center justify-center text-center text-sm text-slate-500">
                Nenhum município visível com o filtro atual.
            </p>
        );
    }
    return (
        <ResponsiveContainer width="100%" height={240}>
            <BarChart data={linhas} margin={{ top: 8, right: 8, left: 4, bottom: 56 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                    dataKey="nome"
                    angle={-30}
                    textAnchor="end"
                    interval={0}
                    height={56}
                    tick={{ fontSize: 10 }}
                />
                <YAxis domain={[0, 1]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="valor" name="Município" fill="#085c8a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="benchmark" name="P25" fill="#99cbe3" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}

function EtiquetaSentido({ sentido }: { sentido: Sentido | undefined }) {
    const menorMelhor = sentido === "min";
    return (
        <span
            className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${menorMelhor
                ? "bg-amber-50 text-amber-800 ring-1 ring-amber-100"
                : "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100"
                }`}
            title={
                menorMelhor
                    ? "Meta em relação ao P25: valor menor ou igual ao benchmark"
                    : "Meta em relação ao P25: valor maior ou igual ao benchmark"
            }
        >
            {menorMelhor ? "Menor melhor" : "Maior melhor"}
        </span>
    );
}

function ChartCard({
    codigo,
    sentido,
    children,
}: {
    codigo: string;
    sentido?: Sentido;
    children: ReactNode;
}) {
    return (
        <div className="dashboard-panel flex h-full flex-col">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-50 px-4 py-3">
                <h3 className="flex flex-wrap items-center gap-1 text-sm font-semibold text-slate-800">
                    <span>Município × P25 ·</span>
                    <CodigoIndicador codigo={codigo} sentido={sentido} />
                </h3>
                <EtiquetaSentido sentido={sentido} />
            </div>
            <div className="min-h-[260px] flex-1 p-4">{children}</div>
        </div>
    );
}

function DashboardShell({
    children,
    filtroCluster,
    clusters,
    onFiltroCluster,
}: {
    children: ReactNode;
    filtroCluster: FiltroCluster;
    clusters: number[];
    onFiltroCluster: (c: FiltroCluster) => void;
}) {
    const nav = [
        { href: "#visao-geral", label: "Visão geral" },
        { href: "#municipios", label: "Municípios" },
        { href: "#analise", label: "Análise e relatório" },
    ];

    return (
        <div className="min-h-screen bg-brand-50">
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 flex-col bg-brand lg:flex">
                <div className="shrink-0 px-5 py-5">
                    <p className="mt-1 text-sm font-bold text-white">Clusterização</p>
                    <p className="text-xs text-brand-100">Benchmarking municipal</p>
                </div>
                <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-3">
                    {nav.map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-brand-100 transition-colors hover:bg-white/10 hover:text-white"
                        >
                            <span className="mr-2 h-1.5 w-1.5 rounded-full bg-brand-200 opacity-0 group-hover:opacity-100" />
                            {item.label}
                        </a>
                    ))}
                </nav>
                <div className="shrink-0 p-4 text-[11px] leading-relaxed text-brand-200/80">
                    Metodologia: Pertel et al. (2016)
                </div>
            </aside>

            <div className="flex min-h-screen min-w-0 flex-col lg:pl-56">
                <header className="sticky top-0 z-30 border-b border-brand-100 bg-white/95 px-4 py-3 backdrop-blur-md sm:px-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 sm:text-xl">
                                Dashboard de Clusterização
                            </h1>
                            <p className="text-xs text-slate-500 sm:text-sm">
                                Comparativo de indicadores normalizados e benchmarks P25 por cluster
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-medium text-slate-500">Cluster:</span>
                            <button
                                type="button"
                                onClick={() => onFiltroCluster("todos")}
                                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${filtroCluster === "todos"
                                    ? "bg-brand text-white shadow-sm"
                                    : "bg-brand-50 text-brand-800 hover:bg-brand-100"
                                    }`}
                            >
                                Todos
                            </button>
                            {clusters.map((c) => (
                                <button
                                    type="button"
                                    key={c}
                                    onClick={() => onFiltroCluster(c)}
                                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${filtroCluster === c
                                        ? "bg-brand text-white shadow-sm"
                                        : "bg-brand-50 text-brand-800 hover:bg-brand-100"
                                        }`}
                                >
                                    {rotuloCluster(c)}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <div className="mx-auto max-w-7xl space-y-6">{children}</div>
                </main>
            </div>
        </div>
    );
}

export default function App() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [erro, setErro] = useState<string | null>(null);
    const [filtroCluster, setFiltroCluster] = useState<FiltroCluster>("todos");
    const [indicadoresSelecionados, setIndicadoresSelecionados] = useState<string[]>([]);
    const [abaAnalise, setAbaAnalise] = useState<AbaAnalise>("graficos");

    useEffect(() => {
        fetch("/resultados_clusterizacao.json")
            .then((r) => {
                if (!r.ok) throw new Error("Falha ao carregar JSON");
                return r.json();
            })
            .then((json: DashboardData) => setData(json))
            .catch((e: Error) => setErro(e.message));
    }, []);

    const totalMunicipios = useMemo(
        () => (data ? Object.keys(data.municipios).length : 0),
        [data]
    );

    const clusters = useMemo(() => {
        if (!data) return [];
        const valores = Object.values(data.municipios).map((m) => m.Cluster);
        return [...new Set(valores)].sort((a, b) => a - b);
    }, [data]);
    const indicadoresDisponiveis = useMemo(() => {
        if (!data) return [];
        const primeiro = Object.values(data.municipios)[0];
        return Object.keys(primeiro).filter((k) => k !== "Cluster");
    }, [data]);

    useEffect(() => {
        if (!indicadoresDisponiveis.length) return;
        setIndicadoresSelecionados(indicadoresDisponiveis.slice(0, 3)); // começa com 3
    }, [indicadoresDisponiveis]);
    const municipiosFiltrados = useMemo(() => {
        if (!data) return [];
        const entries = Object.entries(data.municipios).map(([nome, valores]) => ({
            nome,
            cluster: valores.Cluster,
        }));
        if (filtroCluster === "todos") return entries;
        return entries.filter((m) => m.cluster === filtroCluster);
    }, [data, filtroCluster]);

    const municipiosPorCluster = useMemo(() => {
        const grupos = new Map<number, string[]>();
        for (const { nome, cluster } of municipiosFiltrados) {
            const lista = grupos.get(cluster) ?? [];
            lista.push(nome);
            grupos.set(cluster, lista);
        }
        return [...grupos.entries()]
            .sort(([a], [b]) => a - b)
            .map(([cluster, nomes]) => ({
                cluster,
                nomes: nomes.sort((a, b) => a.localeCompare(b, "pt-BR")),
            }));
    }, [municipiosFiltrados]);

    const comparacaoMunicipioP25PorIndicador = useMemo(() => {
        if (!data || indicadoresSelecionados.length === 0) {
            return [] as { codigo: string; sentido: Sentido | undefined; linhas: LinhaComparacaoP25[] }[];
        }
        return indicadoresSelecionados.map((codigo) => ({
            codigo,
            sentido: data.metricas?.sentido_indicadores?.[codigo],
            linhas: municipiosFiltrados.map((m) => {
                const valores = data.municipios[m.nome];
                const clusterKey = String(m.cluster);
                return {
                    nome: m.nome,
                    valor: valores[codigo],
                    benchmark: data.benchmarks[clusterKey]?.[codigo] ?? 0,
                };
            }),
        }));
    }, [data, municipiosFiltrados, indicadoresSelecionados]);

    const alternarIndicador = (codigo: string) => {
        setIndicadoresSelecionados((prev) =>
            prev.includes(codigo) ? prev.filter((x) => x !== codigo) : [...prev, codigo]
        );
    };

    /** Matriz de benchmarks internos (P25) + municípios que atingem a meta mínima (Pertel et al., 2016). */
    const matrizBenchmarksPertel = useMemo(() => {
        if (!data || clusters.length === 0 || indicadoresSelecionados.length === 0) {
            return [] as {
                codigo: string;
                sentido: Sentido | undefined;
                porCluster: Record<
                    number,
                    { p25: number; municipiosNaMeta: string[] }
                >;
            }[];
        }
        return indicadoresSelecionados.map((codigo) => {
            const sentido = data.metricas?.sentido_indicadores?.[codigo];
            const porCluster: Record<number, { p25: number; municipiosNaMeta: string[] }> = {};
            for (const c of clusters) {
                const p25 = data.benchmarks[String(c)]?.[codigo] ?? 0;
                porCluster[c] = {
                    p25,
                    municipiosNaMeta: municipiosQueAtingemMetaP25(
                        data.municipios,
                        c,
                        codigo,
                        p25,
                        sentido
                    ),
                };
            }
            return { codigo, sentido, porCluster };
        });
    }, [data, clusters, indicadoresSelecionados]);

    if (erro) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-brand-50 p-6">
                <p className="rounded-xl bg-white px-6 py-4 text-red-600 shadow-sm">Erro: {erro}</p>
            </div>
        );
    }
    if (!data) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-brand-50 p-6">
                <p className="rounded-xl bg-white px-6 py-4 text-slate-600 shadow-sm">
                    Carregando dados do dashboard...
                </p>
            </div>
        );
    }

    return (
        <DashboardShell
            filtroCluster={filtroCluster}
            clusters={clusters}
            onFiltroCluster={setFiltroCluster}
        >
            <section id="visao-geral" className="scroll-mt-24 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                    <KpiCard
                        label="Municípios no estudo"
                        value={String(totalMunicipios)}
                        hint={`${municipiosFiltrados.length} visíveis com o filtro atual`}
                        gradient="from-brand to-brand-600"
                    />
                    <KpiCard
                        label="Clusters identificados"
                        value={String(clusters.length)}
                        hint="Grupos formados na análise"
                        gradient="from-brand-400 to-brand-600"
                    />
                </div>
                <Panel
                    id="municipios"
                    title="Municípios no estudo"
                    subtitle={
                        filtroCluster !== "todos"
                            ? `Filtro ativo: Cluster ${rotuloCluster(filtroCluster)}.`
                            : "Lista dos municípios e o cluster atribuído a cada um."
                    }
                    badge={`${municipiosFiltrados.length} de ${totalMunicipios}`}
                >
                    <div className="overflow-x-auto">
                        <div
                            className="grid min-w-full gap-4"
                            style={{
                                gridTemplateColumns: `repeat(${Math.max(municipiosPorCluster.length, 1)}, minmax(11rem, 1fr))`,
                            }}
                        >
                            {municipiosPorCluster.map(({ cluster, nomes }) => (
                                <article
                                    key={cluster}
                                    className="min-w-0 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-3 shadow-sm"
                                >
                                    <header className="mb-2 flex items-center justify-between gap-2">
                                        <span className="inline-flex rounded-full bg-brand px-2.5 py-0.5 text-xs font-semibold text-white">
                                            Cluster {rotuloCluster(cluster)}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {nomes.length} {nomes.length === 1 ? "município" : "municípios"}
                                        </span>
                                    </header>
                                    <ul className="space-y-1 text-sm text-slate-800">
                                        {nomes.map((nome) => (
                                            <li key={nome} className="rounded px-1.5 py-0.5 leading-snug hover:bg-white">
                                                {nome}
                                            </li>
                                        ))}
                                    </ul>
                                </article>
                            ))}
                        </div>
                    </div>
                </Panel>
            </section>

            <section id="analise" className="dashboard-panel scroll-mt-24">
                <div className="dashboard-panel-header">
                    <h2 className="text-base font-semibold text-slate-800">
                        Análise por indicadores
                    </h2>
                    <p className="mt-0.5 text-sm text-slate-500">
                        Escolha os indicadores e alterne entre gráficos e relatório textual.
                    </p>
                </div>

                <div className="sticky top-[4.5rem] z-20 border-b border-brand-50 bg-white/95 px-5 py-4 backdrop-blur-sm">
                    <p className="mb-2 text-sm font-medium text-slate-700">Indicadores</p>
                    <SeletorIndicadores
                        indicadores={indicadoresDisponiveis}
                        selecionados={indicadoresSelecionados}
                        sentidos={data.metricas?.sentido_indicadores}
                        onToggle={alternarIndicador}
                    />
                    {indicadoresSelecionados.length > 0 ? (
                        <p className="mt-2 text-xs text-slate-500">
                            {indicadoresSelecionados.length} selecionado
                            {indicadoresSelecionados.length === 1 ? "" : "s"} ·{" "}
                            {indicadoresSelecionados.length === 1
                                ? "1 gráfico Município × P25 na aba Gráficos"
                                : `${indicadoresSelecionados.length} gráficos Município × P25 na aba Gráficos`}
                            {" · "}
                            passe o mouse sobre um código para ver o significado
                        </p>
                    ) : (
                        <p className="mt-2 text-xs text-amber-800">Selecione ao menos um indicador.</p>
                    )}
                    <LegendaIndicadoresSelecionados
                        codigos={indicadoresSelecionados}
                        sentidos={data.metricas?.sentido_indicadores}
                    />
                </div>

                <AbasAnalise ativa={abaAnalise} onChange={setAbaAnalise} />

                <div className="dashboard-panel-body space-y-8">
                    {indicadoresSelecionados.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-600">
                            Nenhum indicador selecionado.
                        </p>
                    ) : abaAnalise === "graficos" ? (
                        <div
                            role="tabpanel"
                            aria-label="Gráficos"
                            className="grid gap-4 lg:grid-cols-2"
                        >
                            {comparacaoMunicipioP25PorIndicador.map(({ codigo, sentido, linhas }) => (
                                <ChartCard key={codigo} codigo={codigo} sentido={sentido}>
                                    <GraficoMunicipioVsP25 linhas={linhas} />
                                </ChartCard>
                            ))}
                        </div>
                    ) : (
                        <div role="tabpanel" aria-label="Relatório" className="space-y-8">
                            <div>
                                <h3 className="mb-1 text-sm font-semibold text-slate-800">
                                    Benchmarks internos P25
                                </h3>
                                <p className="mb-3 text-sm text-slate-600">
                                    Referência <strong>Pertel et al. (2016)</strong>: percentil 25 por cluster como meta
                                    mínima interna.
                                </p>
                                <div className="overflow-x-auto rounded-xl border border-slate-200">
                                    <table className="min-w-full border-collapse text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-700">
                                                <th className="sticky left-0 z-10 min-w-[100px] border-slate-200 bg-slate-50 px-3 py-2 font-semibold">
                                                    Indicador
                                                </th>
                                                {clusters.map((c) => (
                                                    <th key={c} className="min-w-[160px] px-3 py-2 text-center font-semibold">
                                                        Cluster {rotuloCluster(c)}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {matrizBenchmarksPertel.map((linha) => (
                                                <tr key={linha.codigo} className="border-b border-slate-100">
                                                    <td className="sticky left-0 z-10 border-slate-100 bg-white px-3 py-2 align-top">
                                                        <CodigoIndicador codigo={linha.codigo} sentido={linha.sentido} />
                                                        <div className="mt-0.5 font-sans text-[10px] font-normal text-slate-500">
                                                            {linha.sentido === "min" ? "menor melhor" : "maior melhor"}
                                                        </div>
                                                    </td>
                                                    {clusters.map((c) => {
                                                        const cel = linha.porCluster[c];
                                                        return (
                                                            <td key={c} className="px-3 py-2 align-top text-center">
                                                                <div className="mx-auto max-w-[220px] space-y-2 text-left">
                                                                    <div>
                                                                        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                                                                            P25 (referência)
                                                                        </p>
                                                                        <p className="font-mono text-lg font-semibold text-amber-800">
                                                                            {cel.p25.toFixed(4)}
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[10px] font-medium text-slate-600">
                                                                            Municípios na meta
                                                                        </p>
                                                                        {cel.municipiosNaMeta.length > 0 ? (
                                                                            <ul className="list-inside list-disc text-[11px] leading-snug text-slate-800">
                                                                                {cel.municipiosNaMeta.map((nome) => (
                                                                                    <li key={nome}>{nome}</li>
                                                                                ))}
                                                                            </ul>
                                                                        ) : (
                                                                            <p className="text-[11px] text-rose-700">
                                                                                Nenhum município atinge a meta neste cluster.
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-1">
                                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-3 pt-3">
                                    <h3 className="text-sm font-semibold text-slate-800">
                                        Indicadores vs benchmark
                                    </h3>
                                    <span className="text-xs text-slate-500">
                                        {municipiosFiltrados.length} registros · {indicadoresSelecionados.length}{" "}
                                        indicadores
                                    </span>
                                </div>

                                <p className="mx-3 mb-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                                    <span className="font-semibold text-slate-700">Leitura (Pertel et al., 2016):</span>{" "}
                                    barra <span className="font-mono text-brand-600">azul</span> = valor do município;{" "}
                                    <span className="text-amber-700">traço âmbar</span> = P25 do cluster. Selos{" "}
                                    <strong>ADEQUADO</strong> / <strong>ATENÇÃO</strong> conforme maior ou menor melhor.
                                </p>

                                <div className="overflow-x-auto rounded-lg bg-white">
                                    <table className="min-w-full border-collapse text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
                                                <th className="px-4 py-3 align-bottom font-semibold">Município</th>
                                                <th className="px-4 py-3 align-bottom font-semibold">Cluster</th>
                                                {indicadoresSelecionados.map((ind) => (
                                                    <th key={ind} className="px-4 py-3 align-bottom">
                                                        <CodigoIndicador
                                                            codigo={ind}
                                                            sentido={data.metricas?.sentido_indicadores?.[ind]}
                                                        />
                                                        <div className="mt-0.5 text-[10px] font-normal text-slate-500">
                                                            vs P25 do cluster
                                                        </div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {municipiosFiltrados.map((m) => {
                                                const valores = data.municipios[m.nome];
                                                const clusterKey = String(m.cluster);
                                                return (
                                                    <tr
                                                        key={m.nome}
                                                        className="border-b border-slate-100 align-top hover:bg-slate-50/80"
                                                    >
                                                        <td className="px-4 py-3 font-medium text-slate-800">
                                                            {m.nome}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-800 ring-1 ring-brand-100">
                                                                Cluster {rotuloCluster(m.cluster)}
                                                            </span>
                                                        </td>
                                                        {indicadoresSelecionados.map((ind) => {
                                                            const valor = valores[ind];
                                                            const benchmark =
                                                                data.benchmarks[clusterKey]?.[ind] ?? 0;
                                                            const sentido =
                                                                data.metricas?.sentido_indicadores?.[ind];
                                                            return (
                                                                <td key={ind} className="px-4 py-3 align-top">
                                                                    <CelulaBenchmark
                                                                        valor={valor}
                                                                        benchmark={benchmark}
                                                                        sentido={sentido}
                                                                    />
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </DashboardShell>
    );
}
