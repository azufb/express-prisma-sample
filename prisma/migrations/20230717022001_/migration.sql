/*
  Warnings:

  - You are about to drop the column `deadLine` on the `task` table. All the data in the column will be lost.
  - Added the required column `deadline` to the `task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "task" DROP COLUMN "deadLine",
ADD COLUMN     "deadline" TEXT NOT NULL;
