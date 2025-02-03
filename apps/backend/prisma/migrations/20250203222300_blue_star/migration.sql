/*
  Warnings:

  - Changed the type of `branch` on the `ServiceMember` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Branch" AS ENUM ('ARMY', 'NAVY', 'AIR_FORCE', 'SPACE_FORCE', 'COAST_GUARD', 'NATIONAL_GUARD', 'MARINES');

-- AlterTable
ALTER TABLE "ServiceMember" DROP COLUMN "branch",
ADD COLUMN     "branch" "Branch" NOT NULL;
