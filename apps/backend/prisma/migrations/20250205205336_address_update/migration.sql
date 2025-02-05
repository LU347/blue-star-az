/*
  Warnings:

  - You are about to drop the column `addressLine1` on the `ServiceMember` table. All the data in the column will be lost.
  - You are about to drop the column `addressLine2` on the `ServiceMember` table. All the data in the column will be lost.
  - Added the required column `addressLineOne` to the `ServiceMember` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ServiceMember" DROP COLUMN "addressLine1",
DROP COLUMN "addressLine2",
ADD COLUMN     "addressLineOne" TEXT NOT NULL,
ADD COLUMN     "addressLineTwo" TEXT;
