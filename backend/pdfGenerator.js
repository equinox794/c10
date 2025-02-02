const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function createTeklifPDF(data, res) {
    const { musteriAdi, paraBirimi, urunler, tarih, teklifSettings } = data;

    // Roboto fontunu kaydet
    const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        lang: 'tr',
        info: {
            Title: 'Teklif Formu',
            Author: 'BİOPLANT',
            Subject: `Teklif - ${musteriAdi}`,
            Keywords: 'teklif, bioplant'
        }
    });

    // Roboto fontunu kaydet ve varsayılan font olarak ayarla
    doc.registerFont('Roboto', path.join(__dirname, 'fonts', 'Roboto-Regular.ttf'));
    doc.font('Roboto');

    // Stream'i response'a yönlendir - UTF-8 karakter seti ile
    res.setHeader('Content-Type', 'application/pdf; charset=UTF-8');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(`Teklif_${musteriAdi}_${tarih.replace(/\./g, '-')}.pdf`)}`);
    doc.pipe(res);

    // Sayfa genişliği ve kenar boşlukları
    const pageWidth = doc.page.width;
    const contentWidth = 515;
    const marginX = (pageWidth - contentWidth) / 2;

    // Yeşil üst çizgi
    doc.moveTo(marginX, 30)
       .lineTo(marginX + contentWidth, 30)
       .strokeColor('#4CAF50')
       .lineWidth(1)
       .stroke();

    // Logo ekle - ortada olacak şekilde
    const logoPath = path.join(__dirname, 'images', 'logo.png');
    if (fs.existsSync(logoPath)) {
        doc.image(logoPath, marginX + (contentWidth - 150) / 2, 40, {
            fit: [150, 60],
            align: 'center'
        });
    }

    // Firma Bilgileri - logonun altında
    doc.fontSize(11)
       .moveDown(5)
       .fillColor('#333333')
       .text('BİOPLANT TARIM ÜRÜNLERİ ARAŞTIRMA LTD ŞTİ', marginX, doc.y, { 
           width: contentWidth,
           align: 'center'
       })
       .fontSize(9)
       .moveDown(0.3)
       .text('Ofis: Kızıl İş Merkezi', { 
           width: contentWidth,
           align: 'center'
       })
       .text('Fabrika: Sarıhamzalı mh', { 
           width: contentWidth,
           align: 'center'
       })
       .text('Tel: +90 242 502 38 38', { 
           width: contentWidth,
           align: 'center'
       })
       .text('E-mail: info@bioplant.com.tr', { 
           width: contentWidth,
           align: 'center'
       })
       .text('Web: www.bioplant.com.tr', { 
           width: contentWidth,
           align: 'center'
       })
       .moveDown(1);

    // Başlık
    doc.fontSize(14)
       .fillColor('#333333')
       .text('TEKLİF FORMU', marginX, doc.y, {
           width: contentWidth,
           align: 'center'
       })
       .moveDown();

    // Tarih
    doc.fontSize(9)
       .text(`Tarih: ${tarih}`, marginX, doc.y, {
           width: contentWidth,
           align: 'right'
       })
       .moveDown();

    // Müşteri Bilgileri
    doc.fontSize(9)
       .text('Sayın yetkili,', marginX, doc.y)
       .text('Talebiniz üzerine hazırlanan teklifimiz aşağıda bilgilerinize sunulmuştur.')
       .text(`Sayın ${musteriAdi}`)
       .moveDown();

    // Tablo başlıkları
    const tableTop = doc.y;
    const tableHeaders = ['Ürün Adı', 'Ambalaj', 'Miktar', 'Birim Fiyat', 'Toplam'];
    const columnWidths = {
        urunAdi: 150,
        ambalaj: 80,
        miktar: 85,
        birimFiyat: 100,
        toplam: 100
    };

    // Tablo başlık arkaplanı
    doc.fillColor('#4CAF50')
       .rect(marginX, tableTop, contentWidth, 25)
       .fill();

    // Tablo başlık yazıları
    let xPos = marginX;
    doc.fillColor('#FFFFFF')
       .fontSize(9);
    Object.entries(columnWidths).forEach(([key, width], index) => {
        doc.text(
            tableHeaders[index],
            xPos + 5,
            tableTop + 8,
            { 
                width: width - 5,
                align: key === 'urunAdi' ? 'left' : 'right'
            }
        );
        xPos += width;
    });

    // Ürünleri listele
    let y = tableTop + 35;
    let toplamTutar = 0;
    doc.fillColor('#333333');

    urunler.forEach((urun, index) => {
        if (y > doc.page.height - 150) {
            doc.addPage();
            y = 50;
        }

        const birimFiyat = parseFloat(urun.birimFiyat);
        const toplamFiyat = parseFloat(urun.toplamFiyat);
        const miktar = parseFloat(urun.miktar);

        xPos = marginX;

        // Ürün Adı
        doc.text(urun.urunAdi, xPos + 5, y, { 
            width: columnWidths.urunAdi - 5,
            align: 'left'
        });
        xPos += columnWidths.urunAdi;

        // Ambalaj
        doc.text(urun.paket || '-', xPos + 5, y, { 
            width: columnWidths.ambalaj - 5,
            align: 'right'
        });
        xPos += columnWidths.ambalaj;

        // Miktar
        doc.text(miktar.toLocaleString('tr-TR'), xPos + 5, y, { 
            width: columnWidths.miktar - 5,
            align: 'right'
        });
        xPos += columnWidths.miktar;

        // Birim Fiyat
        doc.text(
            `${birimFiyat.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${paraBirimi}`,
            xPos + 5, y, { 
                width: columnWidths.birimFiyat - 5,
                align: 'right'
            }
        );
        xPos += columnWidths.birimFiyat;

        // Toplam
        doc.text(
            `${toplamFiyat.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${paraBirimi}`,
            xPos + 5, y, { 
                width: columnWidths.toplam - 5,
                align: 'right'
            }
        );

        // Alt çizgi
        doc.moveTo(marginX, y + 15)
           .lineTo(marginX + contentWidth, y + 15)
           .strokeColor('#dddddd')
           .stroke();

        toplamTutar += toplamFiyat;
        y += 25;
    });

    // Toplam tutar
    doc.moveDown()
       .fontSize(11)
       .text(
           `Toplam: ${toplamTutar.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${paraBirimi}`,
           marginX, doc.y, {
               width: contentWidth,
               align: 'right'
           }
       )
       .moveDown();

    // Teklif şartları
    doc.fontSize(10)
       .text('Teklif Şartları:', marginX, doc.y)
       .moveDown(0.5)
       .fontSize(9);

    const sartlar = [
        '1. Fiyatlarımıza KDV dahil değildir.',
        '2. Ödeme peşin veya maksimum 30 gün vadelidir.',
        '3. Teslimat süresi sipariş tarihinden itibaren 7 iş günüdür.',
        '4. Minimum sipariş miktarı uygulanmaktadır.',
        '5. Nakliye alıcıya aittir.'
    ];

    sartlar.forEach(sart => {
        doc.text(sart, marginX + 10, doc.y, {
            width: contentWidth - 20
        });
    });

    doc.moveDown()
       .text('Teklif Geçerlilik Süresi: 7 gün', marginX + 10, doc.y)
       .moveDown();

    // Banka bilgileri
    doc.fontSize(10)
       .text('Banka Bilgileri:', marginX, doc.y)
       .moveDown(0.5)
       .fontSize(9)
       .text('Banka: XXX Bank', marginX + 10)
       .text('IBAN: TR00 0000 0000 0000 0000 0000 00', marginX + 10)
       .text('Şube: Merkez', marginX + 10)
       .moveDown();

    // Alt bilgiler
    doc.fontSize(9)
       .text('Teklifimizin tarafınızca olumlu değerlendirileceğini umar, işbirliğimizin devamını dileriz.', marginX)
       .moveDown(0.5)
       .text('Saygılarımızla.', marginX)
       .moveDown()
       .text(`Vergi Dairesi: ${teklifSettings?.firma_vergi_dairesi || ''}`, marginX)
       .text(`Vergi No: ${teklifSettings?.firma_vergi_no || ''}`, marginX);

    // PDF'i sonlandır
    doc.end();
}

module.exports = { createTeklifPDF }; 