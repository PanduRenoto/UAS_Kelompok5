// modul readline untuk input terminal
import * as readline from "readline/promises";
// input dan output terminal
import { stdin as input, stdout as output } from "process";

// blok 1: tipe data

// data satu lapangan futsal
interface Lapangan {
  id: string;              // nomor pilihan lapangan
  nama: string;            // nama lapangan
  jamOperasional: string;  // jam operasional lapangan
  jamBukaMenit: number;    // jam buka dalam menit
  jamTutupMenit: number;   // jam tutup dalam menit
  hargaPerJam: number;     // harga sewa per jam
}

// satu sesi booking yang sudah valid
interface SesiBooking {
  nomor: number;           // urutan sesi
  jamMulai: string;        // format HH:mm
  jamSelesai: string;      // format HH:mm
  mulaiMenit: number;      // menit mulai
  selesaiMenit: number;    // menit selesai
}

// hasil validasi satu sesi
interface HasilValidasiSesi {
  valid: boolean;          // status validasi
  pesan: string;           // pesan error jika tidak valid
  sesi?: SesiBooking;      // data sesi jika valid
}

// data booking yang disimpan di array
interface Booking {
  id: number;                  // id booking
  namaPemesan: string;         // nama pemesan
  lapangan: string;            // nama lapangan
  tanggal: string;             // tanggal booking
  durasiJam: number;           // durasi per sesi dalam jam
  jumlahSesi: number;          // jumlah sesi
  sesi: SesiBooking[];         // daftar sesi
  hargaPerJam: number;         // harga sewa per jam
  subtotal: number;            // subtotal sebelum diskon
  persenDiskon: number;        // persentase diskon
  diskon: number;              // potongan harga
  totalBayar: number;          // total setelah diskon
  metodePembayaran: string;    // metode pembayaran
  lunas: boolean;              // status pelunasan
  statusPesanan: string;       // status pesanan
}

// blok 2: konstanta dan data awal

// batas maksimal sesi
const maxSesi: number = 3;
// batas pilihan hari ke depan
const jumlahHariBooking: number = 7;
// syarat minimal sesi untuk diskon durasi
const minSesiDiskonDurasi: number = 2;

// diskon durasi
const diskonDurasi2Jam: number = 0.05;
const diskonDurasi3Jam: number = 0.1;

// diskon jumlah sesi
const diskonSesi2: number = 0.05;
const diskonSesi3: number = 0.1;

// daftar lapangan
const daftarLapangan: Lapangan[] = [
    { id: "1", nama: "Lapangan A - Vinyl", jamOperasional: "08:00-23:00", jamBukaMenit: 480, jamTutupMenit: 1380, hargaPerJam: 80000 },
    { id: "2", nama: "Lapangan B - Rumput Sintetis", jamOperasional: "08:00-23:00", jamBukaMenit: 480, jamTutupMenit: 1380, hargaPerJam: 100000 },
    { id: "3", nama: "Lapangan C - Premium", jamOperasional: "08:00-23:00", jamBukaMenit: 480, jamTutupMenit: 1380, hargaPerJam: 125000 },
    { id: "4", nama: "Lapangan D - Indoor", jamOperasional: "08:00-23:00", jamBukaMenit: 480, jamTutupMenit: 1380, hargaPerJam: 150000 },
    { id: "5", nama: "Lapangan E - Rumput Sintetis Premium", jamOperasional: "08:00-23:00", jamBukaMenit: 480, jamTutupMenit: 1380, hargaPerJam: 175000 }
];

// opsi durasi dan metode pembayaran
const daftarDurasiPilihan: number[] = [1, 2, 3];
const daftarMetodePembayaran: string[] = ["Kartu Kredit", "QRIS", "Transfer Bank"];

// data awal booking
function buatDataAwal(): Booking[] {
    // Array penampung data awal
    const data: Booking[] = [];

    // Data 1: Budi, Lapangan A, 1 sesi x 1 jam, QRIS, lunas
    data.push(buatBooking(1, "Budi Santoso", daftarLapangan[0], "Senin, 14 Desember 2026", 1, ["09:00"], "QRIS", true, "Booking dikonfirmasi"));

    // Data 2: Siti, Lapangan B, 2 sesi x 2 jam, Transfer Bank, lunas
    data.push(buatBooking(2, "Siti Aminah", daftarLapangan[1], "Selasa, 15 Desember 2026", 2, ["10:00", "14:00"], "Transfer Bank", true, "Booking dikonfirmasi"));

    // Data 3: Rizky, Lapangan C, 1 sesi x 3 jam, Kartu Kredit, lunas
    data.push(buatBooking(3, "Rizky Pratama", daftarLapangan[2], "Rabu, 16 Desember 2026", 3, ["19:00"], "Kartu Kredit", true, "Booking dikonfirmasi"));

    // Data 4: Dewi, Lapangan D, 3 sesi x 1 jam, QRIS, belum lunas
    data.push(buatBooking(4, "Dewi Lestari", daftarLapangan[3], "Kamis, 17 Desember 2026", 1, ["08:00", "10:00", "16:00"], "QRIS", false, "Menunggu pembayaran"));

    // Data 5: Andi, Lapangan E, 1 sesi x 2 jam, Transfer Bank, lunas
    data.push(buatBooking(5, "Andi Wijaya", daftarLapangan[4], "Jumat, 18 Desember 2026", 2, ["20:00"], "Transfer Bank", true, "Booking dikonfirmasi"));

    // Mengembalikan seluruh data awal
    return data;
}

// array penyimpan data booking
const daftarBooking: Booking[] = buatDataAwal();

// blok 3: fungsi utilitas


// format angka ke rupiah
function formatRupiah(angka: number): string {
    return "Rp" + angka.toLocaleString("id-ID");
}
// Mengubah teks jam "HH:mm" menjadi total menit sejak 00:00, mengembalikan null kalau formatnya salah
function ubahJamKeMenit(teks: string): number | null {
  //pola jam yang sah: jam 00-23, menit 00-59, dipisah titik dua
  const polajam: RegExp = /^([01]\d|2[0-3]):([0-5]\d)$/;
  // Mencocokan teks (spasi di awal dan akhir dibuang dulu) dengan pola 
  const hasil = polajam.exec(teks.trim());

  // seleksi if: teks tidak cocok dengan pola berarti format salah 
  if (hasil === null) {
    return null;
  }

  // Total menit = jam x 60 + menit
  return Number(hasil[1]) * 60 + Number(hasil[2]);
}

// Mengubah total menit sejak 00:00 menjadi teks "HH:mm", contoh 540 menjadi "09.00"
function formatMenit(totalMenit: number): string {
  // Jam adalah hasil bagi bulat, menit adalah sisa bagi (modulo)
  const jam: number = Math.floor(totalMenit / 60);
  const menit: number = totalMenit % 60;
  // padStart menambah angka 0 di depan supaya selalu 2 digit
  return String (jam).padStart(2, "0") + ":" + String(menit).padStart(2, "0");
}

//Mengecek dua sesi bertumpuk, sesi yang bersebelahan (selesai A = mulai B) tidak dihitung mulai 
function sesiBertumpuk(mulaiA: number, selesaiA: number, mulaiB: number, selesaiB: number): boolean {
  //Bertumpuk kalau A mulai sebelum B selesai DAN A selesai setelah B mulai
  return mulaiA < selesaiB && selesaiA > mulaiB;
}
// Membuat label 7 hari ke depan mulai besok, contoh "Selasa, 1 Desember 2026"
function buatDaftarTanggal(acuan?: Date): string[] {
    // Nama hari sesuai urutan getDay (0 = Minggu)
    const daftarNamaHari: string[] = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    // Nama bulan sesuai urutan getMonth (0 = Januari)
    const daftarNamaBulan: string[] = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    // Tanggal acuan: hari ini, kecuali diberikan tanggal lain
    const tanggalAcuan: Date = acuan ?? new Date();
    // Penampung label tanggal
    const daftar: string[] = [];

    // Perulangan for: urutan 1 = besok sampai urutan 7 = tujuh hari ke depan
    for (let urutan = 1; urutan <= jumlahHariBooking; urutan++) {
        // Date otomatis menyesuaikan pergantian bulan dan tahun
        const tanggal: Date = new Date(
            tanggalAcuan.getFullYear(),
            tanggalAcuan.getMonth(),
            tanggalAcuan.getDate() + urutan
        );
        // Menyusun label: nama hari, tanggal, nama bulan, tahun
        const label: string = `${daftarNamaHari[tanggal.getDay()]}, ${tanggal.getDate()} ${daftarNamaBulan[tanggal.getMonth()]} ${tanggal.getFullYear()}`;
        daftar.push(label);
    }

    // Mengembalikan 7 label tanggal
    return daftar;
}

// hitung total pendapatan dari booking yang lunas
function hitungTotalPendapatan(data: Booking[]): number {
    // Penampung total pendapatan
    let totalPendapatan: number = 0;

    // Perulangan for...of: periksa setiap booking
    for (const booking of data) {
        // Penanda booking dibatalkan
        const dibatalkan: boolean = booking.statusPesanan === "Booking dibatalkan";
        // Seleksi if dengan dua kondisi: harus lunas (&&) dan tidak (!) dibatalkan
        if (booking.lunas && !dibatalkan) {
            totalPendapatan += booking.totalBayar;
        }
    }

    // Mengembalikan total pendapatan
    return totalPendapatan;
}

// blok 4: perhitungan dan validasi jadwal
// Memeriksa satu jam mulai: format, jam operasional, dan tumpang tindih, lalu menghitung jam selesainya
function validasiSesiBaru(
    jamMulaiTeks: string,
    durasiJam: number,
    lapangan: Lapangan,
    sesiSebelumnya: SesiBooking[]
): HasilValidasiSesi {
    // Seleksi if 1: format jam harus HH:mm, ubahJamKeMenit mengembalikan null kalau salah
    const mulaiMenit: number | null = ubahJamKeMenit(jamMulaiTeks);
    if (mulaiMenit === null) {
        return { valid: false, pesan: "Format jam harus HH:mm, contoh 09:00." };
    }

    // Jam selesai = jam mulai + durasi (jam diubah ke menit dengan compound *=)
    let durasiMenit: number = durasiJam;
    durasiMenit *= 60;
    const selesaiMenit: number = mulaiMenit + durasiMenit;

    // Seleksi if 2 (lebih dari satu kondisi): sesi harus di dalam jam operasional lapangan
    if (mulaiMenit < lapangan.jamBukaMenit || selesaiMenit > lapangan.jamTutupMenit) {
        return {
            valid: false,
            pesan: `Sesi ${formatMenit(mulaiMenit)}-${formatMenit(selesaiMenit)} di luar jam operasional ${lapangan.jamOperasional}.`
        };
    }

    // Perulangan for...of: bandingkan dengan setiap sesi yang sudah dimasukkan
    for (const sesi of sesiSebelumnya) {
        // Seleksi if 3: tolak kalau waktunya bertumpuk dengan sesi lain
        if (sesiBertumpuk(mulaiMenit, selesaiMenit, sesi.mulaiMenit, sesi.selesaiMenit)) {
            return {
                valid: false,
                pesan: `Bertumpuk dengan sesi ${sesi.nomor} (${sesi.jamMulai}-${sesi.jamSelesai}).`
            };
        }
    }

    // Semua pemeriksaan lolos, kembalikan sesi baru
    return {
        valid: true,
        pesan: "",
        sesi: {
            nomor: sesiSebelumnya.length + 1,
            jamMulai: formatMenit(mulaiMenit),
            jamSelesai: formatMenit(selesaiMenit),
            mulaiMenit,
            selesaiMenit
        }
    };
}

// Menghitung subtotal: jumlah (lama sesi dalam jam x harga per jam) dari semua sesi
function hitungSubtotal(daftarSesi: SesiBooking[], hargaPerJam: number): number {
    // Penampung total biaya
    let subtotal: number = 0;

    // Perulangan for...of: proses setiap sesi
    for (const sesi of daftarSesi) {
        // Lama sesi dalam menit, lalu diubah ke jam dengan compound /=
        let lamaJam: number = sesi.selesaiMenit - sesi.mulaiMenit;
        lamaJam /= 60;
        // Tambahkan biaya sesi ini ke subtotal dengan compound +=
        subtotal += lamaJam * hargaPerJam;
    }

    // Mengembalikan subtotal seluruh sesi
    return subtotal;
}

// Menghitung persen diskon dari durasi dan jumlah sesi (hasil bulat, 10 berarti 10%)
function hitungPersenDiskon(durasiJam: number, jumlahSesi: number): number {
    // Penampung persen diskon dari jumlah sesi dan dari durasi
    let persenDiskonSesi: number = 0;
    let persenDiskonDurasi: number = 0;

    // Nested tingkat 1 (if): diskon hanya untuk pesanan minimal 2 sesi
    if (jumlahSesi >= minSesiDiskonDurasi) {
        // Nested tingkat 2 (if): jumlah sesi tidak boleh melebihi batas maksimal
        if (jumlahSesi <= maxSesi) {
            // Diskon dari jumlah sesi: 2 sesi = 5%, 3 sesi = 10%
            if (jumlahSesi === 2) {
                persenDiskonSesi = diskonSesi2;
            } else if (jumlahSesi === 3) {
                persenDiskonSesi = diskonSesi3;
            }

            // Nested tingkat 3 (switch): diskon durasi, 3 case + default, masing-masing dengan break
            switch (durasiJam) {
                case 1:
                    persenDiskonDurasi = 0; // durasi 1 jam tidak dapat diskon durasi
                    break;
                case 2:
                    persenDiskonDurasi = diskonDurasi2Jam;
                    break;
                case 3:
                    persenDiskonDurasi = diskonDurasi3Jam;
                    break;
                default:
                    persenDiskonDurasi = 0;
                    break;
            }
        }
    }

    // Gabungkan kedua diskon, dibulatkan agar tidak muncul 15.000000000000002
    const totalPersen: number = persenDiskonSesi + persenDiskonDurasi;
    return Math.round(totalPersen * 100);
}

// Membuat satu objek Booking lengkap dengan semua perhitungannya
// Dipakai untuk seed data, Create, dan hitung ulang saat Update
function buatBooking(
    id: number,
    namaPemesan: string,
    lapangan: Lapangan,
    tanggal: string,
    durasiJam: number,
    jamMulaiList: string[],
    metodePembayaran: string,
    lunas: boolean,
    statusPesanan: string
): Booking {
    // Penampung sesi yang sudah lolos validasi
    const sesiList: SesiBooking[] = [];

    // Perulangan for...of: validasi tiap jam mulai, hentikan dengan error kalau ada yang salah
    for (const jamMulai of jamMulaiList) {
        const hasil: HasilValidasiSesi = validasiSesiBaru(jamMulai, durasiJam, lapangan, sesiList);
        if (hasil.valid && hasil.sesi !== undefined) {
            sesiList.push(hasil.sesi);
        } else {
            throw new Error(`Sesi ${sesiList.length + 1} (${namaPemesan}): ${hasil.pesan}`);
        }
    }

    // Seleksi if: jumlah sesi harus 1 sampai maxSesi
    if (sesiList.length < 1 || sesiList.length > maxSesi) {
        throw new Error(`Jumlah sesi harus antara 1 dan ${maxSesi}.`);
    }

    // Hitung subtotal, persen diskon, nilai diskon (dibulatkan ke rupiah), dan total bayar
    const subtotal: number = hitungSubtotal(sesiList, lapangan.hargaPerJam);
    const persenDiskon: number = hitungPersenDiskon(durasiJam, sesiList.length);
    const diskon: number = Math.round(subtotal * persenDiskon / 100);
    let totalBayar: number = subtotal;
    totalBayar -= diskon;

    // Mengembalikan objek Booking yang siap disimpan ke array
    return {
        id,
        namaPemesan,
        lapangan: lapangan.nama,
        tanggal,
        durasiJam,
        jumlahSesi: sesiList.length,
        sesi: sesiList,
        hargaPerJam: lapangan.hargaPerJam,
        subtotal,
        persenDiskon,
        diskon,
        totalBayar,
        metodePembayaran,
        lunas,
        statusPesanan
    };
}

// blok 5: fitur create

// memeriksa nama pemesan, mengembalikan pesan error atau "" kalau valid
function periksaNama(nama: string): string {
  // seleksi if: nama tidak boleh kosong
  if (nama.trim() === "") {
    return "Nama tidak boleh kosong.";
  }
  // seleksi if: nama tidak boleh terlalu panjang
  if (nama.trim().length > 30) {
    return "Nama maksimal 30 karakter.";
  }
  // nama lolos pemeriksaan
  return "";
}

// mengecek apakah sesi baru bertabrakan dengan booking lain di lapangan dan tanggal yang sama
// mengembalikan pesan error atau "" kalau tidak bentrok
function sesiBentrokDenganBooking(namaLapangan: string, tanggal: string, sesiBaru: SesiBooking): string {
  // perulangan for...of: periksa setiap booking yang sudah tersimpan
  for (const booking of daftarBooking) {
    // hanya booking di lapangan dan tanggal yang sama yang perlu dibandingkan
    if (booking.lapangan === namaLapangan && booking.tanggal === tanggal) {
      // perulangan for...of: bandingkan dengan setiap sesi booking tersebut
      for (const sesi of booking.sesi) {
        if (sesiBertumpuk(sesiBaru.mulaiMenit, sesiBaru.selesaiMenit, sesi.mulaiMenit, sesi.selesaiMenit)) {
          return `Bentrok dengan booking #${booking.id} (${sesi.jamMulai}-${sesi.jamSelesai}).`;
        }
      }
    }
  }
  // tidak ada jadwal yang bertabrakan
  return "";
}

// memeriksa pilihan angka (kosong, bukan angka/NaN, negatif, desimal, di luar batas)
function periksaPilihanAngka(teks: string, min: number, maks: number): string {
  // seleksi if: input tidak boleh kosong
  if (teks.trim() === "") {
    return "Input tidak boleh kosong.";
  }

  // ubah teks menjadi angka
  const angka: number = Number(teks);

  // seleksi if: hasil ubah harus berupa angka
  if (Number.isNaN(angka)) {
    return "Input harus berupa angka.";
  }
  // seleksi if: angka tidak boleh negatif
  if (angka < 0) {
    return "Angka tidak boleh negatif.";
  }
  // seleksi if dengan dua kondisi: harus bulat dan berada dalam rentang min sampai maks
  if (!Number.isInteger(angka) || angka < min || angka > maks) {
    return `Masukkan angka bulat ${min} sampai ${maks}.`;
  }

  // angka lolos pemeriksaan
  return "";
}

// mengecek apakah id sudah dipakai booking lain
function idSudahAda(id: number): boolean {
  return daftarBooking.some((booking) => booking.id === id);
}

// membuat id baru: id terbesar + 1, lalu dipastikan tidak ada duplikasi
function buatIdBaru(): number {
  // penampung id terbesar yang sudah ada
  let idTerbesar: number = 0;

  // perulangan for...of: cari id terbesar
  for (const booking of daftarBooking) {
    if (booking.id > idTerbesar) {
      idTerbesar = booking.id;
    }
  }

  // id baru = id terbesar + 1
  let idBaru: number = idTerbesar + 1;

  // perulangan while: naikkan id selama masih dipakai (pencegahan duplikasi)
  while (idSudahAda(idBaru)) {
    idBaru++;
  }
  return idBaru;
}

// menanyakan nama sampai valid
async function tanyaNama(rl: readline.Interface): Promise<string> {
  let nama: string = (await rl.question("Nama pemesan: ")).trim();
  let pesan: string = periksaNama(nama);

  // perulangan while: ulangi selama nama belum valid
  while (pesan !== "") {
    console.log("  [!] " + pesan);
    nama = (await rl.question("Nama pemesan: ")).trim();
    pesan = periksaNama(nama);
  }
  return nama;
}

// menanyakan pilihan angka sampai valid, program tidak berhenti saat input salah
async function tanyaPilihanAngka(rl: readline.Interface, pertanyaan: string, min: number, maks: number): Promise<number> {
  let jawaban: string = (await rl.question(pertanyaan)).trim();
  let pesan: string = periksaPilihanAngka(jawaban, min, maks);

  // perulangan while: ulangi selama pilihan belum valid
  while (pesan !== "") {
    console.log("  [!] " + pesan);
    jawaban = (await rl.question(pertanyaan)).trim();
    pesan = periksaPilihanAngka(jawaban, min, maks);
  }
  return Number(jawaban);
}

// menanyakan Y/N sampai jawabannya benar, true kalau Y
async function tanyaYaTidak(rl: readline.Interface, pertanyaan: string): Promise<boolean> {
  let jawaban: string = (await rl.question(pertanyaan)).trim().toLowerCase();

  // perulangan while: hanya terima y atau n
  while (jawaban !== "y" && jawaban !== "n") {
    console.log("  [!] Jawab dengan Y atau N.");
    jawaban = (await rl.question(pertanyaan)).trim().toLowerCase();
  }
  return jawaban === "y";
}

// menampilkan ringkasan booking yang baru tersimpan
function tampilkanBookingBaru(booking: Booking): void {
  console.log("\nBooking berhasil ditambahkan!");
  console.log("--------------------------------------------------");
  console.log(`ID Booking       : ${booking.id}`);
  console.log(`Pemesan          : ${booking.namaPemesan}`);
  console.log(`Lapangan         : ${booking.lapangan}`);
  console.log(`Tanggal          : ${booking.tanggal}`);
  console.log(`Durasi per Sesi  : ${booking.durasiJam} jam`);
  // forEach: tampilkan setiap sesi
  booking.sesi.forEach((sesi) => {
    console.log(`  Sesi ${sesi.nomor}         : ${sesi.jamMulai} - ${sesi.jamSelesai}`);
  });
  console.log(`Subtotal         : ${formatRupiah(booking.subtotal)}`);
  console.log(`Diskon           : ${formatRupiah(booking.diskon)} (${booking.persenDiskon}%)`);
  console.log(`Total Bayar      : ${formatRupiah(booking.totalBayar)}`);
  console.log(`Metode Pembayaran: ${booking.metodePembayaran}`);
  console.log(`Status Pesanan   : ${booking.statusPesanan}`);
  console.log("--------------------------------------------------");
  console.log(`Total data booking sekarang: ${daftarBooking.length}\n`);
}

// tambah booking baru
async function tambahBooking(rl: readline.Interface): Promise<void> {
  console.log("\n=== TAMBAH BOOKING BARU ===");

  // langkah 1: pilih lapangan
  console.log("\nDaftar Lapangan:");
  // perulangan for: tampilkan lapangan beserta harga
  for (let i = 0; i < daftarLapangan.length; i++) {
    const lap: Lapangan = daftarLapangan[i];
    console.log(`  ${lap.id}. ${lap.nama} - ${formatRupiah(lap.hargaPerJam)}/jam (${lap.jamOperasional})`);
  }
  const noLapangan: number = await tanyaPilihanAngka(rl, "Pilih lapangan (nomor): ", 1, daftarLapangan.length);
  const lapangan: Lapangan | undefined = daftarLapangan.find((lap) => lap.id === String(noLapangan));
  // seleksi if: pengaman kalau lapangan tidak ditemukan
  if (lapangan === undefined) {
    console.log("Terjadi kesalahan: lapangan tidak ditemukan.\n");
    return;
  }
 // langkah 2: nama pemesan
  const namaPemesan: string = await tanyaNama(rl);

  // langkah 3: pilih tanggal (7 hari ke depan mulai besok)
  console.log("\nPilihan Tanggal:");
  const tanggalList: string[] = buatDaftarTanggal();
  tanggalList.forEach((label, index) => console.log(`  ${index + 1}. ${label}`));
  const noTanggal: number = await tanyaPilihanAngka(rl, "Pilih tanggal (nomor): ", 1, tanggalList.length);
  const tanggal: string = tanggalList[noTanggal - 1];

  // langkah 4: pilih durasi per sesi
  console.log("\nPilihan Durasi per Sesi:");
  daftarDurasiPilihan.forEach((jam, index) => console.log(`  ${index + 1}. ${jam} Jam`));
  const noDurasi: number = await tanyaPilihanAngka(rl, "Pilih durasi (nomor): ", 1, daftarDurasiPilihan.length);
  const durasiJam: number = daftarDurasiPilihan[noDurasi - 1];

  // langkah 5: jumlah sesi
  const jumlahSesi: number = await tanyaPilihanAngka(rl, `Jumlah sesi (1-${maxSesi}): `, 1, maxSesi);

  // langkah 6: jam mulai tiap sesi, harus valid dan tidak bentrok
  console.log(`\nMasukkan jam mulai tiap sesi (format HH:mm, operasional ${lapangan.jamOperasional}).`);
  const sesiList: SesiBooking[] = [];
  const jamMulaiList: string[] = [];

  // perulangan while: ulangi sampai jumlah sesi terpenuhi
  while (sesiList.length < jumlahSesi) {
    const nomorSesi: number = sesiList.length + 1;
    const jamTeks: string = (await rl.question(`Jam mulai sesi ${nomorSesi}: `)).trim();
    const hasil: HasilValidasiSesi = validasiSesiBaru(jamTeks, durasiJam, lapangan, sesiList);

    // seleksi if: jam tidak lolos validasi sesi (format, operasional, tumpang tindih)
    if (!hasil.valid || hasil.sesi === undefined) {
      console.log("  [!] " + hasil.pesan);
    } else {
      // cek bentrok dengan booking lain yang sudah tersimpan
      const pesanBentrok: string = sesiBentrokDenganBooking(lapangan.nama, tanggal, hasil.sesi);
      if (pesanBentrok !== "") {
        console.log("  [!] " + pesanBentrok);
      } else {
        sesiList.push(hasil.sesi);
        jamMulaiList.push(hasil.sesi.jamMulai);
        console.log(`  Sesi ${nomorSesi}: ${hasil.sesi.jamMulai} - ${hasil.sesi.jamSelesai}`);
      }
    }
  }

  // langkah 7: metode pembayaran
  console.log("\nMetode Pembayaran:");
  daftarMetodePembayaran.forEach((metode, index) => console.log(`  ${index + 1}. ${metode}`));
  const noMetode: number = await tanyaPilihanAngka(rl, "Pilih metode (nomor): ", 1, daftarMetodePembayaran.length);
  const metodePembayaran: string = daftarMetodePembayaran[noMetode - 1];

  // langkah 8: status pembayaran menentukan status pesanan
  const lunas: boolean = await tanyaYaTidak(rl, "Bayar sekarang? (Y/N): ");
  const statusPesanan: string = lunas ? "Booking dikonfirmasi" : "Menunggu pembayaran";

  // langkah 9: buat objek booking, simpan ke array dengan push, lalu tampilkan hasilnya
  try {
    const bookingBaru: Booking = buatBooking(
      buatIdBaru(),
      namaPemesan,
      lapangan,
      tanggal,
      durasiJam,
      jamMulaiList,
      metodePembayaran,
      lunas,
      statusPesanan
    );
    daftarBooking.push(bookingBaru);
    tampilkanBookingBaru(bookingBaru);
  } catch (error: unknown) {
    // kesalahan tidak menghentikan program, pengguna kembali ke menu
    const pesan: string = error instanceof Error ? error.message : String(error);
    console.log("\nGagal menambah booking: " + pesan + "\n");
  }
}

// blok 6: fitur read

// tampilkan semua booking
function tampilSemuaBooking(): void {
  tampilkanFiturBelumTersedia("Lihat Semua Booking", 4);
}

// tampilkan detail booking berdasarkan id
async function tampilDetailBooking(_rl: readline.Interface): Promise<void> {
  tampilkanFiturBelumTersedia("Lihat Detail Booking", 4);
}

// blok 7: fitur update

// ubah data booking
async function ubahBooking(_rl: readline.Interface): Promise<void> {
  tampilkanFiturBelumTersedia("Ubah Booking", 5);
}

// blok 8: fitur delete

// hapus data booking
async function hapusBooking(_rl: readline.Interface): Promise<void> {
  tampilkanFiturBelumTersedia("Hapus Booking", 5);
}

// blok 9: fitur search

// cari data booking
async function cariBooking(_rl: readline.Interface): Promise<void> {
  tampilkanFiturBelumTersedia("Cari Booking", 6);
}

// blok 10: menu utama

// pesan penanda fitur belum tersedia
function tampilkanFiturBelumTersedia(namaFitur: string, progress: number): void {
  console.log(`\nFitur ${namaFitur} akan tersedia pada Progress ${progress}.\n`);
}

// tampilan menu utama
function tampilkanMenu(): void {
  const totalBooking: number = daftarBooking.length;
  const totalPendapatan: number = hitungTotalPendapatan(daftarBooking);

  console.log("==================================================");
  console.log("       SISTEM BOOKING LAPANGAN FUTSAL - UAS       ");
  console.log("==================================================");
  console.log(`Total Booking: ${totalBooking} | Total Pendapatan: ${formatRupiah(totalPendapatan)}`);
  console.log("--------------------------------------------------");
  console.log("1. Tambah Booking");
  console.log("2. Lihat Semua Booking");
  console.log("3. Lihat Detail Booking");
  console.log("4. Ubah Booking");
  console.log("5. Hapus Booking");
  console.log("6. Cari Booking");
  console.log("0. Keluar");
  console.log("==================================================");
}

// fungsi utama aplikasi
async function main(): Promise<void> {
  const rl = readline.createInterface({ input, output });

  // tangani ctrl+c
  rl.on("SIGINT", () => {
    console.log("\n\nProgram dihentikan oleh pengguna.");
    rl.close();
    process.exit(0);
  });

  let menuBerjalan: boolean = true;

  try {
    // perulangan menu utama
    while (menuBerjalan) {
      tampilkanMenu();
      const inputPilihan: string = (await rl.question("Pilih menu (0-6): ")).trim();

      switch (inputPilihan) {
        case "1":
          await tambahBooking(rl);
          break;
        case "2":
          tampilSemuaBooking();
          break;
        case "3":
          await tampilDetailBooking(rl);
          break;
        case "4":
          await ubahBooking(rl);
          break;
        case "5":
          await hapusBooking(rl);
          break;
        case "6":
          await cariBooking(rl);
          break;
        case "0":
          console.log("\nTerima kasih telah menggunakan Sistem Booking Lapangan Futsal. Sampai jumpa!\n");
          menuBerjalan = false;
          break;
        default:
          console.log("\nPilihan tidak valid, masukkan angka 0 sampai 6.\n");
          break;
      }
    }
  } finally {
    rl.close();
  }
}

// jalankan program utama
main().catch((error: unknown) => {
  const pesan: string = error instanceof Error ? error.message : String(error);
  console.log("Terjadi kesalahan: " + pesan);
  process.exit(1);
});