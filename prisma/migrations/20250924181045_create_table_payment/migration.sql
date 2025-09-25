-- CreateEnum
CREATE TYPE "public"."PaymentType" AS ENUM ('PIX', 'CREDIT_CARD');

-- CreateEnum
CREATE TYPE "public"."StatusType" AS ENUM ('FAIL', 'PAID', 'PENDING');

-- CreateTable
CREATE TABLE "public"."accounts" (
    "id" VARCHAR(100) NOT NULL,
    "cpf" VARCHAR(11) NOT NULL,
    "description" VARCHAR(30) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "paymentMethod" "public"."PaymentType" NOT NULL DEFAULT 'PIX',
    "status" "public"."StatusType" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pk_payment" PRIMARY KEY ("id")
);
