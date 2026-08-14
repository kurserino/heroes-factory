import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

// A future date_of_birth is not a plausible value (data-model.md validation
// rules); this is checked independently of @IsDateString's format check.
export function IsNotFutureDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isNotFutureDate',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string') {
            return false;
          }
          const date = new Date(value);
          if (Number.isNaN(date.getTime())) {
            return false;
          }
          return date.getTime() <= Date.now();
        },
        defaultMessage(args: ValidationArguments): string {
          return `${args.property} must not be a future date`;
        },
      },
    });
  };
}
