# TODO - Rebuild Rich Text Editor (Tiptap "Simple Editor Template")

## Tujuan
Hapus total editor contenteditable & rebuild ulang memakai template "Simple Editor Template" Tiptap
dengan SEMUA fitur open source, lalu sesuaikan tampilan dengan tema Retro Neo Brutalism, dan
tambahkan fitur preview peserta.

## Langkah
- [x] Install dependensi Tiptap tambahan: `@tiptap/extension-image`, `@tiptap/extension-superscript`, `@tiptap/extension-subscript`.
- [x] Tulis ulang total `src/components/admin/RichTextEditor.vue` (template Simple Editor Tiptap):
      Undo/Redo, Heading (H1-H3), Paragraph, Bold, Italic, Strike, Underline, Superscript,
      Subscript, Code, Highlight, Color, Link, Image (URL), Bullet & Ordered List, Blockquote,
      Code Block, Alignment, Horizontal Rule, Placeholder.
- [x] Perluas `src/lib/rich-text.ts`: tag `blockquote`, `pre`, `code`, `h1-h3`, `hr`, `img`
      (validasi URL), `sup`, `sub`, `a`, `mark` + atribut warna/align/font.
- [x] Sesuaikan `src/assets/main.css` untuk tampilan toolbar & konten editor (Retro Neo Brutalism).
- [x] Tambah fitur **Preview Peserta** di `SettingsView.vue` (render via `personalizeRichHtml`
      seperti tampilan yang diterima participant).
- [x] Typecheck (`pnpm typecheck`) & build (`pnpm build`) → EXIT 0.
- [ ] QA manual editor + preview di Settings.
