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
