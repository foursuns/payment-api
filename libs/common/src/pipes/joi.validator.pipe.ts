import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import Joi from 'joi';

@Injectable()
export class JoiValidatorPipe<Dto> implements PipeTransform<Dto> {
  constructor(private schema: Joi.ObjectSchema<any>) {}

  public transform(value: Dto): Dto {
    const { error } = this.schema.validate(value, { abortEarly: false });
    if (error) {
      const errorMessages = error.details.map(d => d.message).join();
      throw new BadRequestException(errorMessages);
    }
    return value;
  }
}
