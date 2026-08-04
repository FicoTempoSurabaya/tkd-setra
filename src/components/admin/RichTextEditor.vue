<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  List,
  ListOrdered,
  Smile,
  Underline,
} from 'lucide-vue-next';
import { sanitizeRichHtml } from '@/lib/rich-text.js';

const props = defineProps<{
  modelValue: string;
  editorId: string;
  placeholder?: string;
}>();

const emit = defineEmits<{ 'update:modelValue': [value: string] }>();
const editor = ref<HTMLElement | null>(null);
const savedSelection = ref<Range | null>(null);

function syncValue() {
  if (!editor.value) return;
  const value = sanitizeRichHtml(editor.value.innerHTML);
  if (editor.value.innerHTML !== value) editor.value.innerHTML = value;
  emit('update:modelValue', value);
}

function saveSelection() {
  const selection = window.getSelection();
  if (selection?.rangeCount) savedSelection.value = selection.getRangeAt(0).cloneRange();
}

function restoreEditorSelection() {
  editor.value?.focus();
  if (!savedSelection.value) return;
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(savedSelection.value);
}

function runCommand(command: string, value?: string) {
  restoreEditorSelection();
  document.execCommand(command, false, value);
  syncValue();
}

function runCommandFromSelect(command: string, event: Event) {
  runCommand(command, (event.target as HTMLSelectElement).value);
}

function setFontSize(event: Event) {
  const size = (event.target as HTMLSelectElement).value;
  restoreEditorSelection();
  document.execCommand('fontSize', false, '7');
  editor.value?.querySelectorAll('font[size="7"]').forEach((element) => {
    element.removeAttribute('size');
    (element as HTMLElement).style.fontSize = `${size}pt`;
  });
  syncValue();
}

function insertEmoji(event: Event) {
  const emoji = (event.target as HTMLSelectElement).value;
  if (!emoji) return;
  runCommand('insertText', emoji);
  (event.target as HTMLSelectElement).value = '';
}

function insertTag(event: Event) {
  const tag = (event.target as HTMLSelectElement).value;
  if (!tag) return;
  runCommand('insertText', tag);
  (event.target as HTMLSelectElement).value = '';
}

function pastePlainText(event: ClipboardEvent) {
  event.preventDefault();
  document.execCommand('insertText', false, event.clipboardData?.getData('text/plain') ?? '');
  syncValue();
}

watch(
  () => props.modelValue,
  async (value) => {
    await nextTick();
    if (editor.value && editor.value.innerHTML !== value) editor.value.innerHTML = value;
  },
  { immediate: true },
);
</script>

<template>
  <div class="rich-editor">
    <div class="rich-editor__toolbar" role="toolbar" :aria-controls="editorId" @mousedown.capture="saveSelection">
      <select aria-label="Jenis huruf" @change="runCommandFromSelect('fontName', $event)">
        <option value="Arial">Arial</option>
        <option value="Georgia">Georgia</option>
        <option value="Tahoma">Tahoma</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Verdana">Verdana</option>
      </select>
      <select aria-label="Ukuran huruf" @change="setFontSize">
        <option value="8">8 pt</option>
        <option value="9">9 pt</option>
        <option value="10">10 pt</option>
        <option value="11">11 pt</option>
        <option value="12" selected>12 pt</option>
        <option value="14">14 pt</option>
        <option value="16">16 pt</option>
        <option value="18">18 pt</option>
        <option value="20">20 pt</option>
        <option value="24">24 pt</option>
        <option value="28">28 pt</option>
        <option value="32">32 pt</option>
      </select>
      <button type="button" title="Tebal" aria-label="Tebal" @mousedown.prevent @click="runCommand('bold')"><Bold :size="16" /></button>
      <button type="button" title="Miring" aria-label="Miring" @mousedown.prevent @click="runCommand('italic')"><Italic :size="16" /></button>
      <button type="button" title="Garis bawah" aria-label="Garis bawah" @mousedown.prevent @click="runCommand('underline')"><Underline :size="16" /></button>
      <button type="button" title="Daftar berpoin" aria-label="Daftar berpoin" @mousedown.prevent @click="runCommand('insertUnorderedList')"><List :size="16" /></button>
      <button type="button" title="Daftar bernomor" aria-label="Daftar bernomor" @mousedown.prevent @click="runCommand('insertOrderedList')"><ListOrdered :size="16" /></button>
      <button type="button" title="Rata kiri" aria-label="Rata kiri" @mousedown.prevent @click="runCommand('justifyLeft')"><AlignLeft :size="16" /></button>
      <button type="button" title="Rata tengah" aria-label="Rata tengah" @mousedown.prevent @click="runCommand('justifyCenter')"><AlignCenter :size="16" /></button>
      <button type="button" title="Rata kanan" aria-label="Rata kanan" @mousedown.prevent @click="runCommand('justifyRight')"><AlignRight :size="16" /></button>
      <button type="button" title="Rata kiri-kanan" aria-label="Rata kiri-kanan" @mousedown.prevent @click="runCommand('justifyFull')"><AlignJustify :size="16" /></button>
      <label class="rich-editor__tag">
        <select aria-label="Sisipkan tag biodata" @change="insertTag">
          <option value="">Tag Biodata</option>
          <option value="@participant.nama_lengkap">Nama lengkap</option>
          <option value="@participant.tempat_lahir">Tempat lahir</option>
          <option value="@participant.tanggal_lahir">Tanggal lahir</option>
          <option value="@participant.nik">NIK</option>
          <option value="@participant.alamat">Alamat</option>
          <option value="@participant.whatsapp">WhatsApp</option>
          <option value="@participant.email">Email</option>
        </select>
      </label>
      <label class="rich-editor__emoji">
        <Smile :size="16" />
        <select aria-label="Sisipkan emoji" @change="insertEmoji">
          <option value="">Emoji</option>
          <option value="😊">😊</option>
          <option value="😀">😀</option>
          <option value="😃">😃</option>
          <option value="😄">😄</option>
          <option value="😁">😁</option>
          <option value="🥳">🥳</option>
          <option value="😍">😍</option>
          <option value="🤩">🤩</option>
          <option value="😎">😎</option>
          <option value="🤝">🤝</option>
          <option value="👏">👏</option>
          <option value="🙌">🙌</option>
          <option value="👍">👍</option>
          <option value="❤️">❤️</option>
          <option value="⭐">⭐</option>
          <option value="🔥">🔥</option>
          <option value="🎉">🎉</option>
          <option value="🎯">🎯</option>
          <option value="🏆">🏆</option>
          <option value="🚀">🚀</option>
          <option value="✅">✅</option>
          <option value="⚠️">⚠️</option>
          <option value="❗">❗</option>
          <option value="❌">❌</option>
          <option value="📋">📋</option>
          <option value="💡">💡</option>
          <option value="📌">📌</option>
          <option value="📚">📚</option>
          <option value="⏰">⏰</option>
          <option value="📝">📝</option>
          <option value="💬">💬</option>
          <option value="🔔">🔔</option>
          <option value="🌟">🌟</option>
        </select>
      </label>
    </div>
    <div
      :id="editorId"
      ref="editor"
      class="rich-editor__content"
      contenteditable="true"
      role="textbox"
      aria-multiline="true"
      :data-placeholder="placeholder"
      @input="syncValue"
      @paste="pastePlainText"
    ></div>
  </div>
</template>
