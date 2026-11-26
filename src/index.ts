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
    return [];
}

// array penyimpan data booking
const daftarBooking: Booking[] = buatDataAwal();

// blok 3: fungsi utilitas


// format angka ke rupiah
function formatRupiah(angka: number): string {
    return "Rp" + angka.toLocaleString("id-ID");
}
// Mengubah teks jam "HH:mm" menjadi total menit sejak 00:00, mengembalikan null kalau formatnya salah
function ubahjamKemenit(teks: string): number | null {
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
// hitung total pendapatan dari booking yang lunas
function hitungTotalPendapatan(_data: Booking[]): number {
    return 0;
}

// blok 4: perhitungan dan validasi jadwal

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