#!/bin/bash

# Mevcut dizinde backups klasörü yoksa oluştur
mkdir -p backups

# Tarih ve saat damgası (örn. 20250215_153045)
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Kaynak veritabanı dosyası
DB_FILE="database.sqlite"

# Hedef yedek dosyası
BACKUP_FILE="backups/database_${TIMESTAMP}.sqlite"

echo "Backing up ${DB_FILE} to ${BACKUP_FILE}..."
cp "${DB_FILE}" "${BACKUP_FILE}"

if [ $? -eq 0 ]; then
  echo "Backup successful!"
else
  echo "Backup failed!"
fi
