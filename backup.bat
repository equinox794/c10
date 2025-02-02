@echo off

REM Mevcut dizinde backups klasörü yoksa oluştur
if not exist "backups" mkdir backups

REM Tarih-saat damgası (YılAyGün_SaatDakikaSaniye formatında)
for /f "tokens=1-5 delims=/-: " %%a in ("%date% %time%") do (
    set year=%%c
    set month=%%a
    set day=%%b
    set hour=%%d
    set minute=%%e
)
set timestamp=%year%%month%%day%_%hour%%minute%

REM Asıl veritabanı dosyasının adı
set DB_FILE=database.sqlite

REM Hedef yedek dosyası adı
set BACKUP_FILE=backups\database_%timestamp%.sqlite

echo Backing up %DB_FILE% to %BACKUP_FILE%...
copy %DB_FILE% %BACKUP_FILE%

if %ERRORLEVEL%==0 (
    echo Backup successful!
) else (
    echo Backup failed!
)
pause 