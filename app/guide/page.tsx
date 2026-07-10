"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  User,
  Users,
  Compass,
  FileText,
  Calendar,
  Lock,
  ArrowLeft,
  Search,
  CheckCircle,
  HelpCircle,
  ShieldAlert,
  Crown,
  Building2,
  HelpCircle as QuestionIcon
} from "lucide-react";

export default function GuidePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"siswa" | "konselor">("siswa");
  const [searchQuery, setSearchQuery] = useState("");

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const studentSteps = [
    {
      id: "std-1",
      title: "Registrasi & Akun",
      icon: User,
      desc: "Langkah awal memulai perjalanan karier di Careerous.",
      points: [
        "Akses halaman Pendaftaran dari halaman utama.",
        "Pilih peran sebagai <b>Siswa</b>.",
        "Masukkan nama lengkap, email aktif, dan buat kata sandi yang kuat (minimal 8 karakter).",
        "Setelah berhasil mendaftar, Anda akan langsung masuk ke Dasbor Siswa."
      ]
    },
    {
      id: "std-2",
      title: "Asesmen Minat & Gaya Belajar",
      icon: Compass,
      desc: "Menemukan kepribadian RIASEC dominan dan gaya belajar terbaik Anda.",
      points: [
        "Buka menu <b>Tes RIASEC</b> dari dasbor atau baris menu sebelah kiri.",
        "Isi kuesioner RIASEC yang berisi daftar aktivitas yang mungkin Anda sukai.",
        "Lanjutkan dengan mengisi kuesioner pilihan ganda tentang Gaya Belajar pada halaman yang sama.",
        "Klik <b>Simpan Jawaban</b> untuk langsung melihat diagram kepribadian Anda dan cara belajar yang paling pas (Visual, Auditorial, atau Kinestetik)."
      ]
    },
    {
      id: "std-3",
      title: "Refleksi Jurnal Karier (12 Modul)",
      icon: BookOpen,
      desc: "Tahapan terpenting untuk mengeksplorasi pemikiran dan pemahaman karier.",
      points: [
        "Masuk ke menu <b>Modul Eksplorasi</b>.",
        "Anda harus menyelesaikan 12 modul secara berurutan. Pertanyaan di setiap modul bersumber secara dinamis dari database admin.",
        "Ketikkan jawaban Anda pada masing-masing kolom teks pertanyaan yang disediakan secara terpisah.",
        "Anda dapat melampirkan berkas tambahan (seperti foto atau dokumen) sebagai bukti pendukung.",
        "<b>Akses Premium</b>: Sebagian modul lanjutan ditandai dengan lencana <i>Premium</i> dan baru terbuka jika sekolah/institusi Anda sudah mengaktifkan langganan Premium. Lihat langkah <b>Akses Premium</b> di bawah bila modul terkunci Premium.",
        "<b>Buka Kunci Mandiri (Self-Unlock)</b>: Jika Anda terlambat mengerjakan modul hingga melewati batas waktu (deadline), modul akan terkunci sementara. Anda dapat membukanya sendiri secara instan dengan mengisi <b>Tugas Transisi</b> (memilih mood, menjelaskan kendala, dan mengunggah dokumen moodboard) atau meminta bantuan Guru BK untuk membukanya."
      ]
    },
    {
      id: "std-4",
      title: "Konseling & Jadwal Pertemuan",
      icon: Calendar,
      desc: "Berkonsultasi secara tatap muka atau video call langsung di platform.",
      points: [
        "Pilih menu <b>Jadwal Konseling</b> di dasbor Anda.",
        "Lihat daftar jadwal konseling yang sudah disediakan oleh Guru BK.",
        "Klik <b>Booking Jadwal</b> pada waktu yang cocok, lalu tuliskan topik permasalahan bimbingan Anda.",
        "Setelah disetujui, Anda dapat bergabung ke <b>Ruang Konseling Video Jitsi</b> terintegrasi langsung di dalam aplikasi pada waktu pertemuan.",
        "Anda juga dapat memantau status persetujuan janji temu yang diajukan."
      ]
    },
    {
      id: "std-5",
      title: "Career Report (Laporan Karier)",
      icon: FileText,
      desc: "Melihat hasil ringkasan mengenai kecenderungan karier masa depan Anda.",
      points: [
        "Setelah Anda menyelesaikan <b>seluruh 12 modul</b>, menu <b>Career Report</b> akan otomatis terbuka.",
        "Sistem akan merangkum seluruh jawaban jurnal yang sudah Anda tulis untuk dijadikan satu laporan eksplorasi utuh.",
        "Laporan memuat <b>Indeks Sentimen Jurnal</b>, <b>Tema Karier Teridentifikasi</b>, diagram <b>RIASEC</b>, dan <b>AI Insight</b> yang bisa Anda perbarui kapan saja dengan sekali klik.",
        "Klik ikon <b>Cetak</b> untuk mengunduh atau mencetak laporan sebagai dokumen resmi (PDF).",
        "Gunakan laporan ini sebagai panduan berdiskusi dengan Guru BK untuk mematangkan rencana studi lanjut."
      ]
    },
    {
      id: "std-6",
      title: "Akses Premium",
      icon: Crown,
      desc: "Membuka seluruh 12 modul, AI Insight, dan konseling online secara penuh.",
      points: [
        "Akses Premium <b>diaktifkan oleh sekolah/institusi</b> Anda, bukan dibeli per siswa.",
        "Jika modul atau fitur ditandai <i>Premium</i> dan masih terkunci, artinya langganan institusi Anda belum aktif.",
        "Hubungi <b>Guru BK</b> Anda untuk mengajukan langganan Premium sekolah ke Admin Careerous.",
        "Bila sudah aktif, dasbor Anda akan menampilkan badge <b>Akses Premium aktif</b> dan seluruh modul, AI Insight, serta konseling online langsung terbuka."
      ]
    }
  ];

  const counselorSteps = [
    {
      id: "cns-1",
      title: "Memantau Progress Siswa",
      icon: Users,
      desc: "Melihat data siswa bimbingan secara cepat dan ringkas.",
      points: [
        "Akses menu <b>Daftar Siswa</b> pada baris menu sebelah kiri.",
        "Data siswa disajikan dalam tabel yang memuat: Nama, Progres Modul, Kepribadian RIASEC Teratas, dan Status Akun.",
        "Gunakan kolom <b>Pencarian</b> untuk mencari nama siswa dengan cepat, atau klik tombol filter seperti <i>Terblokir</i> untuk melihat siswa yang butuh bantuan segera.",
        "Klik baris nama siswa untuk membuka <b>Panel Samping</b> berisi data rincian siswa tanpa harus berpindah halaman."
      ]
    },
    {
      id: "cns-2",
      title: "Reviu & Umpan Balik Modul",
      icon: BookOpen,
      desc: "Membaca catatan refleksi siswa dan memberikan arahan bimbingan.",
      points: [
        "Pilih menu <b>Reviu Modul</b> pada baris menu sebelah kiri.",
        "Anda dapat menyaring tampilan berdasarkan status pengerjaan modul siswa.",
        "Klik pada modul siswa untuk membaca jawaban lengkap per pertanyaan yang mereka tulis, serta melihat lampiran file pendukung.",
        "Berikan tanggapan atau masukan di kolom komentar pada bagian bawah untuk membimbing arah pemikiran karier siswa."
      ]
    },
    {
      id: "cns-3",
      title: "Mengelola Jadwal & Ruang Konseling",
      icon: Calendar,
      desc: "Menyediakan jadwal bimbingan tatap muka maupun online.",
      points: [
        "Buka menu <b>Jadwal Program</b>.",
        "Klik tombol <b>Buat Slot Baru</b>, tentukan tanggal, jam, batas maksimal siswa, dan tipe ruangan virtual.",
        "Anda akan mendapatkan pemberitahuan jika ada siswa yang memesan slot tersebut.",
        "Anda bisa menyetujui (<i>Approve</i>) atau menolak (<i>Reject</i>) pengajuan dari siswa.",
        "Untuk konseling online, Guru BK dan Siswa dapat langsung masuk ke <b>Ruang Konseling Virtual Jitsi</b> terintegrasi dalam platform."
      ]
    },
    {
      id: "cns-4",
      title: "Membuka Kunci Modul (Unlock)",
      icon: Lock,
      desc: "Membantu siswa yang mengalami hambatan waktu saat mengisi jurnal.",
      points: [
        "Buka profil siswa melalui Panel Samping di halaman <b>Daftar Siswa</b> atau halaman <b>Reviu Jurnal</b>.",
        "Cari daftar modul siswa yang berstatus <b>Terblokir</b> (karena batas waktu pengerjaan sudah habis).",
        "Klik tombol <b>Buka Akses</b> di sebelah modul tersebut agar siswa bisa kembali melanjutkan tugas jurnalnya secara manual (Siswa juga dapat membuka secara mandiri lewat Tugas Transisi)."
      ]
    },
    {
      id: "cns-5",
      title: "Reset Kata Sandi Siswa",
      icon: ShieldAlert,
      desc: "Membantu memulihkan akses siswa yang lupa kata sandi login.",
      points: [
        "Di halaman <b>Daftar Siswa</b>, temukan siswa yang membutuhkan bantuan reset sandi.",
        "Klik ikon <b>Kunci (Reset Sandi)</b> pada kolom aksi, atau buka profil mereka lewat Panel Samping.",
        "Masukkan kata sandi yang baru (minimal 8 karakter), kemudian klik simpan.",
        "Serahkan kata sandi baru tersebut ke siswa yang bersangkutan agar mereka bisa masuk kembali ke aplikasi."
      ]
    },
    {
      id: "cns-6",
      title: "Mengajukan Langganan Institusi (Premium)",
      icon: Building2,
      desc: "Membuka akses Premium untuk seluruh siswa di sekolah Anda.",
      points: [
        "Buka menu <b>Langganan Institusi</b> pada baris menu sebelah kiri.",
        "Halaman ini menampilkan status langganan sekolah Anda: <b>Berlangganan Aktif</b> atau <b>Belum Berlangganan</b>, beserta tanggal berakhirnya.",
        "Jika belum aktif, isi catatan pengajuan (misalnya jumlah siswa aktif atau kebutuhan program) lalu klik <b>Ajukan Langganan ke Admin</b>.",
        "Pengajuan akan ditinjau Admin Careerous. Setelah disetujui, <b>seluruh siswa institusi</b> otomatis mendapat akses penuh ke 12 modul, AI Insight, dan konseling online.",
        "Jika akun Anda belum tertaut ke sebuah institusi, hubungi Admin untuk menautkannya terlebih dahulu."
      ]
    }
  ];

  const filterSteps = (steps: typeof studentSteps) => {
    if (!searchQuery.trim()) return steps;
    const query = searchQuery.toLowerCase();
    return steps.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.desc.toLowerCase().includes(query) ||
        s.points.some((p) => p.toLowerCase().includes(query))
    );
  };

  const activeSteps = activeTab === "siswa" ? filterSteps(studentSteps) : filterSteps(counselorSteps);

  return (
    <main className="relative min-h-screen bg-slate-50 font-sans text-slate-900 pb-16">

      <header className="relative overflow-hidden bg-gradient-to-b from-blue-600 to-indigo-700 pb-16 shadow-inner">
        <div className="pointer-events-none absolute top-10 left-10 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-5 pt-8 text-white">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/20"
          >
            <ArrowLeft size={14} /> Kembali
          </button>

          <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-blue-200">
                  <HelpCircle size={11} /> Pusat Bantuan
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-4xl">
                Panduan Penggunaan <span className="text-blue-200">Careerous</span>
              </h1>
              <p className="mt-2 text-[13px] leading-relaxed text-blue-100 sm:text-sm max-w-xl">
                Temukan tata cara lengkap untuk memaksimalkan seluruh fitur di platform Careerous. Pilih panduan yang sesuai dengan peran Anda di bawah ini.
              </p>
            </div>
            <div className="relative w-full md:w-80 md:shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-200" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari topik panduan..."
                className="w-full rounded-full border-none bg-white/15 px-10 py-3 text-sm text-white placeholder-blue-200 outline-none ring-2 ring-white/10 focus:bg-white/25 focus:ring-white/30 backdrop-blur-md transition"
              />
            </div>
          </div>
        </div>
      </header>


      <div className="relative mx-auto max-w-5xl px-5 -mt-8">
        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          

          <aside className="flex flex-col gap-2 md:sticky md:top-5 md:self-start">
            <div className="grid grid-cols-2 gap-2 md:flex md:flex-col">
            <button
              onClick={() => {
                setActiveTab("siswa");
                setSearchQuery("");
              }}
              className={`flex items-center gap-3 rounded-2xl p-4 text-left font-bold transition ${
                activeTab === "siswa"
                  ? "bg-white text-blue-700 shadow-md shadow-slate-200/50 border-l-4 border-blue-600"
                  : "bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <User size={18} />
              <div>
                <p className="text-sm">Panduan Siswa</p>
                <p className="text-[10px] font-normal text-slate-400">Untuk siswa &amp; alumni</p>
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTab("konselor");
                setSearchQuery("");
              }}
              className={`flex items-center gap-3 rounded-2xl p-4 text-left font-bold transition ${
                activeTab === "konselor"
                  ? "bg-white text-blue-700 shadow-md shadow-slate-200/50 border-l-4 border-blue-600"
                  : "bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <Users size={18} />
              <div>
                <p className="text-sm">Panduan Konselor</p>
                <p className="text-[10px] font-normal text-slate-400">Untuk Guru BK / Konselor</p>
              </div>
            </button>
            </div>

            <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:mt-5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Punya Kendala?</h4>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                Jika Anda memiliki kendala teknis atau pertanyaan lebih lanjut mengenai Careerous, silakan hubungi bagian Administrator melalui tim IT sekolah Anda.
              </p>
            </div>
          </aside>


          <section className="flex flex-col gap-5">
            {activeSteps.length > 0 ? (
              activeSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.id}
                    id={step.id}
                    className="group rounded-3xl border border-slate-200/60 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                        <Icon size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-extrabold text-blue-600 font-mono">
                            LANGKAH {index + 1}
                          </span>
                        </div>
                        <h3 className="mt-1 text-lg font-extrabold text-slate-900">
                          {step.title}
                        </h3>
                        <p className="mt-1 text-[12.5px] text-slate-500 leading-relaxed">
                          {step.desc}
                        </p>

                        <div className="mt-5 border-t border-slate-100 pt-4">
                          <ul className="flex flex-col gap-3">
                            {step.points.map((pt, pIdx) => (
                              <li key={pIdx} className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-slate-600">
                                <CheckCircle size={15} className="mt-0.5 shrink-0 text-emerald-500" />
                                <span dangerouslySetInnerHTML={{ __html: pt }} />
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <QuestionIcon size={28} />
                </div>
                <h3 className="mt-4 text-base font-extrabold text-slate-900">Topik Tidak Ditemukan</h3>
                <p className="mt-2 text-xs text-slate-400 max-w-sm mx-auto">
                  Maaf, kata kunci &ldquo;{searchQuery}&rdquo; tidak cocok dengan panduan mana pun. Silakan bersihkan pencarian atau cari kata kunci lain.
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
                >
                  Bersihkan Pencarian
                </button>
              </div>
            )}
          </section>

        </div>
      </div>
    </main>
  );
}
