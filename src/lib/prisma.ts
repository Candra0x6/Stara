import { PrismaClient } from "@prisma/client";

const prismaClientSingeleton = () => {
  return new PrismaClient();
};
type PrismaClientType = ReturnType<typeof prismaClientSingeleton>;

const globalPrismaClient = globalThis as unknown as {
  prisma: PrismaClientType | undefined;
};
const prisma = globalPrismaClient.prisma ?? prismaClientSingeleton();

export default prisma;