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
