-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "invoiceDate" TIMESTAMP(3),
ADD COLUMN     "invoiceNumber" TEXT,
ADD COLUMN     "invoiceUploaded" BOOLEAN NOT NULL DEFAULT false;
