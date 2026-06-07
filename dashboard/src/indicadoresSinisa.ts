export type ModuloSinisa = "água" | "esgoto" | "resíduos" | "drenagem";

export type MetaIndicador = {
    codigo: string;
    nome: string;
    modulo: ModuloSinisa;
    descricao: string;
};

/** Glossário resumido dos indicadores SINISA utilizados na clusterização (RF06). */
export const INDICADORES_SINISA: Record<string, MetaIndicador> = {
    IAG0001: {
        codigo: "IAG0001",
        nome: "Atendimento da população total com rede de abastecimento de água",
        modulo: "água",
        descricao:
            "Percentual da população total (urbana e rural) efetivamente atendida pela rede pública de abastecimento de água.",
    },
    IAG2006: {
        codigo: "IAG2006",
        nome: "Consumo total médio per capita de água",
        modulo: "água",
        descricao:
            "Consumo médio de água por habitante atendido, em litros por habitante por dia.",
    },
    IAG2013: {
        codigo: "IAG2013",
        nome: "Perdas totais de água na distribuição",
        modulo: "água",
        descricao:
            "Percentual de água produzida ou importada que não é faturada, incluindo perdas físicas e comerciais na rede.",
    },
    IES0001: {
        codigo: "IES0001",
        nome: "Atendimento da população total com rede coletora de esgoto",
        modulo: "esgoto",
        descricao:
            "Percentual da população total (urbana e rural) efetivamente atendida por rede coletora de esgotamento sanitário.",
    },
    IES2004: {
        codigo: "IES2004",
        nome: "Índice de esgoto tratado referido ao esgoto coletado",
        modulo: "esgoto",
        descricao:
            "Percentual do volume de esgoto coletado que recebe tratamento adequado antes da disposição final.",
    },
    IFE1001: {
        codigo: "IFE1001",
        nome: "Receita operacional direta média dos usuários de esgoto",
        modulo: "esgoto",
        descricao:
            "Receita operacional direta média obtida com a cobrança do serviço de esgotamento sanitário.",
    },
    IRS0001: {
        codigo: "IRS0001",
        nome: "Cobertura da população total com coleta de resíduos sólidos domiciliares",
        modulo: "resíduos",
        descricao:
            "Percentual da população total coberta pelo serviço regular de coleta de resíduos sólidos domiciliares.",
    },
    IRS1004: {
        codigo: "IRS1004",
        nome: "Disposição final ambientalmente adequada dos resíduos coletados",
        modulo: "resíduos",
        descricao:
            "Percentual dos resíduos sólidos coletados encaminhados a disposição final ambientalmente adequada.",
    },
    IRS3002: {
        codigo: "IRS3002",
        nome: "Disposição final inadequada de resíduos sólidos urbanos",
        modulo: "resíduos",
        descricao:
            "Percentual dos resíduos sólidos urbanos coletados destinados a disposição final inadequada (lixões, aterros controlados etc.).",
    },
    IAP0002: {
        codigo: "IAP0002",
        nome: "Atendimento da população urbana com serviço de drenagem e manejo de águas pluviais",
        modulo: "drenagem",
        descricao:
            "Percentual da população urbana atendida por serviços de drenagem e manejo de águas pluviais urbanas.",
    },
    IFD0010: {
        codigo: "IFD0010",
        nome: "Índice de drenagem urbana",
        modulo: "drenagem",
        descricao:
            "Mede a adequação da infraestrutura e dos serviços de drenagem urbana no município.",
    },
    IGR0002: {
        codigo: "IGR0002",
        nome: "Índice de gestão de resíduos sólidos urbanos",
        modulo: "resíduos",
        descricao:
            "Avalia aspectos de gestão e regulação do serviço de limpeza urbana e manejo de resíduos sólidos.",
    },
};

const MODULO_LABEL: Record<ModuloSinisa, string> = {
    água: "Abastecimento de água",
    esgoto: "Esgotamento sanitário",
    resíduos: "Resíduos sólidos",
    drenagem: "Drenagem e águas pluviais",
};

export function metaIndicador(codigo: string): MetaIndicador {
    return (
        INDICADORES_SINISA[codigo] ?? {
            codigo,
            nome: codigo,
            modulo: "água",
            descricao: "Indicador SINISA sem descrição cadastrada no dashboard.",
        }
    );
}

export function labelModulo(modulo: ModuloSinisa): string {
    return MODULO_LABEL[modulo];
}
