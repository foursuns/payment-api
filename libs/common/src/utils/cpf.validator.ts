import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

function validarCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]/g, '');

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  const digitoVerificador1 = resto > 9 ? 0 : resto;

  if (digitoVerificador1 !== parseInt(cpf.charAt(9))) {
    return false;
  }

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  const digitoVerificador2 = resto > 9 ? 0 : resto;

  if (digitoVerificador2 !== parseInt(cpf.charAt(10))) {
    return false;
  }

  return true;
}

@ValidatorConstraint({ name: 'IsCpfValid', async: false })
export class IsCpfValidConstraint implements ValidatorConstraintInterface {
  validate(cpf: string) {
    return validarCPF(cpf);
  }

  defaultMessage() {
    return 'C.P.F. inválido.';
  }
}
