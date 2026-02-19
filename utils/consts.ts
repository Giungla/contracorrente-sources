
export const statesMap = ({
  'AC': 'Acre',
  'AL': 'Alagoas',
  'AP': 'Amapá',
  'AM': 'Amazonas',
  'BA': 'Bahia',
  'CE': 'Ceará',
  'DF': 'Distrito Federal',
  'ES': 'Espírito Santo',
  'GO': 'Goiás',
  'MA': 'Maranhão',
  'MT': 'Mato Grosso',
  'MS': 'Mato Grosso do Sul',
  'MG': 'Minas Gerais',
  'PA': 'Pará',
  'PB': 'Paraíba',
  'PR': 'Paraná',
  'PE': 'Pernambuco',
  'PI': 'Piauí',
  'RJ': 'Rio de Janeiro',
  'RN': 'Rio Grande do Norte',
  'RS': 'Rio Grande do Sul',
  'RO': 'Rondônia',
  'RR': 'Roraima',
  'SC': 'Santa Catarina',
  'SP': 'São Paulo',
  'SE': 'Sergipe',
  'TO': 'Tocantins',
}) as const

export const XANO_BASE_URL = 'https://xef5-44zo-gegm.b2.xano.io'

export const STORAGE_KEY_NAME = 'editora_contracorrente_cart_items'

export const CEP_STORAGE_KEY = 'contra_corrente_cep'

export type IStatesMap      = typeof statesMap
export type IStatesAcronyms = keyof IStatesMap

export const CART_SWITCH_CLASS = 'carrinhoflutuante--visible'

export const statesAcronym = Object.keys(statesMap) as IStatesAcronyms[]

export const statesValues = Object.values(statesMap)

export const EMPTY_STRING = '' as const
export const SLASH_STRING = '/' as const
