import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export function prismaCompanyFactory(prisma: PrismaService): PrismaService {
  return prisma.$extends({
    query: {
      $allModels: {
        findMany: function ({ query, args }) {
          args.where = {
            ...args.where,
          } as unknown;

          return query(args);
        },
        findFirst({ query, args }) {
          args.where = {
            ...args.where,
          } as unknown;

          return query(args);
        },
        findUnique({ query, args }) {
          args.where = {
            ...args.where,
          } as any;

          return query(args);
        },
        findUniqueOrThrow({ query, args }) {
          args.where = {
            ...args.where,
          } as any;

          return query(args);
        },
        findFirstOrThrow({ query, args }) {
          args.where = {
            ...args.where,
          } as unknown;

          return query(args);
        },
        updateMany({ args, query }) {
          args.where = {
            ...args.where,
          } as unknown;

          return query(args);
        },

        deleteMany({ args, query }) {
          args.where = {
            ...args.where,
          } as unknown;

          return query(args);
        },

        create({ query, args }) {
          args.data = {
            ...args.data,
          } as any;

          return query(args);
        },
        upsert({ args, query }) {
          args.where = {
            ...args.where,
          } as any;

          args.create = {
            ...args.create,
          } as any;

          return query(args);
        },

        createMany({ query, args }) {
          if (Array.isArray(args.data)) {
            args.data = args.data.map(
              d =>
                ({
                  ...d,
                }) as any,
            );
          } else {
            args.data = {
              ...args.data,
            } as any;
          }

          return query(args);
        },
      },
    },
  }) as PrismaService;
}
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super();
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }
}
