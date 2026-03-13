-- AlterTable
ALTER TABLE "User" ADD COLUMN "availability" TEXT;
ALTER TABLE "User" ADD COLUMN "contact" TEXT;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Shift" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Regular',
    "staffCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Shift" ("createdAt", "endTime", "id", "name", "startTime", "updatedAt") SELECT "createdAt", "endTime", "id", "name", "startTime", "updatedAt" FROM "Shift";
DROP TABLE "Shift";
ALTER TABLE "new_Shift" RENAME TO "Shift";
CREATE UNIQUE INDEX "Shift_name_key" ON "Shift"("name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
