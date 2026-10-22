import { ERPDatabase } from '../types/erp';
import { INITIAL_ERP_DATA } from '../data/initialData';

const STORAGE_KEY = 'planopme_erp_database_v1';

/**
 * Justificativa técnica da escolha de armazenamento no navegador (LocalStorage / JSON):
 * 1. Facilidade de uso e zero barreira técnica: Pequenas empresas e oficinas não
 *    precisam instalar ou configurar servidores de banco de dados locais (como SQLite,
 *    Postgres ou MySQL), permitindo que o sistema funcione instantaneamente em qualquer
 *    computador ou tablet comum via navegador.
 * 2. Persistência real entre sessões: Todos os cadastros, ordens e fichas técnicas
 *    permanecem salvos mesmo se o navegador for fechado, o computador reiniciado ou a página recarregada.
 * 3. Soberania e privacidade dos dados: As fórmulas de produto (BOM), segredos de produção,
 *    clientes e custos ficam salvos diretamente no dispositivo do empresário.
 * 4. Portabilidade e Backup simplificado: Possui ferramentas integradas de exportação
 *    e importação de arquivo JSON estruturado, garantindo cópias de segurança confiáveis.
 */

export const loadDatabase = (): ERPDatabase => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveDatabase(INITIAL_ERP_DATA);
      return INITIAL_ERP_DATA;
    }
    const parsed = JSON.parse(raw) as ERPDatabase;
    // Validação mínima de integridade estrutural
    if (!parsed.rawMaterials || !parsed.products || !parsed.orders || !parsed.productionOrders) {
      console.warn('Banco local com formato inconsistente. Restaurando dados padrão.');
      saveDatabase(INITIAL_ERP_DATA);
      return INITIAL_ERP_DATA;
    }
    return parsed;
  } catch (error) {
    console.error('Erro ao ler banco de dados do LocalStorage:', error);
    return INITIAL_ERP_DATA;
  }
};

export const saveDatabase = (db: ERPDatabase): void => {
  try {
    const updated: ERPDatabase = {
      ...db,
      lastSync: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Erro ao salvar no LocalStorage:', error);
  }
};

export const exportDatabaseAsJSON = (db: ERPDatabase): void => {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(db, null, 2));
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `planopme-erp-backup-${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export const parseImportedJSON = (jsonString: string): ERPDatabase => {
  const parsed = JSON.parse(jsonString) as ERPDatabase;
  if (!Array.isArray(parsed.rawMaterials) || !Array.isArray(parsed.products) || !Array.isArray(parsed.partners)) {
    throw new Error('Arquivo JSON inválido: não contém a estrutura exigida pelo PlanoPME ERP.');
  }
  return {
    ...parsed,
    lastSync: new Date().toISOString(),
  };
};

export const resetDatabaseToInitial = (): ERPDatabase => {
  saveDatabase(INITIAL_ERP_DATA);
  return INITIAL_ERP_DATA;
};
