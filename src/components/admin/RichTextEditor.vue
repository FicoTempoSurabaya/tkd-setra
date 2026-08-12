<script setup lang="ts">
import { watch } from 'vue';
import { EditorContent, useEditor } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import { Color, FontFamily, FontSize, TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
Bold,
  Code,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  Link2Off,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo,
  RemoveFormatting,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Text,
  Underline as UnderlineIcon,
  Undo,
} from 'lucide-vue-next';
import { sanitizeRichHtml } from '@/lib/rich-text.js';

const props = defineProps<{
  modelValue: string;
  editorId: string;
  placeholder?: string;
}>();

const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

const FONT_FAMILIES = ['Arial', 'Georgia', 'Tahoma', 'Times New Roman', 'Verdana'];
const FONT_SIZES = ['8pt', '9pt', '10pt', '11pt', '12pt', '14pt', '16pt', '18pt', '20pt', '24pt', '28pt', '32pt'];
const TEXT_COLORS = ['#1a1a1a', '#6c5ce7', '#0984e3', '#00b894', '#e84393', '#d63031', '#fdcb6e', '#ffffff'];
const HIGHLIGHT_COLORS = ['#fef9ef', '#fdcb6e', '#a3e635', '#81ecec', '#dfe6e9', '#fab1a0'];
const EMOJIS = [
  '😊', '😀', '😃', '😄', '😁', '🥳', '😍', '🤩', '😎', '🤝', '👏', '🙌',
  '👍', '❤️', '⭐', '🔥', '🎉', '🎯', '🏆', '🚀', '✅', '⚠️', '❗', '❌',
  '📋', '💡', '📌', '📚', '⏰', '📝', '💬', '🔔', '🌟',
];
const BIODATA_TAGS = [
  '@participant.nama_lengkap',
  '@participant.tempat_lahir',
  '@participant.tanggal_lahir',
  '@participant.nik',
  '@participant.alamat',
  '@participant.whatsapp',
  '@participant.email',
];

function isSafeUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const url = new URL(trimmed);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}

const editor = useEditor({
  content: sanitizeRichHtml(props.modelValue),
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
    TextStyle,
    Color,
    FontFamily,
    FontSize,
    Underline,
    Highlight.configure({ multicolor: true }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Link.configure({
      openOnClick: false,
      autolink: true,
      defaultProtocol: 'https',
      HTMLAttributes: {
        rel: 'noopener noreferrer nofollow',
        target: '_blank',
      },
    }),
    Image.configure({ inline: false, allowBase64: false }),
    Subscript,
    Superscript,
    Placeholder.configure({
      placeholder: props.placeholder ?? '',
      emptyEditorClass: 'is-editor-empty',
    }),
  ],
  editorProps: {
    attributes: {
      id: props.editorId,
      class: 'rich-editor__content',
      role: 'textbox',
      'aria-multiline': 'true',
      'data-placeholder': props.placeholder ?? '',
    },
  },
  onUpdate({ editor }) {
    emit('update:modelValue', sanitizeRichHtml(editor.getHTML()));
  },
});

watch(
  () => props.modelValue,
  (value) => {
    if (!editor.value) return;
    const current = sanitizeRichHtml(editor.value.getHTML());
    const next = sanitizeRichHtml(value);
    if (current !== next) {
      editor.value.commands.setContent(next, { emitUpdate: false });
    }
  },
);

function runFromSelect(fn: (value: string) => void, event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  if (!value) return;
  fn(value);
  (event.target as HTMLSelectElement).value = '';
}

function setFontSize(value: string) {
  editor.value?.chain().focus().setFontSize(value).run();
}

function setFontFamily(value: string) {
  editor.value?.chain().focus().setFontFamily(value).run();
}

function setColor(value: string) {
  editor.value?.chain().focus().setColor(value).run();
}

function setHighlight(value: string) {
  editor.value?.chain().focus().toggleHighlight({ color: value }).run();
}

function setLink() {
  const prev = editor.value?.getAttributes('link').href as string | undefined;
  const url = window.prompt('Masukkan URL:', prev ?? 'https://');
  if (url === null) return;
  if (url === '') {
    editor.value?.chain().focus().extendMarkRange('link').unsetLink().run();
    return;
  }
  editor.value?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
}

function unsetLink() {
  editor.value?.chain().focus().extendMarkRange('link').unsetLink().run();
}

function addImage() {
  const url = window.prompt('Masukkan URL gambar:');
  if (!url) return;
  if (!isSafeUrl(url)) {
    window.alert('URL gambar tidak valid. Gunakan http/https.');
    return;
  }
  editor.value?.chain().focus().setImage({ src: url }).run();
}

function toggleHighlight() {
  editor.value?.chain().focus().toggleHighlight({ color: '#fdcb6e' }).run();
}

function clearFormatting() {
  editor.value?.chain().focus().unsetAllMarks().clearNodes().run();
}

function insertText(value: string) {
  editor.value?.chain().focus().insertContent(value).run();
}

function isActive(name: string, attributes?: Record<string, unknown>) {
  return editor.value?.isActive(name, attributes) ?? false;
}

function isFontFamilyActive(value: string) {
  return editor.value?.isActive('textStyle', { fontFamily: value }) ?? false;
}

function isFontSizeActive(value: string) {
  return editor.value?.isActive('textStyle', { fontSize: value }) ?? false;
}

function isColorActive(value: string) {
  return editor.value?.isActive('textStyle', { color: value }) ?? false;
}

function isTextAlignActive(value: string) {
  return editor.value?.isActive('paragraph', { textAlign: value }) ?? false;
}
</script>

<template>
  <div class="rich-editor">
    <div class="rich-editor__toolbar" role="toolbar" :aria-controls="editorId">
      <!-- Undo / Redo -->
      <button
        type="button"
        title="Batalkan (Undo)"
        aria-label="Undo"
        :disabled="!editor?.can().chain().focus().undo().run()"
        @mousedown.prevent
        @click="editor?.chain().focus().undo().run()"
      >
        <Undo :size="16" />
      </button>
      <button
        type="button"
        title="Ulangi (Redo)"
        aria-label="Redo"
        :disabled="!editor?.can().chain().focus().redo().run()"
        @mousedown.prevent
        @click="editor?.chain().focus().redo().run()"
      >
        <Redo :size="16" />
      </button>

      <span class="rich-editor__divider" aria-hidden="true"></span>

      <!-- Paragraph & Headings -->
      <button
        type="button"
        title="Paragraf"
        aria-label="Paragraf"
        :class="{ 'is-active': isActive('paragraph') }"
        @mousedown.prevent
        @click="editor?.chain().focus().setParagraph().run()"
      >
        <Pilcrow :size="16" />
      </button>
      <button
        type="button"
        title="Heading 1"
        aria-label="Heading 1"
        :class="{ 'is-active': isActive('heading', { level: 1 }) }"
        @mousedown.prevent
        @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
      >
        <Heading1 :size="16" />
      </button>
      <button
        type="button"
        title="Heading 2"
        aria-label="Heading 2"
        :class="{ 'is-active': isActive('heading', { level: 2 }) }"
        @mousedown.prevent
        @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        <Heading2 :size="16" />
      </button>
      <button
        type="button"
        title="Heading 3"
        aria-label="Heading 3"
        :class="{ 'is-active': isActive('heading', { level: 3 }) }"
        @mousedown.prevent
        @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
      >
        <Heading3 :size="16" />
      </button>

      <!-- Font & Ukuran -->
      <label class="rich-editor__wrap">
        <Text :size="14" />
        <select
          aria-label="Jenis huruf"
          :value="FONT_FAMILIES.find(isFontFamilyActive) ?? ''"
          @change="runFromSelect(setFontFamily, $event)"
        >
          <option value="">Font</option>
          <option v-for="f in FONT_FAMILIES" :key="f" :value="f">{{ f }}</option>
        </select>
      </label>
      <label class="rich-editor__wrap">
        <select
          aria-label="Ukuran huruf"
          :value="FONT_SIZES.find(isFontSizeActive) ?? ''"
          @change="runFromSelect(setFontSize, $event)"
        >
          <option value="">Ukuran</option>
          <option v-for="s in FONT_SIZES" :key="s" :value="s">{{ s }}</option>
        </select>
      </label>

      <span class="rich-editor__divider" aria-hidden="true"></span>

      <!-- Inline formatting -->
      <button
        type="button"
        title="Tebal"
        aria-label="Tebal"
        :class="{ 'is-active': isActive('bold') }"
        @mousedown.prevent
        @click="editor?.chain().focus().toggleBold().run()"
      >
        <Bold :size="16" />
      </button>
      <button
        type="button"
        title="Miring"
        aria-label="Miring"
        :class="{ 'is-active': isActive('italic') }"
        @mousedown.prevent
        @click="editor?.chain().focus().toggleItalic().run()"
      >
        <Italic :size="16" />
      </button>
      <button
        type="button"
        title="Garis bawah"
        aria-label="Garis bawah"
        :class="{ 'is-active': isActive('underline') }"
        @mousedown.prevent
        @click="editor?.chain().focus().toggleUnderline().run()"
      >
        <UnderlineIcon :size="16" />
      </button>
      <button
        type="button"
        title="Coret"
        aria-label="Coret"
        :class="{ 'is-active': isActive('strike') }"
        @mousedown.prevent
        @click="editor?.chain().focus().toggleStrike().run()"
      >
        <Strikethrough :size="16" />
      </button>
      <button
        type="button"
        title="Superscript"
        aria-label="Superscript"
        :class="{ 'is-active': isActive('superscript') }"
        @mousedown.prevent
        @click="editor?.chain().focus().toggleSuperscript().run()"
      >
        <SuperscriptIcon :size="16" />
      </button>
      <button
        type="button"
        title="Subscript"
        aria-label="Subscript"
        :class="{ 'is-active': isActive('subscript') }"
        @mousedown.prevent
        @click="editor?.chain().focus().toggleSubscript().run()"
      >
        <SubscriptIcon :size="16" />
      </button>
      <button
        type="button"
        title="Kode (inline)"
        aria-label="Kode inline"
        :class="{ 'is-active': isActive('code') }"
        @mousedown.prevent
        @click="editor?.chain().focus().toggleCode().run()"
      >
        <Code :size="16" />
      </button>

      <span class="rich-editor__divider" aria-hidden="true"></span>

      <!-- Warna & Highlight -->
      <label class="rich-editor__wrap">
        <select
          aria-label="Warna teks"
          :value="TEXT_COLORS.find(isColorActive) ?? ''"
          @change="runFromSelect(setColor, $event)"
        >
          <option value="">Warna</option>
          <option v-for="c in TEXT_COLORS" :key="c" :value="c" :style="{ color: c }">{{ c }}</option>
        </select>
      </label>
      <button
        type="button"
        title="Sorot (warna stabilo)"
        aria-label="Sorot"
        :class="{ 'is-active': isActive('highlight') }"
        @mousedown.prevent
        @click="toggleHighlight"
      >
        <Highlighter :size="16" />
      </button>
      <label class="rich-editor__wrap">
        <select aria-label="Warna sorotan" @change="runFromSelect(setHighlight, $event)">
          <option value="">Sorot Warna</option>
          <option v-for="c in HIGHLIGHT_COLORS" :key="c" :value="c">{{ c }}</option>
        </select>
      </label>

      <span class="rich-editor__divider" aria-hidden="true"></span>

      <!-- Link & Image -->
      <button
        type="button"
        title="Sisipkan tautan"
        aria-label="Sisipkan tautan"
        :class="{ 'is-active': isActive('link') }"
        @mousedown.prevent
        @click="setLink"
      >
        <LinkIcon :size="16" />
      </button>
      <button
        type="button"
        title="Hapus tautan"
        aria-label="Hapus tautan"
        @mousedown.prevent
        @click="unsetLink"
      >
        <Link2Off :size="16" />
      </button>
      <button
        type="button"
        title="Sisipkan gambar (URL)"
        aria-label="Sisipkan gambar"
        @mousedown.prevent
        @click="addImage"
      >
        <ImageIcon :size="16" />
      </button>

      <span class="rich-editor__divider" aria-hidden="true"></span>

      <!-- Block elements -->
      <button
        type="button"
        title="Daftar berpoin"
        aria-label="Daftar berpoin"
        :class="{ 'is-active': isActive('bulletList') }"
        @mousedown.prevent
        @click="editor?.chain().focus().toggleBulletList().run()"
      >
        <List :size="16" />
      </button>
      <button
        type="button"
        title="Daftar bernomor"
        aria-label="Daftar bernomor"
        :class="{ 'is-active': isActive('orderedList') }"
        @mousedown.prevent
        @click="editor?.chain().focus().toggleOrderedList().run()"
      >
        <ListOrdered :size="16" />
      </button>
      <button
        type="button"
        title="Kutipan"
        aria-label="Kutipan"
        :class="{ 'is-active': isActive('blockquote') }"
        @mousedown.prevent
        @click="editor?.chain().focus().toggleBlockquote().run()"
      >
        <Quote :size="16" />
      </button>
      <button
        type="button"
        title="Kode blok"
        aria-label="Kode blok"
        :class="{ 'is-active': isActive('codeBlock') }"
        @mousedown.prevent
        @click="editor?.chain().focus().toggleCodeBlock().run()"
      >
<Code2 :size="16" />
      </button>
      <button
        type="button"
        title="Garis pemisah"
        aria-label="Garis pemisah"
        @mousedown.prevent
        @click="editor?.chain().focus().setHorizontalRule().run()"
      >
        <Minus :size="16" />
      </button>

      <span class="rich-editor__divider" aria-hidden="true"></span>

      <!-- Alignment -->
      <button
        type="button"
        title="Rata kiri"
        aria-label="Rata kiri"
        :class="{ 'is-active': isTextAlignActive('left') }"
        @mousedown.prevent
        @click="editor?.chain().focus().setTextAlign('left').run()"
      >
        <AlignLeft :size="16" />
      </button>
      <button
        type="button"
        title="Rata tengah"
        aria-label="Rata tengah"
        :class="{ 'is-active': isTextAlignActive('center') }"
        @mousedown.prevent
        @click="editor?.chain().focus().setTextAlign('center').run()"
      >
        <AlignCenter :size="16" />
      </button>
      <button
        type="button"
        title="Rata kanan"
        aria-label="Rata kanan"
        :class="{ 'is-active': isTextAlignActive('right') }"
        @mousedown.prevent
        @click="editor?.chain().focus().setTextAlign('right').run()"
      >
        <AlignRight :size="16" />
      </button>
      <button
        type="button"
        title="Rata kiri-kanan"
        aria-label="Rata kiri-kanan"
        :class="{ 'is-active': isTextAlignActive('justify') }"
        @mousedown.prevent
        @click="editor?.chain().focus().setTextAlign('justify').run()"
      >
        <AlignJustify :size="16" />
      </button>

      <span class="rich-editor__divider" aria-hidden="true"></span>

      <!-- Emoji & Tag Biodata -->
      <label class="rich-editor__wrap">
        <select aria-label="Sisipkan emoji" @change="runFromSelect(insertText, $event)">
          <option value="">Emoji</option>
          <option v-for="e in EMOJIS" :key="e" :value="e">{{ e }}</option>
        </select>
      </label>
      <label class="rich-editor__wrap">
        <select aria-label="Sisipkan tag biodata" @change="runFromSelect(insertText, $event)">
          <option value="">Tag Biodata</option>
          <option v-for="t in BIODATA_TAGS" :key="t" :value="t">{{ t }}</option>
        </select>
      </label>

      <span class="rich-editor__divider" aria-hidden="true"></span>

      <!-- Clear formatting -->
      <button
        type="button"
        title="Hapus format"
        aria-label="Hapus format"
        @mousedown.prevent
        @click="clearFormatting"
      >
        <RemoveFormatting :size="16" />
      </button>
    </div>

    <EditorContent :id="editorId" :editor="editor" />
  </div>
</template>
