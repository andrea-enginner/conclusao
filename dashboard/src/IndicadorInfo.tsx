import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { labelModulo, metaIndicador } from "./indicadoresSinisa";

type Sentido = "max" | "min";

function textoSentido(sentido: Sentido | undefined): string {
    return sentido === "min" ? "Menor melhor" : "Maior melhor";
}

export function ConteudoIndicador({
    codigo,
    sentido,
    compacto = false,
}: {
    codigo: string;
    sentido?: Sentido;
    compacto?: boolean;
}) {
    const meta = metaIndicador(codigo);

    return (
        <div className={compacto ? "space-y-1.5" : "space-y-2"}>
            <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-xs font-semibold text-brand-600">{meta.codigo}</span>
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700">
                    {labelModulo(meta.modulo)}
                </span>
                {sentido && (
                    <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                            sentido === "min"
                                ? "bg-amber-50 text-amber-800 ring-1 ring-amber-100"
                                : "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100"
                        }`}
                    >
                        {textoSentido(sentido)}
                    </span>
                )}
            </div>
            <p className={`font-medium text-slate-800 ${compacto ? "text-xs leading-snug" : "text-sm leading-snug"}`}>
                {meta.nome}
            </p>
            <p className={`text-slate-600 ${compacto ? "text-[11px] leading-relaxed" : "text-xs leading-relaxed"}`}>
                {meta.descricao}
            </p>
        </div>
    );
}

export function PopoverIndicador({
    codigo,
    sentido,
    children,
    className = "",
    alinhamento = "esquerda",
}: {
    codigo: string;
    sentido?: Sentido;
    children: ReactNode;
    className?: string;
    alinhamento?: "esquerda" | "centro";
}) {
    const popoverId = useId();
    const containerRef = useRef<HTMLDivElement>(null);
    const [hover, setHover] = useState(false);
    const [fixado, setFixado] = useState(false);
    const aberto = hover || fixado;

    useEffect(() => {
        if (!fixado) return;
        const fechar = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setFixado(false);
                setHover(false);
            }
        };
        const onEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setFixado(false);
                setHover(false);
            }
        };
        document.addEventListener("mousedown", fechar);
        document.addEventListener("keydown", onEscape);
        return () => {
            document.removeEventListener("mousedown", fechar);
            document.removeEventListener("keydown", onEscape);
        };
    }, [fixado]);

    return (
        <div
            ref={containerRef}
            className={`relative inline-flex ${className}`}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => {
                if (!fixado) setHover(false);
            }}
        >
            <span
                aria-describedby={aberto ? popoverId : undefined}
                className="inline-flex cursor-help items-center"
            >
                {children}
            </span>
            {aberto && (
                <div
                    id={popoverId}
                    role="tooltip"
                    className={`absolute top-full z-50 mt-1.5 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-lg ring-1 ring-slate-900/5 ${
                        alinhamento === "centro" ? "left-1/2 -translate-x-1/2" : "left-0"
                    }`}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <ConteudoIndicador codigo={codigo} sentido={sentido} />
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setFixado((prev) => !prev);
                            if (fixado) setHover(false);
                        }}
                        className="mt-2 text-[11px] font-medium text-brand hover:text-brand-700"
                    >
                        {fixado ? "Desfixar" : "Fixar para ler"}
                    </button>
                </div>
            )}
        </div>
    );
}

export function CodigoIndicador({
    codigo,
    sentido,
    className = "",
    mono = true,
}: {
    codigo: string;
    sentido?: Sentido;
    className?: string;
    mono?: boolean;
}) {
    return (
        <PopoverIndicador codigo={codigo} sentido={sentido} className={className}>
            <span
                className={`border-b border-dotted border-slate-400/70 text-slate-800 hover:border-brand-400 hover:text-brand-600 ${
                    mono ? "font-mono text-xs font-semibold" : "text-sm font-semibold"
                }`}
                title="Passe o mouse para ver o significado"
            >
                {codigo}
            </span>
        </PopoverIndicador>
    );
}

export function LegendaIndicadoresSelecionados({
    codigos,
    sentidos,
}: {
    codigos: string[];
    sentidos?: Record<string, Sentido>;
}) {
    const [aberta, setAberta] = useState(false);

    if (codigos.length === 0) return null;

    return (
        <div className="mt-3 border-t border-brand-50 pt-3">
            <button
                type="button"
                onClick={() => setAberta((prev) => !prev)}
                aria-expanded={aberta}
                className="flex w-full items-center justify-between gap-2 text-left text-xs font-medium text-slate-700 hover:text-slate-900"
            >
                <span>
                    Legenda dos indicadores selecionados
                    <span className="ml-1.5 font-normal text-slate-500">({codigos.length})</span>
                </span>
                <span className="text-slate-400">{aberta ? "▲" : "▼"}</span>
            </button>
            {aberta && (
                <ul className="mt-2 space-y-2">
                    {codigos.map((codigo) => (
                        <li
                            key={codigo}
                            className="rounded-lg border border-brand-100 bg-brand-50/80 px-3 py-2.5"
                        >
                            <ConteudoIndicador
                                codigo={codigo}
                                sentido={sentidos?.[codigo]}
                                compacto
                            />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export function ChipIndicador({
    codigo,
    ativo,
    sentido,
    onToggle,
}: {
    codigo: string;
    ativo: boolean;
    sentido?: Sentido;
    onToggle: () => void;
}) {
    return (
        <PopoverIndicador codigo={codigo} sentido={sentido}>
            <button
                type="button"
                onClick={onToggle}
                aria-pressed={ativo}
                title="Clique para selecionar · passe o mouse para ver o significado"
                className={`rounded-full px-3 py-1 text-sm transition-colors ${
                    ativo
                        ? "bg-brand text-white"
                        : "bg-brand-100 text-brand-800 hover:bg-brand-200"
                }`}
            >
                {codigo}
            </button>
        </PopoverIndicador>
    );
}
