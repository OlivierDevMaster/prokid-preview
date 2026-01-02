import z from 'zod';

/**
 * Helper function to create const object from enum values
 */
export const createEnumConstants = <T extends readonly string[]>(values: T) => {
  return Object.freeze(
    Object.fromEntries(values.map(value => [value, value]))
  ) as Readonly<{
    [K in T[number] as K]: K;
  }>;
};

export const Order = Object.freeze({
  asc: 'asc',
  desc: 'desc',
} as const);

export type Order = (typeof Order)[keyof typeof Order];

export const OrderSchema = z.enum(Order);
