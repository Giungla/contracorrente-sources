import {
  couponType,
} from './coupon'

import {
  type IStatesAcronyms,
} from '../utils/consts'

export const addressType = ({
  /**
   * Representa os endereços de entrega
   */
  BILLING: 'billing',
  /**
   * Representa os endereços de entrega/envio
   */
  SHIPPING: couponType.SHIPPING,
}) as const

export type AddressType = typeof addressType

export type AddressTypes = AddressType[keyof AddressType]

export interface UserAddress {
  /**
   * Identificador do endereço na base de dados
   */
  id: string;

  /**
   * Código de Endereçamento Postal
   */
  cep: string;

  /**
   * Cidade do endereço
   */
  city: string;

  /**
   * Apelido dado ao endereço
   */
  nick: string;

  /**
   * Sigla do estado do endereço
   */
  state: IStatesAcronyms;

  /**
   * Número da residência do endereço
   */
  number: string;

  /**
   * Nome da rua
   */
  address: string;

  /**
   * Complemento do endereço
   */
  complement: string;

  /**
   * Bairro do endereço
   */
  neighborhood: string;
}

export interface BaseAddress {
  /**
   * CEP do endereço (somente números)
   */
  cep: string;
  /**
   * Nome do bairro do endereço
   */
  bairro: string;
  /**
   * Nome da rua do endereço
   */
  logradouro: string;
  /**
   * Cidade do endereço
   */
  localidade: string;
  /**
   * Sigla do estado do endereço
   */
  uf: IStatesAcronyms;
}
