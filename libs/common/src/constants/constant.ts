export enum MESSAGE {
  PAYMENT_CREATE_SUCCESS = 'Pagamento criado com sucesso',
  PAYMENT_UPDATE_SUCCESS = 'Pagamento alterado com sucesso',
  PAYMENT_DELETE_SUCCESS = 'Pagamento excluído com sucesso',
  PAYMENT_CREATE_FAILED = 'Falha ao tentar criar pagamento',
  PAYMENT_UPDATE_FAILED = 'Falha ao tentar alterar pagamento',
  PAYMENT_DELETE_FAILED = 'Falha ao tentar excluir pagamento',
  PAYMENT_DELETE_FOREIGNKEY = 'Pagamento não pode ser excluído',
  PAYMENT_FIND_FAILED = 'Falha ao tentar localizar pagamento',
  PAYMENT_ALREADY = 'Pagamento já cadastrado',
  PAYMENT_FOUND = 'Pagamento encontrado',
  PAYMENT_NOT_FOUND = 'Pagamento não encontrado',
  PAYMENT_LIST_EMPTY = 'Nenhum pagamento cadastrado',

  MERCADOPAGO_AUTH_SUCCESS = 'Autenticação com a API do Mercado Pago realizada com sucesso',
  MERCADOPAGO_AUTH_FAILED = 'Falha na autenticação com a API do Mercado Pago',
  MERCADOPAGO_CONFIG_FAILED = 'Configuração do Mercado Pago está incorreta',
  MERCADOPAGO_CREATE_FAILED = 'Falha ao tentar criar pagamento no Mercado Pago',
  MERCADOPAGO_CREATE_SUCCESS = 'Pagamento criado com sucesso no Mercado Pago',

  INTERNAL_SERVER_ERROR = 'MicroService Security Error',
  BAD_REQUEST = 'Exceção de solicitação incorreta',
  BAD_GATEWAY_REQUEST = 'Exceção de solicitação gateway',
}
