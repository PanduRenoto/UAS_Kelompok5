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

interface HasilValidasi {
    valid: boolean; // true kalau input boleh dipakai
    pesan: string;  // alasan penolakan kalau tidak valid
}

// batas panjang nama pemesan
const MAKS_NAMA: number = 30;

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

// validasi nama: tidak boleh kosong dan tidak terlalu panjang
function validasiNama(nama: string): HasilValidasi {
    if (nama.trim() === "") {
        return { valid: false, pesan: "Nama tidak boleh kosong." };
    }
    if (nama.trim().length > MAKS_NAMA) {
        return { valid: false, pesan: "Nama maksimal " + MAKS_NAMA + " karakter." };
    }
    return { valid: true, pesan: "" };
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

// tambah booking baru
async function tambahBooking(_rl: readline.Interface): Promise<void> {
  tampilkanFiturBelumTersedia("Tambah Booking", 3);
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